// Admin Dashboard Functions

// Admin credentials (in production, use proper authentication)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Check if user is logged in
function isLoggedIn() {
    return sessionStorage.getItem('isLoggedIn') === 'true';
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('loginMessage');
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Successful login
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('adminUsername', username);
        
        // Hide login, show dashboard
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        
        // Update username in dashboard
        document.getElementById('adminUsername').textContent = username;
        
        // Load dashboard data
        loadDashboardData();
        
        return true;
    } else {
        // Failed login
        messageElement.textContent = 'Invalid username or password.';
        messageElement.className = 'error';
        
        // Clear message after 3 seconds
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = '';
        }, 3000);
        
        return false;
    }
}

// Handle logout
function handleLogout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('adminUsername');
    
    // Show login, hide dashboard
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('dashboardSection').style.display = 'none';
    
    // Clear form
    document.getElementById('loginForm').reset();
}

// Load dashboard data
function loadDashboardData() {
    // Load statistics
    refreshStats();
    
    // Load messages
    loadMessages();
    
    // Initialize chart
    initChart();
}

// Refresh statistics
function refreshStats() {
    const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    
    // Update stats
    document.getElementById('totalMessages').textContent = messages.length;
    
    // Get unread count
    const unreadCount = messages.filter(m => !m.read).length;
    
    // For demo purposes, set some sample data
    document.getElementById('totalVisitors').textContent = Math.floor(Math.random() * 1000) + 500;
    document.getElementById('lastUpdated').textContent = new Date().toLocaleDateString();
}

// Load messages
function loadMessages() {
    const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    const messagesList = document.getElementById('messagesList');
    
    if (messages.length === 0) {
        messagesList.innerHTML = '<p>No messages found.</p>';
        return;
    }
    
    let html = '';
    messages.forEach((message, index) => {
        const date = new Date(message.timestamp);
        const dateStr = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        html += `
            <div class="message-item ${message.read ? 'read' : 'unread'}" 
                 onclick="showMessageDetails(${index})">
                <h4>${message.name}</h4>
                <p>${truncateText(message.message, 50)}</p>
                <span>${dateStr}</span>
            </div>
        `;
    });
    
    messagesList.innerHTML = html;
}

// Show message details
function showMessageDetails(index) {
    const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    const message = messages[index];
    const messageDetails = document.getElementById('messageDetails');
    
    if (!message) {
        messageDetails.innerHTML = '<p>Message not found.</p>';
        return;
    }
    
    // Mark as read
    message.read = true;
    localStorage.setItem('contactMessages', JSON.stringify(messages));
    
    // Update message list
    loadMessages();
    
    const date = new Date(message.timestamp);
    const dateStr = date.toLocaleString();
    
    messageDetails.innerHTML = `
        <div class="message-header">
            <h4>From: ${message.name}</h4>
            <p><strong>Email:</strong> ${message.email}</p>
            <p><strong>Date:</strong> ${dateStr}</p>
        </div>
        <div class="message-body">
            <h4>Message:</h4>
            <p>${message.message}</p>
        </div>
        <button onclick="deleteMessage(${index})" class="delete-btn">Delete Message</button>
    `;
}

// Delete message
function deleteMessage(index) {
    if (!confirm('Are you sure you want to delete this message?')) {
        return;
    }
    
    const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    messages.splice(index, 1);
    localStorage.setItem('contactMessages', JSON.stringify(messages));
    
    // Refresh lists
    loadMessages();
    refreshStats();
    
    // Clear details
    document.getElementById('messageDetails').innerHTML = '<p>Select a message to view details.</p>';
}

// Filter messages
function filterMessages() {
    const searchTerm = document.getElementById('messageSearch').value.toLowerCase();
    const filterType = document.getElementById('messageFilter').value;
    const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    const messagesList = document.getElementById('messagesList');
    
    let filtered = messages;
    
    // Filter by read/unread
    if (filterType === 'unread') {
        filtered = filtered.filter(m => !m.read);
    } else if (filterType === 'read') {
        filtered = filtered.filter(m => m.read);
    }
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(m => 
            m.name.toLowerCase().includes(searchTerm) ||
            m.email.toLowerCase().includes(searchTerm) ||
            m.message.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filtered.length === 0) {
        messagesList.innerHTML = '<p>No messages found matching your criteria.</p>';
        return;
    }
    
    let html = '';
    filtered.forEach((message, index) => {
        const originalIndex = messages.indexOf(message);
        const date = new Date(message.timestamp);
        const dateStr = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        html += `
            <div class="message-item ${message.read ? 'read' : 'unread'}" 
                 onclick="showMessageDetails(${originalIndex})">
                <h4>${message.name}</h4>
                <p>${truncateText(message.message, 50)}</p>
                <span>${dateStr}</span>
            </div>
        `;
    });
    
    messagesList.innerHTML = html;
}

// Clear all messages
function clearMessages() {
    if (!confirm('Are you sure you want to clear ALL messages? This cannot be undone.')) {
        return;
    }
    
    localStorage.removeItem('contactMessages');
    loadMessages();
    refreshStats();
    document.getElementById('messageDetails').innerHTML = '<p>Select a message to view details.</p>';
}

// Export data
function exportData() {
    const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contact-messages-export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Initialize chart
function initChart() {
    const ctx = document.getElementById('pageViewsChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Home', 'Education', 'Hobbies', 'Media', 'Future', 'Admin'],
            datasets: [{
                label: 'Page Views',
                data: [120, 85, 95, 110, 75, 45],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(199, 199, 199, 0.7)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Page Views by Section',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

// Check login status on page load
function checkLoginStatus() {
    if (isLoggedIn()) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        document.getElementById('adminUsername').textContent = sessionStorage.getItem('adminUsername');
        loadDashboardData();
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', checkLoginStatus);

// Delete button styling
function addDeleteButtonStyle() {
    const style = document.createElement('style');
    style.textContent = `
        .delete-btn {
            background-color: #e74c3c;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 1rem;
            transition: all 0.3s ease;
        }
        .delete-btn:hover {
            background-color: #c0392b;
        }
        .message-header {
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #ddd;
        }
        .message-body {
            padding-top: 1rem;
        }
    `;
    document.head.appendChild(style);
}

// Add delete button style on load
document.addEventListener('DOMContentLoaded', addDeleteButtonStyle);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleLogin,
        handleLogout,
        isLoggedIn,
        loadDashboardData,
        refreshStats,
        loadMessages,
        showMessageDetails,
        deleteMessage,
        filterMessages,
        clearMessages,
        exportData
    };
}
