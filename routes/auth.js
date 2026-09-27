const express = require('express');
const crypto = require('crypto');
const db = require('../database/db-factory');

const router = express.Router();

// Simple password hashing using Node.js crypto module
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password, hashedPassword) {
  const hash = hashPassword(password);
  return hash === hashedPassword;
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, confirmPassword, name } = req.body;

    // Validate all fields present
    if (!email || !password || !confirmPassword || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate name
    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters long' });
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()], async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (row) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      try {
        // Hash password
        const hashedPassword = hashPassword(password);

        // Insert new user
        db.run(
          'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
          [email.toLowerCase(), hashedPassword, name.trim()],
          function(err) {
            if (err) {
              console.error('Error creating user:', err);
              return res.status(500).json({ error: 'Error creating user' });
            }

            // Create session
            req.session.userId = this.lastID;
            req.session.userEmail = email.toLowerCase();
            req.session.userName = name.trim();

            res.status(201).json({
              message: 'Registration successful',
              user: {
                id: this.lastID,
                email: email.toLowerCase(),
                name: name.trim()
              }
            });
          }
        );
      } catch (hashError) {
        console.error('Hashing error:', hashError);
        return res.status(500).json({ error: 'Error processing password' });
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      try {
        // Compare passwords
        const validPassword = verifyPassword(password, user.password);

        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create session
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.userName = user.name;

        res.json({
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        });
      } catch (compareError) {
        console.error('Password comparison error:', compareError);
        return res.status(500).json({ error: 'Authentication error' });
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Error logging out' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  db.get('SELECT id, email, name, created_at FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      req.session.destroy();
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      }
    });
  });
});

// Export middleware for use in other routes
router.requireAuth = requireAuth;

module.exports = router;
