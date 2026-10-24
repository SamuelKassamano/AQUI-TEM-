const fs = require('fs');
const products = JSON.parse(fs.readFileSync('supabase_products_dump.json', 'utf8'));

console.log('--- SUPABASE PRODUCTS (RAW) ---');
products.forEach((p, idx) => {
  console.log(`${idx + 1}. [${p.id}] ${p.name}`);
  console.log(`   Price: ${p.price} | Sale Price: ${p.sale_price} | Active: ${p.active}`);
  console.log(`   SKU: ${p.sku} | Brand: ${p.brand} | Created: ${p.created_at}`);
});
