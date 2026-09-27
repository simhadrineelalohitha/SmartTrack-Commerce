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

// Get all categories (MUST be before /:id route)
router.get('/categories/list', (req, res) => {
  db.all('SELECT DISTINCT category FROM products ORDER BY category', (err, rows) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ error: 'Error fetching categories' });
    }

    const categories = rows.map(row => row.category);
    res.json(categories);
  });
});

// Search suggestions
router.get('/search/suggestions', (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.json([]);
  }

  const searchPattern = `%${q}%`;
  const query = `
    SELECT DISTINCT name, category 
    FROM products 
    WHERE name LIKE ? OR category LIKE ?
    ORDER BY name
    LIMIT 10
  `;

  db.all(query, [searchPattern, searchPattern], (err, results) => {
    if (err) {
      console.error('Error fetching suggestions:', err);
      return res.status(500).json({ error: 'Error fetching suggestions' });
    }
    res.json(results);
  });
});

// Get all products with enhanced filtering and sorting
router.get('/', (req, res) => {
  const { category, search, minPrice, maxPrice, inStock, sort } = req.query;

  let query = 'SELECT p.*, COALESCE(AVG(pr.rating), 0) as avg_rating, COUNT(pr.id) as review_count FROM products p LEFT JOIN product_reviews pr ON p.id = pr.product_id WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND p.category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  if (minPrice) {
    query += ' AND p.price >= ?';
    params.push(parseFloat(minPrice));
  }

  if (maxPrice) {
    query += ' AND p.price <= ?';
    params.push(parseFloat(maxPrice));
  }

  if (inStock === 'true') {
    query += ' AND p.stock > 0';
  }

  query += ' GROUP BY p.id';

  // Sorting
  switch (sort) {
    case 'price_asc':
      query += ' ORDER BY p.price ASC';
      break;
    case 'price_desc':
      query += ' ORDER BY p.price DESC';
      break;
    case 'rating':
      query += ' ORDER BY avg_rating DESC, review_count DESC';
      break;
    case 'newest':
      query += ' ORDER BY p.created_at DESC';
      break;
    default:
      query += ' ORDER BY p.created_at DESC';
  }

  db.all(query, params, (err, products) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Error fetching products' });
    }
    res.json(products);
  });
});

// Get single product by ID with reviews and rating
router.get('/:id', (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  const productQuery = `
    SELECT p.*, 
           COALESCE(AVG(pr.rating), 0) as avg_rating, 
           COUNT(pr.id) as review_count
    FROM products p
    LEFT JOIN product_reviews pr ON p.id = pr.product_id
    WHERE p.id = ?
    GROUP BY p.id
  `;

  db.get(productQuery, [id], (err, product) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ error: 'Error fetching product' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Track recently viewed if user is logged in
    if (req.session && req.session.userId) {
      db.run(
        'INSERT OR REPLACE INTO recently_viewed (user_id, product_id, viewed_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [req.session.userId, id]
      );
      
      // Keep only last 20 viewed items per user
      db.run(
        `DELETE FROM recently_viewed 
         WHERE user_id = ? AND id NOT IN (
           SELECT id FROM recently_viewed 
           WHERE user_id = ? 
           ORDER BY viewed_at DESC 
           LIMIT 20
         )`,
        [req.session.userId, req.session.userId]
      );
    }

    res.json(product);
  });
});

// Get related/recommended products
router.get('/:id/related', (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  const query = `
    SELECT p2.*, COALESCE(AVG(pr.rating), 0) as avg_rating, COUNT(pr.id) as review_count
    FROM products p1
    JOIN products p2 ON p1.category = p2.category AND p2.id != p1.id
    LEFT JOIN product_reviews pr ON p2.id = pr.product_id
    WHERE p1.id = ? AND p2.stock > 0
    GROUP BY p2.id
    ORDER BY avg_rating DESC, review_count DESC
    LIMIT 4
  `;

  db.all(query, [id], (err, products) => {
    if (err) {
      console.error('Error fetching related products:', err);
      return res.status(500).json({ error: 'Error fetching related products' });
    }
    res.json(products);
  });
});

// Get product reviews
router.get('/:id/reviews', (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  const query = `
    SELECT pr.*, u.name as user_name
    FROM product_reviews pr
    JOIN users u ON pr.user_id = u.id
    WHERE pr.product_id = ?
    ORDER BY pr.created_at DESC
  `;

  db.all(query, [id], (err, reviews) => {
    if (err) {
      console.error('Error fetching reviews:', err);
      return res.status(500).json({ error: 'Error fetching reviews' });
    }
    res.json(reviews);
  });
});

// Add product review
router.post('/:id/reviews', requireAuth, (req, res) => {
  const { id } = req.params;
  const { rating, review_text } = req.body;
  const userId = req.session.userId;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const query = `
    INSERT OR REPLACE INTO product_reviews (product_id, user_id, rating, review_text)
    VALUES (?, ?, ?, ?)
  `;

  db.run(query, [id, userId, rating, review_text || ''], function(err) {
    if (err) {
      console.error('Error adding review:', err);
      return res.status(500).json({ error: 'Error adding review' });
    }
    res.json({ message: 'Review added successfully', reviewId: this.lastID });
  });
});

// Get recently viewed products
router.get('/user/recently-viewed', requireAuth, (req, res) => {
  const userId = req.session.userId;

  const query = `
    SELECT p.*, rv.viewed_at, COALESCE(AVG(pr.rating), 0) as avg_rating
    FROM recently_viewed rv
    JOIN products p ON rv.product_id = p.id
    LEFT JOIN product_reviews pr ON p.id = pr.product_id
    WHERE rv.user_id = ?
    GROUP BY p.id
    ORDER BY rv.viewed_at DESC
    LIMIT 10
  `;

  db.all(query, [userId], (err, products) => {
    if (err) {
      console.error('Error fetching recently viewed:', err);
      return res.status(500).json({ error: 'Error fetching recently viewed products' });
    }
    res.json(products);
  });
});

// Compare multiple products
router.post('/compare', (req, res) => {
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length < 2 || productIds.length > 3) {
    return res.status(400).json({ error: 'Please provide 2-3 product IDs to compare' });
  }

  const placeholders = productIds.map(() => '?').join(',');
  const query = `
    SELECT p.*, COALESCE(AVG(pr.rating), 0) as avg_rating, COUNT(pr.id) as review_count
    FROM products p
    LEFT JOIN product_reviews pr ON p.id = pr.product_id
    WHERE p.id IN (${placeholders})
    GROUP BY p.id
  `;

  db.all(query, productIds, (err, products) => {
    if (err) {
      console.error('Error comparing products:', err);
      return res.status(500).json({ error: 'Error comparing products' });
    }

    if (products.length !== productIds.length) {
      return res.status(404).json({ error: 'One or more products not found' });
    }

    res.json(products);
  });
});

// Get personalized recommendations
router.get('/user/recommendations', requireAuth, (req, res) => {
  const userId = req.session.userId;

  // Get recommendations based on wishlist, cart, and recently viewed categories
  const query = `
    SELECT DISTINCT p.*, COALESCE(AVG(pr.rating), 0) as avg_rating, COUNT(pr.id) as review_count
    FROM products p
    LEFT JOIN product_reviews pr ON p.id = pr.product_id
    WHERE p.category IN (
      SELECT DISTINCT p2.category FROM products p2
      WHERE p2.id IN (
        SELECT product_id FROM wishlist WHERE user_id = ?
        UNION
        SELECT product_id FROM recently_viewed WHERE user_id = ? ORDER BY viewed_at DESC LIMIT 5
      )
    )
    AND p.id NOT IN (
      SELECT product_id FROM wishlist WHERE user_id = ?
    )
    AND p.stock > 0
    GROUP BY p.id
    ORDER BY avg_rating DESC, review_count DESC
    LIMIT 8
  `;

  db.all(query, [userId, userId, userId], (err, products) => {
    if (err) {
      console.error('Error fetching recommendations:', err);
      return res.status(500).json({ error: 'Error fetching recommendations' });
    }
    res.json(products);
  });
});

module.exports = router;
