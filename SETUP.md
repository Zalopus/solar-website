# SolarTN - Solar Panel Installation Website Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Git

### Installation Steps

1. **Clone/Download the project**
   ```bash
   # If using git
   git clone <repository-url>
   cd solar-project
   
   # Or extract the downloaded files to a folder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env file with your settings
   nano .env
   ```

4. **Configure MongoDB**
   ```bash
   # Start MongoDB service
   # On Windows: Start MongoDB service from Services
   # On macOS: brew services start mongodb-community
   # On Linux: sudo systemctl start mongod
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Website: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin

## 📋 Environment Configuration

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/solar-tn

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Secret for Admin Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Admin Credentials (Change these in production!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# WhatsApp Configuration
WHATSAPP_NUMBER=919876543210
WHATSAPP_MESSAGE_TEMPLATE=Hi! I'm interested in solar panel installation. Please provide more details.

# Email Configuration (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Important Configuration Notes

1. **MongoDB URI**: Update with your MongoDB connection string
2. **JWT Secret**: Generate a strong secret key for authentication
3. **WhatsApp Number**: Use your business WhatsApp number (with country code, no +)
4. **Admin Credentials**: Change default admin username/password
5. **Email Settings**: Configure for email notifications (optional)

## 🗄️ Database Setup

### MongoDB Collections

The application will automatically create the following collections:

- **quotes**: Stores quote requests from customers
- **contents**: Stores website content and settings
- **admins**: Stores admin user accounts

### Default Admin Account

On first startup, a default admin account is created:
- Username: `admin` (or from ADMIN_USERNAME env var)
- Password: `admin123` (or from ADMIN_PASSWORD env var)

**⚠️ Important**: Change these credentials immediately after first login!

## 🎛️ Admin Panel Features

### Dashboard
- View quote statistics
- Recent quote requests
- Quick actions

### Quote Management
- View all quote requests
- Update quote status
- Add notes to quotes
- Filter and search quotes
- Export quote data

### Content Management
- Edit hero section
- Update about us content
- Manage contact information
- Configure SEO settings

### Services Management
- Add/edit/delete services
- Set service descriptions and features
- Configure WhatsApp messages for services

### Projects Management
- Add/edit/delete projects
- Upload project images
- Set project details and locations

### WhatsApp Settings
- View quick links
- Check business status
- Configure WhatsApp number

### Settings
- Update admin profile
- Change password
- Manage user accounts (super admin only)

## 📱 WhatsApp Integration

### Features
- Quick WhatsApp links for different services
- Auto-generated messages from quote forms
- Business hours status indicator
- Click tracking for analytics

### Configuration
1. Update `WHATSAPP_NUMBER` in `.env` file
2. Customize message templates in admin panel
3. Set business hours for status indicator

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/content` - Get website content
- `POST /api/quotes` - Submit quote request
- `GET /api/whatsapp/quick-links` - Get WhatsApp quick links
- `GET /api/whatsapp/status` - Get WhatsApp business status

### Admin Endpoints (Require Authentication)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get admin profile
- `GET /api/quotes` - Get all quotes (admin)
- `PUT /api/quotes/:id` - Update quote (admin)
- `GET /api/content/admin/all` - Get all content (admin)
- `PUT /api/content/:section` - Update content (admin)

## 🚀 Deployment

### Production Deployment

1. **Set production environment**
   ```bash
   NODE_ENV=production
   ```

2. **Use production MongoDB**
   ```bash
   MONGODB_URI=mongodb://your-production-mongodb-uri
   ```

3. **Set strong JWT secret**
   ```bash
   JWT_SECRET=your-very-strong-production-secret
   ```

4. **Configure domain**
   ```bash
   FRONTEND_URL=https://yourdomain.com
   ```

### Recommended Hosting Platforms

- **Heroku**: Easy deployment with MongoDB Atlas
- **Vercel**: Great for frontend + serverless functions
- **DigitalOcean**: VPS with full control
- **AWS**: Scalable cloud hosting

### MongoDB Atlas (Cloud Database)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Backup database regularly

### File Permissions

```bash
# Set proper file permissions
chmod 600 .env
chmod 755 public/
```

## 📊 Analytics & Monitoring

### Built-in Analytics
- Quote submission tracking
- WhatsApp click tracking
- Admin activity logging

### Recommended Monitoring
- Application performance monitoring
- Error tracking (Sentry)
- Uptime monitoring
- Database performance monitoring

## 🛠️ Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check firewall settings

2. **Admin Login Issues**
   - Verify admin credentials
   - Check JWT secret configuration
   - Clear browser cache

3. **WhatsApp Links Not Working**
   - Verify WhatsApp number format
   - Check if number has WhatsApp Business
   - Test with different browsers

4. **Form Submission Errors**
   - Check API endpoints are accessible
   - Verify form validation
   - Check browser console for errors

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

## 📞 Support

### Getting Help

1. Check this documentation
2. Review error logs
3. Check browser console for frontend issues
4. Check server logs for backend issues

### Contact Information

- Email: support@solartn.com
- WhatsApp: +91-98765-43210

## 🔄 Updates & Maintenance

### Regular Maintenance Tasks

1. **Weekly**
   - Review quote requests
   - Update content if needed
   - Check system performance

2. **Monthly**
   - Backup database
   - Update dependencies
   - Review analytics

3. **Quarterly**
   - Security audit
   - Performance optimization
   - Content refresh

### Updating the Application

1. Backup current installation
2. Download new version
3. Update dependencies: `npm install`
4. Run database migrations (if any)
5. Test functionality
6. Deploy to production

---

## 🎉 Congratulations!

Your SolarTN website is now ready! 

- **Website**: Professional solar installation website
- **Admin Panel**: Complete content and quote management
- **WhatsApp Integration**: Direct customer communication
- **SEO Optimized**: Ready for search engines
- **Mobile Responsive**: Works on all devices

Start by logging into the admin panel and customizing the content for your business!
