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
    const type = row.querySelector('td').textContent;
    const num = parseInt(row.querySelector('.numQuestions').value) || 0;
    if (num > 0) questionTypesSelected.push(type);
  });

  const payload = {
    curriculum: formData.get('curriculum') || curriculumDropdown.value,
    className: formData.get('className') || classDropdown.value,
    subject: formData.get('subject') || subjectDropdown.value,
    topic: formData.get('topic'),
    numQuestions: questionTypesSelected.length,
    difficultySplit: `${document.getElementById('easy').value}%-${document.getElementById('medium').value}%-${document.getElementById('hard').value}%`,
    timeDuration: formData.get('timeDuration') || document.getElementById('timeDuration').value,
    additionalConditions: formData.get('additionalConditions'),
    questionTypes: questionTypesSelected,
    answerKeyFormat: formData.get('answerKeyFormat') || document.querySelector('input[name="answerKeyFormat"]:checked').value
  };

  document.getElementById('outputSection').style.display = 'none';
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
      throw new Error('Generation failed');
    }
  } catch (error) {
    document.getElementById('output').textContent = 'Error generating paper.';
  }
}

// Download generated paper as Word file
document.getElementById('downloadBtn').addEventListener('click', () => {
  const text = document.getElementById('output').textContent;
  const blob = new Blob([text], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'question-paper.docx';
  a.click();
  URL.revokeObjectURL(url);
});

// Logout
function logout() {
  localStorage.removeItem('userEmail');
  window.location.href = '/login.html';
}
