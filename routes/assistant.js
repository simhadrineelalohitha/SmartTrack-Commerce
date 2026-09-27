const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Simple rule-based product assistant
router.post('/ask', (req, res) => {
  const { question, productId, productIds } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const lowerQuestion = question.toLowerCase().trim();

  // Product comparison
  if (productIds && productIds.length > 1 && (lowerQuestion.includes('compare') || lowerQuestion.includes('difference') || lowerQuestion.includes('better'))) {
    return handleComparison(productIds, res);
  }

  // Single product questions
  if (productId) {
    return handleProductQuestion(productId, lowerQuestion, res);
  }

  // General recommendations
  if (lowerQuestion.includes('recommend') || lowerQuestion.includes('suggest') || lowerQuestion.includes('best')) {
    return handleRecommendation(lowerQuestion, res);
  }

  // Default response
  res.json({
    answer: "I can help you with product information! You can ask me:\n\n" +
            "• What is this product?\n" +
            "• What are the main features?\n" +
            "• Is it in stock?\n" +
            "• Show me similar products\n" +
            "• Compare products\n" +
            "• What should I consider before buying?\n\n" +
            "Please select a product or ask a specific question about it.",
    type: 'info'
  });
});

function handleProductQuestion(productId, question, res) {
  const query = `
    SELECT p.*, 
           COALESCE(AVG(pr.rating), 0) as avg_rating, 
           COUNT(pr.id) as review_count
    FROM products p
    LEFT JOIN product_reviews pr ON p.id = pr.product_id
    WHERE p.id = ?
    GROUP BY p.id
  `;

  db.get(query, [productId], (err, product) => {
    if (err || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let answer = '';
    
    // Parse specifications if available
    let specs = {};
    if (product.specifications) {
      try {
        specs = JSON.parse(product.specifications);
      } catch (e) {
        specs = {};
      }
    }

    // Price info including discount
    const originalPrice = product.price + (product.discount || 0);
    const hasDiscount = product.discount && product.discount > 0;

    // What is this product / features
    if (question.includes('what is') || question.includes('tell me about') || question.includes('describe')) {
      answer = `**${product.name}**\n`;
      if (product.brand) answer += `_by ${product.brand}_\n\n`;
      answer += `${product.description}\n\n`;
      answer += `**Price:** $${parseFloat(product.price).toFixed(2)}`;
      if (hasDiscount) {
        answer += ` ~~$${originalPrice.toFixed(2)}~~ (Save $${product.discount.toFixed(2)}!)`;
      }
      answer += `\n**Category:** ${product.category}${product.subcategory ? ` > ${product.subcategory}` : ''}\n`;
      answer += `**Availability:** ${product.stock > 0 ? `✅ In stock (${product.stock} available)` : '❌ Out of stock'}\n`;
      if (product.avg_rating > 0) {
        answer += `**Rating:** ${product.avg_rating.toFixed(1)}/5 ⭐ (${product.review_count} reviews)\n`;
      }
    }
    // Features / specifications
    else if (question.includes('feature') || question.includes('specification') || question.includes('specs') || question.includes('details')) {
      answer = `**${product.name} - Specifications:**\n\n`;
      answer += `${product.description}\n\n`;
      
      if (Object.keys(specs).length > 0) {
        answer += `**Key Specs:**\n`;
        Object.entries(specs).forEach(([key, value]) => {
          answer += `• ${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value}\n`;
        });
        answer += `\n`;
      }
      
      answer += `**Price:** $${parseFloat(product.price).toFixed(2)}`;
      if (hasDiscount) answer += ` (${Math.round(product.discount/originalPrice*100)}% off)`;
      answer += `\n`;
      if (product.brand) answer += `**Brand:** ${product.brand}\n`;
      if (product.avg_rating > 0) {
        answer += `**Rating:** ${product.avg_rating.toFixed(1)}/5 ⭐ (${product.review_count} reviews)\n`;
      }
    }
    // Availability / stock
    else if (question.includes('stock') || question.includes('available') || question.includes('in stock')) {
      if (product.stock > 0) {
        answer = `✅ **${product.name}** is currently in stock!\n\n`;
        answer += `📦 **${product.stock} units** available\n`;
        answer += `💰 **Price:** $${parseFloat(product.price).toFixed(2)}`;
        if (hasDiscount) answer += ` (Save $${product.discount.toFixed(2)}!)`;
      } else {
        answer = `❌ **${product.name}** is currently out of stock.\n\n`;
        answer += `Check back later or explore similar products in **${product.category}**.`;
      }
    }
    // Price / cost / expensive
    else if (question.includes('price') || question.includes('cost') || question.includes('expensive') || question.includes('cheap')) {
      answer = `**${product.name}** is priced at **$${parseFloat(product.price).toFixed(2)}**\n\n`;
      if (hasDiscount) {
        answer += `🏷️ **Special offer!** Originally $${originalPrice.toFixed(2)}, save $${product.discount.toFixed(2)} (${Math.round(product.discount/originalPrice*100)}% off)\n\n`;
      }
      if (product.brand) answer += `Brand: ${product.brand}\n`;
      answer += `Category: ${product.category}\n`;
      if (product.avg_rating > 0) {
        answer += `Rating: ${product.avg_rating.toFixed(1)}/5 ⭐ from ${product.review_count} customers\n`;
      }
    }
    // Is it suitable / good for me
    else if (question.includes('suitable') || question.includes('good for') || question.includes('right for me') || question.includes('should i buy')) {
      answer = `**${product.name}** might be perfect for you if:\n\n`;
      answer += `✓ You're looking for ${product.category}${product.subcategory ? ` (specifically ${product.subcategory})` : ''}\n`;
      answer += `✓ Your budget is around $${parseFloat(product.price).toFixed(2)}`;
      if (hasDiscount) answer += ` (currently on sale!)`;
      answer += `\n`;
      if (product.brand) answer += `✓ You prefer ${product.brand} products\n`;
      if (product.avg_rating >= 4) {
        answer += `✓ You want a highly-rated product (${product.avg_rating.toFixed(1)}/5 ⭐)\n`;
      }
      answer += `\n**Product highlights:**\n${product.description}\n`;
      if (product.review_count > 0) {
        answer += `\n💬 Read ${product.review_count} customer reviews for real experiences!`;
      }
    }
    // Brand question
    else if (question.includes('brand') || question.includes('manufacturer') || question.includes('who makes')) {
      if (product.brand) {
        answer = `**${product.name}** is made by **${product.brand}**\n\n`;
        answer += `${product.description}\n\n`;
        answer += `Price: $${parseFloat(product.price).toFixed(2)}`;
        if (hasDiscount) answer += ` (On sale!)`;
      } else {
        answer = `Brand information is not specified for **${product.name}**.\n\n`;
        answer += `${product.description}`;
      }
    }
    // Similar products
    else if (question.includes('similar') || question.includes('alternative') || question.includes('other options') || question.includes('like this')) {
      return getSimilarProducts(product.id, product.category, res);
    }
    // Before buying / consider
    else if (question.includes('consider') || question.includes('before buying') || question.includes('should i know')) {
      answer = `**Before buying ${product.name}, consider:**\n\n`;
      answer += `💰 **Price:** $${parseFloat(product.price).toFixed(2)}`;
      if (hasDiscount) answer += ` (${Math.round(product.discount/originalPrice*100)}% discount!)`;
      answer += `\n`;
      if (product.brand) answer += `🏷️ **Brand:** ${product.brand}\n`;
      answer += `📦 **Availability:** ${product.stock > 0 ? `✅ In stock (${product.stock} available)` : '⚠️ Currently out of stock'}\n`;
      if (product.avg_rating > 0) {
        answer += `⭐ **Rating:** ${product.avg_rating.toFixed(1)}/5 from ${product.review_count} customers\n`;
      } else {
        answer += `ℹ️ **No reviews yet** - Be the first!\n`;
      }
      answer += `📂 **Category:** ${product.category}${product.subcategory ? ` > ${product.subcategory}` : ''}\n\n`;
      
      if (Object.keys(specs).length > 0) {
        answer += `**Key specifications:**\n`;
        Object.entries(specs).slice(0, 5).forEach(([key, value]) => {
          answer += `• ${key.replace(/_/g, ' ')}: ${value}\n`;
        });
        answer += `\n`;
      }
      
      answer += `💡 **Tip:** Check customer reviews and compare similar products before deciding.`;
    }
    // Warranty / guarantee
    else if (question.includes('warranty') || question.includes('guarantee') || question.includes('return')) {
      answer = `For **${product.name}**:\n\n`;
      answer += `Our standard policies apply:\n`;
      answer += `• 30-day return policy\n`;
      answer += `• Manufacturer warranty (varies by product)\n`;
      answer += `• Secure payments and buyer protection\n\n`;
      answer += `For specific warranty details, please check with our customer service after purchase.`;
    }
    else {
      // Default comprehensive response
      answer = `**${product.name}**\n`;
      if (product.brand) answer += `_by ${product.brand}_\n\n`;
      answer += `${product.description}\n\n`;
      answer += `💰 **Price:** $${parseFloat(product.price).toFixed(2)}`;
      if (hasDiscount) answer += ` ~~$${originalPrice.toFixed(2)}~~ 🏷️`;
      answer += `\n📦 **Stock:** ${product.stock > 0 ? `${product.stock} available` : 'Out of stock'}\n`;
      if (product.avg_rating > 0) {
        answer += `⭐ **Rating:** ${product.avg_rating.toFixed(1)}/5 (${product.review_count} reviews)\n`;
      }
      answer += `\n**Ask me:**\n`;
      answer += `• What are the specifications?\n`;
      answer += `• Is it suitable for me?\n`;
      answer += `• Show similar products\n`;
      answer += `• What should I consider?\n`;
    }

    res.json({ answer, type: 'product', product });
  });
}

function getSimilarProducts(productId, category, res) {
  const query = `
    SELECT p.*, COALESCE(AVG(pr.rating), 0) as avg_rating, COUNT(pr.id) as review_count
    FROM products p
    LEFT JOIN product_reviews pr ON p.id = pr.product_id
    WHERE p.category = ? AND p.id != ? AND p.active = 1 AND p.stock > 0
    GROUP BY p.id
    ORDER BY avg_rating DESC
    LIMIT 4
  `;

  db.all(query, [category, productId], (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching similar products' });
    }

    if (products.length === 0) {
      return res.json({
        answer: `I couldn't find similar products in the **${category}** category at the moment. Try browsing other categories or check back later!`,
        type: 'info'
      });
    }

    let answer = `**Similar products in ${category}:**\n\n`;
    products.forEach((p, index) => {
      answer += `${index + 1}. **${p.name}**\n`;
      answer += `   Price: $${parseFloat(p.price).toFixed(2)}`;
      if (p.avg_rating > 0) {
        answer += ` | Rating: ${p.avg_rating.toFixed(1)}⭐`;
      }
      answer += `\n   ${p.description.substring(0, 100)}...\n\n`;
    });

    res.json({ answer, type: 'similar', products });
  });
}

function handleComparison(productIds, res) {
  if (productIds.length > 3) {
    return res.status(400).json({ error: 'You can compare up to 3 products at a time' });
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
    if (err || products.length < 2) {
      return res.status(400).json({ error: 'Unable to compare products' });
    }

    let answer = `**Product Comparison:**\n\n`;
    
    products.forEach((p, index) => {
      answer += `**${index + 1}. ${p.name}**\n`;
      answer += `   💰 Price: $${parseFloat(p.price).toFixed(2)}\n`;
      answer += `   📦 Stock: ${p.stock > 0 ? `${p.stock} available` : 'Out of stock'}\n`;
      answer += `   📂 Category: ${p.category}\n`;
      if (p.avg_rating > 0) {
        answer += `   ⭐ Rating: ${p.avg_rating.toFixed(1)}/5 (${p.review_count} reviews)\n`;
      } else {
        answer += `   ⭐ No reviews yet\n`;
      }
      answer += `\n`;
    });

    // Price comparison
    const prices = products.map(p => parseFloat(p.price));
    const cheapest = products.find(p => parseFloat(p.price) === Math.min(...prices));
    const mostExpensive = products.find(p => parseFloat(p.price) === Math.max(...prices));

    if (cheapest.id !== mostExpensive.id) {
      answer += `\n💡 **Price Analysis:**\n`;
      answer += `• Cheapest: **${cheapest.name}** at $${parseFloat(cheapest.price).toFixed(2)}\n`;
      answer += `• Most expensive: **${mostExpensive.name}** at $${parseFloat(mostExpensive.price).toFixed(2)}\n`;
    }

    // Rating comparison
    const rated = products.filter(p => p.review_count > 0);
    if (rated.length > 0) {
      const topRated = rated.reduce((a, b) => a.avg_rating > b.avg_rating ? a : b);
      answer += `\n⭐ **Top rated:** **${topRated.name}** with ${topRated.avg_rating.toFixed(1)}/5 stars\n`;
    }

    res.json({ answer, type: 'comparison', products });
  });
}

function handleRecommendation(question, res) {
  let category = null;
  
  // Try to extract category from question
  const categories = ['Electronics', 'Sports', 'Home', 'Accessories'];
  categories.forEach(cat => {
    if (question.includes(cat.toLowerCase())) {
      category = cat;
    }
  });

  let query = `
    SELECT p.*, COALESCE(AVG(pr.rating), 0) as avg_rating, COUNT(pr.id) as review_count
    FROM products p
    LEFT JOIN product_reviews pr ON p.id = pr.product_id
    WHERE p.active = 1 AND p.stock > 0
  `;
  const params = [];

  if (category) {
    query += ' AND p.category = ?';
    params.push(category);
  }

  query += ` GROUP BY p.id ORDER BY avg_rating DESC, review_count DESC LIMIT 5`;

  db.all(query, params, (err, products) => {
    if (err || products.length === 0) {
      return res.json({
        answer: "I'd love to recommend products! Please browse our categories or ask about a specific type of product.",
        type: 'info'
      });
    }

    let answer = category 
      ? `**Top recommendations in ${category}:**\n\n`
      : `**Top recommended products:**\n\n`;

    products.forEach((p, index) => {
      answer += `${index + 1}. **${p.name}** - $${parseFloat(p.price).toFixed(2)}`;
      if (p.avg_rating > 0) {
        answer += ` (${p.avg_rating.toFixed(1)}⭐)`;
      }
      answer += `\n`;
    });

    res.json({ answer, type: 'recommendation', products });
  });
}

module.exports = router;
