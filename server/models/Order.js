const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  mainImg: { type: String },
  size: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  paymentMethod: { type: String, required: true },
  orderDate: { type: String, required: true },
  deliveryDate: { type: String },
  orderStatus: { type: String, default: 'Order placed' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
