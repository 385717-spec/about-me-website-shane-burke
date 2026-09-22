// Contact Form Handling
function handleContactSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Validate inputs
    if (!data.name || !data.email || !data.message) {
        showFormMessage('Please fill in all fields.', 'error');
        return false;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showFormMessage('Please enter a valid email address.', 'error');
        return false;
    }
    
    // Save to local storage (for demo purposes)
    saveContactMessage(data);
    
    // Show success message
    showFormMessage('Thank you for your message! I will get back to you soon.', 'success');
    
    // Reset form
    form.reset();
    
    return false;
}

function showFormMessage(message, type) {
    const messageElement = document.getElementById('formMessage');
    messageElement.textContent = message;
    messageElement.className = type;
    
    // Clear message after 5 seconds
    setTimeout(() => {
        messageElement.textContent = '';
        messageElement.className = '';
    }, 5000);
}

function saveContactMessage(messageData) {
    // Add timestamp
    messageData.timestamp = new Date().toISOString();
    messageData.read = false;
    
    // Get existing messages or create new array
    let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    
    // Add new message
    messages.push(messageData);
    
    // Save back to local storage
    localStorage.setItem('contactMessages', JSON.stringify(messages));
}

// Media Gallery Filter
function filterMedia(category) {
    const cards = document.querySelectorAll('.media-card');
    const buttons = document.querySelectorAll('.filter-btn');
    
    // Update active button
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter cards
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add active class to navigation based on current page
function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    setActiveNav();
    
    // Add animation to sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
    });
    
    // Animate sections as they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
});

// Mobile menu toggle (if hamburger menu is added)
function toggleMobileMenu() {
    const nav = document.querySelector('nav ul');
    nav.classList.toggle('mobile-menu-active');
}

// Dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    // Save preference
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
}

// Load dark mode preference
function loadDarkModePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
}

// Initialize dark mode on load
document.addEventListener('DOMContentLoaded', loadDarkModePreference);

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleContactSubmit,
        showFormMessage,
        saveContactMessage,
        filterMedia,
        setActiveNav,
        toggleDarkMode,
        loadDarkModePreference,
        formatDate,
        truncateText
    };
}
