const Business = require('../models/business.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all businesses
 * @route   GET /api/businesses
 * @access  Public
 */
const getAllBusinesses = async (req, res) => {
  try {
    const { search, category, limit = 10, page = 1 } = req.query;
    
    let query = { isActive: true };
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add category filter
    if (category) {
      query.businessType = category;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const businesses = await Business.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ rating: -1 });
    
    const total = await Business.countDocuments(query);
    
    res.json({
      success: true,
      businesses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all businesses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get business by ID
 * @route   GET /api/businesses/:id
 * @access  Public
 */
const getBusinessById = async (req, res) => {
  try {
    const business = await Business.findOne({ 
      _id: req.params.id,
      isActive: true
    });
    
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    
    res.json({
      success: true,
      business
    });
  } catch (error) {
    console.error('Get business by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Create business profile
 * @route   POST /api/businesses
 * @access  Private/Business
 */
const createBusiness = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    // Check if user already has a business
    const existingBusiness = await Business.findOne({ owner: req.user._id });
    
    if (existingBusiness) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have a business profile' 
      });
    }
    
    const {
      name,
      description,
      businessType,
      address,
      location,
      contactPhone,
      contactEmail,
      website,
      openingHours
    } = req.body;
    
    const business = new Business({
      owner: req.user._id,
      name,
      description,
      businessType,
      address,
      location,
      contactPhone,
      contactEmail,
      website,
      openingHours
    });
    
    const savedBusiness = await business.save();
    
    res.status(201).json({
      success: true,
      business: savedBusiness
    });
  } catch (error) {
    console.error('Create business error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update business profile
 * @route   PUT /api/businesses/:id
 * @access  Private/Business
 */
const updateBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    
    // Check if user owns the business
    if (business.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this business' 
      });
    }
    
    const {
      name,
      description,
      businessType,
      address,
      location,
      contactPhone,
      contactEmail,
      website,
      openingHours
    } = req.body;
    
    // Update fields
    if (name) business.name = name;
    if (description) business.description = description;
    if (businessType) business.businessType = businessType;
    if (address) business.address = address;
    if (location) business.location = location;
    if (contactPhone) business.contactPhone = contactPhone;
    if (contactEmail) business.contactEmail = contactEmail;
    if (website) business.website = website;
    if (openingHours) business.openingHours = openingHours;
    
    const updatedBusiness = await business.save();
    
    res.json({
      success: true,
      business: updatedBusiness
    });
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get business analytics
 * @route   GET /api/businesses/:id/analytics
 * @access  Private/Business
 */
const getBusinessAnalytics = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    
    // Check if user owns the business
    if (business.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view analytics for this business' 
      });
    }
    
    // Get total products
    const totalProducts = await Product.countDocuments({ business: business._id });
    
    // Get active products
    const activeProducts = await Product.countDocuments({ 
      business: business._id,
      isActive: true,
      isSoldOut: false
    });
    
    // Get total orders
    const totalOrders = await Order.countDocuments({ business: business._id });
    
    // Get orders by status
    const pendingOrders = await Order.countDocuments({ 
      business: business._id,
      status: 'pending'
    });
    
    const confirmedOrders = await Order.countDocuments({ 
      business: business._id,
      status: 'confirmed'
    });
    
    const completedOrders = await Order.countDocuments({ 
      business: business._id,
      status: 'completed'
    });
    
    const cancelledOrders = await Order.countDocuments({ 
      business: business._id,
      status: 'cancelled'
    });
    
    // Get sales data for last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const salesData = await Order.aggregate([
      {
        $match: {
          business: business._id,
          status: 'completed',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Get product categories distribution
    const categoriesData = await Product.aggregate([
      {
        $match: {
          business: business._id,
          isActive: true
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.json({
      success: true,
      analytics: {
        products: {
          total: totalProducts,
          active: activeProducts
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          completed: completedOrders,
          cancelled: cancelledOrders
        },
        salesData,
        categoriesData,
        impactMetrics: business.impactMetrics
      }
    });
  } catch (error) {
    console.error('Get business analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get business reviews
 * @route   GET /api/businesses/:id/reviews
 * @access  Public
 */
const getBusinessReviews = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .select('reviews rating')
      .populate({
        path: 'reviews.user',
        select: 'name profileImage'
      });
    
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    
    res.json({
      success: true,
      reviews: business.reviews,
      rating: business.rating
    });
  } catch (error) {
    console.error('Get business reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Add business review
 * @route   POST /api/businesses/:id/reviews
 * @access  Private
 */
const addBusinessReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { rating, comment } = req.body;
    
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    
    // Check if user has already reviewed this business
    const alreadyReviewed = business.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );
    
    if (alreadyReviewed) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this business' 
      });
    }
    
    // Check if user has completed an order with this business
    const hasOrder = await Order.findOne({
      consumer: req.user._id,
      business: business._id,
      status: 'completed'
    });
    
    if (!hasOrder) {
      return res.status(400).json({ 
        success: false, 
        message: 'You can only review businesses after completing an order' 
      });
    }
    
    // Add review
    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment,
      date: Date.now()
    };
    
    business.reviews.push(review);
    
    // Update business rating
    const totalRatings = business.reviews.length;
    business.rating.average = (
      business.reviews.reduce((sum, item) => sum + item.rating, 0) / totalRatings
    ).toFixed(1);
    business.rating.count = totalRatings;
    
    await business.save();
    
    res.status(201).json({
      success: true,
      message: 'Review added successfully'
    });
  } catch (error) {
    console.error('Add business review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  getBusinessAnalytics,
  getBusinessReviews,
  addBusinessReview
};
