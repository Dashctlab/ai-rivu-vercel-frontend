// Generator.js 
const backendURL = `${window.APP_CONFIG.BACKEND_URL}/generate`;
let classDropdown, subjectDropdown, curriculumDropdown;

// Global variable to store the raw generated text
let generatedPaperText = '';
let currentQueryId = '';
let qualityFeedbackSubmitted = false;

// Loading states
let isGenerating = false;
let progressTimeout1, progressTimeout2, progressTimeout3;

// Validation debouncing
let validationTimeout;

// Device info - moved to global scope
let deviceInfo = {
 screenSize: `${window.screen.width}x${window.screen.height}`,
 viewport: `${window.innerWidth}x${window.innerHeight}`,
 userAgent: navigator.userAgent
};

// List of question types
const questionTypes = [
 'MCQ', 'Short Answer', 'Long Answer', 'True/False', 'Fill in the Blanks',
 'Match the Following', 'Case Based', 'Diagram Based', 'Descriptive', 'Give Reasons'
];

// Track rows added
let questionRowCount = 0;
const MAX_QUESTION_ROWS = 10; // Changed from 12 to 10

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

// ===== BUG FIX #4: DEBOUNCED VALIDATION =====
function debouncedValidateForm() {
 clearTimeout(validationTimeout);
 validationTimeout = setTimeout(() => {
   validateForm();
 }, 300);
}

// ===== VALIDATION FUNCTIONS =====

function validateForm() {
  const errors = [];
  
  // Check required fields
  const curriculum = curriculumDropdown?.value || '';
  const selectedClass = classDropdown?.value || '';
  const selectedSubject = subjectDropdown?.value || '';
  const assessment = document.getElementById('assessment')?.value || '';
  const specificTopic = document.getElementById('specificTopic')?.value || '';
  
  // Update checklist items - this will trigger the disappearing animation
  updateChecklistItem('check-curriculum', curriculum, ' Select Curriculum Board');
  updateChecklistItem('check-class', selectedClass, 'Select Class');
  updateChecklistItem('check-subject', selectedSubject, 'Select Subject');
 const assessmentComplete = assessment && (assessment === 'Full' || (assessment === 'Specific Topic' && specificTopic.trim()));

   // Dynamic checklist text based on selection
   let checklistText = 'Select Assessment Type';
   if (assessment === 'Specific Topic') {
     checklistText = specificTopic.trim() ? 'Assessment & Topic Complete' : 'Enter Specific Topic';
   } else if (assessment === 'Full') {
     checklistText = 'Assessment Complete';
   }
   
   updateChecklistItem('check-assessment', assessmentComplete, checklistText);
   
   if (!curriculum) errors.push('Please select a Curriculum Board');
   if (!selectedClass) errors.push('Please select a Class/Grade');
   if (!selectedSubject) errors.push('Please select a Subject');
   if (!assessment) errors.push('Please select Assessment type (Full or Specific Topic)');
   if (assessment === 'Specific Topic' && !specificTopic.trim()) {
     errors.push('Please enter the specific topic you want to focus on');
   }

  
 
 
 // Check difficulty percentages
 const easy = parseInt(document.getElementById('easy')?.value) || 0;
 const medium = parseInt(document.getElementById('medium')?.value) || 0;
 const hard = parseInt(document.getElementById('hard')?.value) || 0;
 
 if (easy + medium + hard !== 100) {
   errors.push('Difficulty percentages must add up to 100%');
 }
 
 // Enhanced question validation with limits
 let hasValidRow = false;
 let totalQuestions = 0;
 let questionTypeCount = 0;
 let limitErrors = [];
 
 document.querySelectorAll('#questionRowsBody tr').forEach(row => {
   const type = row.querySelector('.question-type')?.value || '';
   const num = parseInt(row.querySelector('.numQuestions')?.value) || 0;
   
   if (type && num > 0) {
     hasValidRow = true;
     questionTypeCount++;
     totalQuestions += num;
     
     // Check individual section limit
     if (num > 15) {
       limitErrors.push(`${type} section has ${num} questions (max 15 allowed per section)`);
     }
   }
 });
 
 // Check total limits
 if (totalQuestions > 75) {
   limitErrors.push(`Total questions: ${totalQuestions} (max 75 allowed)`);
 }
 
 if (questionTypeCount > 10) {
   limitErrors.push(`${questionTypeCount} question types (max 10 allowed)`);
 }
 
 // Update checklist for questions and limits
 updateChecklistItem('check-questions', hasValidRow, 'Question Types Added');
 updateChecklistItem('check-limits', limitErrors.length === 0, 'Within Limits (≤75 questions)');
 
 if (!hasValidRow) {
   errors.push('Please add at least one question type with number of questions greater than 0');
 }
 
 errors.push(...limitErrors);
 
 // Enable/disable generate button
 const generateBtn = document.getElementById('generateBtn');
 if (generateBtn) {
   generateBtn.disabled = errors.length > 0 || isGenerating;
 }
 
 return errors.length === 0;
}

// Enhanced Helper function for checklist updates with complete hiding
function updateChecklistItem(itemId, isValid, label) {
  const item = document.getElementById(itemId);
  if (item) {
    const icon = item.querySelector('.check-icon');
    if (icon) {
      if (isValid) {
        icon.textContent = '✅';
        item.style.color = '#27ae60';
        
        // Add completed class for scaling effect
        item.classList.add('completed');
        
        // After a delay, start disappearing animation
        setTimeout(() => {
          item.classList.add('disappearing');
          
          // Check if all items are complete
          checkAllComplete();
        }, 1000);
        
      } else {
        icon.textContent = '⚪';
        item.style.color = '#7f8c8d';
        
        // Remove disappearing classes to show the item again
        item.classList.remove('completed', 'disappearing');
        
        // Show checklist and requirements text again
        const checklist = document.getElementById('validationChecklist');
        const requirementsText = document.getElementById('requirements-text');
        if (checklist) checklist.classList.remove('all-complete');
        if (requirementsText) requirementsText.classList.remove('hide');
      }
    }
  }
}

// Check if all checklist items are complete and hide the block
function checkAllComplete() {
  const allItems = document.querySelectorAll('.checklist-item-compact');
  const completedItems = document.querySelectorAll('.checklist-item-compact.disappearing');
  
  if (allItems.length === completedItems.length) {
    // All items are complete, hide the entire checklist
    setTimeout(() => {
      const checklist = document.getElementById('validationChecklist');
      const requirementsText = document.getElementById('requirements-text');
      
      if (checklist) checklist.classList.add('all-complete');
      if (requirementsText) requirementsText.classList.add('hide');
    }, 500);
  }
}

// ===== LOADING STATES =====
function showLoadingProgress() {
 const loadingProgress = document.getElementById('loadingProgress');
 const progressMessage = document.getElementById('progressMessage');
 const generateBtn = document.getElementById('generateBtn');
 const outputSection = document.getElementById('outputSection');
 
 isGenerating = true;
 
 if (loadingProgress) loadingProgress.classList.add('show');
 if (outputSection) outputSection.style.display = 'none';
 
 if (generateBtn) {
   generateBtn.classList.add('loading');
   generateBtn.disabled = true;
   generateBtn.textContent = 'Generating...';
 }
 
 // Progressive messages
 progressTimeout1 = setTimeout(() => {
   if (progressMessage) {
     progressMessage.textContent = 'AI is still thinking and working on your paper...';
   }
 }, 10000);
 
 progressTimeout2 = setTimeout(() => {
   if (progressMessage) {
     progressMessage.textContent = 'AI is working hard to create the perfect paper for you...';
   }
 }, 20000);
 
 progressTimeout3 = setTimeout(() => {
   if (progressMessage) {
     progressMessage.textContent = 'Almost there! AI is finalizing your question paper...';
   }
 }, 30000);
}

function hideLoadingProgress() {
 const loadingProgress = document.getElementById('loadingProgress');
 const generateBtn = document.getElementById('generateBtn');
 
 isGenerating = false;
 
 if (loadingProgress) loadingProgress.classList.remove('show');
 
 if (generateBtn) {
   generateBtn.classList.remove('loading');
   generateBtn.disabled = false;
   generateBtn.textContent = 'Generate My Question Paper';
 }
 
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
}

function showToast(message, duration = 3000, isError = false) {
 const toast = document.getElementById('toast');
 if (!toast) return;
 
 toast.textContent = message;
 toast.classList.toggle('error', isError);
 toast.classList.add('show');
 
 setTimeout(() => {
   toast.classList.remove('show');
 }, duration);
}

// ===== HELPER FUNCTIONS =====

// BUG FIX #3: Enhanced async dropdown handling with retry mechanism
async function updateSubjectDropdown(curriculum, selectedClass, retryCount = 0) {
  if (!subjectDropdown) return;
  
  const maxRetries = 3;
  const retryDelay = 1000; // Start with 1 second
  
  subjectDropdown.innerHTML = '<option value="">Loading subjects...</option>';
  subjectDropdown.disabled = true;
  
  if (!curriculum || !selectedClass) {
    subjectDropdown.innerHTML = '<option value="">Select Subject</option>';
    return;
  }
  
  try {
    console.log(`Loading subjects for ${curriculum} - ${selectedClass} (attempt ${retryCount + 1})`);
    
    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(
      `${window.APP_CONFIG.BACKEND_URL}/api/curriculum?board=${encodeURIComponent(curriculum)}&class=${encodeURIComponent(selectedClass)}`,
      {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const subjects = data.subjects || [];
    
    subjectDropdown.innerHTML = '<option value="">Select Subject</option>';
    
    if (subjects.length > 0) {
      subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectDropdown.appendChild(option);
      });
      subjectDropdown.disabled = false;
      console.log(`Successfully loaded ${subjects.length} subjects`);
    } else {
      subjectDropdown.innerHTML = '<option value="">No subjects available for this class</option>';
    }
    
    // Clear any previous error messages
    clearCurriculumErrorMessage();
    
  } catch (error) {
    console.error('Error loading subjects:', error);
    
    // Handle different types of errors
    if (error.name === 'AbortError') {
      console.log('Request timed out');
    }
    
    if (retryCount < maxRetries) {
      // Show retry message to user
      showCurriculumRetryMessage(`Loading subjects... (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = retryDelay * Math.pow(2, retryCount);
      
      setTimeout(() => {
        updateSubjectDropdown(curriculum, selectedClass, retryCount + 1);
      }, delay);
    } else {
      // All retries failed, show user-friendly error
      subjectDropdown.innerHTML = '<option value="">Failed to load subjects. Please try again.</option>';
      showCurriculumErrorMessage(
        'Unable to load subjects. Please check your internet connection and try again.',
        () => updateSubjectDropdown(curriculum, selectedClass, 0)
      );
    }
  }
}

async function updateClassDropdown(curriculum, retryCount = 0) {
  if (!classDropdown || !subjectDropdown) return;
  
  const maxRetries = 3;
  const retryDelay = 1000;
  
  classDropdown.innerHTML = '<option value="">Loading classes...</option>';
  classDropdown.disabled = true;
  subjectDropdown.innerHTML = '<option value="">Select class first</option>';
  subjectDropdown.disabled = true;

  if (!curriculum) {
    classDropdown.innerHTML = '<option value="">Select Class</option>';
    return;
  }

  try {
    console.log(`Loading classes for ${curriculum} (attempt ${retryCount + 1})`);
    
    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(
      `${window.APP_CONFIG.BACKEND_URL}/api/curriculum?board=${encodeURIComponent(curriculum)}`,
      {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const classes = data.classes || [];
    
    classDropdown.innerHTML = '<option value="">Select Class</option>';
    
    if (classes.length > 0) {
      classes.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        classDropdown.appendChild(option);
      });
      classDropdown.disabled = false;
      console.log(`Successfully loaded ${classes.length} classes`);
    } else {
      classDropdown.innerHTML = '<option value="">No classes available for this board</option>';
    }
    
    // Clear any previous error messages
    clearCurriculumErrorMessage();
    
  } catch (error) {
    console.error('Error loading classes:', error);
    
    if (retryCount < maxRetries) {
      // Show retry message to user
      showCurriculumRetryMessage(`Loading classes... (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      const delay = retryDelay * Math.pow(2, retryCount);
      
      setTimeout(() => {
        updateClassDropdown(curriculum, retryCount + 1);
      }, delay);
    } else {
      // All retries failed
      classDropdown.innerHTML = '<option value="">Failed to load classes. Please try again.</option>';
      showCurriculumErrorMessage(
        'Unable to load classes. Please check your internet connection and try again.',
        () => updateClassDropdown(curriculum, 0)
      );
    }
  }
}

// BUG FIX #3: Helper functions for user feedback during curriculum loading
function showCurriculumRetryMessage(message) {
  let retryDiv = document.getElementById('curriculum-retry-message');
  if (!retryDiv) {
    retryDiv = document.createElement('div');
    retryDiv.id = 'curriculum-retry-message';
    retryDiv.style.cssText = `
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      color: #856404;
      padding: 8px 12px;
      border-radius: 4px;
      margin-top: 8px;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    retryDiv.innerHTML = `
      <div class="spinner" style="
        width: 16px;
        height: 16px;
        border: 2px solid #856404;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
      <span class="message"></span>
    `;
    
    // Add CSS for spinner animation if not exists
    if (!document.getElementById('spinner-style')) {
      const style = document.createElement('style');
      style.id = 'spinner-style';
      style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    const curriculumCard = document.querySelector('.form-card');
    if (curriculumCard) {
      curriculumCard.appendChild(retryDiv);
    }
  }
  
  const messageSpan = retryDiv.querySelector('.message');
  if (messageSpan) {
    messageSpan.textContent = message;
  }
  retryDiv.style.display = 'flex';
}

function showCurriculumErrorMessage(message, retryCallback) {
  clearCurriculumErrorMessage();
  
  const errorDiv = document.createElement('div');
  errorDiv.id = 'curriculum-error-message';
  errorDiv.style.cssText = `
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
    padding: 12px;
    border-radius: 4px;
    margin-top: 8px;
    font-size: 0.9rem;
  `;
  
  errorDiv.innerHTML = `
    <div style="margin-bottom: 8px;">${message}</div>
    <button type="button" id="curriculum-retry-btn" style="
      background: #dc3545;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
    ">Try Again</button>
  `;
  
  const curriculumCard = document.querySelector('.form-card');
  if (curriculumCard) {
    curriculumCard.appendChild(errorDiv);
  }
  
  // Add retry button functionality
  const retryBtn = document.getElementById('curriculum-retry-btn');
  if (retryBtn && retryCallback) {
    retryBtn.addEventListener('click', () => {
      clearCurriculumErrorMessage();
      retryCallback();
    });
  }
}

function clearCurriculumErrorMessage() {
  const retryDiv = document.getElementById('curriculum-retry-message');
  const errorDiv = document.getElementById('curriculum-error-message');
  
  if (retryDiv) {
    retryDiv.remove();
  }
  if (errorDiv) {
    errorDiv.remove();
  }
}

// ===== QUESTION ROW MANAGEMENT =====
function addQuestionRow() {

const tbody = document.getElementById('questionRowsBody');
  if (!tbody) {
    console.log('Table not ready, retrying addQuestionRow...');
    setTimeout(() => addQuestionRow(), 500);
    return;
  }
 
 if (questionRowCount >= MAX_QUESTION_ROWS) {
   showToast('Maximum 10 question types allowed.', 3000, true);
   return;
 }
 
 questionRowCount++;
 const rowId = `qrow-${Date.now()}`;
 const row = document.createElement('tr');
 row.id = rowId;
 
 // Set default values
 const defaultType = questionRowCount === 1 ? 'Short Answer' : '';
 const defaultQuestions = '5';
 const defaultMarks = questionRowCount === 1 ? '1' : '0';
 
 row.innerHTML = `
   <td>
     <select class="question-type" required>
       <option value="">Select Type</option>
       ${questionTypes.map(type => `<option value="${type}" ${type === defaultType ? 'selected' : ''}>${type}</option>`).join('')}
     </select>
   </td>
   <td>
     <input type="text" class="topic" placeholder="Optional topic">
   </td>
  <td>
  <input type="number" class="numQuestions" min="0" max="15" value="${defaultQuestions}" 
         required inputmode="numeric" pattern="[0-9]*">
</td>
<td>
  <input type="number" class="marksPerQuestion" min="0" value="${defaultMarks}" 
         required inputmode="numeric" pattern="[0-9]*">
</td>
   <td class="totalMarks" style="text-align: center;">0</td>
   <td>
     ${questionRowCount === 1 ? '' : `
       <button type="button" class="delete-row-btn" data-row-id="${rowId}" aria-label="Delete row">
         <span>&times;</span>
       </button>
     `}
   </td>
 `;
 
 tbody.appendChild(row);
 
 // Add event listeners with validation
const numQuestionsInput = row.querySelector('.numQuestions');
const marksPerQuestionInput = row.querySelector('.marksPerQuestion');
const typeSelect = row.querySelector('.question-type');

[numQuestionsInput, marksPerQuestionInput, typeSelect].forEach(input => {
   if (input) {
     // FIXED: Multiple events for mobile compatibility
     ['input', 'change', 'blur'].forEach(eventType => {
       input.addEventListener(eventType, () => {
         // FIXED: Mobile number input sanitization - IMPROVED
         if (input.type === 'number' && input.value) {
           // Allow decimal points for marks, only digits for questions
           if (input.classList.contains('marksPerQuestion')) {
             // For marks: allow decimals (2.5, 1.5, etc.)
             const sanitized = input.value.replace(/[^0-9.]/g, '');
             // Prevent multiple decimal points
             const parts = sanitized.split('.');
             if (parts.length > 2) {
               input.value = parts[0] + '.' + parts.slice(1).join('');
             } else {
               input.value = sanitized;
             }
           } else {
             // For question numbers: only integers
             const sanitized = input.value.replace(/[^0-9]/g, '');
             input.value = sanitized;
           }
         }
         
         // FIXED: Enforce limits after sanitization
         if (numQuestionsInput && parseInt(numQuestionsInput.value) > 15) {
           numQuestionsInput.value = 15;
           showToast('Maximum 15 questions per section allowed.', 3000, true);
         }
         
         // FIXED: Enforce marks limit
         if (marksPerQuestionInput && parseFloat(marksPerQuestionInput.value) > 50) {
           marksPerQuestionInput.value = 50;
           showToast('Maximum 50 marks per question allowed.', 3000, true);
         }
         
         calculateTotals();
         debouncedValidateForm();
       });
     });
   }
 });
 
 // Delete button
 const deleteBtn = row.querySelector('.delete-row-btn');
 if (deleteBtn) {
   deleteBtn.addEventListener('click', () => {
     if (questionRowCount > 1) {
       row.remove();
       questionRowCount--;
       calculateTotals();
       debouncedValidateForm();
       
       // Re-enable add button if under limit
       const addBtn = document.getElementById('addQuestionRowBtn');
       if (addBtn && questionRowCount < MAX_QUESTION_ROWS) {
         addBtn.disabled = false;
       }
     }
   });
 }
 
 // Disable add button if at limit
 if (questionRowCount >= MAX_QUESTION_ROWS) {
   const addBtn = document.getElementById('addQuestionRowBtn');
   if (addBtn) {
     addBtn.disabled = true;
   }
 }
 
 calculateTotals();
 debouncedValidateForm();
}

// Quality feedback handling
function setupQualityFeedback() {
  const qualityOptions = document.querySelectorAll('.quality-option-mini'); // Changed class name
  qualityOptions.forEach(option => {
    option.addEventListener('click', function() {
      const radio = this.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
      }
      
      // Visual feedback - remove selected from siblings with same name
      const radioName = radio.name;
      const siblings = document.querySelectorAll(`input[name="${radioName}"]`);
      siblings.forEach(sibling => {
        sibling.closest('.quality-option-mini').classList.remove('selected');
      });
      this.classList.add('selected');
      
      // Check if all quality questions are answered
      checkQualityFeedbackComplete();
    });
  });
}

function checkQualityFeedbackComplete() {
 const outputQuality = document.querySelector('input[name="outputQuality"]:checked');
 const questionQuality = document.querySelector('input[name="questionQuality"]:checked');
 const curriculumAlignment = document.querySelector('input[name="curriculumAlignment"]:checked');
 
 if (outputQuality && questionQuality && curriculumAlignment && !qualityFeedbackSubmitted) {
   // Submit quality feedback
   submitQualityFeedback({
     outputQuality: outputQuality.value,
     questionQuality: questionQuality.value,
     curriculumAlignment: curriculumAlignment.value
   });
 }
}

async function submitQualityFeedback(feedback) {
 if (qualityFeedbackSubmitted) return;
 
 qualityFeedbackSubmitted = true;
 
 try {
   await fetch(`${window.APP_CONFIG.BACKEND_URL}/api/quality-feedback`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'useremail': localStorage.getItem('userEmail') || 'anonymous'
     },
     body: JSON.stringify({
       queryId: currentQueryId,
       qualityFeedback: feedback
     })
   });
   
   console.log('Quality feedback submitted:', feedback);
 } catch (error) {
   console.error('Error submitting quality feedback:', error);
   qualityFeedbackSubmitted = false; // Allow retry
 }
}

function calculateTotals() {
 let overallTotal = 0;
 let totalQuestions = 0;
 
 document.querySelectorAll('#questionRowsBody tr').forEach(row => {
   // FIXED: Robust null checking and NaN handling
   const numInput = row.querySelector('.numQuestions');
   const marksInput = row.querySelector('.marksPerQuestion');
   
   // FIXED: Parse and validate inputs
   let num = 0;
   let marks = 0;
   
   if (numInput && numInput.value !== '') {
     num = parseInt(numInput.value);
     if (isNaN(num) || num < 0) {
       num = 0;
       numInput.value = '0';
     }
   }
   
   if (marksInput && marksInput.value !== '') {
     marks = parseFloat(marksInput.value);
     if (isNaN(marks) || marks < 0) {
       marks = 0;
       marksInput.value = '0';
     }
   }
   
   const total = num * marks;
   
   const totalMarksCell = row.querySelector('.totalMarks');
   if (totalMarksCell) {
     // FIXED: Always show clean numbers, never NaN
     totalMarksCell.textContent = total || 0;
   }
   
   overallTotal += total;
   totalQuestions += num;
 });
 
 const overallTotalElement = document.getElementById('overallTotalMarks');
 const totalQuestionsElement = document.getElementById('totalQuestions');
 
 // FIXED: Ensure clean display
 if (overallTotalElement) overallTotalElement.textContent = overallTotal || 0;
 if (totalQuestionsElement) totalQuestionsElement.textContent = totalQuestions || 0;
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
   const type = row.querySelector('.question-type')?.value || '';
   const topic = row.querySelector('.topic')?.value?.trim() || '';
   const num = parseInt(row.querySelector('.numQuestions')?.value) || 0;
   const marks = parseInt(row.querySelector('.marksPerQuestion')?.value) || 0;
   
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
 const assessment = document.getElementById('assessment')?.value || '';
 const specificTopic = document.getElementById('specificTopic')?.value || '';
 
 // Backend compatibility mapping
 const payload = {
   curriculum: curriculumDropdown?.value || '',
   className: classDropdown?.value || '',
   subject: subjectDropdown?.value || '',
   topic: assessment === 'Specific Topic' ? specificTopic : '',
   testObjective: document.getElementById('testObjective')?.value || 'mixed',
   focusLevel: assessment === 'Full' ? 'comprehensive' : 'targeted',
   questionDetails: questionDetails,
   difficultySplit: `${document.getElementById('easy')?.value || 30}%-${document.getElementById('medium')?.value || 50}%-${document.getElementById('hard')?.value || 20}%`,
   timeDuration: document.getElementById('timeDuration')?.value || '60',
   additionalConditions: document.getElementById('additionalConditions')?.value || '',
   answerKeyFormat: document.querySelector('input[name="answerKeyFormat"]:checked')?.value || 'Brief',
   deviceInfo: deviceInfo // Include device info in body instead of headers
 };

 try {
   const response = await fetch(backendURL, {
     method: 'POST',
     headers: { 
       'Content-Type': 'application/json',
       'useremail': localStorage.getItem('userEmail') || 'anonymous'
       // Removed X-Screen-Size header to avoid CORS issues
     },
     body: JSON.stringify(payload)
   });
     
   if (response.ok) {
     const data = await response.json();
     if (!data.questions || typeof data.questions !== 'string') {
       throw new Error("Invalid response format");
     }
     
     hideLoadingProgress();
     
     // Store query ID
     currentQueryId = data.queryId || '';
     qualityFeedbackSubmitted = false;
     
     const outputElement = document.getElementById('output');
     if (outputElement) {
       outputElement.textContent = data.questions;
     }
     
     generatedPaperText = data.questions;

     // Display query ID
     if (data.queryId) {
       const queryIdElement = document.getElementById('queryIdDisplay');
       if (queryIdElement) {
         queryIdElement.textContent = data.queryId;
         queryIdElement.style.display = 'inline';
       }
     }

     // Show pedagogical summary
     if (data.pedagogicalSummary || data.queryId) {
       const summaryElement = document.getElementById('pedagogicalSummary');
       if (summaryElement) {
         summaryElement.style.display = 'block';
         
         if (data.pedagogicalSummary) {
           const descriptionElement = document.getElementById('frameworkDescription');
           if (descriptionElement) {
             descriptionElement.textContent = data.pedagogicalSummary;
           }
         }
       }
     }

     // Show quality indicators
     const qualityIndicators = document.getElementById('qualityIndicators');
     if (qualityIndicators) {
       qualityIndicators.style.display = 'block';
       setupQualityFeedback();
     }

     // Update download button dataset
     const downloadBtn = document.getElementById('downloadBtn');
     if (downloadBtn) {
       downloadBtn.style.display = 'inline-block';
       downloadBtn.dataset.subject = payload.subject;
       downloadBtn.dataset.classname = payload.className;
       downloadBtn.dataset.curriculum = payload.curriculum;
       downloadBtn.dataset.totalmarks = document.getElementById('overallTotalMarks')?.textContent || '0';
       
       const timeDurationSelect = document.getElementById('timeDuration');
       if (timeDurationSelect) {
         const selectedOption = timeDurationSelect.options[timeDurationSelect.selectedIndex];
         downloadBtn.dataset.timedurationtext = selectedOption ? selectedOption.text : '1 Hour';
       }
     }

     const outputSection = document.getElementById('outputSection');
     if (outputSection) {
       outputSection.style.display = 'block';
       outputSection.scrollIntoView({ behavior: 'smooth' });
     }
     
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

// ===== BUG FIX #1: DOWNLOAD FUNCTION WITH MEMORY LEAK FIX =====
async function downloadQuestionPaper() {
  console.log("Starting download process...");
  const downloadBtn = document.getElementById('downloadBtn');
  const downloadStatus = document.getElementById('downloadStatus');
  if (!downloadBtn) return;

  downloadBtn.disabled = true;
  downloadBtn.style.opacity = '0.6';
  if (downloadStatus) {
    downloadStatus.style.display = 'block';
  }

  const subject = downloadBtn.dataset.subject;
  const className = downloadBtn.dataset.classname;
  const curriculum = downloadBtn.dataset.curriculum;
  const timeDurationText = downloadBtn.dataset.timedurationtext;
  const text = generatedPaperText;
  const actualTotalMarks = document.getElementById('overallTotalMarks')?.textContent || '0';

  if (!subject || !text || !className || !curriculum || !timeDurationText) {
    showToast("Required data for download is missing. Please generate the paper again.", 5000, true);
    return;
  }

  if (!text || text.trim() === '' || text.includes('Generating, please wait...') || text.includes('Error:')) {
    showToast("No valid content to download. Please generate a question paper first.", 5000, true);
    return;
  }

  // BUG FIX #1: Declare URL variable outside try block for proper cleanup
  let blobUrl = null;

  try {
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

    // BUG FIX #1: Create blob URL and ensure cleanup
    blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    const safeSubject = subject.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `Question_Paper_${safeSubject || 'Untitled'}.docx`;
    document.body.appendChild(a);
    a.click();

    // BUG FIX #1: Remove the anchor element immediately
    document.body.removeChild(a);

    showToast("Question paper downloaded successfully!", 3000);

  } catch (error) {
    console.error("Download error:", error);
    showToast(`Download failed: ${error.message}`, 5000, true);
  } finally {
    // BUG FIX #1: Always cleanup blob URL, even if errors occur
    if (blobUrl) {
      window.URL.revokeObjectURL(blobUrl);
      blobUrl = null;
      console.log('Download completed, blob URL cleaned up');
    }
    
    // Re-enable button and hide status
    downloadBtn.disabled = false;
    downloadBtn.style.opacity = '1';
    if (downloadStatus) {
      downloadStatus.style.display = 'none';
    }
  }
}

// ===== BUG FIX #2: RACE CONDITION INITIALIZATION FIXES =====

// BUG FIX #2: Replace timeout with proper DOM ready check
async function waitForDOMAndComponentsReady() {
  // Wait for DOM to be fully ready
  await waitForDOMReady();
  
  // Wait for shared components to be rendered
  await waitForComponents();
  
  // Additional safety check for critical elements
  await waitForCriticalElements();
}

function waitForDOMReady() {
  return new Promise(resolve => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve);
    } else {
      resolve();
    }
  });
}

function waitForComponents() {
  return new Promise(resolve => {
    // Check if header component is loaded
    const checkComponents = () => {
      const header = document.querySelector('.app-header');
      if (header) {
        resolve();
      } else {
        setTimeout(checkComponents, 50);
      }
    };
    checkComponents();
  });
}

function waitForCriticalElements() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    const checkElements = () => {
      attempts++;
      
      const curriculum = document.getElementById('curriculum');
      const className = document.getElementById('className');
      const subject = document.getElementById('subject');
      const questionForm = document.getElementById('questionForm');
      
      if (curriculum && className && subject && questionForm) {
        console.log('All critical elements found, proceeding with initialization');
        resolve();
      } else if (attempts >= maxAttempts) {
        reject(new Error('Critical form elements not found after maximum wait time'));
      } else {
        setTimeout(checkElements, 100);
      }
    };
    
    checkElements();
  });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication first
  const userEmail = localStorage.getItem('userEmail');
  if (!userEmail) {
    window.location.href = '/login.html';
    return;
  }

  // Initialize page with shared components
  initializeCommonComponents({
    currentPage: 'generator',
    isAuthenticated: true,
    userEmail: userEmail
  });
  
  // BUG FIX #2: Wait for components to be ready, then initialize form
  waitForDOMAndComponentsReady().then(() => {
    initializeFormElements();
  }).catch(error => {
    console.error('Failed to initialize form:', error);
    showToast('Failed to load form. Please refresh the page.', 5000, true);
  });
});

// BUG FIX #2: Enhanced form initialization with proper safety checks
function initializeFormElements() {
  console.log('Initializing form elements...');
  
  try {
    // 1. Initialize dropdown references with safety checks
    curriculumDropdown = document.getElementById('curriculum');
    classDropdown = document.getElementById('className');
    subjectDropdown = document.getElementById('subject');
    
    // 2. Safety checks before proceeding
    if (!curriculumDropdown || !classDropdown || !subjectDropdown) {
      throw new Error('Critical form elements not found');
    }

    // 3. Set initial states
    classDropdown.disabled = true;
    subjectDropdown.disabled = true;

    // 4. Set up all event listeners BEFORE adding rows and validation
    setupEventListeners();
    
    // 5. Add initial question row AFTER safety checks
    addQuestionRow();

    // 6. Run initial validation LAST with delay
    setTimeout(() => {
      validateForm();
    }, 200);
    
    console.log('Form elements initialized successfully');
    
    // Dispatch custom event to signal initialization complete
    window.dispatchEvent(new CustomEvent('formInitialized'));
    
  } catch (error) {
    console.error('Form initialization failed:', error);
    showToast('Form initialization failed. Please refresh the page.', 5000, true);
  }
}

// BUG FIX #2: Consolidated event listener setup
function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Curriculum change handler with proper async handling
  curriculumDropdown.addEventListener('change', async () => {
    console.log('Curriculum changed to:', curriculumDropdown.value);
    try {
      // Show loading state
      classDropdown.innerHTML = '<option value="">Loading classes...</option>';
      classDropdown.disabled = true;
      subjectDropdown.innerHTML = '<option value="">Select class first</option>';
      subjectDropdown.disabled = true;
      
      await updateClassDropdown(curriculumDropdown.value);
      debouncedValidateForm();
    } catch (error) {
      console.error('Error updating class dropdown:', error);
      classDropdown.innerHTML = '<option value="">Error loading classes</option>';
      showToast('Unable to load classes. Please try again.', 3000, true);
      debouncedValidateForm();
    }
  });

  // Class change handler with proper async handling
  classDropdown.addEventListener('change', async () => {
    console.log('Class changed to:', classDropdown.value);
    try {
      subjectDropdown.innerHTML = '<option value="">Loading subjects...</option>';
      subjectDropdown.disabled = true;
      
      await updateSubjectDropdown(curriculumDropdown.value, classDropdown.value);
      debouncedValidateForm();
    } catch (error) {
      console.error('Error updating subject dropdown:', error);
      subjectDropdown.innerHTML = '<option value="">Error loading subjects</option>';
      showToast('Unable to load subjects. Please try again.', 3000, true);
      debouncedValidateForm();
    }
  });

  // Subject change handler
  subjectDropdown.addEventListener('change', debouncedValidateForm);

  // Assessment conditional logic
const assessmentSelect = document.getElementById('assessment');
const specificTopicGroup = document.getElementById('specificTopicGroup');

if (assessmentSelect && specificTopicGroup) {
  assessmentSelect.addEventListener('change', function() {
    const specificTopicInput = document.getElementById('specificTopic');
    
    if (this.value === 'Specific Topic') {
      specificTopicGroup.classList.add('show');
      if (specificTopicInput) {
        specificTopicInput.required = true;
        // FIXED: Clear any previous validation state
        specificTopicInput.style.borderColor = '';
        // Trigger validation after a short delay
        setTimeout(() => debouncedValidateForm(), 100);
      }
    } else {
      specificTopicGroup.classList.remove('show');
      if (specificTopicInput) {
        specificTopicInput.required = false;
        specificTopicInput.value = '';
        // FIXED: Clear validation state and errors
        specificTopicInput.style.borderColor = '';
        const errorElement = specificTopicInput.parentNode.querySelector('.error-message');
        if (errorElement) errorElement.style.display = 'none';
      }
    }
    debouncedValidateForm();
  });
}


    // ADD: Validation when specific topic is typed
  const specificTopicInput = document.getElementById('specificTopic');
  if (specificTopicInput) {
    specificTopicInput.addEventListener('input', debouncedValidateForm);
    specificTopicInput.addEventListener('blur', debouncedValidateForm);
  }

 
  // Answer key radio button styling
  const radioOptions = document.querySelectorAll('.radio-option');
  radioOptions.forEach(option => {
    option.addEventListener('click', function() {
      radioOptions.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
      
      // Also check the actual radio button
      const radioInput = this.querySelector('input[type="radio"]');
      if (radioInput) {
        radioInput.checked = true;
      }
    });
  });

  // Difficulty sum tracking
  const easyInput = document.getElementById('easy');
  const mediumInput = document.getElementById('medium');
  const hardInput = document.getElementById('hard');

 if (easyInput && mediumInput && hardInput) {
    [easyInput, mediumInput, hardInput].forEach(input => {
      ['input', 'change', 'blur'].forEach(eventType => {
        input.addEventListener(eventType, () => {
          // FIXED: Mobile number sanitization for difficulty inputs
          if (input.value) {
            const sanitized = input.value.replace(/[^0-9]/g, '');
            const num = parseInt(sanitized) || 0;
            if (num > 100) {
              input.value = 100;
            } else {
              input.value = sanitized;
            }
          }
          updateDifficultySum();
          debouncedValidateForm();
        });
      });
    });
  }

 
  // Form submission
  const questionForm = document.getElementById('questionForm');
  if (questionForm) {
    questionForm.addEventListener('submit', generateQuestionPaper);
  }

  // Add question row button
  const addRowBtn = document.getElementById('addQuestionRowBtn');
  if (addRowBtn) {
    addRowBtn.addEventListener('click', () => {
      if (questionRowCount < MAX_QUESTION_ROWS) {
        addQuestionRow();
      } else {
        showToast('Maximum 10 question types allowed.', 3000, true);
      }
    });
  }

  // Download button
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadQuestionPaper);
    downloadBtn.style.display = 'none';
  }
  
  console.log('Event listeners setup complete');
}

// Update difficulty sum with better styling
function updateDifficultySum() {
  const easyInput = document.getElementById('easy');
  const mediumInput = document.getElementById('medium');
  const hardInput = document.getElementById('hard');
  const difficultySumSpan = document.getElementById('difficultySum');
  const difficultyTotalMessage = document.getElementById('difficultyTotalMessage');

  if (!easyInput || !mediumInput || !hardInput || !difficultySumSpan || !difficultyTotalMessage) return;

  // FIXED: Handle empty/invalid inputs gracefully
  const easy = parseFloat(easyInput.value) || 0;
  const medium = parseFloat(mediumInput.value) || 0;
  const hard = parseFloat(hardInput.value) || 0;
  
  // FIXED: Validate individual values
  if (easy < 0 || easy > 100) easyInput.value = Math.max(0, Math.min(100, easy));
  if (medium < 0 || medium > 100) mediumInput.value = Math.max(0, Math.min(100, medium));
  if (hard < 0 || hard > 100) hardInput.value = Math.max(0, Math.min(100, hard));
  
  const total = easy + medium + hard;
  difficultySumSpan.textContent = total;
  
  // FIXED: Better visual feedback
  if (total !== 100) {
    difficultyTotalMessage.style.color = '#e74c3c';
    difficultySumSpan.style.fontWeight = 'bold';
    difficultyTotalMessage.style.background = '#fff5f5';
    difficultyTotalMessage.style.padding = '4px 8px';
    difficultyTotalMessage.style.borderRadius = '4px';
  } else {
    difficultyTotalMessage.style.color = '#27ae60';
    difficultySumSpan.style.fontWeight = 'normal';
    difficultyTotalMessage.style.background = 'transparent';
    difficultyTotalMessage.style.padding = '0';
  }
}

// ===== UTILITY FUNCTIONS =====

// Progress bar update function (if progress bar exists)
function updateProgressBar(step) {
  const steps = document.querySelectorAll('.progress-step');
  steps.forEach((s, index) => {
    s.classList.remove('active', 'completed');
    if (index < step) {
      s.classList.add('completed');
    } else if (index === step - 1) {
      s.classList.add('active');
    }
  });
}

// BUG FIX #5: Enhanced logout function with proper cleanup
function logout() {
  localStorage.removeItem('userEmail');
  
  // Clear generated paper data
  generatedPaperText = '';
  currentQueryId = '';
  qualityFeedbackSubmitted = false;
  
  // Clear download button data
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    // Clear all dataset properties
    delete downloadBtn.dataset.subject;
    delete downloadBtn.dataset.classname;
    delete downloadBtn.dataset.curriculum;
    delete downloadBtn.dataset.totalmarks;
    delete downloadBtn.dataset.timedurationtext;
    downloadBtn.style.display = 'none';
  }
  
  // Hide output section
  const outputSection = document.getElementById('outputSection');
  if (outputSection) {
    outputSection.style.display = 'none';
  }
  
  // Clear form data
  if (curriculumDropdown) curriculumDropdown.value = '';
  if (classDropdown) {
    classDropdown.innerHTML = '<option value="">First select a board</option>';
    classDropdown.disabled = true;
  }
  if (subjectDropdown) {
    subjectDropdown.innerHTML = '<option value="">First select a class</option>';
    subjectDropdown.disabled = true;
  }
  
  window.location.href = '/login.html';
}

// Make functions globally available (for backward compatibility)
window.updateProgressBar = updateProgressBar;
window.logout = logout;
window.debouncedValidateForm = debouncedValidateForm;
window.showToast = showToast;
window.generateQuestionPaper = generateQuestionPaper;
window.updateClassDropdown = updateClassDropdown;
window.validateForm = validateForm;
window.initializeFormElements = initializeFormElements;

// Debug logging
console.log('generator.js loaded successfully');
console.log('APP_CONFIG:', window.APP_CONFIG);
