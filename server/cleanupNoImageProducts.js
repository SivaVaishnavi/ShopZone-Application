/**
 * cleanupNoImageProducts.js
 * Permanently deletes every product in MongoDB that has no image.
 * Run once from the server/ directory:
 *   node cleanupNoImageProducts.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./models/Product');

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopzone';

const cleanup = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB (${mongoURI})`);

    // Find products with no image
    const noImageFilter = {
      $or: [
        { mainImg: { $exists: false } },
        { mainImg: null },
        { mainImg: '' },
      ],
    };

    const found = await Product.find(noImageFilter).select('_id title').lean();

    if (found.length === 0) {
      console.log('No imageless products found. Nothing to delete.');
      process.exit(0);
    }

    console.log(`Found ${found.length} product(s) with no image:`);
    found.forEach((p) => console.log(`  • [${p._id}] ${p.title}`));

    const result = await Product.deleteMany(noImageFilter);
    console.log(`\n✅ Permanently deleted ${result.deletedCount} product(s).`);

    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
};

cleanup();
