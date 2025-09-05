const express = require('express');
const { body, validationResult } = require('express-validator');
const Quote = require('../models/Quote');

const router = express.Router();

// @route   POST /api/whatsapp/generate-message
// @desc    Generate WhatsApp message from form data
// @access  Public
router.post('/generate-message', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian phone number'),
  body('location').notEmpty().withMessage('Location is required')
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

    const {
      name,
      phone,
      email,
      location,
      propertyType,
      propertySize,
      services,
      systemSize,
      budget,
      timeline,
      message,
      serviceType = 'General Inquiry'
    } = req.body;

    // Generate WhatsApp message
    let whatsappMessage = `Hi! I'm interested in solar panel ${serviceType.toLowerCase()}.\n\n`;
    whatsappMessage += `Name: ${name}\n`;
    whatsappMessage += `Phone: ${phone}\n`;
    if (email) whatsappMessage += `Email: ${email}\n`;
    whatsappMessage += `Location: ${location}\n`;
    
    if (propertyType) whatsappMessage += `Property Type: ${propertyType}\n`;
    if (propertySize) whatsappMessage += `Property Size: ${propertySize}\n`;
    if (services && services.length > 0) {
      const servicesList = Array.isArray(services) ? services.join(', ') : services;
      whatsappMessage += `Services: ${servicesList}\n`;
    }
    if (systemSize) whatsappMessage += `System Size: ${systemSize}\n`;
    if (budget) whatsappMessage += `Budget: ${budget}\n`;
    if (timeline) whatsappMessage += `Timeline: ${timeline}\n`;
    if (message) whatsappMessage += `\nMessage: ${message}\n`;
    
    whatsappMessage += `\nPlease provide more details and quote.`;

    // Generate WhatsApp URL
    const whatsappNumber = process.env.WHATSAPP_NUMBER || '919876543210';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    res.json({
      success: true,
      data: {
        message: whatsappMessage,
        url: whatsappUrl,
        number: whatsappNumber
      }
    });

  } catch (error) {
    console.error('Generate WhatsApp message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate WhatsApp message'
    });
  }
});

// @route   GET /api/whatsapp/quick-links
// @desc    Get quick WhatsApp links for different services
// @access  Public
router.get('/quick-links', async (req, res) => {
  try {
    const whatsappNumber = process.env.WHATSAPP_NUMBER || '919876543210';
    
    const quickLinks = {
      general: {
        title: 'General Inquiry',
        message: 'Hi! I\'m interested in solar panel installation and services. Please provide more details.',
        url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi! I\'m interested in solar panel installation and services. Please provide more details.')}`
      },
      installation: {
        title: 'Solar Panel Installation',
        message: 'Hi! I\'m interested in solar panel installation for my property. Please provide details about installation process and pricing.',
        url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi! I\'m interested in solar panel installation for my property. Please provide details about installation process and pricing.')}`
      },
      maintenance: {
        title: 'Solar Panel Maintenance',
        message: 'Hi! I need solar panel maintenance and cleaning services. Please provide details about your maintenance packages.',
        url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi! I need solar panel maintenance and cleaning services. Please provide details about your maintenance packages.')}`
      },
      repair: {
        title: 'Solar Panel Repair',
        message: 'Hi! My solar panel system needs repair. Please provide details about your repair services and emergency support.',
        url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi! My solar panel system needs repair. Please provide details about your repair services and emergency support.')}`
      },
      consultation: {
        title: 'Solar Consultation',
        message: 'Hi! I need solar energy consultation for my property. Please provide details about site assessment and system design.',
        url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi! I need solar energy consultation for my property. Please provide details about site assessment and system design.')}`
      },
      battery: {
        title: 'Battery Backup Solutions',
        message: 'Hi! I\'m interested in battery backup and inverter solutions for my solar system. Please provide details about available options.',
        url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi! I\'m interested in battery backup and inverter solutions for my solar system. Please provide details about available options.')}`
      },
      quote: {
        title: 'Get Free Quote',
        message: 'Hi! I\'d like to get a free quote for solar panel installation. Please provide details about your services and pricing.',
        url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi! I\'d like to get a free quote for solar panel installation. Please provide details about your services and pricing.')}`
      }
    };

    res.json({
      success: true,
      data: {
        number: whatsappNumber,
        quickLinks
      }
    });

  } catch (error) {
    console.error('Get WhatsApp quick links error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch WhatsApp quick links'
    });
  }
});

// @route   POST /api/whatsapp/send-quote
// @desc    Send quote request via WhatsApp (creates quote record)
// @access  Public
router.post('/send-quote', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian phone number'),
  body('location').notEmpty().withMessage('Location is required')
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

    // Check for duplicate quote (same phone number within last 24 hours)
    const existingQuote = await Quote.findOne({
      phone: req.body.phone,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (existingQuote) {
      // Generate WhatsApp message for existing quote
      const whatsappMessage = existingQuote.generateWhatsAppMessage();
      const whatsappUrl = `https://wa.me/${process.env.WHATSAPP_NUMBER || '919876543210'}?text=${encodeURIComponent(whatsappMessage)}`;
      
      return res.status(400).json({
        success: false,
        message: 'A quote request with this phone number was already submitted in the last 24 hours.',
        data: {
          whatsappUrl,
          existingQuoteId: existingQuote._id
        }
      });
    }

    // Create new quote
    const quote = new Quote({
      ...req.body,
      source: 'WhatsApp',
      whatsappSent: true
    });

    // Generate WhatsApp message
    quote.whatsappMessage = quote.generateWhatsAppMessage();
    await quote.save();

    // Generate WhatsApp URL
    const whatsappNumber = process.env.WHATSAPP_NUMBER || '919876543210';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(quote.whatsappMessage)}`;

    res.json({
      success: true,
      message: 'Quote request created successfully! Click the WhatsApp link to send your message.',
      data: {
        quoteId: quote._id,
        whatsappMessage: quote.whatsappMessage,
        whatsappUrl,
        number: whatsappNumber
      }
    });

  } catch (error) {
    console.error('Send WhatsApp quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create WhatsApp quote request'
    });
  }
});

// @route   GET /api/whatsapp/status
// @desc    Get WhatsApp business status and availability
// @access  Public
router.get('/status', async (req, res) => {
  try {
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Business hours: Monday to Saturday, 9 AM to 6 PM
    const isBusinessHours = currentDay >= 1 && currentDay <= 6 && currentHour >= 9 && currentHour < 18;
    
    const status = {
      isOnline: isBusinessHours,
      businessHours: 'Mon-Sat: 9:00 AM - 6:00 PM',
      currentTime: new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      responseTime: isBusinessHours ? 'Usually responds within minutes' : 'Usually responds within 24 hours',
      number: process.env.WHATSAPP_NUMBER || '919876543210'
    };

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Get WhatsApp status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch WhatsApp status'
    });
  }
});

// @route   POST /api/whatsapp/track-click
// @desc    Track WhatsApp link clicks for analytics
// @access  Public
router.post('/track-click', [
  body('linkType').notEmpty().withMessage('Link type is required'),
  body('source').optional().trim()
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

    const { linkType, source, quoteId } = req.body;

    // Log the click (in a real application, you might want to store this in a database)
    console.log(`WhatsApp link clicked: ${linkType} from ${source || 'unknown'} at ${new Date().toISOString()}`);

    // If it's from a specific quote, update the quote record
    if (quoteId) {
      try {
        await Quote.findByIdAndUpdate(quoteId, {
          $inc: { whatsappClicks: 1 },
          lastWhatsAppClick: new Date()
        });
      } catch (error) {
        console.error('Error updating quote WhatsApp clicks:', error);
      }
    }

    res.json({
      success: true,
      message: 'Click tracked successfully'
    });

  } catch (error) {
    console.error('Track WhatsApp click error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track WhatsApp click'
    });
  }
});

module.exports = router;
