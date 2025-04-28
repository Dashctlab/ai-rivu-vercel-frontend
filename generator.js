async function generateQuestions() {
  const input = document.getElementById('inputTopic').value;

  const response = await fetch('https://ai-rivu-vercel-render-backend.onrender.com/generate', {
    method: 'POST',
   headers: {
    'Content-Type': 'application/json',
    'useremail': localStorage.getItem('userEmail') // Important to send user email
  },
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
