const User = require('../models/user.model');
const Business = require('../models/business.model');
const Order = require('../models/order.model');

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address, preferences } = req.body;
    
    // Find user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    
    const updatedUser = await user.save();
    
    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        userType: updatedUser.userType,
        phone: updatedUser.phone,
        address: updatedUser.address,
        preferences: updatedUser.preferences,
        profileImage: updatedUser.profileImage,
        impactMetrics: updatedUser.impactMetrics
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get user's order history
 * @route   GET /api/users/orders
 * @access  Private
 */
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ consumer: req.user._id })
      .populate('product')
      .populate('business', 'name address')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get user's favorite businesses
 * @route   GET /api/users/favorites
 * @access  Private
 */
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      favorites: user.favorites
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Add business to favorites
 * @route   POST /api/users/favorites/:businessId
 * @access  Private
 */
const addFavorite = async (req, res) => {
  try {
    const { businessId } = req.params;
    
    // Check if business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    
    // Add to favorites if not already added
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.favorites.includes(businessId)) {
      return res.status(400).json({ success: false, message: 'Business already in favorites' });
    }
    
    user.favorites.push(businessId);
    await user.save();
    
    res.json({
      success: true,
      message: 'Business added to favorites'
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Remove business from favorites
 * @route   DELETE /api/users/favorites/:businessId
 * @access  Private
 */
const removeFavorite = async (req, res) => {
  try {
    const { businessId } = req.params;
    
    // Remove from favorites
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!user.favorites.includes(businessId)) {
      return res.status(400).json({ success: false, message: 'Business not in favorites' });
    }
    
    user.favorites = user.favorites.filter(id => id.toString() !== businessId);
    await user.save();
    
    res.json({
      success: true,
      message: 'Business removed from favorites'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get user's impact metrics
 * @route   GET /api/users/impact
 * @access  Private
 */
const getImpactMetrics = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('impactMetrics');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      impactMetrics: user.impactMetrics
    });
  } catch (error) {
    console.error('Get impact metrics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getOrders,
  getFavorites,
  addFavorite,
  removeFavorite,
  getImpactMetrics
};
