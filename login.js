const backendURL = window.env?.BACKEND_URL || 'https://ai-rivu-vercel-render-backend.onrender.com';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${backendURL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    const errorMsg = document.getElementById('error-message');

    if (response.ok) {
      localStorage.setItem('userEmail', result.email);
      window.location.href = '/generator.html';
    } else {
      errorMsg.innerText = result.message || 'Invalid credentials';
      errorMsg.style.display = 'block';
    }
  } catch (err) {
    console.error('Login failed:', err);
    alert('Server error. Please try again.');
  }
});
