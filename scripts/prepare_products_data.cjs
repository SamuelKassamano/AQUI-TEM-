const fs = require('fs');

const dump = JSON.parse(fs.readFileSync('supabase_products_dump.json', 'utf8'));

// Read pricing reference
const pricingCode = fs.readFileSync('src/data/productPricing.js', 'utf8');

console.log('Total supabase products to incorporate into data/products.js:', dump.length);
