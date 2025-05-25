document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${window.APP_CONFIG.BACKEND_URL}/login`,  
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

    

    const result = await response.json();

    if (response.ok) {
      localStorage.setItem('userEmail', result.email);
      window.location.href = '/generator.html';
    } 
    


 } else if (response.status === 401) {
      document.getElementById('error-message').textContent = 'Invalid email or password.';
    } else {
      document.getElementById('error-message').textContent = 'Something went wrong. Try again.';
    }

//    else {
  //    document.getElementById('error-message').innerText = result.message || 'Invalid credentials';
    //}
  } catch (err) {
    console.error('Login failed:', err);
    alert('Server error. Please try again.');
  }
});
