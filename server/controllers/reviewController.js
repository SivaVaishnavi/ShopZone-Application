const Review  = require('../models/Review');
const Product = require('../models/Product');
const User    = require('../models/User');

// GET /api/products/:id/reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/products/:id/reviews  (auth required)
const addReview = async (req, res) => {
  try {
    const { rating, title, body } = req.body;
    if (!rating || !body) {
      return res.status(400).json({ message: 'Rating and review text are required.' });
    }

    const productId = req.params.id;

    // Fetch username from DB (token only carries id + usertype)
    const user = await User.findById(req.user.id).select('username');
    const username = user ? user.username : 'Anonymous';

    // Upsert: one review per user per product
    const review = await Review.findOneAndUpdate(
      { productId, userId: String(req.user.id) },
      {
        productId,
        userId:   String(req.user.id),
        username,
        rating:   Number(rating),
        title:    title || '',
        body,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Recalculate aggregate rating on the product
    const agg = await Review.aggregate([
      { $match: { productId: review.productId } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (agg.length) {
      await Product.findByIdAndUpdate(productId, {
        rating:      Math.round(agg[0].avg * 10) / 10,
        reviewCount: agg[0].count,
      });
    }

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getReviews, addReview };
