const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const Product = require('./models/Product');
const Admin = require('./models/Admin');
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopzone';

const exportFallback = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB (${mongoURI})...`);

    // 1. Export Products
    const products = await Product.find({}).lean();
    console.log(`Found ${products.length} products in MongoDB.`);

    const formattedProducts = products.map((p) => ({
      _id: p._id.toString(),
      title: p.title,
      description: p.description,
      mainImg: p.mainImg,
      category: p.category,
      gender: p.gender || 'Unisex',
      price: p.price,
      discount: p.discount || 0,
      sizes: p.sizes || [],
    }));

    const productsContent = `export const fallbackProducts = ${JSON.stringify(formattedProducts, null, 2)};\n`;
    const productsPath = path.join(__dirname, '../client/src/assets/fallbackProducts.js');
    fs.writeFileSync(productsPath, productsContent, 'utf-8');
    console.log(`Successfully exported ${formattedProducts.length} products to ${productsPath}!`);

    // 2. Export Admin Settings (Banner & Categories)
    const adminSettings = await Admin.findOne({}).lean();
    const bannerUrl = adminSettings?.banner || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200';
    const categoriesList = adminSettings?.categories || ['Mobiles', 'Electronics', 'Sports-Equipment', 'Fashion', 'Groceries'];

    const settingsObject = {
      banner: bannerUrl,
      categories: categoriesList,
    };

    const settingsContent = `export const fallbackAdminSettings = ${JSON.stringify(settingsObject, null, 2)};\n`;
    const settingsPath = path.join(__dirname, '../client/src/assets/fallbackAdminSettings.js');
    fs.writeFileSync(settingsPath, settingsContent, 'utf-8');
    console.log(`Successfully exported Admin Settings (Banner: ${bannerUrl}) to ${settingsPath}!`);

    process.exit(0);
  } catch (error) {
    console.error('Export error:', error);
    process.exit(1);
  }
};

exportFallback();
