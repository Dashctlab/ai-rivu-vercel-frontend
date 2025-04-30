const backendURL = 'https://ai-rivu-vercel-render-backend.onrender.com';
let classDropdown, subjectDropdown, curriculumDropdown;
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

const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
// On page load

function resetFormFields() {
  document.getElementById('curriculum').selectedIndex = 0;
  classDropdown.innerHTML = '<option value="">Select Class</option>';
  subjectDropdown.innerHTML = '<option value="">Select Subject</option>';
  document.getElementById('topic').value = '';
  document.getElementById('timeDuration').value = '60';
  document.getElementById('easy').value = '0';
  document.getElementById('medium').value = '100';
  document.getElementById('hard').value = '0';
  document.getElementById('additionalConditions').value = '';
  document.querySelector('input[name="answerKeyFormat"][value="Brief"]').checked = true;

  document.querySelectorAll('.numQuestions').forEach(input => input.value = 0);
  document.querySelectorAll('.marksPerQuestion').forEach(input => input.value = 0);

  calculateTotals();
  validateForm();
}
document.addEventListener('DOMContentLoaded', () => {
  curriculumDropdown = document.getElementById('curriculum');
  classDropdown = document.getElementById('className');
  subjectDropdown = document.getElementById('subject');

  // Initially disable both
  classDropdown.disabled = true;
  subjectDropdown.disabled = true;

  // Curriculum → Enable Class
  curriculumDropdown.addEventListener('change', () => {
    const selectedCurriculum = curriculumDropdown.value;

    // Reset class and subject
    classDropdown.innerHTML = '<option value="">Select Class</option>';
    classDropdown.disabled = true;

    subjectDropdown.innerHTML = '<option value="">Select Subject</option>';
    subjectDropdown.disabled = true;

    if (selectedCurriculum) {
      for (let i = 1; i <= 10; i++) {
        const option = document.createElement('option');
        option.value = `Class ${i}`;
        option.textContent = `Class ${i}`;
        classDropdown.appendChild(option);
      }
      classDropdown.disabled = false; // ✅ enable class
    }
  });

  // ✅ Class → Enable and populate Subject
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

  console.log("Dropdown logic ready");
}); 



  console.log("generator.js loaded and dropdown logic active");
  
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
  );

  document.querySelectorAll('.numQuestions').forEach(input => {
    input.addEventListener('input', () => {
      if (parseInt(input.value) > 25) {
        input.value = 25;
      }
    });
  });

  document.querySelectorAll('.numQuestions, .marksPerQuestion').forEach(input => {
    input.addEventListener('input', calculateTotals);
  });

  document.getElementById('questionForm').addEventListener('input', validateForm);
  document.getElementById('questionForm').addEventListener('submit', generateQuestionPaper);

  downloadBtn.style.display = 'none';

  // Correct download click binding
  downloadBtn.addEventListener('click', async () => {
    const text = document.getElementById('output').textContent;
    const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');

    let sections = [], currentSection = null, answerKeyStarted = false, answerKey = [];

    for (let line of lines) {
      if (line.toLowerCase().includes('answer key')) {
        answerKeyStarted = true;
        continue;
      }
      if (answerKeyStarted) {
        if (line !== '') answerKey.push(line);
      } else if (line.startsWith('Section')) {
        if (currentSection) sections.push(currentSection);
        currentSection = { title: line, questions: [] };
      } else if (line.match(/^\d+\.\s+/)) {
        if (currentSection) currentSection.questions.push(line.replace(/^\d+\.\s*/, '').trim());
      }
    }

    if (currentSection) sections.push(currentSection);

    const metadata = {
      curriculum: document.getElementById('curriculum').value,
      className: document.getElementById('className').value,
      subject: document.getElementById('subject').value,
      totalMarks: document.getElementById('overallTotalMarks').textContent,
      timeDuration: document.getElementById('timeDuration').value + ' Minutes'
    };

    const payload = {
      subject: metadata.subject,
      metadata: {
        className: metadata.className,
        totalMarks: metadata.totalMarks,
        timeDuration: metadata.timeDuration
      },
      sections,
      answerKey
    };

    try {
      const response = await fetch(`${backendURL}/download-docx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Question_Paper_${metadata.subject || 'Untitled'}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download Word file.');
      console.error(error);
    }
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

  generateBtn.disabled = true;											   
									  
  const questionTypesSelected = [];

  document.querySelectorAll('#questionsTable tbody tr').forEach(row => {
    const type = row.querySelector('td').textContent.trim();
    const num = parseInt(row.querySelector('.numQuestions').value) || 0;
    if (num > 0) questionTypesSelected.push(type);
  });

  if (questionTypesSelected.length === 0) {
    alert("Please select at least one type of question with a non-zero number.");
    generateBtn.disabled = false;
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
																	   
      document.getElementById('output').textContent = data.questions;
      downloadBtn.style.display = 'inline-block';
      resetFormFields();
    } else {
      const errorData = await response.json();
      document.getElementById('output').textContent = `Error: ${errorData.message || 'Failed to generate paper.'}`;
    }
  } catch (error) {
    console.error(error);
    document.getElementById('output').textContent = 'Error generating paper. Please check connection or server.';
  } finally {
    generateBtn.disabled = false;

// Download generated paper as Word file
  const text = document.getElementById('output').textContent;
  const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');

  let sections = [];
  let currentSection = null;
  let answerKeyStarted = false;
  let answerKey = [];

  for (let line of lines) {
    if (line.toLowerCase().includes('answer key')) {
      answerKeyStarted = true;
      continue;
    }

    if (answerKeyStarted) {
      if (line !== '') answerKey.push(line);
    } else if (line.startsWith('Section')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: line,
        questions: []
      };
    } else if (line.match(/^\d+\.\s+/)) {
      // Lines starting with "1. ", "2. " etc. are questions
      if (currentSection) {
        currentSection.questions.push(line.replace(/^\d+\.\s*/, '').trim());
      }
    } else {
      // Ignore instructions and random text
      continue;
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  // Prepare metadata
  const metadata = {
    curriculum: document.getElementById('curriculum').value,
    className: document.getElementById('className').value,
    subject: document.getElementById('subject').value,
    totalMarks: document.getElementById('overallTotalMarks').textContent,
    timeDuration: document.getElementById('timeDuration').value + " Minutes"
  };

  const payload = {
    subject: metadata.subject,
    metadata: {
      className: metadata.className,
      totalMarks: metadata.totalMarks,
      timeDuration: metadata.timeDuration
    },
    sections,
    answerKey
  };

  try {
    const response = await fetch(`${backendURL}/download-docx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Question_Paper_${metadata.subject || 'Untitled'}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    alert("Failed to download Word file.");
    console.error(error);
    }
}

// Logout
function logout() {
  localStorage.removeItem('userEmail');
  window.location.href = '/login.html';
}
}
