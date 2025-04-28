async function generateQuestions() {
  const input = document.getElementById('inputTopic').value;

  const response = await fetch('https://YOUR-BACKEND-URL/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: input })
  });

  if (response.ok) {
    const data = await response.json();
    document.getElementById('output').innerText = data.questions;
  } else {
    document.getElementById('output').innerText = 'Error generating questions.';
  }
}

function logout() {
  localStorage.removeItem('userEmail');
  window.location.href = '/login.html';
}
