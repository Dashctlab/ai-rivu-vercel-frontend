// Updated generator.js with curriculum-specific subject mapping
const backendURL = `${window.APP_CONFIG.BACKEND_URL}/generate`;
let classDropdown, subjectDropdown, curriculumDropdown;

// ---> ADDED: Global variable to store the raw generated text
let generatedPaperText = '';

// ===== UPDATED: Curriculum-specific Class → Subject Mapping =====
const curriculumSubjectMap = {
  'CBSE': {
    'Class 1': ['English', 'Mathematics', 'Environmental Studies', 'General Knowledge'],
    'Class 2': ['English', 'Mathematics', 'Environmental Studies', 'General Knowledge'],
    'Class 3': ['English', 'Mathematics', 'Environmental Studies', 'Computer Science', 'General Knowledge'],
    'Class 4': ['English', 'Mathematics', 'Environmental Studies', 'Computer Science', 'General Knowledge'],
    'Class 5': ['English', 'Mathematics', 'Environmental Studies', 'Computer Science', 'General Knowledge'],
    'Class 6': ['English', 'Mathematics', 'Science', 'Social Science', 'Computer Science', 'Sanskrit'],
    'Class 7': ['English', 'Mathematics', 'Science', 'Social Science', 'Computer Science', 'Sanskrit'],
    'Class 8': ['English', 'Mathematics', 'Science', 'Social Science', 'Computer Science', 'Sanskrit'],
    'Class 9': ['English', 'Mathematics', 'Science', 'Social Science', 'Computer Science', 'Information Technology', 'Sanskrit'],
    'Class 10': ['English', 'Mathematics', 'Science', 'Social Science', 'Computer Science', 'Information Technology', 'Sanskrit'],
    'Class 11': ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics', 'Business Studies', 'Accountancy', 'Political Science', 'History', 'Geography', 'Psychology'],
    'Class 12': ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics', 'Business Studies', 'Accountancy', 'Political Science', 'History', 'Geography', 'Psychology']
  },
  
  'Karnataka State Board': {
    'Class 1': ['English', 'Kannada', 'Mathematics', 'Environmental Studies', 'General Knowledge'],
    'Class 2': ['English', 'Kannada', 'Mathematics', 'Environmental Studies', 'General Knowledge'],
    'Class 3': ['English', 'Kannada', 'Mathematics', 'Environmental Studies', 'General Knowledge'],
    'Class 4': ['English', 'Kannada', 'Mathematics', 'Environmental Studies', 'General Knowledge'],
    'Class 5': ['English', 'Kannada', 'Mathematics', 'Science', 'Social Science', 'Computer Science'],
    'Class 6': ['English', 'Kannada', 'Mathematics', 'Science', 'Social Science', 'Computer Science', 'Sanskrit'],
    'Class 7': ['English', 'Kannada', 'Mathematics', 'Science', 'Social Science', 'Computer Science', 'Sanskrit'],
    'Class 8': ['English', 'Kannada', 'Mathematics', 'Science', 'Social Science', 'Computer Science', 'Sanskrit'],
    'Class 9': ['English', 'Kannada', 'Mathematics', 'Science', 'Social Science', 'Computer Science', 'Sanskrit'],
    'Class 10': ['English', 'Kannada', 'Mathematics', 'Science', 'Social Science', 'Computer Science', 'Sanskrit'],
    'Class 11': ['English', 'Kannada', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'Economics', 'Business Studies', 'Accountancy', 'History', 'Political Science', 'Geography'],
    'Class 12': ['English', 'Kannada', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'Economics', 'Business Studies', 'Accountancy', 'History', 'Political Science', 'Geography']
  },
  
  'Tamil Nadu State Board': {
    'Class 1': ['Tamil', 'English', 'Mathematics', 'Environmental Studies', 'General Knowledge'],
    'Class 2': ['Tamil', 'English', 'Mathematics', 'Environmental Studies', 'General Knowledge'],
    'Class 3': ['Tamil', 'English', 'Mathematics', 'Environmental Studies', 'General Knowledge'],
    'Class 4': ['Tamil', 'English', 'Mathematics', 'Environmental Studies', 'General Knowledge'],
    'Class 5': ['Tamil', 'English', 'Mathematics', 'Environmental Studies', 'General Knowledge'],
    'Class 6': ['Tamil', 'English', 'Mathematics', 'Science', 'Social Science', 'Computer Science'],
    'Class 7': ['Tamil', 'English', 'Mathematics', 'Science', 'Social Science', 'Computer Science'],
    'Class 8': ['Tamil', 'English', 'Mathematics', 'Science', 'Social Science', 'Computer Science'],
    'Class 9': ['Tamil', 'English', 'Mathematics', 'Science', 'Social Science', 'Computer Science'],
    'Class 10': ['Tamil', 'English', 'Mathematics', 'Science', 'Social Science', 'Computer Science'],
    'Class 11': ['Tamil', 'English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'Commerce', 'Accountancy', 'Economics', 'History', 'Geography', 'Political Science'],
    'Class 12': ['Tamil', 'English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'Commerce', 'Accountancy', 'Economics', 'History', 'Geography', 'Political Science']
  }
};

// List of question types with new "Give Reasons" option
const questionTypes = [
  'MCQ', 'Short Answer', 'Long Answer', 'True/False', 'Fill in the Blanks',
  'Match the Following', 'Case Based', 'Diagram Based', 'Descriptive', 'Give Reasons'
];

// Track rows added
let questionRowCount = 0;
const MAX_QUESTION_ROWS = 12;

// ===== UPDATED: Helper function to update subject dropdown based on curriculum and class =====
function updateSubjectDropdown(curriculum, selectedClass) {
  subjectDropdown.innerHTML = '<option value="">Select Subject</option>';
  
  if (!curriculum || !selectedClass) {
    subjectDropdown.disabled = true;
    return;
  }
  
  const subjects = curriculumSubjectMap[curriculum]?.[selectedClass] || [];
  
  if (subjects.length > 0) {
    subjects.forEach(subject => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      subjectDropdown.appendChild(option);
    });
    subjectDropdown.disabled = false;
  } else {
    subjectDropdown.disabled = true;
  }
}

// On page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize references
  curriculumDropdown = document.getElementById('curriculum');
  classDropdown = document.getElementById('className');
  subjectDropdown = document.getElementById('subject');
  const tableBody = document.getElementById('questionRowsBody');
  const generateBtn = document.getElementById('generateBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const addRowBtn = document.getElementById('addQuestionRowBtn');

  // Initially disable both class and subject
  classDropdown.disabled = true;
  subjectDropdown.disabled = true;

  // Add initial row
  addQuestionRow();

  // Add row button event listener
  addRowBtn.addEventListener('click', () => {
    if (questionRowCount < MAX_QUESTION_ROWS) {
      addQuestionRow();
    } else {
      alert(`Maximum ${MAX_QUESTION_ROWS} question types are allowed.`);
    }
  });

  // ===== UPDATED: Curriculum → Enable Class (curriculum-specific) =====
  curriculumDropdown.addEventListener('change', () => {
    const selectedCurriculum = curriculumDropdown.value;

    // Reset class and subject
    classDropdown.innerHTML = '<option value="">Select Class</option>';
    classDropdown.disabled = true;
    subjectDropdown.innerHTML = '<option value="">Select Subject</option>';
    subjectDropdown.disabled = true;

    if (selectedCurriculum) {
      // Populate classes based on selected curriculum
      const availableClasses = Object.keys(curriculumSubjectMap[selectedCurriculum] || {});
      availableClasses.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        classDropdown.appendChild(option);
      });
      classDropdown.disabled = false;
    }
  });

  // ===== UPDATED: Class → Enable and populate Subject (curriculum-specific) =====
  classDropdown.addEventListener('change', () => {
    const selectedCurriculum = curriculumDropdown.value;
    const selectedClass = classDropdown.value;
    updateSubjectDropdown(selectedCurriculum, selectedClass);
  });

  // Validate form on input change
  document.getElementById('questionForm').addEventListener('input', validateForm);

  // Form submission
  document.getElementById('questionForm').addEventListener('submit', generateQuestionPaper);

  // Hide download button initially
  downloadBtn.style.display = 'none';

  // Download button functionality
  downloadBtn.addEventListener('click', () => {
    downloadQuestionPaper();
  });

  console.log("generator.js loaded with curriculum-specific dropdown logic active");
});

// Function to add a new question row
function addQuestionRow() {
  if (questionRowCount >= MAX_QUESTION_ROWS) return;
  
  questionRowCount++;
  const rowId = `qrow-${Date.now()}`; // Unique ID for the row
  const tbody = document.getElementById('questionRowsBody');
  
  const row = document.createElement('tr');
  row.id = rowId;
  row.innerHTML = `
    <td>
      <select class="question-type" required>
        <option value="">Select Type</option>
        ${questionTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
      </select>
    </td>
    <td>
      <input type="text" class="topic" placeholder="Optional topic">
    </td>
    <td>
      <input type="number" class="numQuestions" min="0" max="25" value="0" required>
    </td>
    <td>
      <input type="number" class="marksPerQuestion" min="0" value="0" required>
    </td>
    <td class="totalMarks">0</td>
    <td>
      <button type="button" class="delete-row-btn" data-row-id="${rowId}" aria-label="Delete row">
        <span>&times;</span>
      </button>
    </td>
  `;
  
  tbody.appendChild(row);
  
  // Add event listeners to the new inputs
  const numQuestionsInput = row.querySelector('.numQuestions');
  const marksPerQuestionInput = row.querySelector('.marksPerQuestion');
  
  // Limit questions to max 25
  numQuestionsInput.addEventListener('input', () => {
    if (parseInt(numQuestionsInput.value) > 25) {
      numQuestionsInput.value = 25;
    }
    calculateTotals();
    validateForm();
  });
  
  // Calculate totals when marks change
  marksPerQuestionInput.addEventListener('input', () => {
    calculateTotals();
    validateForm();
  });
  
  // Delete row button
  const deleteBtn = row.querySelector('.delete-row-btn');
  deleteBtn.addEventListener('click', () => {
    if (questionRowCount > 1) {
      row.remove();
      questionRowCount--;
      calculateTotals();
      validateForm();
    } else {
      alert('At least one question type row is required.');
    }
  });
  
  calculateTotals();
  validateForm();
}

// Reset form fields
function resetFormFields() {
  document.getElementById('curriculum').selectedIndex = 0;
  classDropdown.innerHTML = '<option value="">Select Class</option>';
  subjectDropdown.innerHTML = '<option value="">Select Subject</option>';
  document.getElementById('topic').value = '';
  
  // Reset new assessment fields if they exist
  const testObjectiveSelect = document.getElementById('testObjective');
  const focusLevelSelect = document.getElementById('focusLevel');
  if (testObjectiveSelect) testObjectiveSelect.selectedIndex = 0;
  if (focusLevelSelect) focusLevelSelect.selectedIndex = 0;
  
  document.getElementById('timeDuration').value = '60'; // Reset to default
  document.getElementById('easy').value = '0';
  document.getElementById('medium').value = '100'; // Reset to default
  document.getElementById('hard').value = '0';
  document.getElementById('additionalConditions').value = '';
  document.querySelector('input[name="answerKeyFormat"][value="Brief"]').checked = true;

  // Clear all question rows and add a fresh one
  document.getElementById('questionRowsBody').innerHTML = '';
  questionRowCount = 0;
  addQuestionRow();

  // Re-disable dropdowns
  classDropdown.disabled = true;
  subjectDropdown.disabled = true;

  calculateTotals();
  validateForm();
  // Clear stored text on reset as well, just in case
  generatedPaperText = '';
  // Hide download button again on reset
  document.getElementById('downloadBtn').style.display = 'none';
}

// Calculate total marks dynamically
function calculateTotals() {
  let overallTotal = 0;
  let totalQuestions = 0;
  
  document.querySelectorAll('#questionRowsBody tr').forEach(row => {
    const num = parseInt(row.querySelector('.numQuestions').value) || 0;
    const marks = parseInt(row.querySelector('.marksPerQuestion').value) || 0;
    const total = num * marks;
    
    row.querySelector('.totalMarks').textContent = total;
    overallTotal += total;
    totalQuestions += num;
  });
  
  document.getElementById('overallTotalMarks').textContent = overallTotal;
  document.getElementById('totalQuestions').textContent = totalQuestions;
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
  
  // Check for at least one valid question row
  let hasValidRow = false;
  document.querySelectorAll('#questionRowsBody tr').forEach(row => {
    const type = row.querySelector('.question-type').value;
    const num = parseInt(row.querySelector('.numQuestions').value) || 0;
    if (type && num > 0) {
      hasValidRow = true;
    }
  });
  
  // Ensure dropdowns are not disabled and at least one valid question type row
  const formReady = curriculum && selectedClass && selectedSubject && 
                   !classDropdown.disabled && !subjectDropdown.disabled && 
                   hasValidRow && (easy + medium + hard === 100);
                   
  generateBtn.disabled = !formReady;
}

// Generate Question Paper
async function generateQuestionPaper(e) {
  e.preventDefault();

  const generateBtn = document.getElementById('generateBtn');
  generateBtn.disabled = true; // Disable button during generation

  const questionDetails = []; // Capture all question details

  document.querySelectorAll('#questionRowsBody tr').forEach(row => {
    const type = row.querySelector('.question-type').value;
    const topic = row.querySelector('.topic').value.trim();
    const num = parseInt(row.querySelector('.numQuestions').value) || 0;
    const marks = parseInt(row.querySelector('.marksPerQuestion').value) || 0;
    
    if (type && num > 0) {
      questionDetails.push({ 
        type: type, 
        topic: topic, 
        num: num, 
        marks: marks 
      });
    }
  });

  if (questionDetails.length === 0) {
    alert("Please select at least one type of question with a non-zero number.");
    generateBtn.disabled = false; // Re-enable button
    return;
  }

  const easy = document.getElementById('easy').value || 0;
  const medium = document.getElementById('medium').value || 0;
  const hard = document.getElementById('hard').value || 0;

  // Capture needed info BEFORE potential reset
  const currentSubject = document.getElementById('subject').value;
  const currentClassName = document.getElementById('className').value;
  const currentCurriculum = document.getElementById('curriculum').value;
  const currentTotalMarks = document.getElementById('overallTotalMarks').textContent;
  const currentTimeDurationValue = document.getElementById('timeDuration').value;
  
  // Find the selected time duration text (e.g., "1 Hour")
  const timeDurationSelect = document.getElementById('timeDuration');
  const selectedTimeOption = timeDurationSelect.options[timeDurationSelect.selectedIndex];
  const currentTimeDurationText = selectedTimeOption ? selectedTimeOption.text : `${currentTimeDurationValue} Minutes`;

  // ===== UPDATED: Construct payload with new assessment fields =====
  const payload = {
    curriculum: currentCurriculum,
    className: currentClassName,
    subject: currentSubject,
    topic: document.getElementById('topic').value,
    testObjective: document.getElementById('testObjective')?.value || 'mixed',  // 🆕 NEW
    focusLevel: document.getElementById('focusLevel')?.value || 'comprehensive', // 🆕 NEW
    questionDetails: questionDetails, // Send detailed structure 
    difficultySplit: `${easy}%-${medium}%-${hard}%`,
    timeDuration: currentTimeDurationValue, // Send value (e.g., 60)
    additionalConditions: document.getElementById('additionalConditions').value,
    answerKeyFormat: document.querySelector('input[name="answerKeyFormat"]:checked').value
  };

  document.getElementById('outputSection').style.display = 'block';
  document.getElementById('output').textContent = 'Generating, please wait...';
  generatedPaperText = ''; // Clear previous text
  document.getElementById('downloadBtn').style.display = 'none'; // Hide download btn initially

  try {
    const response = await fetch(
      `${window.APP_CONFIG.BACKEND_URL}/generate`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'useremail': localStorage.getItem('userEmail') || 'anonymous'
        },
        body: JSON.stringify(payload)
      }
    );
      
    if (response.ok) {
      const data = await response.json();
      if (!data.questions || typeof data.questions !== 'string') {
        throw new Error("Received invalid question data from server.");
      }
      
      document.getElementById('output').textContent = data.questions;
      generatedPaperText = data.questions; // Store the generated text

      // ===== NEW: Display pedagogical summary if available =====
      if (data.pedagogicalSummary) {
        const summaryElement = document.getElementById('pedagogicalSummary');
        if (summaryElement) {
          summaryElement.style.display = 'block';
          const descriptionElement = document.getElementById('frameworkDescription');
          if (descriptionElement) {
            descriptionElement.textContent = data.pedagogicalSummary;
          }
        }
      }

      const downloadBtn = document.getElementById('downloadBtn');
      downloadBtn.style.display = 'inline-block';

      // Store the captured info in data attributes AFTER successful generation
      downloadBtn.dataset.subject = currentSubject;
      downloadBtn.dataset.classname = currentClassName;
      downloadBtn.dataset.curriculum = currentCurriculum;
      downloadBtn.dataset.totalmarks = currentTotalMarks;
      downloadBtn.dataset.timedurationtext = currentTimeDurationText; // Store text like "1 Hour"

    } else {
      generatedPaperText = ''; // Clear stored text on error
      let errorData = { message: `Server responded with ${response.status}` };
      try {
        errorData = await response.json();
      } catch(e) { /* ignore json parsing error */ }
      document.getElementById('output').textContent = `Error: ${errorData.message || 'Failed to generate paper.'}`;
    }
  } catch (error) {
    console.error("Generation error:", error);
    generatedPaperText = ''; // Clear stored text on error
    document.getElementById('output').textContent = `Error generating paper: ${error.message}. Please check connection or server.`;
  } finally {
    generateBtn.disabled = false; // Re-enable button
  }
}

// Download generated paper as Word file (no changes needed to this function)
async function downloadQuestionPaper() {
    console.log("Starting download process...");
    const downloadBtn = document.getElementById('downloadBtn');

    // Read data from the button's data attributes and stored text
    const subject = downloadBtn.dataset.subject;
    const className = downloadBtn.dataset.classname;
    const curriculum = downloadBtn.dataset.curriculum;
    const timeDurationText = downloadBtn.dataset.timedurationtext;
    const text = generatedPaperText;

    // 🆕 FIX: Calculate actual total marks
    const actualTotalMarks = document.getElementById('overallTotalMarks').textContent || '0';

    // Basic validation
    if (!subject || !text || !className || !curriculum || !timeDurationText) {
         alert("Required data for download is missing or incomplete. Please generate the paper again.");
         return;
    }

    if (!text || text.trim() === '' || text.includes('Generating, please wait...') || text.includes('Error:')) {
         alert("No valid content to download. Please generate a question paper first.");
         return;
    }

    console.log("Processing output text for download...");

    // 🆕 IMPROVED: Clean text preprocessing
    let cleanedText = text
        .replace(/\*\*/g, '') // Remove markdown bold
        .replace(/^(question paper|curriculum board|class|subject|total time).*$/gmi, '') // Remove header info
        .replace(/^general instructions \/ questions.*$/gmi, '') // Remove mixed header
        .replace(/^\d+\.\s*(tamil nadu state board|cbse|karnataka state board).*$/gmi, (match) => {
            // Clean curriculum headers - remove numbering
            return match.replace(/^\d+\.\s*/, '');
        });

    // 🆕 IMPROVED: Better answer key detection and separation
    const answerKeyMarkers = [
        /^(\*\*|__)?answer key(\*\*|__)?$/i,
        /^---+.*answer key.*---+$/i,
        /^answer key:?$/i,
        /^\*\*answer key\*\*$/i,
        /^-{3,}$/  // Separator lines
    ];

    // Split text at answer key
    let questionPart = '';
    let answerPart = '';
    let answerKeyFound = false;
    
    const lines = cleanedText.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check if this line is an answer key header or separator
        const isAnswerKeyHeader = answerKeyMarkers.some(regex => regex.test(line));
        
        if (isAnswerKeyHeader && !answerKeyFound) {
            answerKeyFound = true;
            // Skip any separator lines that might follow
            let j = i + 1;
            while (j < lines.length && /^[-=_\s]*$/.test(lines[j].trim())) {
                j++;
            }
            i = j - 1;
            continue;
        }
        
        if (answerKeyFound) {
            // Only add non-empty, non-separator lines to answer part
            if (line && !line.match(/^[-=_\s]*$/) && !answerKeyMarkers.some(regex => regex.test(line))) {
                answerPart += lines[i] + '\n';
            }
        } else {
            // Add to question part, but skip answer key markers and separators
            if (!isAnswerKeyHeader && line && !line.match(/^[-=_\s]*$/)) {
                questionPart += lines[i] + '\n';
            }
        }
    }

    // 🆕 IMPROVED: Parse questions with better structure detection
    const sections = [];
    let currentSection = null;
    const questionLines = questionPart.split('\n');

    for (let i = 0; i < questionLines.length; i++) {
        let line = questionLines[i].trim();
        
        // Skip empty lines
        if (!line) continue;

        // 🆕 IMPROVED: Better section header detection
        const sectionHeaderRegex = /^(section|part|பிரிவு)\s*([a-zA-Z0-9அ-ஹ]+)?[\s:\-]*(.*)/i;
        
        // Detect curriculum info lines (should be treated as general info, not questions)
        const curriculumInfoRegex = /^(tamil nadu state board|cbse|karnataka state board|time allowed|maximum marks|time:)/i;
        
        if (sectionHeaderRegex.test(line) && line.length < 100) {
            // This is a section header
            currentSection = { title: line, questions: [] };
            sections.push(currentSection);
        } else if (curriculumInfoRegex.test(line)) {
            // This is curriculum/exam info - add to a general info section
            if (!currentSection || currentSection.title !== 'Exam Information') {
                currentSection = { title: 'Exam Information', questions: [] };
                sections.push(currentSection);
            }
            currentSection.questions.push(line);
        } else if (currentSection) {
            // 🆕 IMPROVED: Better question detection
            const numberedQuestionRegex = /^\s*(\d+)[\.\)]\s*(.*)/;
            
            if (numberedQuestionRegex.test(line)) {
                // This is a new numbered question
                const match = line.match(numberedQuestionRegex);
                const questionText = match[2].trim();
                
                // Skip if this looks like curriculum info that got numbered
                if (!curriculumInfoRegex.test(questionText)) {
                    currentSection.questions.push(questionText);
                }
            } else if (currentSection.questions.length > 0) {
                // This is a continuation of the previous question (like MCQ options)
                const lastIndex = currentSection.questions.length - 1;
                currentSection.questions[lastIndex] += '\n' + line;
            } else if (line.length > 0 && !curriculumInfoRegex.test(line)) {
                // First content in section (not curriculum info)
                currentSection.questions.push(line);
            }
        } else {
            // No current section, but we have content - create a default section
            if (!curriculumInfoRegex.test(line)) {
                currentSection = { title: 'Questions', questions: [line] };
                sections.push(currentSection);
            }
        }
    }

    // 🆕 IMPROVED: Parse answer key more carefully
    const answerKey = [];
    if (answerPart.trim()) {
        const answerLines = answerPart.split('\n');
        
        for (const line of answerLines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            // Skip section headers in answer key
            if (/^(section|part|பிரிவு)/i.test(trimmed)) continue;
            
            // Clean answer text - remove question numbers and common prefixes
            let cleanAnswer = trimmed
                .replace(/^\d+[\.\)]\s*/, '') // Remove leading numbers
                .replace(/^answer\s*:?\s*/i, '') // Remove "Answer:" prefix
                .replace(/^ans\s*:?\s*/i, '') // Remove "Ans:" prefix
                .trim();
            
            if (cleanAnswer) {
                answerKey.push(cleanAnswer);
            }
        }
    }

    // Construct metadata with fixed total marks
    const metadata = {
        curriculum: curriculum,
        className: className,
        totalMarks: actualTotalMarks, // 🆕 FIX: Use actual calculated marks
        timeDuration: timeDurationText
    };

    // Prepare the payload
    const payload = {
        subject: subject,
        metadata: metadata,
        sections: sections,
        answerKey: answerKey
    };

    console.log("Sending payload to server:", JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(
            `${window.APP_CONFIG.BACKEND_URL}/download-docx`,
            {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'useremail': localStorage.getItem('userEmail') || 'anonymous'
                },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            let errorData = { message: `Server responded with status ${response.status}` };
            try {
                errorData = await response.json();
            } catch (e) {
                console.warn("Could not parse error response as JSON");
            }
            throw new Error(`Download failed: ${errorData.message || response.statusText}`);
        }

        const blob = await response.blob();
        
        if (blob.size === 0) {
            throw new Error("Received empty file from server.");
        }

        // Download the file
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const safeSubject = subject.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        a.download = `Question_Paper_${safeSubject || 'Untitled'}.docx`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        a.remove();

        console.log("Download completed successfully");

    } catch (error) {
        console.error("Download error:", error);
        alert(`Failed to download Word file: ${error.message}`);
    }
}


// Logout function (No changes needed)
function logout() {
  localStorage.removeItem('userEmail');
  // Optional: Clear other stored data if needed
  generatedPaperText = '';
  const downloadBtn = document.getElementById('downloadBtn');
  if(downloadBtn) {
      // Clear data attributes on logout
      delete downloadBtn.dataset.subject;
      delete downloadBtn.dataset.classname;
      delete downloadBtn.dataset.curriculum;
      delete downloadBtn.dataset.totalmarks;
      delete downloadBtn.dataset.timedurationtext;
      downloadBtn.style.display = 'none';
  }
  window.location.href = '/login.html'; // Redirect to login page
}
