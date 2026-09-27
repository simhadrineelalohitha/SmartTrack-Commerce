const express = require('express');
const db = require('../database/db-factory');

const router = express.Router();

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  db.get('SELECT role FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (err || !user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

// Calculate estimated delivery (7 days from now)
function getEstimatedDelivery() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
}

// Create a new order with full validation and transactions
router.post('/', requireAuth, async (req, res) => {
  try {
    const { items, customerInfo } = req.body;
    const userId = req.session.userId;

    // Validate customer information
    if (!customerInfo || 
        !customerInfo.fullName || 
        !customerInfo.email || 
        !customerInfo.phone || 
        !customerInfo.address || 
        !customerInfo.city || 
        !customerInfo.state || 
        !customerInfo.pincode) {
      return res.status(400).json({ error: 'All customer information fields are required' });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate phone
    if (!/^\d{10}$/.test(customerInfo.phone.replace(/[-\s]/g, ''))) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Validate pincode
    if (!/^\d{6}$/.test(customerInfo.pincode)) {
      return res.status(400).json({ error: 'Invalid pincode format' });
    }

    // Get all product IDs and verify they exist
    const productIds = items.map(item => item.productId);
    const placeholders = productIds.map(() => '?').join(',');

    db.all(
      `SELECT id, name, price, stock FROM products WHERE id IN (${placeholders}) AND active = 1`,
      productIds,
      (err, products) => {
        if (err) {
          console.error('Error validating products:', err);
          return res.status(500).json({ error: 'Error validating products' });
        }

        if (products.length !== productIds.length) {
          return res.status(400).json({ error: 'Some products are invalid or unavailable' });
        }

        // Validate stock and calculate total on SERVER
        let totalAmount = 0;
        const validatedItems = [];
        const stockUpdates = [];

        for (const item of items) {
          const product = products.find(p => p.id === item.productId);

          if (!product) {
            return res.status(400).json({ 
              error: `Product with ID ${item.productId} not found` 
            });
          }

          if (item.quantity <= 0) {
            return res.status(400).json({ 
              error: `Invalid quantity for ${product.name}` 
            });
          }

          if (product.stock < item.quantity) {
            return res.status(400).json({ 
              error: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
            });
          }

          validatedItems.push({
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            price: product.price
          });

          stockUpdates.push({
            productId: product.id,
            quantity: item.quantity
          });

          totalAmount += product.price * item.quantity;
        }

        const estimatedDelivery = getEstimatedDelivery();
        
        // Create order
        db.run(
          'INSERT INTO orders (user_id, total_amount, status, estimated_delivery) VALUES (?, ?, ?, ?)',
          [userId, totalAmount, 'Order Placed', estimatedDelivery],
          function(orderErr) {
            if (orderErr) {
              console.error('Error creating order:', orderErr);
              return res.status(500).json({ error: 'Error creating order' });
            }

            const orderId = this.lastID;
            
            // Insert initial status history
            db.run(
              'INSERT INTO order_status_history (order_id, status) VALUES (?, ?)',
              [orderId, 'Order Placed']
            );
            
            let itemsInserted = 0;
            let itemsFailed = false;

            const stmt = db.prepare(
              'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
            );

            validatedItems.forEach((item) => {
              stmt.run(orderId, item.productId, item.quantity, item.price, (itemErr) => {
                if (itemErr) {
                  console.error('Error inserting order item:', itemErr);
                  itemsFailed = true;
                  
                  db.run('DELETE FROM order_status_history WHERE order_id = ?', [orderId]);
                  db.run('DELETE FROM orders WHERE id = ?', [orderId], () => {
                    if (!res.headersSent) {
                      return res.status(500).json({ error: 'Error processing order items' });
                    }
                  });
                  return;
                }

                itemsInserted++;

                if (itemsInserted === validatedItems.length && !itemsFailed) {
                  updateStockForOrder();
                }
              });
            });

            stmt.finalize();

            function updateStockForOrder() {
              let stockUpdated = 0;
              let stockUpdateFailed = false;

              stockUpdates.forEach(update => {
                db.run(
                  'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
                  [update.quantity, update.productId, update.quantity],
                  function(stockErr) {
                    if (stockErr || this.changes === 0) {
                      console.error('Error updating stock:', stockErr);
                      stockUpdateFailed = true;

                      db.run('DELETE FROM order_items WHERE order_id = ?', [orderId], () => {
                        db.run('DELETE FROM order_status_history WHERE order_id = ?', [orderId], () => {
                          db.run('DELETE FROM orders WHERE id = ?', [orderId], () => {
                            if (!res.headersSent) {
                              return res.status(500).json({ 
                                error: 'Stock update failed. Order cancelled.' 
                              });
                            }
                          });
                        });
                      });
                      return;
                    }

                    stockUpdated++;

                    if (stockUpdated === stockUpdates.length && !stockUpdateFailed && !res.headersSent) {
                      res.status(201).json({
                        success: true,
                        message: 'Order placed successfully',
                        orderId: orderId,
                        totalAmount: totalAmount.toFixed(2),
                        estimatedDelivery: estimatedDelivery,
                        orderDate: new Date().toISOString(),
                        items: validatedItems
                      });
                    }
                  }
                );
              });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Server error while processing order' });
  }
});

// Get logged-in user's orders
router.get('/', requireAuth, (req, res) => {
  const userId = req.session.userId;

  db.all(
    `SELECT o.id, o.total_amount, o.status, o.estimated_delivery, o.created_at,
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
     FROM orders o 
     WHERE o.user_id = ? 
     ORDER BY o.created_at DESC`,
    [userId],
    (err, orders) => {
      if (err) {
        console.error('Error fetching orders:', err);
        return res.status(500).json({ error: 'Error fetching orders' });
      }

      res.json(orders);
    }
  );
});

// Get specific order details with authorization check
router.get('/:orderId', requireAuth, (req, res) => {
  const { orderId } = req.params;
  const userId = req.session.userId;

  if (!orderId || isNaN(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }

  db.get(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?', 
    [orderId, userId], 
    (err, order) => {
      if (err) {
        console.error('Error fetching order:', err);
        return res.status(500).json({ error: 'Error fetching order' });
      }

      if (!order) {
        return res.status(404).json({ error: 'Order not found or access denied' });
      }

      db.all(
        `SELECT oi.*, p.name, p.image_url 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [orderId],
        (err, items) => {
          if (err) {
            console.error('Error fetching order items:', err);
            return res.status(500).json({ error: 'Error fetching order items' });
          }

          res.json({
            id: order.id,
            userId: order.user_id,
            totalAmount: order.total_amount,
            status: order.status,
            estimatedDelivery: order.estimated_delivery,
            createdAt: order.created_at,
            items: items
          });
        }
      );
    }
  );
});

// Get order tracking timeline
router.get('/:orderId/tracking', requireAuth, (req, res) => {
  const { orderId } = req.params;
  const userId = req.session.userId;

  if (!orderId || isNaN(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }

  db.get(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?', 
    [orderId, userId], 
    (err, order) => {
      if (err) {
        console.error('Error fetching order:', err);
        return res.status(500).json({ error: 'Error fetching order' });
      }

      if (!order) {
        return res.status(404).json({ error: 'Order not found or access denied' });
      }

      db.all(
        `SELECT status, timestamp FROM order_status_history 
         WHERE order_id = ? 
         ORDER BY timestamp ASC`,
        [orderId],
        (err, history) => {
          if (err) {
            console.error('Error fetching tracking history:', err);
            return res.status(500).json({ error: 'Error fetching tracking history' });
          }

          res.json({
            orderId: order.id,
            currentStatus: order.status,
            estimatedDelivery: order.estimated_delivery,
            history: history
          });
        }
      );
    }
  );
});

// ===== ADMIN ROUTES =====

// Get all orders (admin only)
router.get('/admin/all', requireAdmin, (req, res) => {
  const { search, status, limit = 50 } = req.query;

  let query = `SELECT o.*, u.name as customer_name, u.email as customer_email,
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
               FROM orders o
               JOIN users u ON o.user_id = u.id
               WHERE 1=1`;
  const params = [];

  if (search) {
    query += ' AND (o.id = ? OR u.name LIKE ? OR u.email LIKE ?)';
    params.push(search, `%${search}%`, `%${search}%`);
  }

  if (status) {
    query += ' AND o.status = ?';
    params.push(status);
  }

  query += ' ORDER BY o.created_at DESC LIMIT ?';
  params.push(parseInt(limit));

  db.all(query, params, (err, orders) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ error: 'Error fetching orders' });
    }

    res.json(orders);
  });
});

// Get order details (admin)
router.get('/admin/:orderId', requireAdmin, (req, res) => {
  const { orderId } = req.params;

  if (!orderId || isNaN(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }

  db.get(
    `SELECT o.*, u.name as customer_name, u.email as customer_email, u.id as customer_id
     FROM orders o
     JOIN users u ON o.user_id = u.id
     WHERE o.id = ?`, 
    [orderId], 
    (err, order) => {
      if (err) {
        console.error('Error fetching order:', err);
        return res.status(500).json({ error: 'Error fetching order' });
      }

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      db.all(
        `SELECT oi.*, p.name, p.image_url 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [orderId],
        (err, items) => {
          if (err) {
            console.error('Error fetching order items:', err);
            return res.status(500).json({ error: 'Error fetching order items' });
          }

          db.all(
            `SELECT status, timestamp FROM order_status_history 
             WHERE order_id = ? 
             ORDER BY timestamp ASC`,
            [orderId],
            (err, history) => {
              if (err) {
                console.error('Error fetching status history:', err);
                return res.status(500).json({ error: 'Error fetching status history' });
              }

              res.json({
                ...order,
                items: items,
                statusHistory: history
              });
            }
          );
        }
      );
    }
  );
});

// Update order status (admin only)
router.patch('/admin/:orderId/status', requireAdmin, (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!orderId || isNaN(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }

  const validStatuses = [
    'Order Placed',
    'Order Confirmed',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, order) => {
    if (err) {
      console.error('Error fetching order:', err);
      return res.status(500).json({ error: 'Error fetching order' });
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    db.run(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId],
      function(err) {
        if (err) {
          console.error('Error updating order status:', err);
          return res.status(500).json({ error: 'Error updating order status' });
        }

        db.run(
          'INSERT INTO order_status_history (order_id, status) VALUES (?, ?)',
          [orderId, status],
          (err) => {
            if (err) {
              console.error('Error logging status history:', err);
            }

            // Log admin action
            db.run(
              'INSERT INTO admin_audit_log (admin_id, action, details) VALUES (?, ?, ?)',
              [req.session.userId, 'Update Order Status', `Order #${orderId} → ${status}`]
            );

            res.json({
              success: true,
              message: 'Order status updated successfully',
              orderId: orderId,
              status: status
            });
          }
        );
      }
    );
  });
});

// Get dashboard statistics (admin only)
router.get('/admin/stats/dashboard', requireAdmin, (req, res) => {
  const stats = {};

  db.get('SELECT COUNT(*) as total FROM orders', [], (err, result) => {
    if (!err) stats.totalOrders = result.total;

    db.get(`SELECT COUNT(*) as pending FROM orders WHERE status IN ('Order Placed', 'Order Confirmed', 'Packed')`, [], (err, result) => {
      if (!err) stats.pendingOrders = result.pending;

      db.get(`SELECT COUNT(*) as active FROM orders WHERE status IN ('Shipped', 'Out for Delivery')`, [], (err, result) => {
        if (!err) stats.activeOrders = result.active;

        db.get(`SELECT COUNT(*) as completed FROM orders WHERE status = 'Delivered'`, [], (err, result) => {
          if (!err) stats.completedOrders = result.completed;

          db.get('SELECT SUM(total_amount) as total FROM orders', [], (err, result) => {
            if (!err) stats.totalSales = result.total || 0;

            db.get('SELECT AVG(total_amount) as avg FROM orders', [], (err, result) => {
              if (!err) stats.averageOrderValue = result.avg || 0;

              db.get('SELECT COUNT(*) as total FROM users WHERE role = "customer"', [], (err, result) => {
                if (!err) stats.totalCustomers = result.total;

                db.get('SELECT COUNT(*) as total FROM products WHERE active = 1', [], (err, result) => {
                  if (!err) stats.totalProducts = result.total;

                  db.all('SELECT id, name, stock FROM products WHERE stock < 10 AND active = 1 ORDER BY stock ASC LIMIT 10', [], (err, products) => {
                    if (!err) stats.lowStockProducts = products;

                    res.json(stats);
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

module.exports = router;
