const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { username, password } = req.body;

    // Find admin by username or email
    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }],
      isActive: true
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (admin.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      await admin.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();
    admin.lastLogin = new Date();
    await admin.save();

    // Log activity
    admin.logActivity('login', 'Admin logged in', req);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        username: admin.username, 
        role: admin.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          profile: admin.profile,
          lastLogin: admin.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// @route   GET /api/admin/profile
// @desc    Get admin profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -twoFactorSecret');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      data: admin
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin profile'
    });
  }
});

// @route   PUT /api/admin/profile
// @desc    Update admin profile
// @access  Private
router.put('/profile', auth, [
  body('profile.firstName').optional().trim().isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('profile.lastName').optional().trim().isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  body('profile.phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian phone number')
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

    const admin = await Admin.findById(req.user.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Update profile fields
    if (req.body.profile) {
      Object.assign(admin.profile, req.body.profile);
    }

    await admin.save();

    // Log activity
    admin.logActivity('profile_updated', 'Updated admin profile', req);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        profile: admin.profile
      }
    });

  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// @route   POST /api/admin/change-password
// @desc    Change admin password
// @access  Private
router.post('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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

    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.user.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    // Log activity
    admin.logActivity('password_changed', 'Admin changed password', req);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all admin users (super admin only)
// @access  Private
router.get('/users', auth, async (req, res) => {
  try {
    // Check if user has permission to manage users
    if (req.user.role !== 'super_admin' && !req.user.permissions.canManageUsers) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    const admins = await Admin.find({}).select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -twoFactorSecret -activityLog');
    
    res.json({
      success: true,
      data: admins
    });

  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin users'
    });
  }
});

// @route   POST /api/admin/users
// @desc    Create new admin user (super admin only)
// @access  Private
router.post('/users', auth, [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'editor', 'viewer']).withMessage('Invalid role')
], async (req, res) => {
  try {
    // Check if user has permission to manage users
    if (req.user.role !== 'super_admin' && !req.user.permissions.canManageUsers) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, email, password, role, profile, permissions } = req.body;

    // Check if username or email already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }]
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    const admin = new Admin({
      username,
      email,
      password,
      role,
      profile: profile || {},
      permissions: permissions || {
        canManageContent: role === 'admin',
        canManageQuotes: role === 'admin',
        canManageUsers: false,
        canViewAnalytics: true,
        canManageSettings: false
      }
    });

    await admin.save();

    // Log activity
    req.user.logActivity('admin_created', `Created admin user: ${username}`, req);

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        profile: admin.profile,
        isActive: admin.isActive,
        createdAt: admin.createdAt
      }
    });

  } catch (error) {
    console.error('Create admin user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update admin user (super admin only)
// @access  Private
router.put('/users/:id', auth, [
  body('role').optional().isIn(['admin', 'editor', 'viewer']).withMessage('Invalid role'),
  body('profile.firstName').optional().trim().isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('profile.lastName').optional().trim().isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters')
], async (req, res) => {
  try {
    // Check if user has permission to manage users
    if (req.user.role !== 'super_admin' && !req.user.permissions.canManageUsers) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const allowedUpdates = ['role', 'profile', 'permissions', 'isActive'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -twoFactorSecret -activityLog');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Log activity
    req.user.logActivity('admin_updated', `Updated admin user: ${admin.username}`, req);

    res.json({
      success: true,
      message: 'Admin user updated successfully',
      data: admin
    });

  } catch (error) {
    console.error('Update admin user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin user'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete admin user (super admin only)
// @access  Private
router.delete('/users/:id', auth, async (req, res) => {
  try {
    // Check if user has permission to manage users
    if (req.user.role !== 'super_admin' && !req.user.permissions.canManageUsers) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    // Prevent self-deletion
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const admin = await Admin.findByIdAndDelete(req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Log activity
    req.user.logActivity('admin_deleted', `Deleted admin user: ${admin.username}`, req);

    res.json({
      success: true,
      message: 'Admin user deleted successfully'
    });

  } catch (error) {
    console.error('Delete admin user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin user'
    });
  }
});

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const Quote = require('../models/Quote');
    const Content = require('../models/Content');
    
    // Get quote statistics
    const quoteStats = await Quote.getStats();
    
    // Get content statistics
    const contentStats = await Content.aggregate([
      { $group: { _id: '$isActive', count: { $sum: 1 } } }
    ]);
    
    // Get admin statistics
    const adminStats = await Admin.getStats();
    
    // Get recent activity (last 10 quotes)
    const recentQuotes = await Quote.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name phone location status createdAt');

    res.json({
      success: true,
      data: {
        quotes: quoteStats,
        content: {
          total: contentStats.reduce((sum, item) => sum + item.count, 0),
          active: contentStats.find(item => item._id === true)?.count || 0,
          inactive: contentStats.find(item => item._id === false)?.count || 0
        },
        admins: adminStats,
        recentQuotes
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics'
    });
  }
});

// @route   POST /api/admin/logout
// @desc    Admin logout
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // Log activity
    req.user.logActivity('logout', 'Admin logged out', req);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

module.exports = router;
