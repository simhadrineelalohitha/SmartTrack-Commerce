const express = require('express');
const db = require('../database/db-factory');

const router = express.Router();

// Validate cart items against database
router.post('/validate', (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid cart items' });
    }

    const productIds = items.map(item => item.productId);
    const placeholders = productIds.map(() => '?').join(',');

    db.all(
      `SELECT id, name, price, stock FROM products WHERE id IN (${placeholders})`,
      productIds,
      (err, products) => {
        if (err) {
          return res.status(500).json({ error: 'Error validating cart' });
        }

        const validatedItems = items.map(item => {
          const product = products.find(p => p.id === item.productId);

          if (!product) {
            return { ...item, valid: false, error: 'Product not found' };
          }

          if (product.stock < item.quantity) {
            return { 
              ...item, 
              valid: false, 
              error: `Only ${product.stock} items available`,
              availableStock: product.stock
            };
          }

          return {
            ...item,
            valid: true,
            name: product.name,
            price: product.price,
            subtotal: product.price * item.quantity
          };
        });

        const allValid = validatedItems.every(item => item.valid);
        const total = validatedItems
          .filter(item => item.valid)
          .reduce((sum, item) => sum + item.subtotal, 0);

        res.json({
          items: validatedItems,
          valid: allValid,
          total: total.toFixed(2)
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
