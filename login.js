import config from './config.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('error-message');
  const loadingMsg = document.getElementById('loading-message');

  // Reset messages
  errorMsg.style.display = 'none';
  loadingMsg.style.display = 'block';

  try {
    const response = await fetch(`${config.backendURL}/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include', // This is important for cookies
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (response.ok) {
      // Store user data
      localStorage.setItem('userEmail', result.email);
      localStorage.setItem('authToken', result.token); // If your backend sends a token
      
      // Redirect to generator page
      window.location.href = '/generator.html';
    } else {
      errorMsg.innerText = result.message || 'Invalid credentials';
      errorMsg.style.display = 'block';
    }
  } catch (err) {
    console.error('Login failed:', err);
    errorMsg.innerText = 'Server error. Please try again.';
    errorMsg.style.display = 'block';
  } finally {
    loadingMsg.style.display = 'none';
  }
});

// Add this to prevent form resubmission on page refresh
if (window.history.replaceState) {
  window.history.replaceState(null, null, window.location.href);
}
