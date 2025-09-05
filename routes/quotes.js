const express = require('express');
const { body, validationResult } = require('express-validator');
const Quote = require('../models/Quote');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation rules for quote submission
const quoteValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian phone number'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('location')
    .isIn(['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul', 'Other'])
    .withMessage('Please select a valid location'),
  body('propertyType')
    .optional()
    .isIn(['Residential', 'Commercial', 'Industrial', 'Educational', 'Healthcare', 'Other'])
    .withMessage('Please select a valid property type'),
  body('message')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters')
];

// @route   POST /api/quotes
// @desc    Submit a new quote request
// @access  Public
router.post('/', quoteValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check for duplicate quote (same phone number within last 24 hours)
    const existingQuote = await Quote.findOne({
      phone: req.body.phone,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (existingQuote) {
      return res.status(400).json({
        success: false,
        message: 'A quote request with this phone number was already submitted in the last 24 hours. Please contact us directly for immediate assistance.'
      });
    }

    // Create new quote
    const quote = new Quote({
      ...req.body,
      source: req.body.source || 'Website',
      whatsappMessage: '' // Will be generated when needed
    });

    // Generate WhatsApp message
    quote.whatsappMessage = quote.generateWhatsAppMessage();

    await quote.save();

    res.status(201).json({
      success: true,
      message: 'Quote request submitted successfully! We will contact you within 24 hours.',
      data: {
        id: quote._id,
        whatsappMessage: quote.whatsappMessage,
        whatsappUrl: `https://wa.me/${process.env.WHATSAPP_NUMBER || '919876543210'}?text=${encodeURIComponent(quote.whatsappMessage)}`
      }
    });

  } catch (error) {
    console.error('Quote submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quote request. Please try again or contact us directly.'
    });
  }
});

// @route   GET /api/quotes
// @desc    Get all quotes (admin only)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      location,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (location) filter.location = location;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get quotes with pagination
    const quotes = await Quote.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Quote.countDocuments(filter);

    res.json({
      success: true,
      data: {
        quotes,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quotes'
    });
  }
});

// @route   GET /api/quotes/stats
// @desc    Get quote statistics (admin only)
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Quote.getStats();
    
    // Get additional statistics
    const locationStats = await Quote.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const serviceStats = await Quote.aggregate([
      { $unwind: '$services' },
      { $group: { _id: '$services', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const monthlyStats = await Quote.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        ...stats,
        locationStats,
        serviceStats,
        monthlyStats
      }
    });

  } catch (error) {
    console.error('Get quote stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quote statistics'
    });
  }
});

// @route   GET /api/quotes/:id
// @desc    Get single quote (admin only)
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    res.json({
      success: true,
      data: quote
    });

  } catch (error) {
    console.error('Get quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quote'
    });
  }
});

// @route   PUT /api/quotes/:id
// @desc    Update quote (admin only)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const allowedUpdates = [
      'status', 'priority', 'adminNotes', 'followUpDate', 'lastContactDate'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    // Log activity
    req.user.logActivity('quote_updated', `Updated quote ${quote._id}`, req);

    res.json({
      success: true,
      message: 'Quote updated successfully',
      data: quote
    });

  } catch (error) {
    console.error('Update quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quote'
    });
  }
});

// @route   POST /api/quotes/:id/notes
// @desc    Add note to quote (admin only)
// @access  Private
router.post('/:id/notes', auth, [
  body('note').trim().isLength({ min: 1, max: 500 }).withMessage('Note must be between 1 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const quote = await Quote.findById(req.params.id);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    quote.adminNotes.push({
      note: req.body.note,
      addedBy: req.user.username
    });

    await quote.save();

    // Log activity
    req.user.logActivity('quote_note_added', `Added note to quote ${quote._id}`, req);

    res.json({
      success: true,
      message: 'Note added successfully',
      data: quote
    });

  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note'
    });
  }
});

// @route   DELETE /api/quotes/:id
// @desc    Delete quote (admin only)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const quote = await Quote.findByIdAndDelete(req.params.id);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    // Log activity
    req.user.logActivity('quote_deleted', `Deleted quote ${quote._id}`, req);

    res.json({
      success: true,
      message: 'Quote deleted successfully'
    });

  } catch (error) {
    console.error('Delete quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quote'
    });
  }
});

// @route   GET /api/quotes/:id/whatsapp
// @desc    Get WhatsApp message for quote
// @access  Public
router.get('/:id/whatsapp', async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    const whatsappMessage = quote.generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${process.env.WHATSAPP_NUMBER || '919876543210'}?text=${encodeURIComponent(whatsappMessage)}`;

    res.json({
      success: true,
      data: {
        message: whatsappMessage,
        url: whatsappUrl
      }
    });

  } catch (error) {
    console.error('Get WhatsApp message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate WhatsApp message'
    });
  }
});

module.exports = router;
