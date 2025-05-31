// Shared UI Components

/**
 * Renders the common header
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
  
  // Add common event listeners
  document.addEventListener('DOMContentLoaded', () => {
    // Add any common initialization here
  });
}

// Make functions available globally
window.renderHeader = renderHeader;
window.renderFooter = renderFooter;
window.logout = logout;
window.initializeCommonComponents = initializeCommonComponents;