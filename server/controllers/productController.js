const Product = require('../models/Product');
const downloadImageFromUrl = require('../utils/downloadImage');

// @route GET /api/products
const getProducts = async (req, res) => {
  try {
    const { category, gender, sort, search } = req.query;

    // Never return products that have no image — they would show as broken cards
    const filter = { mainImg: { $exists: true, $ne: '' } };

    if (category) {
      if (/^sports(-equipment)?$/i.test(category)) {
        filter.category = new RegExp('^(Sports|Sports-Equipment)$', 'i');
      } else {
        filter.category = new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      }
    }
    if (gender) filter.gender = new RegExp(`^${gender}$`, 'i');
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    let query = Product.find(filter);

    if (sort === 'price_low') {
      query = query.sort({ price: 1 });
    } else if (sort === 'price_high') {
      query = query.sort({ price: -1 });
    } else if (sort === 'discount') {
      query = query.sort({ discount: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const products = await query.exec();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @route GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @route GET /api/products/:id/related
const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Prefer same category + gender, close in price; fall back to category only
    let related = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      gender: product.gender,
    })
      .limit(8)
      .exec();

    if (related.length < 4) {
      const fallback = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
      })
        .limit(8)
        .exec();

      related = fallback;
    }

    // Sort by closeness in price to the current product
    related.sort((a, b) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price));

    res.status(200).json(related.slice(0, 4));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Resolve the public base URL for this server instance
const getServerBaseUrl = () => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/+$/, '');
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL.replace(/\/+$/, '');
  return `http://localhost:${process.env.PORT || 8000}`;
};

// @route POST /api/products
const createProduct = async (req, res) => {
  try {
    let mainImg = '';

    if (req.file) {
      mainImg = `${getServerBaseUrl()}/uploads/${req.file.filename}`;
    } else if (req.body.mainImgUrl) {
      mainImg = await downloadImageFromUrl(req.body.mainImgUrl);
    }

    if (!mainImg) {
      return res.status(400).json({ message: 'Please provide an image (upload or URL).' });
    }

    const product = await Product.create({
      title: req.body.title,
      description: req.body.description,
      mainImg,
      category: req.body.category,
      gender: req.body.gender,
      price: Number(req.body.price),
      discount: Number(req.body.discount) || 0,
      sizes: req.body.sizes ? JSON.parse(req.body.sizes) : [],
      carousel: [],
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @route PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    if (req.body.title !== undefined) product.title = req.body.title;
    if (req.body.description !== undefined) product.description = req.body.description;
    if (req.body.category !== undefined) product.category = req.body.category;
    if (req.body.gender !== undefined) product.gender = req.body.gender;
    if (req.body.price !== undefined) product.price = Number(req.body.price);
    if (req.body.discount !== undefined) product.discount = Number(req.body.discount);

    if (req.body.sizes) {
      product.sizes = JSON.parse(req.body.sizes);
    }

    if (req.file) {
      product.mainImg = `${getServerBaseUrl()}/uploads/${req.file.filename}`;
    } else if (req.body.mainImgUrl) {
      product.mainImg = await downloadImageFromUrl(req.body.mainImgUrl);
    }

    const updatedProduct = await product.save();

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @route DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    res.status(200).json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};