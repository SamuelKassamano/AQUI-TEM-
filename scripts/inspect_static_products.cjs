const fs = require('fs');
const content = fs.readFileSync('data/products.js', 'utf8');
const regex = /id:\s*(\d+),[\s\S]*?supabaseId:\s*['"]([^'"]+)['"],[\s\S]*?name:\s*['"]([^'"]+)['"]/g;
let match;
console.log('Static PRODUCTS in data/products.js:');
while ((match = regex.exec(content)) !== null) {
  console.log('Local ID: ' + match[1] + ' | Supabase UUID: ' + match[2] + ' | Name: ' + match[3]);
}
