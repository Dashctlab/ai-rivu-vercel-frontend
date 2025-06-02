// Enhanced Shared UI Components with Mobile Support - BUG FIX #2

/**
 * Renders the common header with mobile navigation
 * @param {Object} options - Configuration options
 * @param {string} options.currentPage - Current page identifier
 * @param {boolean} options.isAuthenticated - Whether user is logged in
 * @param {string} options.userEmail - Logged in user's email
 */
function renderHeader(options = {}) {
  const { currentPage = '', isAuthenticated = false, userEmail = '' } = options;
  
  const navItems = isAuthenticated 
    ? APP_CONSTANTS.NAV_ITEMS.authenticated 
    : APP_CONSTANTS.NAV_ITEMS.public;
  
  const navLinks = navItems.map(item => 
    `<li><a href="${item.href}" ${currentPage === item.text.toLowerCase() ? 'class="active"' : ''}>${item.text}</a></li>`
  ).join('');
  
  const authSection = isAuthenticated 
    ? `
      <li><span id="userEmailDisplay">Hi, ${userEmail.split('@')[0]}</span></li>
      <li><button onclick="logout()" class="logout-button">Logout</button></li>
    `
    : `<li><button class="primary-btn" onclick="location.href='/login.html'">Login</button></li>`;
  
  return `
    <header class="app-header">
      <div class="container">
        <div class="logo-container">
          <a href="${isAuthenticated ? '/generator.html' : '/home.html'}" aria-label="Home page">
            <img src="/images/ai-rivu-logo.png" alt="${APP_CONSTANTS.APP_NAME} Logo" class="logo-image">
          </a>
        </div>
        <nav>
          <button class="mobile-menu-toggle" aria-label="Toggle mobile menu">☰</button>
          <ul class="nav-list">
            ${navLinks}
            ${authSection}
          </ul>
        </nav>
      </div>
    </header>
  `;
}

/**
 * Renders the common footer
 */
function renderFooter() {
  const currentYear = new Date().getFullYear();
  
  return `
    <footer class="app-footer">
      <div class="container">
        <div class="footer-flex">
          <div>
            <ul class="footer-links">
              <li><a href="/about.html">About</a></li>
              <li><a href="/contact.html">Contact</a></li>
            </ul>
          </div>
          <div class="footer-logo">
            <img src="/images/asmakam-logo.png" alt="${APP_CONSTANTS.COMPANY_NAME} logo">
          </div>
        </div>
        <p>© ${currentYear} ${APP_CONSTANTS.COMPANY_NAME} · All Rights Reserved</p>
      </div>
    </footer>
  `;
}

/**
 * Global logout function with enhanced cleanup
 */
function logout() {
  localStorage.removeItem('userEmail');
  
  // Clear any other stored data
  if (typeof generatedPaperText !== 'undefined') {
    generatedPaperText = '';
  }
  
  // Clear download button data if it exists
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    // Clear all dataset properties
    delete downloadBtn.dataset.subject;
    delete downloadBtn.dataset.classname;
    delete downloadBtn.dataset.curriculum;
    delete downloadBtn.dataset.totalmarks;
    delete downloadBtn.dataset.timedurationtext;
    downloadBtn.style.display = 'none';
  }
  
  // Hide output section if it exists
  const outputSection = document.getElementById('outputSection');
  if (outputSection) {
    outputSection.style.display = 'none';
  }
  
  window.location.href = '/login.html';
}

/**
 * Initialize common components on page load
 */
function initializeCommonComponents(pageConfig = {}) {
  // Set up header
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    headerContainer.innerHTML = renderHeader(pageConfig);
  }
  
  // Set up footer
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    footerContainer.innerHTML = renderFooter();
  }
  
  // Initialize mobile navigation after rendering
  setTimeout(() => {
    setupMobileNavigation();
  }, 50);
}

/**
 * BUG FIX #2: Unified mobile navigation setup
 */
function setupMobileNavigation() {
  // First, inject mobile navigation styles if not already present
  injectMobileStyles();
  
  // Then setup mobile navigation functionality
  handleMobileNavigation();
}

/**
 * BUG FIX #2: Inject mobile navigation styles dynamically
 */
function injectMobileStyles() {
  // Check if styles already exist
  if (document.getElementById('mobile-nav-styles')) {
    return;
  }
  
  const mobileStyles = document.createElement('style');
  mobileStyles.id = 'mobile-nav-styles';
  mobileStyles.textContent = `
    /* Mobile Navigation Styles */
    .mobile-menu-toggle {
      display: none;
      background: none;
      border: none;
      color: white;
      font-size: 1.8rem;
      cursor: pointer;
      padding: 0.5rem;
      z-index: 1001;
      position: relative;
      transition: all 0.3s ease;
    }
    
    .mobile-menu-toggle:hover {
      transform: scale(1.1);
    }
    
    /* Desktop: Hide mobile toggle, show nav normally */
    @media (min-width: 769px) {
      .mobile-menu-toggle {
        display: none !important;
      }
      
      .nav-list {
        display: flex !important;
        position: static !important;
        background: transparent !important;
        box-shadow: none !important;
        padding: 0 !important;
        flex-direction: row !important;
        align-items: center;
        gap: 1rem;
      }
      
      .nav-list li {
        margin: 0 !important;
      }
      
      .nav-list li a {
        padding: 0.5rem !important;
        border-radius: 4px !important;
      }
    }
    
    /* Mobile: Show toggle, hide nav by default */
    @media (max-width: 768px) {
      .mobile-menu-toggle {
        display: block !important;
      }
      
      .nav-list {
        display: none !important;
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        background: var(--primary-color);
        flex-direction: column;
        padding: 1.5rem;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        z-index: 1000;
        min-width: 200px;
        border-radius: 12px;
        border: 2px solid rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
      }
      
      .nav-list.mobile-open {
        display: flex !important;
        animation: slideIn 0.3s ease-out;
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .nav-list li {
        margin: 0.75rem 0;
        text-align: center;
      }
      
      .nav-list li a {
        display: block;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        transition: all 0.3s;
        color: white;
        text-decoration: none;
        font-weight: 500;
      }
      
      .nav-list li a:hover {
        background: rgba(255,255,255,0.15);
        transform: translateY(-1px);
      }
      
      .nav-list li a.active {
        background: rgba(255,255,255,0.2);
        font-weight: 600;
      }
      
      .nav-list .primary-btn {
        background: var(--accent-color) !important;
        color: var(--text-color) !important;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        text-decoration: none;
        display: inline-block;
        margin: 0.5rem 0;
        transition: all 0.3s;
        cursor: pointer;
      }
      
      .nav-list .primary-btn:hover {
        background: #d8b350 !important;
        transform: translateY(-1px);
      }
      
      .logout-button {
        background: #e74c3c;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
        width: 100%;
      }
      
      .logout-button:hover {
        background: #c0392b;
        transform: translateY(-1px);
      }
      
      #userEmailDisplay {
        color: white;
        font-size: 0.9rem;
        padding: 0.5rem;
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
      
      /* Ensure header layout on mobile */
      .app-header .container {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        flex-direction: row !important;
        gap: 0 !important;
      }
      
      .logo-container {
        flex: 0 0 auto;
      }
      
      nav {
        flex: 0 0 auto;
        position: relative;
      }
    }
  `;
  
  document.head.appendChild(mobileStyles);
}

/**
 * BUG FIX #2: Enhanced mobile navigation functionality
 */
function handleMobileNavigation() {
  const header = document.querySelector('.app-header');
  if (!header) {
    console.warn('Header not found for mobile navigation setup');
    return;
  }
  
  const toggleButton = header.querySelector('.mobile-menu-toggle');
  const navList = header.querySelector('.nav-list');
  
  if (!toggleButton || !navList) {
    console.warn('Mobile navigation elements not found');
    return;
  }
  
  // Clear any existing event listeners by cloning the button
  const newToggleButton = toggleButton.cloneNode(true);
  toggleButton.parentNode.replaceChild(newToggleButton, toggleButton);
  
  // Add click handler for mobile toggle
  newToggleButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isOpen = navList.classList.contains('mobile-open');
    
    if (isOpen) {
      navList.classList.remove('mobile-open');
      newToggleButton.innerHTML = '☰';
      newToggleButton.setAttribute('aria-expanded', 'false');
    } else {
      navList.classList.add('mobile-open');
      newToggleButton.innerHTML = '✕';
      newToggleButton.setAttribute('aria-expanded', 'true');
    }
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target) && navList.classList.contains('mobile-open')) {
      navList.classList.remove('mobile-open');
      newToggleButton.innerHTML = '☰';
      newToggleButton.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Close menu when clicking on nav links (mobile)
  const navLinks = navList.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        navList.classList.remove('mobile-open');
        newToggleButton.innerHTML = '☰';
        newToggleButton.setAttribute('aria-expanded', 'false');
      }
    });
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      // Desktop view
      navList.classList.remove('mobile-open');
      newToggleButton.innerHTML = '☰';
      newToggleButton.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Set initial state
  navList.classList.remove('mobile-open');
  newToggleButton.innerHTML = '☰';
  newToggleButton.setAttribute('aria-expanded', 'false');
  
  console.log('Mobile navigation setup complete');
}

/**
 * Show notification message
 */
function showNotification(message, type = 'success', duration = 3000) {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notif => notif.remove());
  
  // Create new notification
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Add styles if not already present
  if (!document.getElementById('notification-styles')) {
    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        font-size: 0.9rem;
      }
      
      .notification.success {
        background-color: var(--primary-color);
        color: white;
      }
      
      .notification.error {
        background-color: #e74c3c;
        color: white;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @media (max-width: 768px) {
        .notification {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(styles);
  }
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto remove after duration
  setTimeout(() => {
    if (notification && notification.parentNode) {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, duration);
}

/**
 * Utility function to get user authentication status
 */
function isUserAuthenticated() {
  return !!localStorage.getItem('userEmail');
}

/**
 * Utility function to get current user email
 */
function getCurrentUserEmail() {
  return localStorage.getItem('userEmail');
}

/**
 * Utility function to format user display name
 */
function formatUserDisplayName(email) {
  if (!email) return '';
  return email.split('@')[0];
}

// Make functions available globally
window.renderHeader = renderHeader;
window.renderFooter = renderFooter;
window.logout = logout;
window.initializeCommonComponents = initializeCommonComponents;
window.setupMobileNavigation = setupMobileNavigation;
window.handleMobileNavigation = handleMobileNavigation;
window.showNotification = showNotification;
window.isUserAuthenticated = isUserAuthenticated;
window.getCurrentUserEmail = getCurrentUserEmail;
window.formatUserDisplayName = formatUserDisplayName;

// Auto-setup mobile navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure header is rendered first
  setTimeout(() => {
    if (document.querySelector('.app-header')) {
      setupMobileNavigation();
    }
  }, 100);
});

// Re-setup mobile navigation when components are re-initialized
window.addEventListener('componentsInitialized', () => {
  setTimeout(() => {
    setupMobileNavigation();
  }, 50);
});
