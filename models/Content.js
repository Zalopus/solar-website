const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  // Content Identification
  section: {
    type: String,
    required: [true, 'Section is required'],
    unique: true,
    enum: [
      'hero', 'about', 'services', 'projects', 'contact', 'footer',
      'seo', 'statistics', 'testimonials', 'process'
    ]
  },
  
  // SEO Configuration
  seo: {
    title: {
      type: String,
      maxlength: [60, 'SEO title cannot exceed 60 characters']
    },
    description: {
      type: String,
      maxlength: [160, 'SEO description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true
    }],
    ogTitle: {
      type: String,
      maxlength: [60, 'OG title cannot exceed 60 characters']
    },
    ogDescription: {
      type: String,
      maxlength: [160, 'OG description cannot exceed 160 characters']
    },
    ogImage: {
      type: String
    }
  },
  
  // Hero Section Content
  hero: {
    title: {
      type: String,
      maxlength: [100, 'Hero title cannot exceed 100 characters']
    },
    subtitle: {
      type: String,
      maxlength: [200, 'Hero subtitle cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Hero description cannot exceed 500 characters']
    },
    ctaText: {
      type: String,
      default: 'Get Free Quote'
    },
    backgroundImage: {
      type: String
    },
    features: [{
      icon: String,
      text: String
    }]
  },
  
  // About Section Content
  about: {
    title: {
      type: String,
      maxlength: [100, 'About title cannot exceed 100 characters']
    },
    subtitle: {
      type: String,
      maxlength: [200, 'About subtitle cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [1000, 'About description cannot exceed 1000 characters']
    },
    mission: {
      type: String,
      maxlength: [500, 'Mission cannot exceed 500 characters']
    },
    features: [{
      icon: String,
      title: String,
      description: String
    }],
    stats: [{
      number: String,
      label: String,
      icon: String
    }]
  },
  
  // Services Content
  services: {
    title: {
      type: String,
      maxlength: [100, 'Services title cannot exceed 100 characters']
    },
    subtitle: {
      type: String,
      maxlength: [200, 'Services subtitle cannot exceed 200 characters']
    },
    items: [{
      icon: String,
      title: String,
      description: String,
      features: [String],
      price: String,
      whatsappMessage: String
    }]
  },
  
  // Projects Content
  projects: {
    title: {
      type: String,
      maxlength: [100, 'Projects title cannot exceed 100 characters']
    },
    subtitle: {
      type: String,
      maxlength: [200, 'Projects subtitle cannot exceed 200 characters']
    },
    items: [{
      title: String,
      description: String,
      location: String,
      type: String,
      size: String,
      image: String,
      completedDate: Date
    }]
  },
  
  // Contact Information
  contact: {
    title: {
      type: String,
      maxlength: [100, 'Contact title cannot exceed 100 characters']
    },
    subtitle: {
      type: String,
      maxlength: [200, 'Contact subtitle cannot exceed 200 characters']
    },
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^[6-9]\d{9}$/.test(v);
      },
      message: 'Please enter a valid 10-digit Indian phone number'
      }
    },
    email: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
    address: {
      type: String,
      maxlength: [500, 'Address cannot exceed 500 characters']
    },
    whatsappNumber: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^[6-9]\d{9}$/.test(v);
        },
        message: 'Please enter a valid 10-digit Indian phone number'
      }
    },
    workingHours: {
      type: String,
      default: 'Mon-Sat: 9:00 AM - 6:00 PM'
    },
    serviceAreas: [String]
  },
  
  // Footer Content
  footer: {
    companyName: {
      type: String,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Footer description cannot exceed 500 characters']
    },
    socialLinks: [{
      platform: String,
      url: String,
      icon: String
    }],
    quickLinks: [{
      title: String,
      url: String
    }],
    copyright: {
      type: String,
      default: '© 2024 SolarTN. All rights reserved.'
    }
  },
  
  // Process Steps (for solar energy process explanation)
  process: {
    title: {
      type: String,
      maxlength: [100, 'Process title cannot exceed 100 characters']
    },
    subtitle: {
      type: String,
      maxlength: [200, 'Process subtitle cannot exceed 200 characters']
    },
    steps: [{
      number: Number,
      title: String,
      description: String,
      icon: String
    }]
  },
  
  // Testimonials
  testimonials: {
    title: {
      type: String,
      maxlength: [100, 'Testimonials title cannot exceed 100 characters']
    },
    subtitle: {
      type: String,
      maxlength: [200, 'Testimonials subtitle cannot exceed 200 characters']
    },
    items: [{
      name: String,
      location: String,
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      project: String,
      image: String
    }]
  },
  
  // Content Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Version Control
  version: {
    type: Number,
    default: 1
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastModifiedBy: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

// Indexes
contentSchema.index({ section: 1 });
contentSchema.index({ isActive: 1 });

// Pre-save middleware
contentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.version += 1;
  next();
});

// Static method to get all active content
contentSchema.statics.getActiveContent = async function() {
  return await this.find({ isActive: true }).select('-__v');
};

// Static method to get content by section
contentSchema.statics.getBySection = async function(section) {
  return await this.findOne({ section, isActive: true }).select('-__v');
};

// Instance method to update specific section data
contentSchema.methods.updateSectionData = function(sectionData) {
  if (this[this.section]) {
    Object.assign(this[this.section], sectionData);
  }
  return this.save();
};

// Instance method to add service
contentSchema.methods.addService = function(serviceData) {
  if (this.section === 'services' && this.services && this.services.items) {
    this.services.items.push(serviceData);
    return this.save();
  }
  throw new Error('Cannot add service to non-services section');
};

// Instance method to add project
contentSchema.methods.addProject = function(projectData) {
  if (this.section === 'projects' && this.projects && this.projects.items) {
    this.projects.items.push(projectData);
    return this.save();
  }
  throw new Error('Cannot add project to non-projects section');
};

module.exports = mongoose.model('Content', contentSchema);
