const fs = require('fs');
const products = JSON.parse(fs.readFileSync('supabase_products_dump.json', 'utf8'));

console.log('Total products in Supabase:', products.length);
console.log('================================================================');
products.forEach((p, index) => {
  console.log('[' + (index + 1) + '] ID: ' + p.id);
  console.log('    Name: ' + p.name);
  console.log('    Brand: ' + p.brand + ' | Category: ' + p.category + ' | SKU: ' + p.sku);
  console.log('    Price: ' + p.price + ' | Sale Price: ' + p.sale_price + ' | Old Price: ' + p.old_price);
  console.log('    Stock: ' + p.stock + ' | Active: ' + p.active);
  console.log('    Created At: ' + p.created_at);
  console.log('    Slug: ' + p.slug);
  console.log('    SEO Title: ' + (p.seo_title || '(null)'));
  console.log('    SEO Desc: ' + (p.seo_description || '(null)'));
  const imgPreview = p.image_url ? (p.image_url.startsWith('data:') ? 'base64 (' + p.image_url.length + ' chars)' : p.image_url) : 'none';
  console.log('    Image: ' + imgPreview);
  console.log('----------------------------------------------------------------');
});
