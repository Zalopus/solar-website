const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Please enter a valid 10-digit Indian phone number'
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  
  // Location Information
  location: {
    type: String,
    required: [true, 'Location is required'],
    enum: [
      'Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 
      'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul', 'Other'
    ]
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  
  // Property Information
  propertyType: {
    type: String,
    enum: ['Residential', 'Commercial', 'Industrial', 'Educational', 'Healthcare', 'Other'],
    default: 'Residential'
  },
  propertySize: {
    type: String,
    enum: ['Small (1-2 BHK)', 'Medium (3-4 BHK)', 'Large (5+ BHK)', 'Commercial', 'Industrial'],
    default: 'Small (1-2 BHK)'
  },
  
  // Service Requirements
  services: [{
    type: String,
    enum: [
      'Installation', 'Maintenance', 'Repair', 'Consultation', 
      'Battery Backup', 'Monitoring', 'Cleaning', 'Warranty Service'
    ]
  }],
  
  // System Requirements
  systemSize: {
    type: String,
    enum: ['1-3 kW', '3-5 kW', '5-10 kW', '10-20 kW', '20+ kW', 'Not Sure'],
    default: 'Not Sure'
  },
  budget: {
    type: String,
    enum: ['Under ₹1 Lakh', '₹1-3 Lakhs', '₹3-5 Lakhs', '₹5-10 Lakhs', '₹10+ Lakhs', 'Not Sure'],
    default: 'Not Sure'
  },
  timeline: {
    type: String,
    enum: ['Immediate', 'Within 1 Month', '1-3 Months', '3-6 Months', '6+ Months'],
    default: 'Not Sure'
  },
  
  // Additional Information
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  source: {
    type: String,
    enum: ['Website', 'WhatsApp', 'Phone', 'Referral', 'Social Media', 'Other'],
    default: 'Website'
  },
  
  // Status and Tracking
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Quote Sent', 'Follow Up', 'Converted', 'Closed'],
    default: 'New'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  
  // Admin Notes
  adminNotes: [{
    note: {
      type: String,
      required: true,
      trim: true
    },
    addedBy: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Follow-up Information
  followUpDate: {
    type: Date
  },
  lastContactDate: {
    type: Date
  },
  
  // WhatsApp Integration
  whatsappSent: {
    type: Boolean,
    default: false
  },
  whatsappMessage: {
    type: String,
    trim: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
quoteSchema.index({ phone: 1 });
quoteSchema.index({ email: 1 });
quoteSchema.index({ location: 1 });
quoteSchema.index({ status: 1 });
quoteSchema.index({ createdAt: -1 });
quoteSchema.index({ priority: 1, status: 1 });

// Virtual for formatted phone number
quoteSchema.virtual('formattedPhone').get(function() {
  return this.phone ? `+91 ${this.phone}` : '';
});

// Virtual for age of quote
quoteSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
quoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get quote statistics
quoteSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'New'] }, 1, 0] } },
        contacted: { $sum: { $cond: [{ $eq: ['$status', 'Contacted'] }, 1, 0] } },
        converted: { $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] } },
        thisMonth: {
          $sum: {
            $cond: [
              {
                $gte: ['$createdAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1)]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
  
  return stats[0] || { total: 0, new: 0, contacted: 0, converted: 0, thisMonth: 0 };
};

// Instance method to generate WhatsApp message
quoteSchema.methods.generateWhatsAppMessage = function() {
  const services = this.services.length > 0 ? this.services.join(', ') : 'General Inquiry';
  const budget = this.budget !== 'Not Sure' ? `Budget: ${this.budget}` : '';
  const timeline = this.timeline !== 'Not Sure' ? `Timeline: ${this.timeline}` : '';
  
  let message = `Hi! I'm interested in solar panel services.\n\n`;
  message += `Name: ${this.name}\n`;
  message += `Phone: ${this.phone}\n`;
  if (this.email) message += `Email: ${this.email}\n`;
  message += `Location: ${this.location}\n`;
  message += `Property: ${this.propertyType} - ${this.propertySize}\n`;
  message += `Services: ${services}\n`;
  message += `System Size: ${this.systemSize}\n`;
  if (budget) message += `${budget}\n`;
  if (timeline) message += `${timeline}\n`;
  if (this.message) message += `\nMessage: ${this.message}\n`;
  message += `\nPlease provide more details and quote.`;
  
  return message;
};

module.exports = mongoose.model('Quote', quoteSchema);
