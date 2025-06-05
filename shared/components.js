// Enhanced Shared UI Components with Mobile Support - NO HAMBURGER MENU VERSION

/**
 * Renders the common header with direct mobile navigation (no hamburger)
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
 * Unified mobile navigation setup - NO HAMBURGER VERSION
 */
function setupMobileNavigation() {
  // First, inject mobile navigation styles if not already present
  injectMobileStyles();
  
  // Then setup mobile navigation functionality
  handleMobileNavigation();
}

/**
 * Inject mobile navigation styles dynamically - NO HAMBURGER VERSION
 */
function injectMobileStyles() {
  // Check if styles already exist
  if (document.getElementById('mobile-nav-styles')) {
    return;
  }
  
  const mobileStyles = document.createElement('style');
  mobileStyles.id = 'mobile-nav-styles';
  mobileStyles.textContent = `
    /* Mobile Navigation Styles - Always Visible Navigation */
    
    /* Hide hamburger menu completely */
    .mobile-menu-toggle {
      display: none !important;
    }
    
    /* Desktop: Standard navigation */
    @media (min-width: 769px) {
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
    
    /* Mobile: Show all nav items directly - NO HAMBURGER */
    @media (max-width: 768px) {
      .nav-list {
        display: flex !important;
        position: static !important;
        background: transparent !important;
        flex-direction: row !important;
        padding: 0 !important;
        gap: 0.25rem !important;
        flex-wrap: wrap !important;
        justify-content: center !important;
        align-items: center !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        border: none !important;
        backdrop-filter: none !important;
        z-index: auto !important;
        min-width: auto !important;
      }
      
      .nav-list li {
        margin: 0.1rem !important;
        text-align: center;
      }
      
      .nav-list li a {
        display: block;
        padding: 0.4rem 0.6rem !important;
        border-radius: 6px !important;
        transition: all 0.3s;
        color: white !important;
        text-decoration: none;
        font-weight: 500;
        font-size: 0.8rem !important;
        line-height: 1.2;
      }
      
      .nav-list li a:hover {
        background: rgba(255,255,255,0.15) !important;
        transform: translateY(-1px);
      }
      
      .nav-list li a.active {
        background: rgba(255,255,255,0.2) !important;
        font-weight: 600;
      }
      
      .nav-list .primary-btn {
        background: var(--accent-color) !important;
        color: var(--text-color) !important;
        border: none;
        padding: 0.4rem 0.8rem !important;
        border-radius: 6px !important;
        font-weight: 600;
        text-decoration: none;
        display: inline-block;
        margin: 0 !important;
        transition: all 0.3s;
        cursor: pointer;
        font-size: 0.8rem !important;
      }
      
      .nav-list .primary-btn:hover {
        background: #d8b350 !important;
        transform: translateY(-1px);
      }
      
      .logout-button {
        background: #e74c3c !important;
        color: white !important;
        border: none;
        padding: 0.4rem 0.8rem !important;
        border-radius: 6px !important;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
        font-size: 0.8rem !important;
      }
      
      .logout-button:hover {
        background: #c0392b !important;
        transform: translateY(-1px);
      }
      
      #userEmailDisplay {
        color: white;
        font-size: 0.7rem !important;
        padding: 0.3rem 0.5rem !important;
        background: rgba(255,255,255,0.1);
        border-radius: 6px;
        margin: 0 0.2rem !important;
        font-weight: 500;
        max-width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      /* Ensure header layout on mobile */
      .app-header .container {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        flex-direction: row !important;
        gap: 0.5rem !important;
        flex-wrap: wrap !important;
      }
      
      .logo-container {
        flex: 0 0 auto;
      }
      
      nav {
        flex: 1 1 auto;
        position: static !important;
      }
      
      /* Very small screens - stack vertically */
      @media (max-width: 380px) {
        .app-header .container {
          flex-direction: column !important;
          gap: 0.5rem !important;
          padding: 0.5rem 1rem !important;
        }
        
        .logo-container {
          order: 1;
        }
        
        nav {
          order: 2;
          width: 100%;
        }
        
        .nav-list {
          justify-content: space-around !important;
          width: 100% !important;
        }
        
        .nav-list li a,
        .nav-list .primary-btn,
        .logout-button {
          font-size: 0.75rem !important;
          padding: 0.3rem 0.5rem !important;
        }
      }
    }
  `;
  
  document.head.appendChild(mobileStyles);
}

/**
 * Simplified navigation handling - NO HAMBURGER MENU
 */
function handleMobileNavigation() {
  const header = document.querySelector('.app-header');
  if (!header) {
    console.warn('Header not found for mobile navigation setup');
    return;
  }
  
  const navList = header.querySelector('.nav-list');
  
  if (!navList) {
    console.warn('Navigation list not found');
    return;
  }
  
  // Ensure nav is always visible
  navList.classList.remove('mobile-open');
  
  // Remove any hamburger toggles if they exist
  const toggleButton = header.querySelector('.mobile-menu-toggle');
  if (toggleButton) {
    toggleButton.style.display = 'none';
  }
  
  console.log('✅ Direct mobile navigation setup complete - no hamburger menu');
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
