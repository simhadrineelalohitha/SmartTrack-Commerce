/**
 * Database Factory
 * Uses PostgreSQL in production (Render) and SQLite in development
 */

const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

if (isProduction && process.env.DATABASE_URL) {
  console.log('🔵 Using PostgreSQL database');
  module.exports = require('./db-postgres');
} else {
  console.log('🟢 Using SQLite database');
  module.exports = require('./db-sqlite');
}
