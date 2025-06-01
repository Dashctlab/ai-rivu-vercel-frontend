// Enhanced Shared UI Components with Mobile Support

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
          <ul class="nav-list tight">
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
 * Global logout function
 */
function logout() {
  localStorage.removeItem('userEmail');
  // Clear any other stored data
  if (typeof generatedPaperText !== 'undefined') {
    generatedPaperText = '';
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
  
  // Add mobile navigation toggle if needed
  setupMobileNavigation();
  
  // Add common event listeners
  document.addEventListener('DOMContentLoaded', () => {
    // Add any common initialization here
  });
}

/**
 * Setup mobile navigation functionality
 */
function setupMobileNavigation() {
  // Add mobile menu styles if not already present
  if (!document.getElementById('mobile-nav-styles')) {
    const mobileStyles = document.createElement('style');
    mobileStyles.id = 'mobile-nav-styles';
    mobileStyles.textContent = `
      .mobile-menu-toggle {
        display: none;
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
      }
      
      @media (max-width: 768px) {
        .mobile-menu-toggle {
          display: block;
        }
        
        .nav-list {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--primary-color);
          flex-direction: column;
          padding: 1rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
        }
        
        .nav-list.mobile-open {
          display: flex;
        }
        
        .nav-list li {
          margin: 0.5rem 0;
          text-align: center;
        }
        
        .nav-list li a {
          display: block;
          padding: 0.75rem;
          border-radius: 4px;
          transition: background 0.3s;
        }
        
        .nav-list li a:hover {
          background: rgba(255,255,255,0.1);
        }
        
        #userEmailDisplay {
          color: white;
          font-size: 0.9rem;
          padding: 0.5rem;
        }
        
        .logout-button {
          background: var(--accent-color);
          color: var(--text-color);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }
        
        .primary-btn {
          background: var(--accent-color);
          color: var(--text-color);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
        }
      }
    `;
    document.head.appendChild(mobileStyles);
  }
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
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto remove after duration
  setTimeout(() => {
    if (notification && notification.parentNode) {
      notification.parentNode.removeChild(notification);
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

/**
 * Handle responsive navigation for mobile
 */
// REPLACE this entire function:
function handleMobileNavigation() {
  const header = document.querySelector('.app-header');
  if (!header) return;
  
  // Remove any existing mobile toggle
  const existingToggle = header.querySelector('.mobile-menu-toggle');
  if (existingToggle) existingToggle.remove();
  
  const nav = header.querySelector('nav');
  const navList = header.querySelector('.nav-list');
  
  if (nav && navList) {
    // Ensure nav is hidden by default on mobile
    if (window.innerWidth <= 768) {
      navList.classList.remove('mobile-open');
    }
    
    // Create mobile toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'mobile-menu-toggle';
    toggleButton.innerHTML = '☰';
    toggleButton.setAttribute('aria-label', 'Toggle mobile menu');
    
    // Insert toggle button at the end of nav
    nav.appendChild(toggleButton);
    
    // Add click handler
    toggleButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isOpen = navList.classList.contains('mobile-open');
      
      if (isOpen) {
        navList.classList.remove('mobile-open');
        toggleButton.innerHTML = '☰';
      } else {
        navList.classList.add('mobile-open');
        toggleButton.innerHTML = '✕';
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target) && navList.classList.contains('mobile-open')) {
        navList.classList.remove('mobile-open');
        toggleButton.innerHTML = '☰';
      }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        navList.classList.remove('mobile-open');
        toggleButton.innerHTML = '☰';
      }
    });
    
    // Ensure proper initial state
    if (window.innerWidth <= 768) {
      navList.classList.remove('mobile-open');
      toggleButton.innerHTML = '☰';
    }
  }
}

// Make functions available globally
window.renderHeader = renderHeader;
window.renderFooter = renderFooter;
window.logout = logout;
window.initializeCommonComponents = initializeCommonComponents;
window.showNotification = showNotification;
window.isUserAuthenticated = isUserAuthenticated;
window.getCurrentUserEmail = getCurrentUserEmail;
window.formatUserDisplayName = formatUserDisplayName;
window.handleMobileNavigation = handleMobileNavigation;

// Auto-setup mobile navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure header is rendered
  setTimeout(() => {
    handleMobileNavigation();
  }, 100);
});
