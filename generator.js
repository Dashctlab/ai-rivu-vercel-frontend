// Complete Enhanced generator.js with all bug fixes
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
 const curriculum = curriculumDropdown?.value || '';
 const selectedClass = classDropdown?.value || '';
 const selectedSubject = subjectDropdown?.value || '';
 const assessment = document.getElementById('assessment')?.value || '';
 const specificTopic = document.getElementById('specificTopic')?.value || '';
 
 // Update checklist items
 updateChecklistItem('check-curriculum', curriculum, 'Curriculum Board');
 updateChecklistItem('check-class', selectedClass, 'Class Selected');
 updateChecklistItem('check-subject', selectedSubject, 'Subject Selected');
 
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
 
 // Show validation errors
 showValidationMessage(errors);
 
 // Enable/disable generate button
 const generateBtn = document.getElementById('generateBtn');
 if (generateBtn) {
   generateBtn.disabled = errors.length > 0 || isGenerating;
 }
 
 return errors.length === 0;
}

// Helper function for checklist updates
function updateChecklistItem(itemId, isValid, label) {
 const item = document.getElementById(itemId);
 if (item) {
   const icon = item.querySelector('.check-icon');
   if (icon) {
     if (isValid) {
       icon.textContent = '✅';
       item.style.color = '#27ae60';
     } else {
       icon.textContent = '⚪';
       item.style.color = '#7f8c8d';
     }
   }
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

// BUG FIX #4: Enhanced async dropdown handling with proper error management
async function updateSubjectDropdown(curriculum, selectedClass) {
 if (!subjectDropdown) return;
 
 subjectDropdown.innerHTML = '<option value="">Loading subjects...</option>';
 subjectDropdown.disabled = true;
 
 if (!curriculum || !selectedClass) {
   subjectDropdown.innerHTML = '<option value="">Select Subject</option>';
   return;
 }
 
 try {
   const response = await fetch(`${window.APP_CONFIG.BACKEND_URL}/api/curriculum?board=${encodeURIComponent(curriculum)}&class=${encodeURIComponent(selectedClass)}`);
   
   if (!response.ok) {
     throw new Error('Failed to load subjects');
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
   } else {
     subjectDropdown.innerHTML = '<option value="">No subjects available</option>';
   }
 } catch (error) {
   console.error('Error loading subjects:', error);
   subjectDropdown.innerHTML = '<option value="">Error loading subjects</option>';
   showToast('Unable to load subjects. Please check your connection and try again.', 5000, true);
 }
}

async function updateClassDropdown(curriculum) {
 if (!classDropdown || !subjectDropdown) return;
 
 classDropdown.innerHTML = '<option value="">Loading classes...</option>';
 classDropdown.disabled = true;
 subjectDropdown.innerHTML = '<option value="">Select Subject</option>';
 subjectDropdown.disabled = true;

 if (!curriculum) {
   classDropdown.innerHTML = '<option value="">Select Class</option>';
   return;
 }

 try {
   const response = await fetch(`${window.APP_CONFIG.BACKEND_URL}/api/curriculum?board=${encodeURIComponent(curriculum)}`);
   
   if (!response.ok) {
     throw new Error('Failed to load classes');
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
   } else {
     classDropdown.innerHTML = '<option value="">No classes available</option>';
   }
 } catch (error) {
   console.error('Error loading classes:', error);
   classDropdown.innerHTML = '<option value="">Error loading classes</option>';
   showToast('Unable to load classes. Please check your connection and try again.', 5000, true);
 }
}

// ===== QUESTION ROW MANAGEMENT =====
function addQuestionRow() {
 if (questionRowCount >= MAX_QUESTION_ROWS) {
   showToast('Maximum 10 question types allowed.', 3000, true);
   return;
 }
 
 questionRowCount++;
 const rowId = `qrow-${Date.now()}`;
 const tbody = document.getElementById('questionRowsBody');
 
 if (!tbody) return;
 
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
     <input type="number" class="numQuestions" min="0" max="15" value="${defaultQuestions}" required>
   </td>
   <td>
     <input type="number" class="marksPerQuestion" min="0" value="${defaultMarks}" required>
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
     input.addEventListener('input', () => {
       if (numQuestionsInput && parseInt(numQuestionsInput.value) > 15) {
         numQuestionsInput.value = 15;
         showToast('Maximum 15 questions per section allowed.', 3000, true);
       }
       calculateTotals();
       debouncedValidateForm(); // Use debounced version
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
 const qualityOptions = document.querySelectorAll('.quality-option');
 qualityOptions.forEach(option => {
   option.addEventListener('click', function() {
     const radio = this.querySelector('input[type="radio"]');
     if (radio) {
       radio.checked = true;
     }
     
     // Visual feedback
     const siblings = this.parentNode.querySelectorAll('.quality-option');
     siblings.forEach(sibling => sibling.classList.remove('selected'));
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
   const num = parseInt(row.querySelector('.numQuestions')?.value) || 0;
   const marks = parseInt(row.querySelector('.marksPerQuestion')?.value) || 0;
   const total = num * marks;
   
   const totalMarksCell = row.querySelector('.totalMarks');
   if (totalMarksCell) {
     totalMarksCell.textContent = total;
   }
   
   overallTotal += total;
   totalQuestions += num;
 });
 
 const overallTotalElement = document.getElementById('overallTotalMarks');
 const totalQuestionsElement = document.getElementById('totalQuestions');
 
 if (overallTotalElement) overallTotalElement.textContent = overallTotal;
 if (totalQuestionsElement) totalQuestionsElement.textContent = totalQuestions;
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

// ===== DOWNLOAD FUNCTION =====
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

  } catch (error) {
    console.error("Download error:", error);
    showToast(`Download failed: ${error.message}`, 5000, true);
  } finally {
    // Re-enable button and hide status
    downloadBtn.disabled = false;
    downloadBtn.style.opacity = '1';
    if (downloadStatus) {
      downloadStatus.style.display = 'none';
    }
  }
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
  
  // BUG FIX #1: Wait for components to be ready, then initialize form
  setTimeout(() => {
    initializeFormElements();
  }, 100);
});

// BUG FIX #1: Proper form initialization with safety checks
function initializeFormElements() {
  console.log('Initializing form elements...');
  
  // 1. Initialize dropdown references with safety checks
  curriculumDropdown = document.getElementById('curriculum');
  classDropdown = document.getElementById('className');
  subjectDropdown = document.getElementById('subject');
  
  // 2. Safety checks before proceeding
  if (!curriculumDropdown || !classDropdown || !subjectDropdown) {
    console.error('Critical form elements not found');
    showToast('Form initialization error. Please refresh the page.', 5000, true);
    return;
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
}

// BUG FIX #1: Consolidated event listener setup
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
      if (this.value === 'Specific Topic') {
        specificTopicGroup.classList.add('show');
        const specificTopicInput = document.getElementById('specificTopic');
        if (specificTopicInput) {
          specificTopicInput.required = true;
        }
      } else {
        specificTopicGroup.classList.remove('show');
        const specificTopicInput = document.getElementById('specificTopic');
        if (specificTopicInput) {
          specificTopicInput.required = false;
          specificTopicInput.value = '';
        }
      }
      debouncedValidateForm();
    });
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
      input.addEventListener('input', () => {
        updateDifficultySum();
        debouncedValidateForm();
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

  const easy = parseInt(easyInput.value) || 0;
  const medium = parseInt(mediumInput.value) || 0;
  const hard = parseInt(hardInput.value) || 0;
  const total = easy + medium + hard;
  difficultySumSpan.textContent = total;
  
  if (total !== 100) {
    difficultyTotalMessage.style.color = '#e74c3c';
    difficultySumSpan.style.fontWeight = 'bold';
  } else {
    difficultyTotalMessage.style.color = '#27ae60';
    difficultySumSpan.style.fontWeight = 'normal';
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
