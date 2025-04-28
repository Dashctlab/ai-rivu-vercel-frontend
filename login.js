async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const response = await fetch('https://YOUR-BACKEND-URL/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('userEmail', data.email);
    window.location.href = '/generator.html';
  } else {
    document.getElementById('error-message').innerText = 'Invalid login credentials.';
  }
}
