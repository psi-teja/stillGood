const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  consumer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  pickupTime: {
    type: Date,
    required: true
  },
  pickupCode: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'other']
  },
  paymentDetails: {
    transactionId: String,
    paymentDate: Date
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: Date
  },
  impactMetrics: {
    foodSaved: Number, // in kg
    co2Reduced: Number // in kg
  },
  cancellationReason: String
}, {
  timestamps: true
});

// Generate pickup code before saving
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generate a random 6-digit code
    this.pickupCode = Math.floor(100000 + Math.random() * 900000).toString();
  }
  next();
});

// Update product quantity when order is confirmed
orderSchema.post('save', async function(doc) {
  try {
    if (doc.status === 'confirmed' && this.wasNew) {
      const Product = mongoose.model('Product');
      await Product.findByIdAndUpdate(doc.product, {
        $inc: { quantityAvailable: -doc.quantity }
      });
    }
  } catch (error) {
    console.error('Error updating product quantity:', error);
  }
});

// Create indexes for common queries
orderSchema.index({ consumer: 1 });
orderSchema.index({ business: 1 });
orderSchema.index({ product: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ pickupTime: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
