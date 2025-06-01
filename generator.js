// Enhanced generator.js with Phase 1 improvements
const backendURL = `${window.APP_CONFIG.BACKEND_URL}/generate`;
let classDropdown, subjectDropdown, curriculumDropdown;

// Global variable to store the raw generated text
let generatedPaperText = '';

// Loading states
let isGenerating = false;
let progressTimeout1, progressTimeout2, progressTimeout3;

// ===== CURRICULUM-SPECIFIC CLASS → SUBJECT MAPPING =====
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
    // Note: Class 11 & 12 hidden for Karnataka State Board
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

// List of question types
const questionTypes = [
  'MCQ', 'Short Answer', 'Long Answer', 'True/False', 'Fill in the Blanks',
  'Match the Following', 'Case Based', 'Diagram Based', 'Descriptive', 'Give Reasons'
];

// Track rows added
let questionRowCount = 0;
const MAX_QUESTION_ROWS = 12;

// ===== TEACHER-FRIENDLY ERROR MESSAGES =====
const teacherFriendlyErrors = {
  'network': 'Unable to connect to our service. Please check your internet connection and try again.',
  'timeout': 'The request is taking longer than expected. Please try again in a few moments.',
  'validation': 'Please check your inputs and fill all required fields.',
  'generation': 'We encountered an issue while creating your question paper. Please try again.',
  'auth': 'Please refresh the page and log in again.',
  'server': 'Our service is temporarily unavailable. Please try again in a few minutes.',
  'default': 'Something went wrong. Please try again or contact support if the problem continues.'
};

// ===== VALIDATION FUNCTIONS =====
function showValidationMessage(errors) {
  const validationMessage = document.getElementById('validationMessage');
  const validationList = document.getElementById('validationList');
  
  if (errors.length > 0) {
    validationList.innerHTML = errors.map(error => `<li>${error}</li>`).join('');
    validationMessage.classList.add('show');
    validationMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    validationMessage.classList.remove('show');
  }
}

function validateForm() {
  const errors = [];
  
  // Check required fields
  const curriculum = curriculumDropdown.value;
  const selectedClass = classDropdown.value;
  const selectedSubject = subjectDropdown.value;
  const assessment = document.getElementById('assessment').value;
  const specificTopic = document.getElementById('specificTopic').value;
  
  if (!curriculum) {
    errors.push('Please select a Curriculum Board');
  }
  
  if (!selectedClass) {
    errors.push('Please select a Class/Grade');
  }
  
  if (!selectedSubject) {
    errors.push('Please select a Subject');
  }
  
  if (!assessment) {
    errors.push('Please select Assessment type (Full or Specific Topic)');
  }
  
  if (assessment === 'Specific Topic' && !specificTopic.trim()) {
    errors.push('Please enter the specific topic you want to focus on');
  }
  
  // Check difficulty percentages
  const easy = parseInt(document.getElementById('easy').value) || 0;
  const medium = parseInt(document.getElementById('medium').value) || 0;
  const hard = parseInt(document.getElementById('hard').value) || 0;
  
  if (easy + medium + hard !== 100) {
    errors.push('Difficulty percentages must add up to 100%');
  }
  
  // Check for at least one valid question row
  let hasValidRow = false;
  document.querySelectorAll('#questionRowsBody tr').forEach(row => {
    const type = row.querySelector('.question-type').value;
    const num = parseInt(row.querySelector('.numQuestions').value) || 0;
    if (type && num > 0) {
      hasValidRow = true;
    }
  });
  
  if (!hasValidRow) {
    errors.push('Please add at least one question type with number of questions greater than 0');
  }
  
  // Show validation errors or hide them
  showValidationMessage(errors);
  
  // Enable/disable generate button
  const generateBtn = document.getElementById('generateBtn');
  generateBtn.disabled = errors.length > 0 || isGenerating;
  
  return errors.length === 0;
}

// ===== LOADING STATES =====
function showLoadingProgress() {
  const loadingProgress = document.getElementById('loadingProgress');
  const progressMessage = document.getElementById('progressMessage');
  const generateBtn = document.getElementById('generateBtn');
  const outputSection = document.getElementById('outputSection');
  
  isGenerating = true;
  loadingProgress.classList.add('show');
  outputSection.style.display = 'none';
  generateBtn.classList.add('loading');
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';
  
  // Progressive messages
  progressTimeout1 = setTimeout(() => {
    progressMessage.textContent = 'AI is still thinking and working on your paper...';
  }, 10000);
  
  progressTimeout2 = setTimeout(() => {
    progressMessage.textContent = 'AI is working hard to create the perfect paper for you...';
  }, 20000);
  
  progressTimeout3 = setTimeout(() => {
    progressMessage.textContent = 'Almost there! AI is finalizing your question paper...';
  }, 30000);
}

function hideLoadingProgress() {
  const loadingProgress = document.getElementById('loadingProgress');
  const generateBtn = document.getElementById('generateBtn');
  
  isGenerating = false;
  loadingProgress.classList.remove('show');
  generateBtn.classList.remove('loading');
  generateBtn.disabled = false;
  generateBtn.textContent = 'Generate My Question Paper';
  
  // Clear timeouts
  clearTimeout(progressTimeout1);
  clearTimeout(progressTimeout2);
  clearTimeout(progressTimeout3);
}

function showTeacherFriendlyError(errorType, technicalError = '') {
  hideLoadingProgress();
  
  const message = teacherFriendlyErrors[errorType] || teacherFriendlyErrors.default;
  showToast(message, 5000, true);
  
  // Log technical error for admin
  console.error('Technical Error:', technicalError);
  
  // You can also send this to your logging service
  // logTechnicalError(errorType, technicalError);
}

// ===== HELPER FUNCTIONS =====
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

function updateClassDropdown(curriculum) {
  classDropdown.innerHTML = '<option value="">Select Class</option>';
  classDropdown.disabled = true;
  subjectDropdown.innerHTML = '<option value="">Select Subject</option>';
  subjectDropdown.disabled = true;

  if (curriculum) {
    const availableClasses = Object.keys(curriculumSubjectMap[curriculum] || {});
    
    // Filter out Class 11 & 12 for Karnataka State Board
    const filteredClasses = curriculum === 'Karnataka State Board' 
      ? availableClasses.filter(cls => !['Class 11', 'Class 12'].includes(cls))
      : availableClasses;
      
    filteredClasses.forEach(className => {
      const option = document.createElement('option');
      option.value = className;
      option.textContent = className;
      classDropdown.appendChild(option);
    });
    classDropdown.disabled = false;
  }
}

// ===== QUESTION ROW MANAGEMENT =====
function addQuestionRow() {
  if (questionRowCount >= MAX_QUESTION_ROWS) return;
  
  questionRowCount++;
  const rowId = `qrow-${Date.now()}`;
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
      ${questionRowCount === 1 ? '' : `
        <button type="button" class="delete-row-btn" data-row-id="${rowId}" aria-label="Delete row">
          <span>&times;</span>
        </button>
      `}
    </td>
  `;
  
  tbody.appendChild(row);
  
  // Add event listeners
  const numQuestionsInput = row.querySelector('.numQuestions');
  const marksPerQuestionInput = row.querySelector('.marksPerQuestion');
  
  numQuestionsInput.addEventListener('input', () => {
    if (parseInt(numQuestionsInput.value) > 25) {
      numQuestionsInput.value = 25;
    }
    calculateTotals();
    validateForm();
  });
  
  marksPerQuestionInput.addEventListener('input', () => {
    calculateTotals();
    validateForm();
  });
  
  // Delete button (only if not first row)
  const deleteBtn = row.querySelector('.delete-row-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (questionRowCount > 1) {
        row.remove();
        questionRowCount--;
        calculateTotals();
        validateForm();
      }
    });
  }
  
  calculateTotals();
  validateForm();
}

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

// ===== MAIN GENERATION FUNCTION =====
async function generateQuestionPaper(e) {
  e.preventDefault();

  if (!validateForm() || isGenerating) {
    return;
  }

  showLoadingProgress();

  const questionDetails = [];
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
    showTeacherFriendlyError('validation');
    return;
  }

  // Map frontend fields to backend expectations
  const assessment = document.getElementById('assessment').value;
  const specificTopic = document.getElementById('specificTopic').value;
  
  // Backend compatibility mapping
  const payload = {
    curriculum: curriculumDropdown.value,
    className: classDropdown.value,
    subject: subjectDropdown.value,
    topic: assessment === 'Specific Topic' ? specificTopic : '', // Map to existing backend field
    testObjective: document.getElementById('testObjective').value,
    focusLevel: assessment === 'Full' ? 'comprehensive' : 'targeted', // Map to existing backend field
    questionDetails: questionDetails,
    difficultySplit: `${document.getElementById('easy').value}%-${document.getElementById('medium').value}%-${document.getElementById('hard').value}%`,
    timeDuration: document.getElementById('timeDuration').value,
    additionalConditions: document.getElementById('additionalConditions').value,
    answerKeyFormat: document.querySelector('input[name="answerKeyFormat"]:checked').value
  };

  try {
    const response = await fetch(backendURL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'useremail': localStorage.getItem('userEmail') || 'anonymous'
      },
      body: JSON.stringify(payload)
    });
      
    if (response.ok) {
      const data = await response.json();
      if (!data.questions || typeof data.questions !== 'string') {
        throw new Error("Invalid response format");
      }
      
      hideLoadingProgress();
      
      document.getElementById('output').textContent = data.questions;
      generatedPaperText = data.questions;

      // Show pedagogical summary if available
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
      downloadBtn.dataset.subject = payload.subject;
      downloadBtn.dataset.classname = payload.className;
      downloadBtn.dataset.curriculum = payload.curriculum;
      downloadBtn.dataset.totalmarks = document.getElementById('overallTotalMarks').textContent;
      downloadBtn.dataset.timedurationtext = document.getElementById('timeDuration').options[document.getElementById('timeDuration').selectedIndex].text;

      document.getElementById('outputSection').style.display = 'block';
      document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
      
      showToast('Your question paper has been generated successfully!', 3000);

    } else {
      let errorData = { message: `Server responded with ${response.status}` };
      try {
        errorData = await response.json();
      } catch(e) { /* ignore */ }
      
      console.error('Generation API Error:', errorData);
      
      if (response.status === 401) {
        showTeacherFriendlyError('auth', errorData.message);
      } else if (response.status === 429) {
        showTeacherFriendlyError('timeout', 'Rate limit exceeded');
      } else if (response.status >= 500) {
        showTeacherFriendlyError('server', errorData.message);
      } else {
        showTeacherFriendlyError('generation', errorData.message);
      }
    }
  } catch (error) {
    console.error("Generation error:", error);
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      showTeacherFriendlyError('timeout', error.message);
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      showTeacherFriendlyError('network', error.message);
    } else {
      showTeacherFriendlyError('generation', error.message);
    }
  }
}

// ===== DOWNLOAD FUNCTION (Unchanged) =====
async function downloadQuestionPaper() {
    console.log("Starting download process...");
    const downloadBtn = document.getElementById('downloadBtn');

    const subject = downloadBtn.dataset.subject;
    const className = downloadBtn.dataset.classname;
    const curriculum = downloadBtn.dataset.curriculum;
    const timeDurationText = downloadBtn.dataset.timedurationtext;
    const text = generatedPaperText;
    const actualTotalMarks = document.getElementById('overallTotalMarks').textContent || '0';

    if (!subject || !text || !className || !curriculum || !timeDurationText) {
         showToast("Required data for download is missing. Please generate the paper again.", 5000, true);
         return;
    }

    if (!text || text.trim() === '' || text.includes('Generating, please wait...') || text.includes('Error:')) {
         showToast("No valid content to download. Please generate a question paper first.", 5000, true);
         return;
    }

    console.log("Processing output text for download...");

    let cleanedText = text
        .replace(/\*\*/g, '')
        .replace(/^(question paper|curriculum board|class|subject|total time).*$/gmi, '')
        .replace(/^general instructions \/ questions.*$/gmi, '')
        .replace(/^\d+\.\s*(tamil nadu state board|cbse|karnataka state board).*$/gmi, (match) => {
            return match.replace(/^\d+\.\s*/, '');
        });

    const answerKeyMarkers = [
        /^(\*\*|__)?answer key(\*\*|__)?$/i,
        /^---+.*answer key.*---+$/i,
        /^answer key:?$/i,
        /^\*\*answer key\*\*$/i,
        /^-{3,}$/
    ];

    let questionPart = '';
    let answerPart = '';
    let answerKeyFound = false;
    
    const lines = cleanedText.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const isAnswerKeyHeader = answerKeyMarkers.some(regex => regex.test(line));
        
        if (isAnswerKeyHeader && !answerKeyFound) {
            answerKeyFound = true;
            let j = i + 1;
            while (j < lines.length && /^[-=_\s]*$/.test(lines[j].trim())) {
                j++;
            }
            i = j - 1;
            continue;
        }
        
        if (answerKeyFound) {
            if (line && !line.match(/^[-=_\s]*$/) && !answerKeyMarkers.some(regex => regex.test(line))) {
                answerPart += lines[i] + '\n';
            }
        } else {
            if (!isAnswerKeyHeader && line && !line.match(/^[-=_\s]*$/)) {
                questionPart += lines[i] + '\n';
            }
        }
    }

    const sections = [];
    let currentSection = null;
    const questionLines = questionPart.split('\n');

    for (let i = 0; i < questionLines.length; i++) {
        let line = questionLines[i].trim();
        
        if (!line) continue;

        const sectionHeaderRegex = /^(section|part|பிரிவு)\s*([a-zA-Z0-9அ-ஹ]+)?[\s:\-]*(.*)/i;
        const curriculumInfoRegex = /^(tamil nadu state board|cbse|karnataka state board|time allowed|maximum marks|time:)/i;
        
        if (sectionHeaderRegex.test(line) && line.length < 100) {
            currentSection = { title: line, questions: [] };
            sections.push(currentSection);
        } else if (curriculumInfoRegex.test(line)) {
            if (!currentSection || currentSection.title !== 'Exam Information') {
                currentSection = { title: 'Exam Information', questions: [] };
                sections.push(currentSection);
            }
            currentSection.questions.push(line);
        } else if (currentSection) {
            const numberedQuestionRegex = /^\s*(\d+)[\.\)]\s*(.*)/;
            
            if (numberedQuestionRegex.test(line)) {
                const match = line.match(numberedQuestionRegex);
                const questionText = match[2].trim();
                
                if (!curriculumInfoRegex.test(questionText)) {
                    currentSection.questions.push(questionText);
                }
            } else if (currentSection.questions.length > 0) {
                const lastIndex = currentSection.questions.length - 1;
                currentSection.questions[lastIndex] += '\n' + line;
            } else if (line.length > 0 && !curriculumInfoRegex.test(line)) {
                currentSection.questions.push(line);
            }
        } else {
            if (!curriculumInfoRegex.test(line)) {
                currentSection = { title: 'Questions', questions: [line] };
                sections.push(currentSection);
            }
        }
    }

    const answerKey = [];
    if (answerPart.trim()) {
        const answerLines = answerPart.split('\n');
        
        for (const line of answerLines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            if (/^(section|part|பிரிவு)/i.test(trimmed)) continue;
            
            let cleanAnswer = trimmed
                .replace(/^\d+[\.\)]\s*/, '')
                .replace(/^answer\s*:?\s*/i, '')
                .replace(/^ans\s*:?\s*/i, '')
                .trim();
            
            if (cleanAnswer) {
                answerKey.push(cleanAnswer);
            }
        }
    }

    const metadata = {
        curriculum: curriculum,
        className: className,
        totalMarks: actualTotalMarks,
        timeDuration: timeDurationText
    };

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

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const safeSubject = subject.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        a.download = `Question_Paper_${safeSubject || 'Untitled'}.docx`;
        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        a.remove();

        showToast("Question paper downloaded successfully!", 3000);
        console.log("Download completed successfully");

    } catch (error) {
        console.error("Download error:", error);
        showTeacherFriendlyError('generation', `Download failed: ${error.message}`);
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  curriculumDropdown = document.getElementById('curriculum');
  classDropdown = document.getElementById('className');
  subjectDropdown = document.getElementById('subject');
  const tableBody = document.getElementById('questionRowsBody');
  const generateBtn = document.getElementById('generateBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const addRowBtn = document.getElementById('addQuestionRowBtn');

  // Initially disable class and subject
  classDropdown.disabled = true;
  subjectDropdown.disabled = true;

  // Add initial row
  addQuestionRow();

  // Event listeners
  addRowBtn.addEventListener('click', () => {
    if (questionRowCount < MAX_QUESTION_ROWS) {
      addQuestionRow();
    } else {
      showToast(`Maximum ${MAX_QUESTION_ROWS} question types are allowed.`, 3000, true);
    }
  });

  // Curriculum change handler
  curriculumDropdown.addEventListener('change', () => {
    updateClassDropdown(curriculumDropdown.value);
    validateForm();
  });

  // Class change handler
  classDropdown.addEventListener('change', () => {
    updateSubjectDropdown(curriculumDropdown.value, classDropdown.value);
    validateForm();
  });

  // Subject change handler
  subjectDropdown.addEventListener('change', validateForm);

  // Form validation on any input change
  document.getElementById('questionForm').addEventListener('input', validateForm);
  document.getElementById('questionForm').addEventListener('change', validateForm);

  // Form submission
  document.getElementById('questionForm').addEventListener('submit', generateQuestionPaper);

  // Download button
  downloadBtn.addEventListener('click', downloadQuestionPaper);
  downloadBtn.style.display = 'none';

  console.log("Enhanced generator.js loaded successfully");
});
