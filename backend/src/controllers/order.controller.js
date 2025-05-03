const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Business = require('../models/business.model');
const User = require('../models/user.model');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all orders for a business
 * @route   GET /api/orders/business
 * @access  Private/Business
 */
const getBusinessOrders = async (req, res) => {
  try {
    // Find business owned by user
    const business = await Business.findOne({ owner: req.user._id });
    
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    
    const { status, limit = 10, page = 1 } = req.query;
    
    let query = { business: business._id };
    
    // Add status filter
    if (status) {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(query)
      .populate('consumer', 'name email phone')
      .populate('product', 'name images discountedPrice')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Order.countDocuments(query);
    
    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get business orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get all orders for a consumer
 * @route   GET /api/orders/consumer
 * @access  Private
 */
const getConsumerOrders = async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    
    let query = { consumer: req.user._id };
    
    // Add status filter
    if (status) {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(query)
      .populate('business', 'name address contactPhone')
      .populate('product', 'name images discountedPrice')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Order.countDocuments(query);
    
    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get consumer orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('consumer', 'name email phone')
      .populate('business', 'name address contactPhone contactEmail')
      .populate('product', 'name description images discountedPrice expiryDate');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if user is authorized to view this order
    const isConsumer = order.consumer._id.toString() === req.user._id.toString();
    const business = await Business.findOne({ owner: req.user._id });
    const isBusiness = business && order.business._id.toString() === business._id.toString();
    
    if (!isConsumer && !isBusiness) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this order' 
      });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { productId, quantity, pickupTime } = req.body;
    
    // Check if product exists and is available
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    if (product.isSoldOut || product.quantityAvailable < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product is sold out or not enough quantity available' 
      });
    }
    
    // Check if product has expired
    if (new Date(product.expiryDate) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product has expired' 
      });
    }
    
    // Check if pickup time is valid
    const pickupTimeDate = new Date(pickupTime);
    const pickupTimeStart = new Date(product.pickupTimeStart);
    const pickupTimeEnd = new Date(product.pickupTimeEnd);
    
    if (pickupTimeDate < pickupTimeStart || pickupTimeDate > pickupTimeEnd) {
      return res.status(400).json({ 
        success: false, 
        message: 'Pickup time is outside the allowed range' 
      });
    }
    
    // Calculate total price
    const totalPrice = product.discountedPrice * quantity;
    
    // Create order
    const order = new Order({
      consumer: req.user._id,
      business: product.business,
      product: product._id,
      quantity,
      totalPrice,
      pickupTime: pickupTimeDate,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'cash', // Default to cash payment
      impactMetrics: {
        foodSaved: 0.5 * quantity, // Placeholder value, would be calculated based on product
        co2Reduced: 1.2 * quantity // Placeholder value, would be calculated based on product
      }
    });
    
    const savedOrder = await order.save();
    
    // Update product quantity
    product.quantityAvailable -= quantity;
    if (product.quantityAvailable <= 0) {
      product.isSoldOut = true;
    }
    await product.save();
    
    res.status(201).json({
      success: true,
      order: savedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update order status (for business)
 * @route   PATCH /api/orders/:id/status
 * @access  Private/Business
 */
const updateOrderStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Find business owned by user
    const business = await Business.findOne({ owner: req.user._id });
    
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    
    // Check if user owns the business for this order
    if (order.business.toString() !== business._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this order' 
      });
    }
    
    // Update order status
    order.status = status;
    
    // If order is completed, update impact metrics
    if (status === 'completed') {
      order.paymentStatus = 'paid';
      
      // Update business impact metrics
      business.impactMetrics.foodSaved += order.impactMetrics.foodSaved;
      business.impactMetrics.co2Reduced += order.impactMetrics.co2Reduced;
      business.impactMetrics.ordersCompleted += 1;
      await business.save();
      
      // Update consumer impact metrics
      const consumer = await User.findById(order.consumer);
      if (consumer) {
        consumer.impactMetrics.foodSaved += order.impactMetrics.foodSaved;
        consumer.impactMetrics.co2Reduced += order.impactMetrics.co2Reduced;
        consumer.impactMetrics.moneySaved += (order.product.originalPrice - order.product.discountedPrice) * order.quantity;
        await consumer.save();
      }
    }
    
    const updatedOrder = await order.save();
    
    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Cancel order (for consumer)
 * @route   PATCH /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if user is the consumer for this order
    if (order.consumer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to cancel this order' 
      });
    }
    
    // Check if order can be cancelled
    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: `Order cannot be cancelled because it is already ${order.status}` 
      });
    }
    
    // Update order status
    order.status = 'cancelled';
    order.cancellationReason = req.body.reason || 'Cancelled by consumer';
    
    const updatedOrder = await order.save();
    
    // Return quantity to product
    const product = await Product.findById(order.product);
    if (product) {
      product.quantityAvailable += order.quantity;
      product.isSoldOut = false;
      await product.save();
    }
    
    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Confirm order pickup
 * @route   PATCH /api/orders/:id/pickup
 * @access  Private
 */
const confirmPickup = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Find business owned by user
    const business = await Business.findOne({ owner: req.user._id });
    
    // Check if user is authorized (either the consumer or the business)
    const isConsumer = order.consumer.toString() === req.user._id.toString();
    const isBusiness = business && order.business.toString() === business._id.toString();
    
    if (!isConsumer && !isBusiness) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to confirm pickup for this order' 
      });
    }
    
    // Check if order can be picked up
    if (order.status !== 'ready') {
      return res.status(400).json({ 
        success: false, 
        message: 'Order is not ready for pickup' 
      });
    }
    
    // Update order status
    order.status = 'completed';
    order.paymentStatus = 'paid';
    
    const updatedOrder = await order.save();
    
    // Update business impact metrics
    if (business) {
      business.impactMetrics.foodSaved += order.impactMetrics.foodSaved;
      business.impactMetrics.co2Reduced += order.impactMetrics.co2Reduced;
      business.impactMetrics.ordersCompleted += 1;
      await business.save();
    }
    
    // Update consumer impact metrics
    const consumer = await User.findById(order.consumer);
    if (consumer) {
      consumer.impactMetrics.foodSaved += order.impactMetrics.foodSaved;
      consumer.impactMetrics.co2Reduced += order.impactMetrics.co2Reduced;
      consumer.impactMetrics.moneySaved += (order.product.originalPrice - order.product.discountedPrice) * order.quantity;
      await consumer.save();
    }
    
    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Confirm pickup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Add order review
 * @route   POST /api/orders/:id/review
 * @access  Private
 */
const addOrderReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { rating, comment } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if user is the consumer for this order
    if (order.consumer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to review this order' 
      });
    }
    
    // Check if order is completed
    if (order.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only review completed orders' 
      });
    }
    
    // Check if order already has a review
    if (order.review && order.review.rating) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order already has a review' 
      });
    }
    
    // Add review to order
    order.review = {
      rating: Number(rating),
      comment,
      date: Date.now()
    };
    
    const updatedOrder = await order.save();
    
    // Add review to business
    const business = await Business.findById(order.business);
    if (business) {
      business.reviews.push({
        user: req.user._id,
        rating: Number(rating),
        comment,
        date: Date.now()
      });
      
      // Update business rating
      const totalRatings = business.reviews.length;
      business.rating.average = (
        business.reviews.reduce((sum, item) => sum + item.rating, 0) / totalRatings
      ).toFixed(1);
      business.rating.count = totalRatings;
      
      await business.save();
    }
    
    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Add order review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getBusinessOrders,
  getConsumerOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  confirmPickup,
  addOrderReview
};
