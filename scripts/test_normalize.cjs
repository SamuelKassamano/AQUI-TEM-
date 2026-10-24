const fs = require('fs');
const products = JSON.parse(fs.readFileSync('supabase_products_dump.json', 'utf8'));

// Simulating normalizeProduct logic from supabase.js
products.forEach((p, idx) => {
  const isSupabaseRow = Boolean(p.id && typeof p.id === 'string' && p.id.length > 10);
  console.log(`[${idx + 1}] ID: ${p.id} | Name: ${p.name}`);
  console.log(`    Price in DB: ${p.price} | Sale Price in DB: ${p.sale_price} | Active: ${p.active}`);
  console.log(`    Stock: ${p.stock} | SKU: ${p.sku} | Brand: ${p.brand}`);
});
