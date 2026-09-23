const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Admin = require('../models/Admin');

// @route GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ usertype: 'Customer' });
    const allProducts = await Product.countDocuments();
    const allOrders = await Order.countDocuments();
    res.status(200).json({ totalUsers, allProducts, allOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ usertype: 'Customer' }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/admin/settings  (banner + categories)
const getSettings = async (req, res) => {
  try {
    let settings = await Admin.findOne();
    if (!settings) settings = await Admin.create({ banner: '', categories: [] });
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/admin/settings  (update banner / categories)
const updateSettings = async (req, res) => {
  try {
    let settings = await Admin.findOne();
    if (!settings) {
      settings = await Admin.create(req.body);
    } else {
      settings = await Admin.findByIdAndUpdate(settings._id, req.body, { new: true });
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getAllUsers, getSettings, updateSettings };
