document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('https://ai-rivu-vercel-render-backend.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
document.getElementById('error-message').innerText = result.message || 'Invalid credentials';
    if (response.ok) {
      localStorage.setItem('userEmail', result.email);
      window.location.href = '/generator.html';
    } else {
      alert(result.message || 'Invalid email or password.');
    }
  } catch (err) {
    console.error('Login failed:', err);
    alert('Server error. Please try again.');
  }
});
