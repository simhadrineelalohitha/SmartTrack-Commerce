const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Get user's wishlist
router.get('/', requireAuth, (req, res) => {
  const userId = req.session.userId;

  const query = `
    SELECT p.*, w.added_at, COALESCE(AVG(pr.rating), 0) as avg_rating, COUNT(pr.id) as review_count
    FROM wishlist w
    JOIN products p ON w.product_id = p.id
    LEFT JOIN product_reviews pr ON p.id = pr.product_id
    WHERE w.user_id = ?
    GROUP BY p.id
    ORDER BY w.added_at DESC
  `;

  db.all(query, [userId], (err, products) => {
    if (err) {
      console.error('Error fetching wishlist:', err);
      return res.status(500).json({ error: 'Error fetching wishlist' });
    }
    res.json(products);
  });
});

// Add product to wishlist
router.post('/:productId', requireAuth, (req, res) => {
  const userId = req.session.userId;
  const { productId } = req.params;

  if (!productId || isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  // Check if product exists
  db.get('SELECT id FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      console.error('Error checking product:', err);
      return res.status(500).json({ error: 'Error adding to wishlist' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Add to wishlist
    db.run(
      'INSERT OR IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)',
      [userId, productId],
      function(err) {
        if (err) {
          console.error('Error adding to wishlist:', err);
          return res.status(500).json({ error: 'Error adding to wishlist' });
        }
        res.json({ message: 'Product added to wishlist', added: this.changes > 0 });
      }
    );
  });
});

// Remove product from wishlist
router.delete('/:productId', requireAuth, (req, res) => {
  const userId = req.session.userId;
  const { productId } = req.params;

  if (!productId || isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  db.run(
    'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
    [userId, productId],
    function(err) {
      if (err) {
        console.error('Error removing from wishlist:', err);
        return res.status(500).json({ error: 'Error removing from wishlist' });
      }
      res.json({ message: 'Product removed from wishlist', removed: this.changes > 0 });
    }
  );
});

// Check if product is in wishlist
router.get('/check/:productId', requireAuth, (req, res) => {
  const userId = req.session.userId;
  const { productId } = req.params;

  if (!productId || isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  db.get(
    'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
    [userId, productId],
    (err, row) => {
      if (err) {
        console.error('Error checking wishlist:', err);
        return res.status(500).json({ error: 'Error checking wishlist' });
      }
      res.json({ inWishlist: !!row });
    }
  );
});

module.exports = router;
