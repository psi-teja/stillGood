const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  images: [String],
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  quantityAvailable: {
    type: Number,
    min: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  pickupTimeStart: {
    type: Date,
    required: true
  },
  pickupTimeEnd: {
    type: Date,
    required: true
  },
  tags: [String],
  allergens: [String],
  dietaryInfo: [String],
  isSoldOut: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate discount percentage before saving
productSchema.pre('save', function(next) {
  if (this.originalPrice && this.discountedPrice) {
    this.discountPercentage = Math.round(((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100);
  }
  
  if (this.quantity !== undefined && (this.quantityAvailable === undefined || this.isNew)) {
    this.quantityAvailable = this.quantity;
  }
  
  next();
});

// Create indexes for common queries
productSchema.index({ business: 1 });
productSchema.index({ category: 1 });
productSchema.index({ expiryDate: 1 });
productSchema.index({ isSoldOut: 1 });
productSchema.index({ isActive: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
