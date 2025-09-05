// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.apiBase = '/api';
        this.token = localStorage.getItem('adminToken');
        this.currentSection = 'dashboard';
        this.currentPage = 1;
        this.quotesPerPage = 10;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Sidebar menu
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.showSection(section);
            });
        });

        // Content tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.showContentTab(tab);
            });
        });

        // Quote filter and search
        document.getElementById('quoteFilter').addEventListener('change', () => {
            this.loadQuotes();
        });

        document.getElementById('quoteSearch').addEventListener('input', 
            this.debounce(() => this.loadQuotes(), 500)
        );

        // Add service button
        document.getElementById('addServiceBtn').addEventListener('click', () => {
            this.showServiceModal();
        });

        // Add project button
        document.getElementById('addProjectBtn').addEventListener('click', () => {
            this.showProjectModal();
        });

        // Service form
        document.getElementById('serviceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleServiceSubmit();
        });

        // Project form
        document.getElementById('projectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProjectSubmit();
        });

        // Content forms
        document.getElementById('heroContentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContentSubmit('hero');
        });

        document.getElementById('aboutContentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContentSubmit('about');
        });

        document.getElementById('contactContentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContentSubmit('contact');
        });

        document.getElementById('seoContentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContentSubmit('seo');
        });

        // Profile form
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProfileSubmit();
        });

        // Password form
        document.getElementById('passwordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePasswordSubmit();
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModals();
                }
            });
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshCurrentSection();
        });
    }

    checkAuth() {
        if (this.token) {
            this.verifyToken();
        } else {
            this.showLogin();
        }
    }

    async verifyToken() {
        try {
            const response = await this.apiCall('/admin/profile', 'GET');
            if (response.success) {
                this.showAdminPanel(response.data);
            } else {
                this.showLogin();
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            this.showLogin();
        }
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            this.showLoading();
            const response = await this.apiCall('/admin/login', 'POST', {
                username,
                password
            });

            if (response.success) {
                this.token = response.data.token;
                localStorage.setItem('adminToken', this.token);
                this.showAdminPanel(response.data.admin);
                this.hideLoading();
            } else {
                this.showError(errorDiv, response.message);
                this.hideLoading();
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError(errorDiv, 'Login failed. Please try again.');
            this.hideLoading();
        }
    }

    handleLogout() {
        this.token = null;
        localStorage.removeItem('adminToken');
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
    }

    showAdminPanel(admin) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'flex';
        document.getElementById('adminUsername').textContent = admin.username;
        
        this.loadDashboard();
    }

    showSection(section) {
        // Update sidebar
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}Section`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            quotes: 'Quote Requests',
            content: 'Content Management',
            services: 'Services',
            projects: 'Projects',
            whatsapp: 'WhatsApp Settings',
            settings: 'Settings'
        };
        document.getElementById('pageTitle').textContent = titles[section];

        this.currentSection = section;

        // Load section data
        switch (section) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'quotes':
                this.loadQuotes();
                break;
            case 'content':
                this.loadContent();
                break;
            case 'services':
                this.loadServices();
                break;
            case 'projects':
                this.loadProjects();
                break;
            case 'whatsapp':
                this.loadWhatsAppSettings();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    showContentTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.content-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tab}Form`).classList.add('active');
    }

    async loadDashboard() {
        try {
            this.showLoading();
            const response = await this.apiCall('/admin/stats', 'GET');
            
            if (response.success) {
                const stats = response.data.quotes;
                document.getElementById('totalQuotes').textContent = stats.total || 0;
                document.getElementById('newQuotes').textContent = stats.new || 0;
                document.getElementById('convertedQuotes').textContent = stats.converted || 0;
                document.getElementById('monthlyQuotes').textContent = stats.thisMonth || 0;

                // Update quotes badge
                document.getElementById('quotesBadge').textContent = stats.new || 0;

                // Load recent quotes
                this.loadRecentQuotes(response.data.recentQuotes);
            }
            this.hideLoading();
        } catch (error) {
            console.error('Dashboard load error:', error);
            this.hideLoading();
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }

    loadRecentQuotes(quotes) {
        const container = document.getElementById('recentQuotes');
        container.innerHTML = '';

        if (!quotes || quotes.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No recent quotes</p>';
            return;
        }

        quotes.forEach(quote => {
            const item = document.createElement('div');
            item.className = 'recent-item';
            item.innerHTML = `
                <div class="recent-item-info">
                    <h4>${quote.name}</h4>
                    <p>${quote.location} • ${quote.phone}</p>
                </div>
                <span class="recent-item-status status-${quote.status.toLowerCase().replace(' ', '-')}">
                    ${quote.status}
                </span>
            `;
            item.addEventListener('click', () => this.showQuoteDetails(quote._id));
            container.appendChild(item);
        });
    }

    async loadQuotes() {
        try {
            this.showLoading();
            const filter = document.getElementById('quoteFilter').value;
            const search = document.getElementById('quoteSearch').value;
            
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.quotesPerPage
            });
            
            if (filter) params.append('status', filter);
            if (search) params.append('search', search);

            const response = await this.apiCall(`/quotes?${params}`, 'GET');
            
            if (response.success) {
                this.renderQuotesTable(response.data.quotes);
                this.renderPagination(response.data.pagination);
            }
            this.hideLoading();
        } catch (error) {
            console.error('Quotes load error:', error);
            this.hideLoading();
            this.showNotification('Failed to load quotes', 'error');
        }
    }

    renderQuotesTable(quotes) {
        const tbody = document.getElementById('quotesTableBody');
        tbody.innerHTML = '';

        if (!quotes || quotes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No quotes found</td></tr>';
            return;
        }

        quotes.forEach(quote => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${quote.name}</td>
                <td>${quote.phone}</td>
                <td>${quote.location}</td>
                <td>${quote.propertyType || 'N/A'}</td>
                <td>
                    <select class="status-select" data-quote-id="${quote._id}" data-current-status="${quote.status}">
                        <option value="New" ${quote.status === 'New' ? 'selected' : ''}>New</option>
                        <option value="Contacted" ${quote.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="Quote Sent" ${quote.status === 'Quote Sent' ? 'selected' : ''}>Quote Sent</option>
                        <option value="Follow Up" ${quote.status === 'Follow Up' ? 'selected' : ''}>Follow Up</option>
                        <option value="Converted" ${quote.status === 'Converted' ? 'selected' : ''}>Converted</option>
                        <option value="Closed" ${quote.status === 'Closed' ? 'selected' : ''}>Closed</option>
                    </select>
                </td>
                <td>${new Date(quote.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="adminPanel.showQuoteDetails('${quote._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="adminPanel.openWhatsApp('${quote._id}')">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Add event listeners for status changes
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', (e) => {
                this.updateQuoteStatus(e.target.dataset.quoteId, e.target.value);
            });
        });
    }

    renderPagination(pagination) {
        const container = document.getElementById('quotesPagination');
        container.innerHTML = '';

        if (pagination.pages <= 1) return;

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Previous';
        prevBtn.disabled = pagination.current === 1;
        prevBtn.addEventListener('click', () => {
            if (pagination.current > 1) {
                this.currentPage = pagination.current - 1;
                this.loadQuotes();
            }
        });
        container.appendChild(prevBtn);

        // Page numbers
        for (let i = 1; i <= pagination.pages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = i === pagination.current ? 'active' : '';
            pageBtn.addEventListener('click', () => {
                this.currentPage = i;
                this.loadQuotes();
            });
            container.appendChild(pageBtn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.disabled = pagination.current === pagination.pages;
        nextBtn.addEventListener('click', () => {
            if (pagination.current < pagination.pages) {
                this.currentPage = pagination.current + 1;
                this.loadQuotes();
            }
        });
        container.appendChild(nextBtn);
    }

    async updateQuoteStatus(quoteId, status) {
        try {
            const response = await this.apiCall(`/quotes/${quoteId}`, 'PUT', { status });
            if (response.success) {
                this.showNotification('Quote status updated successfully', 'success');
                this.loadQuotes();
            }
        } catch (error) {
            console.error('Update quote status error:', error);
            this.showNotification('Failed to update quote status', 'error');
        }
    }

    async showQuoteDetails(quoteId) {
        try {
            this.showLoading();
            const response = await this.apiCall(`/quotes/${quoteId}`, 'GET');
            
            if (response.success) {
                this.renderQuoteModal(response.data);
                document.getElementById('quoteModal').classList.add('active');
            }
            this.hideLoading();
        } catch (error) {
            console.error('Quote details error:', error);
            this.hideLoading();
            this.showNotification('Failed to load quote details', 'error');
        }
    }

    renderQuoteModal(quote) {
        const container = document.getElementById('quoteModalBody');
        container.innerHTML = `
            <div class="quote-details">
                <div class="detail-row">
                    <strong>Name:</strong> ${quote.name}
                </div>
                <div class="detail-row">
                    <strong>Phone:</strong> ${quote.phone}
                </div>
                <div class="detail-row">
                    <strong>Email:</strong> ${quote.email || 'Not provided'}
                </div>
                <div class="detail-row">
                    <strong>Location:</strong> ${quote.location}
                </div>
                <div class="detail-row">
                    <strong>Property Type:</strong> ${quote.propertyType || 'Not specified'}
                </div>
                <div class="detail-row">
                    <strong>Services:</strong> ${quote.services ? quote.services.join(', ') : 'Not specified'}
                </div>
                <div class="detail-row">
                    <strong>System Size:</strong> ${quote.systemSize || 'Not specified'}
                </div>
                <div class="detail-row">
                    <strong>Budget:</strong> ${quote.budget || 'Not specified'}
                </div>
                <div class="detail-row">
                    <strong>Timeline:</strong> ${quote.timeline || 'Not specified'}
                </div>
                <div class="detail-row">
                    <strong>Status:</strong> ${quote.status}
                </div>
                <div class="detail-row">
                    <strong>Submitted:</strong> ${new Date(quote.createdAt).toLocaleString()}
                </div>
                ${quote.message ? `
                <div class="detail-row">
                    <strong>Message:</strong> ${quote.message}
                </div>
                ` : ''}
            </div>
            <div class="modal-actions">
                <button class="btn btn-success" onclick="adminPanel.openWhatsApp('${quote._id}')">
                    <i class="fab fa-whatsapp"></i> Open WhatsApp
                </button>
                <button class="btn btn-primary" onclick="adminPanel.addQuoteNote('${quote._id}')">
                    <i class="fas fa-sticky-note"></i> Add Note
                </button>
            </div>
        `;
    }

    async openWhatsApp(quoteId) {
        try {
            const response = await this.apiCall(`/quotes/${quoteId}/whatsapp`, 'GET');
            if (response.success) {
                window.open(response.data.url, '_blank');
            }
        } catch (error) {
            console.error('WhatsApp error:', error);
            this.showNotification('Failed to generate WhatsApp link', 'error');
        }
    }

    async loadContent() {
        try {
            const response = await this.apiCall('/content', 'GET');
            if (response.success) {
                this.populateContentForms(response.data);
            }
        } catch (error) {
            console.error('Content load error:', error);
            this.showNotification('Failed to load content', 'error');
        }
    }

    populateContentForms(content) {
        // Hero section
        if (content.hero) {
            document.getElementById('heroTitle').value = content.hero.hero?.title || '';
            document.getElementById('heroSubtitle').value = content.hero.hero?.subtitle || '';
            document.getElementById('heroDescription').value = content.hero.hero?.description || '';
            document.getElementById('heroCtaText').value = content.hero.hero?.ctaText || 'Get Free Quote';
        }

        // About section
        if (content.about) {
            document.getElementById('aboutTitle').value = content.about.about?.title || '';
            document.getElementById('aboutSubtitle').value = content.about.about?.subtitle || '';
            document.getElementById('aboutDescription').value = content.about.about?.description || '';
            document.getElementById('aboutMission').value = content.about.about?.mission || '';
        }

        // Contact section
        if (content.contact) {
            document.getElementById('contactPhone').value = content.contact.contact?.phone || '';
            document.getElementById('contactEmail').value = content.contact.contact?.email || '';
            document.getElementById('contactAddress').value = content.contact.contact?.address || '';
            document.getElementById('whatsappNumber').value = content.contact.contact?.whatsappNumber || '';
            document.getElementById('workingHours').value = content.contact.contact?.workingHours || 'Mon-Sat: 9:00 AM - 6:00 PM';
        }

        // SEO section
        if (content.seo) {
            document.getElementById('seoTitle').value = content.seo.seo?.title || '';
            document.getElementById('seoDescription').value = content.seo.seo?.description || '';
            document.getElementById('seoKeywords').value = content.seo.seo?.keywords?.join(', ') || '';
            document.getElementById('ogTitle').value = content.seo.seo?.ogTitle || '';
            document.getElementById('ogDescription').value = content.seo.seo?.ogDescription || '';
        }
    }

    async handleContentSubmit(section) {
        try {
            this.showLoading();
            const formData = this.getFormData(`${section}ContentForm`);
            
            const response = await this.apiCall(`/content/${section}`, 'PUT', formData);
            
            if (response.success) {
                this.showNotification(`${section} content updated successfully`, 'success');
            }
            this.hideLoading();
        } catch (error) {
            console.error('Content update error:', error);
            this.hideLoading();
            this.showNotification('Failed to update content', 'error');
        }
    }

    async loadServices() {
        try {
            const response = await this.apiCall('/content/services', 'GET');
            if (response.success) {
                this.renderServices(response.data.services?.items || []);
            }
        } catch (error) {
            console.error('Services load error:', error);
            this.showNotification('Failed to load services', 'error');
        }
    }

    renderServices(services) {
        const container = document.getElementById('servicesList');
        container.innerHTML = '';

        if (services.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No services found</p>';
            return;
        }

        services.forEach(service => {
            const card = document.createElement('div');
            card.className = 'service-card';
            card.innerHTML = `
                <div class="service-info">
                    <h4><i class="${service.icon}"></i> ${service.title}</h4>
                    <p>${service.description}</p>
                </div>
                <div class="service-actions">
                    <button class="btn btn-sm btn-primary" onclick="adminPanel.editService('${service._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteService('${service._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    showServiceModal(serviceId = null) {
        document.getElementById('serviceModalTitle').textContent = serviceId ? 'Edit Service' : 'Add Service';
        document.getElementById('serviceForm').reset();
        
        if (serviceId) {
            // Load service data for editing
            // Implementation needed
        }
        
        document.getElementById('serviceModal').classList.add('active');
    }

    async handleServiceSubmit() {
        try {
            this.showLoading();
            const formData = this.getFormData('serviceForm');
            
            // Convert features text to array
            if (formData.features) {
                formData.features = formData.features.split('\n').filter(f => f.trim());
            }
            
            const response = await this.apiCall('/content/services/services', 'POST', formData);
            
            if (response.success) {
                this.showNotification('Service added successfully', 'success');
                this.closeModals();
                this.loadServices();
            }
            this.hideLoading();
        } catch (error) {
            console.error('Service submit error:', error);
            this.hideLoading();
            this.showNotification('Failed to add service', 'error');
        }
    }

    async loadProjects() {
        try {
            const response = await this.apiCall('/content/projects', 'GET');
            if (response.success) {
                this.renderProjects(response.data.projects?.items || []);
            }
        } catch (error) {
            console.error('Projects load error:', error);
            this.showNotification('Failed to load projects', 'error');
        }
    }

    renderProjects(projects) {
        const container = document.getElementById('projectsList');
        container.innerHTML = '';

        if (projects.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No projects found</p>';
            return;
        }

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-info">
                    <h4>${project.title}</h4>
                    <p>${project.description}</p>
                    <small>${project.location} • ${project.type}</small>
                </div>
                <div class="project-actions">
                    <button class="btn btn-sm btn-primary" onclick="adminPanel.editProject('${project._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteProject('${project._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    showProjectModal(projectId = null) {
        document.getElementById('projectModalTitle').textContent = projectId ? 'Edit Project' : 'Add Project';
        document.getElementById('projectForm').reset();
        
        if (projectId) {
            // Load project data for editing
            // Implementation needed
        }
        
        document.getElementById('projectModal').classList.add('active');
    }

    async handleProjectSubmit() {
        try {
            this.showLoading();
            const formData = this.getFormData('projectForm');
            
            const response = await this.apiCall('/content/projects/projects', 'POST', formData);
            
            if (response.success) {
                this.showNotification('Project added successfully', 'success');
                this.closeModals();
                this.loadProjects();
            }
            this.hideLoading();
        } catch (error) {
            console.error('Project submit error:', error);
            this.hideLoading();
            this.showNotification('Failed to add project', 'error');
        }
    }

    async loadWhatsAppSettings() {
        try {
            const response = await this.apiCall('/whatsapp/quick-links', 'GET');
            if (response.success) {
                this.renderWhatsAppQuickLinks(response.data.quickLinks);
            }

            const statusResponse = await this.apiCall('/whatsapp/status', 'GET');
            if (statusResponse.success) {
                this.renderWhatsAppStatus(statusResponse.data);
            }
        } catch (error) {
            console.error('WhatsApp settings load error:', error);
            this.showNotification('Failed to load WhatsApp settings', 'error');
        }
    }

    renderWhatsAppQuickLinks(quickLinks) {
        const container = document.getElementById('whatsappQuickLinks');
        container.innerHTML = '';

        Object.entries(quickLinks).forEach(([key, link]) => {
            const linkElement = document.createElement('a');
            linkElement.className = 'quick-link';
            linkElement.href = link.url;
            linkElement.target = '_blank';
            linkElement.innerHTML = `
                <i class="fab fa-whatsapp"></i>
                <span>${link.title}</span>
            `;
            container.appendChild(linkElement);
        });
    }

    renderWhatsAppStatus(status) {
        const container = document.getElementById('whatsappStatus');
        container.innerHTML = `
            <div class="status-indicator ${status.isOnline ? 'status-online' : 'status-offline'}">
                <i class="fas fa-circle"></i>
                ${status.isOnline ? 'Online' : 'Offline'}
            </div>
            <p><strong>Business Hours:</strong> ${status.businessHours}</p>
            <p><strong>Current Time:</strong> ${status.currentTime}</p>
            <p><strong>Response Time:</strong> ${status.responseTime}</p>
            <p><strong>WhatsApp Number:</strong> ${status.number}</p>
        `;
    }

    async loadSettings() {
        try {
            const response = await this.apiCall('/admin/profile', 'GET');
            if (response.success) {
                const profile = response.data.profile;
                document.getElementById('profileFirstName').value = profile.firstName || '';
                document.getElementById('profileLastName').value = profile.lastName || '';
                document.getElementById('profilePhone').value = profile.phone || '';
            }
        } catch (error) {
            console.error('Settings load error:', error);
            this.showNotification('Failed to load settings', 'error');
        }
    }

    async handleProfileSubmit() {
        try {
            this.showLoading();
            const formData = this.getFormData('profileForm');
            
            const response = await this.apiCall('/admin/profile', 'PUT', { profile: formData });
            
            if (response.success) {
                this.showNotification('Profile updated successfully', 'success');
            }
            this.hideLoading();
        } catch (error) {
            console.error('Profile update error:', error);
            this.hideLoading();
            this.showNotification('Failed to update profile', 'error');
        }
    }

    async handlePasswordSubmit() {
        try {
            this.showLoading();
            const formData = this.getFormData('passwordForm');
            
            if (formData.newPassword !== formData.confirmPassword) {
                this.showNotification('New passwords do not match', 'error');
                this.hideLoading();
                return;
            }
            
            const response = await this.apiCall('/admin/change-password', 'POST', formData);
            
            if (response.success) {
                this.showNotification('Password changed successfully', 'success');
                document.getElementById('passwordForm').reset();
            }
            this.hideLoading();
        } catch (error) {
            console.error('Password change error:', error);
            this.hideLoading();
            this.showNotification('Failed to change password', 'error');
        }
    }

    // Utility methods
    async apiCall(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (this.token) {
            options.headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${this.apiBase}${endpoint}`, options);
        return await response.json();
    }

    getFormData(formId) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const icon = notification.querySelector('.notification-icon');
        const messageEl = notification.querySelector('.notification-message');
        
        notification.className = `notification ${type} active`;
        messageEl.textContent = message;
        
        // Set icon based on type
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        icon.className = `notification-icon ${icons[type]}`;
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('active');
        }, 5000);
    }

    showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    refreshCurrentSection() {
        this.showSection(this.currentSection);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Global functions for onclick handlers
function showSection(section) {
    adminPanel.showSection(section);
}

// Initialize admin panel when DOM is loaded
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});
