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

// On page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize references
  curriculumDropdown = document.getElementById('curriculum');
  classDropdown = document.getElementById('className');
  subjectDropdown = document.getElementById('subject');
  const tableBody = document.querySelector('#questionsTable tbody');
  const generateBtn = document.getElementById('generateBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  // Initially disable both class and subject
  classDropdown.disabled = true;
  subjectDropdown.disabled = true;

  // Populate question types table
  questionTypes.forEach(type => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${type}</td>
      <td><input type="number" class="numQuestions" min="0" max="25" value="0"></td>
      <td><input type="number" class="marksPerQuestion" min="0" value="0"></td>
      <td class="totalMarks">0</td>
    `;
    tableBody.appendChild(row);
  });

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
      classDropdown.disabled = false; // Enable class
    }
  });

  // Class → Enable and populate Subject
  classDropdown.addEventListener('change', () => {
    subjectDropdown.innerHTML = '<option value="">Select Subject</option>';
    const selectedClass = classDropdown.value;
    
    // Keep subject disabled until class is selected
    if (!selectedClass) {
      subjectDropdown.disabled = true;
      return;
    }
    
    // Enable subject and populate options
    subjectDropdown.disabled = false;
    if (classSubjectMap[selectedClass]) {
      classSubjectMap[selectedClass].forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectDropdown.appendChild(option);
      });
    }
  });

  // Limit questions to max 25
  document.querySelectorAll('.numQuestions').forEach(input => {
    input.addEventListener('input', () => {
      if (parseInt(input.value) > 25) {
        input.value = 25;
      }
    });
  });

  // Calculate totals when input changes
  document.querySelectorAll('.numQuestions, .marksPerQuestion').forEach(input => {
    input.addEventListener('input', calculateTotals);
  });

  // Validate form on input change
  document.getElementById('questionForm').addEventListener('input', validateForm);
  
  // Form submission
  document.getElementById('questionForm').addEventListener('submit', generateQuestionPaper);

  // Hide download button initially
  downloadBtn.style.display = 'none';

  // Download button functionality
  downloadBtn.addEventListener('click', () => {
    try {
      downloadQuestionPaper();
    } catch (error) {
      console.error("Error in download handler:", error);
      alert("Failed to download Word file. Check console for details.");
    }
  });

  console.log("generator.js loaded and dropdown logic active");
});

// Reset form fields
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

  // Re-disable dropdowns
  classDropdown.disabled = true;
  subjectDropdown.disabled = true;

  calculateTotals();
  validateForm();
}

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
  const generateBtn = document.getElementById('generateBtn');
  generateBtn.disabled = !(curriculum && selectedClass && selectedSubject && (easy + medium + hard === 100));
}

// Generate Question Paper
async function generateQuestionPaper(e) {
  e.preventDefault();
  
  const generateBtn = document.getElementById('generateBtn');
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
      document.getElementById('downloadBtn').style.display = 'inline-block';
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
  }
}

// Download generated paper as Word file
async function downloadQuestionPaper() {
  console.log("Starting download process...");
  const output = document.getElementById('output');
  if (!output || !output.textContent || output.textContent.trim() === '' || 
      output.textContent.includes('Generating, please wait...') || 
      output.textContent.includes('Error:')) {
    alert("No valid content to download. Please generate a question paper first.");
    return;
  }
  
  const text = output.textContent;
  console.log("Processing output text...");
  
  // Get subject for the document
  const subject = document.getElementById('subject').value;
  
  // Get metadata for the document
  const metadata = {
    curriculum: document.getElementById('curriculum').value,
    className: document.getElementById('className').value,
    totalMarks: document.getElementById('overallTotalMarks').textContent,
    timeDuration: document.getElementById('timeDuration').value + " Minutes"
  };
  
  // Parse the text to identify sections and questions
  const sections = [];
  const answerKey = [];
  
  let currentSection = null;
  let isAnswerKey = false;
  
  // Process the text line by line
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if we've reached the answer key
    if (line.toLowerCase().includes('answer key')) {
      isAnswerKey = true;
      continue;
    }
    
    if (isAnswerKey) {
      // Process answer key lines
      // Remove any numbering and add the answer content
      const answerMatch = line.match(/^\d+\.\s*(.+)$/);
      if (answerMatch) {
        answerKey.push(answerMatch[1].trim());
      } else if (line) {
        answerKey.push(line);
      }
    } else {
      // Process question paper lines
      // Check if this is a section header
      if (line.toUpperCase() === line || 
          line.startsWith('SECTION') || 
          line.includes('QUESTIONS') || 
          line.includes('MARKS')) {
        // This appears to be a section header
        currentSection = {
          title: line,
          questions: []
        };
        sections.push(currentSection);
      } 
      // Check if this is a numbered question
      else if (currentSection && line.match(/^\d+\.\s*/)) {
        currentSection.questions.push(line.replace(/^\d+\.\s*/, '').trim());
      } 
      // If we don't have a section yet, create a default one
      else if (!currentSection && line) {
        currentSection = {
          title: "Questions",
          questions: [line]
        };
        sections.push(currentSection);
      }
      // Otherwise add to the last section
      else if (currentSection && line) {
        // If the line doesn't start with a number, it might be part of the previous question
        // or it might be a question without numbering
        currentSection.questions.push(line);
      }
    }
  }
  
  // Ensure we have at least one section
  if (sections.length === 0) {
    sections.push({
      title: "Questions",
      questions: ["No questions found in the generated content."]
    });
  }
  
  // Prepare the payload in the exact format expected by the backend
  const payload = {
    subject: subject,
    metadata: metadata,
    sections: sections,
    answerKey: answerKey
  };

  console.log("Sending payload to server:", payload);
  
  try {
    const response = await fetch(`${backendURL}/download-docx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'useremail': localStorage.getItem('userEmail') || ''
      },
      body: JSON.stringify(payload)
    });
    
    console.log("Server response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
      console.error("Download failed with status:", response.status, errorData);
      throw new Error(`Download failed: ${errorData.message || response.statusText}`);
    }

    console.log("Download response received, processing blob...");
    const blob = await response.blob();
    
    console.log("Blob received with type:", blob.type);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Question_Paper_${subject || 'Untitled'}.docx`;
    document.body.appendChild(a);
    console.log("Triggering download...");
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    
    console.log("Download completed successfully");
  } catch (error) {
    console.error("Download error:", error);
    alert(`Failed to download Word file: ${error.message}`);
    
    // Fallback method - try a different approach if the fetch method fails
    try {
      console.log("Attempting fallback download method as text file...");
      const blob = new Blob([text], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Question_Paper_${subject || 'Untitled'}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      console.log("Fallback download (text) completed");
    } catch (fallbackError) {
      console.error("Fallback download also failed:", fallbackError);
    }
  }
}

// Logout
function logout() {
  localStorage.removeItem('userEmail');
  window.location.href = '/login.html';
}
