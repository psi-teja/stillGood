const Product = require('../models/product.model');
const Business = require('../models/business.model');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = async (req, res) => {
  try {
    const { 
      search, 
      category, 
      minPrice, 
      maxPrice, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      limit = 10, 
      page = 1 
    } = req.query;
    
    let query = { isActive: true, isSoldOut: false };
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add category filter
    if (category) {
      query.category = category;
    }
    
    // Add price filter
    if (minPrice || maxPrice) {
      query.discountedPrice = {};
      if (minPrice) query.discountedPrice.$gte = Number(minPrice);
      if (maxPrice) query.discountedPrice.$lte = Number(maxPrice);
    }
    
    // Only show products that haven't expired
    query.expiryDate = { $gte: new Date() };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determine sort order
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const products = await Product.find(query)
      .populate('business', 'name address location rating')
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort);
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get products near user location
 * @route   GET /api/products/nearby
 * @access  Public
 */
const getNearbyProducts = async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      radius = 10, // in kilometers
      search,
      category,
      limit = 10, 
      page = 1 
    } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        message: 'Latitude and longitude are required' 
      });
    }
    
    // Find businesses near the location
    const nearbyBusinesses = await Business.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius) * 1000 // convert km to meters
        }
      },
      isActive: true
    }).select('_id');
    
    const businessIds = nearbyBusinesses.map(business => business._id);
    
    if (businessIds.length === 0) {
      return res.json({
        success: true,
        products: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: 0
        }
      });
    }
    
    let query = { 
      business: { $in: businessIds },
      isActive: true, 
      isSoldOut: false,
      expiryDate: { $gte: new Date() }
    };
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add category filter
    if (category) {
      query.category = category;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query)
      .populate('business', 'name address location rating')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get nearby products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('business', 'name address location contactPhone contactEmail openingHours rating');
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Business
 */
const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    // Find business owned by user
    const business = await Business.findOne({ owner: req.user._id });
    
    if (!business) {
      return res.status(404).json({ 
        success: false, 
        message: 'Business not found. Please create a business profile first.' 
      });
    }
    
    const {
      name,
      description,
      category,
      originalPrice,
      discountedPrice,
      quantity,
      expiryDate,
      pickupTimeStart,
      pickupTimeEnd,
      tags,
      allergens,
      dietaryInfo
    } = req.body;
    
    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      // In a real app, you would upload these to cloud storage
      // For now, we'll just use placeholder URLs
      images = req.files.map((file, index) => 
        `https://via.placeholder.com/500x300?text=Product+Image+${index + 1}`
      );
    }
    
    const product = new Product({
      business: business._id,
      name,
      description,
      category,
      originalPrice,
      discountedPrice,
      quantity,
      quantityAvailable: quantity,
      expiryDate,
      pickupTimeStart,
      pickupTimeEnd,
      images,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      allergens: allergens ? allergens.split(',').map(allergen => allergen.trim()) : [],
      dietaryInfo: dietaryInfo ? dietaryInfo.split(',').map(info => info.trim()) : []
    });
    
    const savedProduct = await product.save();
    
    res.status(201).json({
      success: true,
      product: savedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Business
 */
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Find business owned by user
    const business = await Business.findOne({ owner: req.user._id });
    
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    
    // Check if user owns the business that created this product
    if (product.business.toString() !== business._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this product' 
      });
    }
    
    const {
      name,
      description,
      category,
      originalPrice,
      discountedPrice,
      quantity,
      expiryDate,
      pickupTimeStart,
      pickupTimeEnd,
      tags,
      allergens,
      dietaryInfo
    } = req.body;
    
    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (originalPrice) product.originalPrice = originalPrice;
    if (discountedPrice) product.discountedPrice = discountedPrice;
    
    if (quantity) {
      const diff = quantity - product.quantity;
      product.quantity = quantity;
      product.quantityAvailable += diff;
      
      // Make sure quantityAvailable doesn't go below 0
      if (product.quantityAvailable < 0) {
        product.quantityAvailable = 0;
      }
      
      // Update isSoldOut based on quantityAvailable
      product.isSoldOut = product.quantityAvailable <= 0;
    }
    
    if (expiryDate) product.expiryDate = expiryDate;
    if (pickupTimeStart) product.pickupTimeStart = pickupTimeStart;
    if (pickupTimeEnd) product.pickupTimeEnd = pickupTimeEnd;
    
    if (tags) product.tags = tags.split(',').map(tag => tag.trim());
    if (allergens) product.allergens = allergens.split(',').map(allergen => allergen.trim());
    if (dietaryInfo) product.dietaryInfo = dietaryInfo.split(',').map(info => info.trim());
    
    // Handle image uploads
    if (req.files && req.files.length > 0) {
      // In a real app, you would upload these to cloud storage
      // For now, we'll just use placeholder URLs
      product.images = req.files.map((file, index) => 
        `https://via.placeholder.com/500x300?text=Product+Image+${index + 1}`
      );
    }
    
    const updatedProduct = await product.save();
    
    res.json({
      success: true,
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Business
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Find business owned by user
    const business = await Business.findOne({ owner: req.user._id });
    
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    
    // Check if user owns the business that created this product
    if (product.business.toString() !== business._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this product' 
      });
    }
    
    // Instead of deleting, mark as inactive
    product.isActive = false;
    await product.save();
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Mark product as sold out
 * @route   PATCH /api/products/:id/sold-out
 * @access  Private/Business
 */
const markAsSoldOut = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Find business owned by user
    const business = await Business.findOne({ owner: req.user._id });
    
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    
    // Check if user owns the business that created this product
    if (product.business.toString() !== business._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this product' 
      });
    }
    
    product.isSoldOut = true;
    product.quantityAvailable = 0;
    
    const updatedProduct = await product.save();
    
    res.json({
      success: true,
      product: updatedProduct
    });
  } catch (error) {
    console.error('Mark as sold out error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllProducts,
  getNearbyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  markAsSoldOut
};
