const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopzone';

const run = async () => {
  try {
    await mongoose.connect(mongoURI);
    const Product = require('./models/Product');
    const products = await Product.find({ mainImg: { $exists: true, $ne: '' } }).lean();
    fs.writeFileSync('../client/src/assets/fallbackProducts.js', 'export const fallbackProducts = ' + JSON.stringify(products, null, 2) + ';\n');
    console.log(`✅ Updated fallbackProducts.js with ${products.length} products!`);
    process.exit(0);
  } catch (err) {
    console.error('Error exporting fallback products:', err);
    process.exit(1);
  }
};

run();
