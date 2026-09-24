const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');

// @route POST /api/orders  (place order - checkout)
const placeOrder = async (req, res) => {
  try {
    const {
      name, email, mobile, address, pincode,
      title, description, mainImg, size, quantity,
      price, discount, paymentMethod, orderDate, deliveryDate, cartItemId,
    } = req.body;

    const order = await Order.create({
      userId: req.user.id,
      name, email, mobile, address, pincode,
      title, description, mainImg, size, quantity,
      price, discount, paymentMethod,
      orderDate: orderDate || new Date().toISOString().split('T')[0],
      deliveryDate,
    });

    // remove the item from cart once ordered
    if (cartItemId) {
      await Cart.findOneAndDelete({ _id: cartItemId, userId: req.user.id });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/orders/my  (logged-in user's orders)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { orderStatus: 'Cancelled' },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/orders  (admin - all orders)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/orders/user/:userId  (admin - orders by user)
const getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/orders/:id/status  (admin - update order status)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/orders/:id/approve  (admin - approve order)
const approveOrder = async (req, res) => {
  try {
    let adminName = 'ShopZeAdmin';
    if (req.user && req.user.id) {
      const adminUser = await User.findById(req.user.id);
      if (adminUser) adminName = adminUser.username || adminUser.email;
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'Approved', orderStatus: 'Processing', approvedBy: adminName },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/orders/:id/reject  (admin - reject order)
const rejectOrder = async (req, res) => {
  try {
    let adminName = 'ShopZeAdmin';
    if (req.user && req.user.id) {
      const adminUser = await User.findById(req.user.id);
      if (adminUser) adminName = adminUser.username || adminUser.email;
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'Rejected', orderStatus: 'Cancelled', approvedBy: adminName },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/orders/pending-count  (admin - count of pending approvals)
const getPendingCount = async (req, res) => {
  try {
    const count = await Order.countDocuments({ approvalStatus: 'Pending' });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  placeOrder, getMyOrders, cancelOrder, getAllOrders,
  getOrdersByUser, updateOrderStatus, approveOrder, rejectOrder, getPendingCount,
};
