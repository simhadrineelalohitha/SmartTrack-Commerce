const express = require('express');
const db = require('../database/db-factory');

const router = express.Router();

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

// Get all products (admin)
router.get('/products', requireAdmin, (req, res) => {
  const { search, category, active } = req.query;

  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (active !== undefined) {
    query += ' AND active = ?';
    params.push(active === 'true' ? 1 : 0);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, products) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Error fetching products' });
    }
    res.json(products);
  });
});

// Create product (admin)
router.post('/products', requireAdmin, (req, res) => {
  const { name, description, price, image_url, stock, category } = req.body;

  // Validate inputs
  if (!name || !price || price <= 0) {
    return res.status(400).json({ error: 'Name and valid price are required' });
  }

  if (stock < 0 || isNaN(stock)) {
    return res.status(400).json({ error: 'Invalid stock value' });
  }

  db.run(
    `INSERT INTO products (name, description, price, image_url, stock, category, active)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [name, description || '', parseFloat(price), image_url || 'https://via.placeholder.com/300x300?text=Product', parseInt(stock) || 0, category || ''],
    function(err) {
      if (err) {
        console.error('Error creating product:', err);
        return res.status(500).json({ error: 'Error creating product' });
      }

      // Log admin action
      db.run(
        'INSERT INTO admin_audit_log (admin_id, action, details) VALUES (?, ?, ?)',
        [req.session.userId, 'Create Product', `Product: ${name}`]
      );

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        productId: this.lastID
      });
    }
  );
});

// Update product (admin)
router.put('/products/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, stock, category, active } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  if (price !== undefined && (price <= 0 || isNaN(price))) {
    return res.status(400).json({ error: 'Invalid price value' });
  }

  if (stock !== undefined && (stock < 0 || isNaN(stock))) {
    return res.status(400).json({ error: 'Invalid stock value' });
  }

  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ error: 'Error fetching product' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      params.push(parseFloat(price));
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      params.push(image_url);
    }
    if (stock !== undefined) {
      updates.push('stock = ?');
      params.push(parseInt(stock));
    }
    if (category !== undefined) {
      updates.push('category = ?');
      params.push(category);
    }
    if (active !== undefined) {
      updates.push('active = ?');
      params.push(active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    params.push(id);

    db.run(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      params,
      function(err) {
        if (err) {
          console.error('Error updating product:', err);
          return res.status(500).json({ error: 'Error updating product' });
        }

        // Log admin action
        db.run(
          'INSERT INTO admin_audit_log (admin_id, action, details) VALUES (?, ?, ?)',
          [req.session.userId, 'Update Product', `Product ID: ${id}`]
        );

        res.json({
          success: true,
          message: 'Product updated successfully'
        });
      }
    );
  });
});

// Update product stock (admin)
router.patch('/products/:id/stock', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  if (stock === undefined || stock < 0 || isNaN(stock)) {
    return res.status(400).json({ error: 'Invalid stock value' });
  }

  db.get('SELECT name FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ error: 'Error fetching product' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.run(
      'UPDATE products SET stock = ? WHERE id = ?',
      [parseInt(stock), id],
      function(err) {
        if (err) {
          console.error('Error updating stock:', err);
          return res.status(500).json({ error: 'Error updating stock' });
        }

        // Log admin action
        db.run(
          'INSERT INTO admin_audit_log (admin_id, action, details) VALUES (?, ?, ?)',
          [req.session.userId, 'Update Stock', `${product.name}: ${stock} units`]
        );

        res.json({
          success: true,
          message: 'Stock updated successfully'
        });
      }
    );
  });
});

// Deactivate product (admin)
router.delete('/products/:id', requireAdmin, (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  db.get('SELECT name FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ error: 'Error fetching product' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.run(
      'UPDATE products SET active = 0 WHERE id = ?',
      [id],
      function(err) {
        if (err) {
          console.error('Error deactivating product:', err);
          return res.status(500).json({ error: 'Error deactivating product' });
        }

        // Log admin action
        db.run(
          'INSERT INTO admin_audit_log (admin_id, action, details) VALUES (?, ?, ?)',
          [req.session.userId, 'Deactivate Product', `Product: ${product.name}`]
        );

        res.json({
          success: true,
          message: 'Product deactivated successfully'
        });
      }
    );
  });
});

// Get audit log (admin)
router.get('/audit-log', requireAdmin, (req, res) => {
  const { limit = 50 } = req.query;

  db.all(
    `SELECT a.*, u.name as admin_name, u.email as admin_email
     FROM admin_audit_log a
     JOIN users u ON a.admin_id = u.id
     ORDER BY a.timestamp DESC
     LIMIT ?`,
    [parseInt(limit)],
    (err, logs) => {
      if (err) {
        console.error('Error fetching audit log:', err);
        return res.status(500).json({ error: 'Error fetching audit log' });
      }
      res.json(logs);
    }
  );
});

module.exports = router;
