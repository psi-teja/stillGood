/**
 * Business middleware
 * Checks if the authenticated user is a business
 */
const businessMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (req.user.userType !== 'business') {
      return res.status(403).json({ success: false, message: 'Access denied. Business account required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = businessMiddleware;
