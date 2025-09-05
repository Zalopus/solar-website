const express = require('express');
const { body, validationResult } = require('express-validator');
const Content = require('../models/Content');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/content
// @desc    Get all content for public website
// @access  Public
router.get('/', async (req, res) => {
  try {
    const content = await Content.getActiveContent();
    
    // Transform content into a more usable format
    const formattedContent = {};
    content.forEach(item => {
      formattedContent[item.section] = item.toObject();
    });

    res.json({
      success: true,
      data: formattedContent
    });

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content'
    });
  }
});

// @route   GET /api/content/:section
// @desc    Get content by section
// @access  Public
router.get('/:section', async (req, res) => {
  try {
    const content = await Content.getBySection(req.params.section);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content section not found'
      });
    }

    res.json({
      success: true,
      data: content
    });

  } catch (error) {
    console.error('Get content section error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content section'
    });
  }
});

// @route   GET /api/content/admin/all
// @desc    Get all content for admin panel
// @access  Private
router.get('/admin/all', auth, async (req, res) => {
  try {
    const content = await Content.find({}).sort({ section: 1 });
    
    res.json({
      success: true,
      data: content
    });

  } catch (error) {
    console.error('Get all content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content'
    });
  }
});

// @route   PUT /api/content/:section
// @desc    Update content section
// @access  Private
router.put('/:section', auth, [
  body('seo.title').optional().isLength({ max: 60 }).withMessage('SEO title cannot exceed 60 characters'),
  body('seo.description').optional().isLength({ max: 160 }).withMessage('SEO description cannot exceed 160 characters')
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

    let content = await Content.findOne({ section: req.params.section });
    
    if (!content) {
      // Create new content section if it doesn't exist
      content = new Content({
        section: req.params.section,
        [req.params.section]: req.body
      });
    } else {
      // Update existing content - nest the data under the section name
      content[req.params.section] = req.body;
    }

    content.lastModifiedBy = req.user.username;
    await content.save();

    // Log activity
    req.user.logActivity('content_updated', `Updated ${req.params.section} section`, req);

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: content
    });

  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update content'
    });
  }
});

// @route   POST /api/content/:section/services
// @desc    Add service to services section
// @access  Private
router.post('/:section/services', auth, [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Service title is required'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Service description is required'),
  body('icon').trim().isLength({ min: 1 }).withMessage('Service icon is required')
], async (req, res) => {
  try {
    if (req.params.section !== 'services') {
      return res.status(400).json({
        success: false,
        message: 'Can only add services to services section'
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

    let content = await Content.findOne({ section: 'services' });
    
    if (!content) {
      content = new Content({
        section: 'services',
        services: {
          title: 'Our Services',
          subtitle: 'Comprehensive solar energy solutions',
          items: []
        }
      });
    }

    if (!content.services) {
      content.services = {
        title: 'Our Services',
        subtitle: 'Comprehensive solar energy solutions',
        items: []
      };
    }

    if (!content.services.items) {
      content.services.items = [];
    }

    content.services.items.push(req.body);
    content.lastModifiedBy = req.user.username;
    await content.save();

    // Log activity
    req.user.logActivity('service_added', `Added service: ${req.body.title}`, req);

    res.json({
      success: true,
      message: 'Service added successfully',
      data: content
    });

  } catch (error) {
    console.error('Add service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add service'
    });
  }
});

// @route   PUT /api/content/:section/services/:serviceId
// @desc    Update service in services section
// @access  Private
router.put('/:section/services/:serviceId', auth, [
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Service title must be between 1 and 100 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Service description must be between 1 and 500 characters')
], async (req, res) => {
  try {
    if (req.params.section !== 'services') {
      return res.status(400).json({
        success: false,
        message: 'Can only update services in services section'
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

    const content = await Content.findOne({ section: 'services' });
    
    if (!content || !content.services || !content.services.items) {
      return res.status(404).json({
        success: false,
        message: 'Services section not found'
      });
    }

    const serviceIndex = content.services.items.findIndex(
      service => service._id.toString() === req.params.serviceId
    );

    if (serviceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    Object.assign(content.services.items[serviceIndex], req.body);
    content.lastModifiedBy = req.user.username;
    await content.save();

    // Log activity
    req.user.logActivity('service_updated', `Updated service: ${content.services.items[serviceIndex].title}`, req);

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: content
    });

  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service'
    });
  }
});

// @route   DELETE /api/content/:section/services/:serviceId
// @desc    Delete service from services section
// @access  Private
router.delete('/:section/services/:serviceId', auth, async (req, res) => {
  try {
    if (req.params.section !== 'services') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete services from services section'
      });
    }

    const content = await Content.findOne({ section: 'services' });
    
    if (!content || !content.services || !content.services.items) {
      return res.status(404).json({
        success: false,
        message: 'Services section not found'
      });
    }

    const serviceIndex = content.services.items.findIndex(
      service => service._id.toString() === req.params.serviceId
    );

    if (serviceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const deletedService = content.services.items[serviceIndex];
    content.services.items.splice(serviceIndex, 1);
    content.lastModifiedBy = req.user.username;
    await content.save();

    // Log activity
    req.user.logActivity('service_deleted', `Deleted service: ${deletedService.title}`, req);

    res.json({
      success: true,
      message: 'Service deleted successfully',
      data: content
    });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service'
    });
  }
});

// @route   POST /api/content/:section/projects
// @desc    Add project to projects section
// @access  Private
router.post('/:section/projects', auth, [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Project title is required'),
  body('description').trim().isLength({ min: 1, max: 200 }).withMessage('Project description is required'),
  body('location').trim().isLength({ min: 1, max: 50 }).withMessage('Project location is required')
], async (req, res) => {
  try {
    if (req.params.section !== 'projects') {
      return res.status(400).json({
        success: false,
        message: 'Can only add projects to projects section'
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

    let content = await Content.findOne({ section: 'projects' });
    
    if (!content) {
      content = new Content({
        section: 'projects',
        projects: {
          title: 'Our Projects',
          subtitle: 'Successful solar installations across Tamil Nadu',
          items: []
        }
      });
    }

    if (!content.projects) {
      content.projects = {
        title: 'Our Projects',
        subtitle: 'Successful solar installations across Tamil Nadu',
        items: []
      };
    }

    if (!content.projects.items) {
      content.projects.items = [];
    }

    content.projects.items.push({
      ...req.body,
      completedDate: req.body.completedDate ? new Date(req.body.completedDate) : new Date()
    });
    
    content.lastModifiedBy = req.user.username;
    await content.save();

    // Log activity
    req.user.logActivity('project_added', `Added project: ${req.body.title}`, req);

    res.json({
      success: true,
      message: 'Project added successfully',
      data: content
    });

  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add project'
    });
  }
});

// @route   PUT /api/content/:section/projects/:projectId
// @desc    Update project in projects section
// @access  Private
router.put('/:section/projects/:projectId', auth, [
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Project title must be between 1 and 100 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Project description must be between 1 and 200 characters')
], async (req, res) => {
  try {
    if (req.params.section !== 'projects') {
      return res.status(400).json({
        success: false,
        message: 'Can only update projects in projects section'
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

    const content = await Content.findOne({ section: 'projects' });
    
    if (!content || !content.projects || !content.projects.items) {
      return res.status(404).json({
        success: false,
        message: 'Projects section not found'
      });
    }

    const projectIndex = content.projects.items.findIndex(
      project => project._id.toString() === req.params.projectId
    );

    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    Object.assign(content.projects.items[projectIndex], req.body);
    content.lastModifiedBy = req.user.username;
    await content.save();

    // Log activity
    req.user.logActivity('project_updated', `Updated project: ${content.projects.items[projectIndex].title}`, req);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: content
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
});

// @route   DELETE /api/content/:section/projects/:projectId
// @desc    Delete project from projects section
// @access  Private
router.delete('/:section/projects/:projectId', auth, async (req, res) => {
  try {
    if (req.params.section !== 'projects') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete projects from projects section'
      });
    }

    const content = await Content.findOne({ section: 'projects' });
    
    if (!content || !content.projects || !content.projects.items) {
      return res.status(404).json({
        success: false,
        message: 'Projects section not found'
      });
    }

    const projectIndex = content.projects.items.findIndex(
      project => project._id.toString() === req.params.projectId
    );

    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const deletedProject = content.projects.items[projectIndex];
    content.projects.items.splice(projectIndex, 1);
    content.lastModifiedBy = req.user.username;
    await content.save();

    // Log activity
    req.user.logActivity('project_deleted', `Deleted project: ${deletedProject.title}`, req);

    res.json({
      success: true,
      message: 'Project deleted successfully',
      data: content
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
});

// @route   POST /api/content/:section/toggle
// @desc    Toggle content section active status
// @access  Private
router.post('/:section/toggle', auth, async (req, res) => {
  try {
    const content = await Content.findOne({ section: req.params.section });
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content section not found'
      });
    }

    content.isActive = !content.isActive;
    content.lastModifiedBy = req.user.username;
    await content.save();

    // Log activity
    req.user.logActivity('content_toggled', `Toggled ${req.params.section} section to ${content.isActive ? 'active' : 'inactive'}`, req);

    res.json({
      success: true,
      message: `Content section ${content.isActive ? 'activated' : 'deactivated'} successfully`,
      data: content
    });

  } catch (error) {
    console.error('Toggle content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle content section'
    });
  }
});

module.exports = router;
