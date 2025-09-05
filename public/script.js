// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll to contact section function
function scrollToContact() {
    const contactSection = document.getElementById('contact');
    contactSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.service-card, .project-card, .about-feature, .stat');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
});

// Form handling
const quoteForm = document.getElementById('quoteForm');

quoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = quoteForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<div class="loading"></div> Sending...';
    submitBtn.disabled = true;
    
    // Get form data
    const formData = new FormData(quoteForm);
    const data = Object.fromEntries(formData);
    
    try {
        // Simulate form submission (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show success message
        showMessage('Thank you! We have received your quote request. Our team will contact you within 24 hours.', 'success');
        
        // Reset form
        quoteForm.reset();
        
        // Send WhatsApp message with form data
        const whatsappMessage = createWhatsAppMessage(data);
        const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(whatsappMessage)}`;
        
        // Show WhatsApp option
        setTimeout(() => {
            showWhatsAppOption(whatsappUrl);
        }, 1000);
        
    } catch (error) {
        showMessage('Sorry, there was an error submitting your request. Please try again or contact us directly.', 'error');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Create WhatsApp message from form data
function createWhatsAppMessage(data) {
    return `Hi! I'm interested in solar panel installation.

Name: ${data.name}
Phone: ${data.phone}
Email: ${data.email || 'Not provided'}
Location: ${data.location}
Property Type: ${data.propertyType || 'Not specified'}

Message: ${data.message || 'No additional message'}

Please provide more details about solar panel installation.`;
}

// Show message function
function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const form = document.getElementById('quoteForm');
    form.insertBefore(messageDiv, form.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Show WhatsApp option
function showWhatsAppOption(whatsappUrl) {
    const whatsappDiv = document.createElement('div');
    whatsappDiv.className = 'message success';
    whatsappDiv.innerHTML = `
        <p>Want to get instant response? Chat with us on WhatsApp!</p>
        <a href="${whatsappUrl}" target="_blank" class="whatsapp-btn" style="margin-top: 10px; display: inline-flex;">
            <i class="fab fa-whatsapp"></i>
            Open WhatsApp
        </a>
    `;
    
    const form = document.getElementById('quoteForm');
    form.appendChild(whatsappDiv);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        if (whatsappDiv.parentNode) {
            whatsappDiv.remove();
        }
    }, 10000);
}

// Counter animation for stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat h3');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/\D/g, ''));
        const suffix = counter.textContent.replace(/\d/g, '');
        let current = 0;
        const increment = target / 100;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + suffix;
            }
        };
        
        updateCounter();
    });
}

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    const statsSection = document.querySelector('.about-stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const rate = scrolled * -0.5;
    
    if (hero) {
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Service card hover effects
document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Project card click to expand
document.addEventListener('DOMContentLoaded', () => {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            // Add a simple click effect
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 150);
        });
    });
});

// Form validation
function validateForm() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const location = document.getElementById('location').value;
    
    if (!name) {
        showMessage('Please enter your full name.', 'error');
        return false;
    }
    
    if (!phone) {
        showMessage('Please enter your phone number.', 'error');
        return false;
    }
    
    if (!location) {
        showMessage('Please select your location.', 'error');
        return false;
    }
    
    // Basic phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        showMessage('Please enter a valid 10-digit phone number.', 'error');
        return false;
    }
    
    return true;
}

// Add form validation to submit
quoteForm.addEventListener('submit', (e) => {
    if (!validateForm()) {
        e.preventDefault();
        return false;
    }
});

// Lazy loading for images (if any are added later)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Add smooth reveal animation for sections
function revealSections() {
    const sections = document.querySelectorAll('section');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        sectionObserver.observe(section);
    });
}

// Initialize section reveals
document.addEventListener('DOMContentLoaded', revealSections);

// Add click tracking for analytics (placeholder)
function trackEvent(eventName, eventData) {
    // Placeholder for analytics tracking
    console.log('Event tracked:', eventName, eventData);
    
    // Example: Google Analytics tracking
    // gtag('event', eventName, eventData);
}

// Track CTA button clicks
document.addEventListener('DOMContentLoaded', () => {
    const ctaButtons = document.querySelectorAll('.cta-button, .whatsapp-btn, .submit-btn');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            trackEvent('cta_click', {
                button_text: button.textContent.trim(),
                button_location: button.closest('section')?.id || 'unknown'
            });
        });
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    // Close mobile menu with Escape key
    if (e.key === 'Escape') {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Add focus management for accessibility
document.addEventListener('DOMContentLoaded', () => {
    const focusableElements = document.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="email"], input[type="tel"], select'
    );
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
            element.style.outline = '2px solid #4CAF50';
            element.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', () => {
            element.style.outline = 'none';
        });
    });
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
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

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    // Navbar background change
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
    
    // Parallax effect
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const rate = scrolled * -0.5;
    
    if (hero) {
        hero.style.transform = `translateY(${rate}px)`;
    }
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// WhatsApp Integration Functions
async function openWhatsAppQuick(serviceType = 'general') {
    try {
        const response = await fetch('/api/whatsapp/quick-links');
        const data = await response.json();
        
        if (data.success) {
            const linkKey = serviceType === 'quote' ? 'quote' : 
                           serviceType === 'installation' ? 'installation' :
                           serviceType === 'maintenance' ? 'maintenance' :
                           serviceType === 'consultation' ? 'consultation' :
                           serviceType === 'battery' ? 'battery' : 'general';
            
            const whatsappLink = data.data.quickLinks[linkKey];
            if (whatsappLink) {
                window.open(whatsappLink.url, '_blank');
                
                // Track the click
                trackWhatsAppClick(linkKey, 'quick_link');
            }
        }
    } catch (error) {
        console.error('WhatsApp quick link error:', error);
        // Fallback to direct WhatsApp link
        const fallbackMessage = `Hi! I'm interested in solar panel ${serviceType} services. Please provide more details.`;
        const fallbackUrl = `https://wa.me/919876543210?text=${encodeURIComponent(fallbackMessage)}`;
        window.open(fallbackUrl, '_blank');
    }
}

async function trackWhatsAppClick(linkType, source) {
    try {
        await fetch('/api/whatsapp/track-click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                linkType,
                source
            })
        });
    } catch (error) {
        console.error('WhatsApp tracking error:', error);
    }
}

// Enhanced form submission with WhatsApp integration
quoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = quoteForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<div class="loading"></div> Sending...';
    submitBtn.disabled = true;
    
    // Get form data
    const formData = new FormData(quoteForm);
    const data = Object.fromEntries(formData);
    
    try {
        // Submit to backend
        const response = await fetch('/api/quotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            showMessage('Thank you! We have received your quote request. Our team will contact you within 24 hours.', 'success');
            
            // Reset form
            quoteForm.reset();
            
            // Show WhatsApp option
            setTimeout(() => {
                showWhatsAppOption(result.data.whatsappUrl);
            }, 1000);
            
            // Track successful submission
            trackEvent('quote_submitted', {
                location: data.location,
                property_type: data.propertyType,
                source: 'website_form'
            });
            
        } else {
            throw new Error(result.message || 'Submission failed');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage('Sorry, there was an error submitting your request. Please try again or contact us directly.', 'error');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Show WhatsApp option after form submission
function showWhatsAppOption(whatsappUrl) {
    const whatsappDiv = document.createElement('div');
    whatsappDiv.className = 'message success';
    whatsappDiv.innerHTML = `
        <p>Want to get instant response? Chat with us on WhatsApp!</p>
        <a href="${whatsappUrl}" target="_blank" class="whatsapp-btn" style="margin-top: 10px; display: inline-flex;" onclick="trackWhatsAppClick('quote_followup', 'form_success')">
            <i class="fab fa-whatsapp"></i>
            Open WhatsApp
        </a>
    `;
    
    const form = document.getElementById('quoteForm');
    form.appendChild(whatsappDiv);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        if (whatsappDiv.parentNode) {
            whatsappDiv.remove();
        }
    }, 10000);
}

// WhatsApp Business Status Check
async function checkWhatsAppStatus() {
    try {
        const response = await fetch('/api/whatsapp/status');
        const data = await response.json();
        
        if (data.success) {
            const status = data.data;
            const statusElement = document.getElementById('whatsappStatus');
            
            if (statusElement) {
                statusElement.innerHTML = `
                    <div class="whatsapp-status ${status.isOnline ? 'online' : 'offline'}">
                        <i class="fas fa-circle"></i>
                        ${status.isOnline ? 'Online Now' : 'Offline'}
                    </div>
                    <p><strong>Response Time:</strong> ${status.responseTime}</p>
                    <p><strong>Business Hours:</strong> ${status.businessHours}</p>
                `;
            }
        }
    } catch (error) {
        console.error('WhatsApp status check error:', error);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('SolarTN Website loaded successfully!');
    
    // Add a subtle loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Check WhatsApp status
    checkWhatsAppStatus();
    
    // Add WhatsApp status indicator to contact section
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'whatsappStatus';
        statusDiv.className = 'whatsapp-status-indicator';
        contactSection.appendChild(statusDiv);
    }
});
