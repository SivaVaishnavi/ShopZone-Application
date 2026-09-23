const Cart = require('../models/Cart');

// @route GET /api/cart  (logged-in user's cart)
const getCart = async (req, res) => {
  try {
    const items = await Cart.find({ userId: req.user.id });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/cart
const addToCart = async (req, res) => {
  try {
    const { productId, title, mainImg, size, quantity, price, discount } = req.body;

    let existing = await Cart.findOne({ userId: req.user.id, productId, size });
    if (existing) {
      existing.quantity += quantity || 1;
      await existing.save();
      return res.status(200).json(existing);
    }

    const item = await Cart.create({
      userId: req.user.id,
      productId,
      title,
      mainImg,
      size,
      quantity: quantity || 1,
      price,
      discount,
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/cart/:id
const updateCartItem = async (req, res) => {
  try {
    const item = await Cart.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Cart item not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/cart/:id
const removeFromCart = async (req, res) => {
  try {
    const item = await Cart.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ message: 'Cart item not found' });
    res.status(200).json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
