const backendURL = 'https://ai-rivu-vercel-render-backend.onrender.com';

// Class → Subject Mapping
const classSubjectMap = {
  'Class 1': ['English', 'Mathematics', 'Environmental Studies', 'General Knowledge'],
  'Class 2': ['English', 'Mathematics', 'Environmental Studies', 'General Knowledge'],
  'Class 3': ['English', 'Mathematics', 'Environmental Studies', 'Computer Science', 'General Knowledge'],
  'Class 4': ['English', 'Mathematics', 'Environmental Studies', 'Computer Science', 'General Knowledge'],
  'Class 5': ['English', 'Mathematics', 'Environmental Studies', 'Computer Science', 'General Knowledge'],
  'Class 6': ['English', 'Mathematics', 'Science', 'Social Science', 'Computer Science', 'General Knowledge'],
  'Class 7': ['English', 'Mathematics', 'Science', 'Social Science', 'Computer Science', 'General Knowledge'],
  'Class 8': ['English', 'Mathematics', 'Science', 'Social Science', 'Computer Science', 'General Knowledge'],
  'Class 9': ['English', 'Mathematics', 'Science', 'Social Science', 'Computer Science', 'General Knowledge'],
  'Class 10': ['English', 'Mathematics', 'Science', 'Social Science', 'Computer Science', 'General Knowledge']
};

// List of question types
const questionTypes = [
  'MCQ', 'Short Answer', 'Long Answer', 'True/False', 'Fill in the Blanks',
  'Match the Following', 'Case Based', 'Diagram Based', 'Descriptive'
];

const tableBody = document.querySelector('#questionsTable tbody');
const classDropdown = document.getElementById('className');
const subjectDropdown = document.getElementById('subject');
const curriculumDropdown = document.getElementById('curriculum');
const generateBtn = document.getElementById('generateBtn');

// On page load
document.addEventListener('DOMContentLoaded', () => {
  // Create table rows for question types
  questionTypes.forEach(type => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${type}</td>
      <td><input type="number" min="0" value="0" class="numQuestions"></td>
      <td><input type="number" min="0" value="0" class="marksPerQuestion"></td>
      <td class="totalMarks">0</td>
    `;
    tableBody.appendChild(row);
  });

  curriculumDropdown.addEventListener('change', () => {
    classDropdown.disabled = false;
    classDropdown.innerHTML = '<option value="">Select Class</option>';

  // Populate Class 1 to Class 12
  for (let i = 1; i <= 12; i++) {
    const option = document.createElement('option');
    option.value = `Class ${i}`;
    option.textContent = `Class ${i}`;
    classDropdown.appendChild(option);
  }
  });

  classDropdown.addEventListener('change', () => {
    subjectDropdown.disabled = false;
    subjectDropdown.innerHTML = '<option value="">Select Subject</option>';
    const selectedClass = classDropdown.value;
    if (classSubjectMap[selectedClass]) {
      classSubjectMap[selectedClass].forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectDropdown.appendChild(option);
      });
    }
  });

  document.querySelectorAll('.numQuestions, .marksPerQuestion').forEach(input => {
    input.addEventListener('input', calculateTotals);
  });

  document.getElementById('questionForm').addEventListener('input', validateForm);
  document.getElementById('questionForm').addEventListener('submit', generateQuestionPaper);
});

// Calculate total marks dynamically
function calculateTotals() {
  let overallTotal = 0;
  document.querySelectorAll('#questionsTable tbody tr').forEach(row => {
    const num = parseInt(row.querySelector('.numQuestions').value) || 0;
    const marks = parseInt(row.querySelector('.marksPerQuestion').value) || 0;
    const total = num * marks;
    row.querySelector('.totalMarks').textContent = total;
    overallTotal += total;
  });
  document.getElementById('overallTotalMarks').textContent = overallTotal;
}

// Enable Generate Button only if mandatory fields filled
function validateForm() {
  const curriculum = curriculumDropdown.value;
  const selectedClass = classDropdown.value;
  const selectedSubject = subjectDropdown.value;
  const easy = parseInt(document.getElementById('easy').value) || 0;
  const medium = parseInt(document.getElementById('medium').value) || 0;
  const hard = parseInt(document.getElementById('hard').value) || 0;
  generateBtn.disabled = !(curriculum && selectedClass && selectedSubject && (easy + medium + hard === 100));
}

// Generate Question Paper
async function generateQuestionPaper(e) {
  e.preventDefault();

  const form = document.getElementById('questionForm');
  const formData = new FormData(form);
  const questionTypesSelected = [];

  document.querySelectorAll('#questionsTable tbody tr').forEach(row => {
    const type = row.querySelector('td').textContent.trim();
    const num = parseInt(row.querySelector('.numQuestions').value) || 0;
    if (num > 0) questionTypesSelected.push(type);
  });

  if (questionTypesSelected.length === 0) {
    alert("Please select at least one type of question with a non-zero number.");
    return;
  }

  const easy = document.getElementById('easy').value || 0;
  const medium = document.getElementById('medium').value || 0;
  const hard = document.getElementById('hard').value || 0;

  const payload = {
    curriculum: document.getElementById('curriculum').value,
    className: document.getElementById('className').value,
    subject: document.getElementById('subject').value || '',
    topic: document.getElementById('topic').value,
    numQuestions: questionTypesSelected.length,
    difficultySplit: `${easy}%-${medium}%-${hard}%`,
    timeDuration: document.getElementById('timeDuration').value,
    additionalConditions: document.getElementById('additionalConditions').value,
    questionTypes: questionTypesSelected,
    answerKeyFormat: document.querySelector('input[name="answerKeyFormat"]:checked').value
  };

  document.getElementById('outputSection').style.display = 'block';
  document.getElementById('output').textContent = 'Generating, please wait...';

  try {
    const response = await fetch(`${backendURL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'useremail': localStorage.getItem('userEmail')
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      document.getElementById('outputSection').style.display = 'block';
      document.getElementById('output').textContent = data.questions;
    } else {
      const errorData = await response.json();
      document.getElementById('output').textContent = `Error: ${errorData.message || 'Failed to generate paper.'}`;
    }
  } catch (error) {
    console.error(error);
    document.getElementById('output').textContent = 'Error generating paper. Please check connection or server.';
  }
}

// Download generated paper as Word file
document.getElementById('downloadBtn').addEventListener('click', async () => {
  const subject = document.getElementById('subject').value;
  const questionsText = document.getElementById('output').textContent;

  // Extract individual questions from output
  const questions = questionsText
    .split('\n')
    .filter(line => line.trim() !== '' && /^\d+\./.test(line.trim())); // lines like "1. What is..."

  if (!questions || questions.length === 0) {
    alert("No valid questions found to download.");
    return;
  }

  try {
    const response = await fetch(`${backendURL}/download-docx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subject, questions })
    });

    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Question_Paper_${subject || 'Untitled'}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    alert("Failed to download Word file.");
    console.error(error);
  }
});


// Logout
function logout() {
  localStorage.removeItem('userEmail');
  window.location.href = '/login.html';
}
