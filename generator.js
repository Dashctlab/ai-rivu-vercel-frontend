const backendURL = 'https://ai-rivu-vercel-render-backend.onrender.com';
let classDropdown, subjectDropdown, curriculumDropdown;

// ---> ADDED: Global variable to store the raw generated text
let generatedPaperText = '';

// Class → Subject Mapping (No changes needed)
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

// List of question types (No changes needed)
const questionTypes = [
  'MCQ', 'Short Answer', 'Long Answer', 'True/False', 'Fill in the Blanks',
  'Match the Following', 'Case Based', 'Diagram Based', 'Descriptive'
];

// On page load (No changes needed)
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
    // Removed the try-catch here, it's better inside the async function
downloadQuestionPaper();
  });

  console.log("generator.js loaded and dropdown logic active");
});

// Reset form fields (No changes needed)
function resetFormFields() {
  document.getElementById('curriculum').selectedIndex = 0;
  classDropdown.innerHTML = '<option value="">Select Class</option>';
  subjectDropdown.innerHTML = '<option value="">Select Subject</option>';
  document.getElementById('topic').value = '';
  document.getElementById('timeDuration').value = '60'; // Reset to default
  document.getElementById('easy').value = '0';
  document.getElementById('medium').value = '100'; // Reset to default
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
  // Clear stored text on reset as well, just in case
  generatedPaperText = '';
  // Hide download button again on reset
  document.getElementById('downloadBtn').style.display = 'none';
}

// Calculate total marks dynamically (No changes needed)
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

// Enable Generate Button only if mandatory fields filled (No changes needed)
function validateForm() {
  const curriculum = curriculumDropdown.value;
  const selectedClass = classDropdown.value;
  const selectedSubject = subjectDropdown.value;
  const easy = parseInt(document.getElementById('easy').value) || 0;
  const medium = parseInt(document.getElementById('medium').value) || 0;
  const hard = parseInt(document.getElementById('hard').value) || 0;
  const generateBtn = document.getElementById('generateBtn');
  // Ensure dropdowns are not disabled (meaning a valid selection path was followed)
  const formReady = curriculum && selectedClass && selectedSubject && !classDropdown.disabled && !subjectDropdown.disabled;
  generateBtn.disabled = !(formReady && (easy + medium + hard === 100));
}

// Generate Question Paper ---> MODIFIED <---
async function generateQuestionPaper(e) {
  e.preventDefault();

  const generateBtn = document.getElementById('generateBtn');
  generateBtn.disabled = true; // Disable button during generation

  const questionTypesSelected = [];
  const questionDetails = []; // Also capture marks per type if needed for prompt

  document.querySelectorAll('#questionsTable tbody tr').forEach(row => {
    const type = row.querySelector('td').textContent.trim();
    const num = parseInt(row.querySelector('.numQuestions').value) || 0;
    const marks = parseInt(row.querySelector('.marksPerQuestion').value) || 0;
    if (num > 0) {
      questionTypesSelected.push(type);
      questionDetails.push({ type: type, num: num, marks: marks }); // Store details
    }
  });

  if (questionTypesSelected.length === 0) {
    alert("Please select at least one type of question with a non-zero number.");
    generateBtn.disabled = false; // Re-enable button
    return;
  }

  const easy = document.getElementById('easy').value || 0;
  const medium = document.getElementById('medium').value || 0;
  const hard = document.getElementById('hard').value || 0;

  // ---> Capture needed info BEFORE potential reset
  const currentSubject = document.getElementById('subject').value;
  const currentClassName = document.getElementById('className').value;
  const currentCurriculum = document.getElementById('curriculum').value;
  const currentTotalMarks = document.getElementById('overallTotalMarks').textContent;
  const currentTimeDurationValue = document.getElementById('timeDuration').value;
  // Find the selected time duration text (e.g., "1 Hour")
  const timeDurationSelect = document.getElementById('timeDuration');
  const selectedTimeOption = timeDurationSelect.options[timeDurationSelect.selectedIndex];
  const currentTimeDurationText = selectedTimeOption ? selectedTimeOption.text : `${currentTimeDurationValue} Minutes`;


  // Construct payload (Consider sending questionDetails if backend prompt needs num/marks per type)
  const payload = {
    curriculum: currentCurriculum,
    className: currentClassName,
    subject: currentSubject,
    topic: document.getElementById('topic').value,
    // numQuestions: questionTypesSelected.length, // Backend prompt seems to ignore this?
    questionDetails: questionDetails, // Send detailed structure instead
    difficultySplit: `${easy}%-${medium}%-${hard}%`,
    timeDuration: currentTimeDurationValue, // Send value (e.g., 60)
    additionalConditions: document.getElementById('additionalConditions').value,
    questionTypes: questionTypesSelected, // Keep this for compatibility if backend uses it
    answerKeyFormat: document.querySelector('input[name="answerKeyFormat"]:checked').value
  };

  document.getElementById('outputSection').style.display = 'block';
  document.getElementById('output').textContent = 'Generating, please wait...';
  generatedPaperText = ''; // Clear previous text
  document.getElementById('downloadBtn').style.display = 'none'; // Hide download btn initially


  try {
    const response = await fetch(`${backendURL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'useremail': localStorage.getItem('userEmail') || 'anonymous' // Send something even if not logged in? Adjust as needed
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      if (!data.questions || typeof data.questions !== 'string') {
           throw new Error("Received invalid question data from server.");
      }
      document.getElementById('output').textContent = data.questions;
      generatedPaperText = data.questions; // Store the generated text

      const downloadBtn = document.getElementById('downloadBtn');
      downloadBtn.style.display = 'inline-block';

      // ---> Store the captured info in data attributes AFTER successful generation
      downloadBtn.dataset.subject = currentSubject;
      downloadBtn.dataset.classname = currentClassName;
      downloadBtn.dataset.curriculum = currentCurriculum;
      downloadBtn.dataset.totalmarks = currentTotalMarks;
      downloadBtn.dataset.timedurationtext = currentTimeDurationText; // Store text like "1 Hour"

      // Don't reset form immediately, let user download first maybe?
      // Or reset only non-essential parts? For now, keeping the reset:
      // resetFormFields(); // Consider if this is the best UX

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


// Download generated paper as Word file ---> MODIFIED <---
async function downloadQuestionPaper() {
    console.log("Starting download process...");
    const downloadBtn = document.getElementById('downloadBtn');

    // ---> Read data from the button's data attributes and stored text
    const subject = downloadBtn.dataset.subject;
    const className = downloadBtn.dataset.classname;
    const curriculum = downloadBtn.dataset.curriculum;
    const totalMarks = downloadBtn.dataset.totalmarks;
    const timeDurationText = downloadBtn.dataset.timedurationtext; // Use the stored text like "1 Hour"
    const text = generatedPaperText; // Use the stored text

    // Basic check if data is available
    if (!subject || !text || !className || !curriculum || !totalMarks || !timeDurationText) {
         alert("Required data for download is missing or incomplete. Please generate the paper again.");
         console.error("Missing data attributes/text for download. Attributes:", downloadBtn.dataset, "Text available:", !!text);
         return;
    }

     // Check if text content is valid
     if (!text || text.trim() === '' || text.includes('Generating, please wait...') || text.includes('Error:')) {
         alert("No valid content to download. Please generate a question paper first.");
         return;
     }

    console.log("Processing output text for download...");

    // ---> Construct metadata from stored data
    const metadata = {
      curriculum: curriculum,
      className: className,
      totalMarks: totalMarks,
      timeDuration: timeDurationText // Use the text format (e.g., "1 Hour")
    };

    // Parse the text to identify sections and questions
    const sections = [];
    const answerKey = [];
    let currentSection = null;
    let isAnswerKey = false;
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim().replace(/\*\*/g, '');   // strip Markdown bold
      if (/^(\*\*?)?(question paper|curriculum board|class|subject|total time)/i.test(line)) {
        continue;           // ignore; don't add to sections or questions
        }
        if (!line) continue; // Skip empty lines

        // Improved Answer Key detection
        if (/^(\*\*|__)?answer key(\*\*|__)?$/i.test(line)) {
          isAnswerKey = true;
          // Check if the next line is also part of the header (like a separator ===)
          if (i + 1 < lines.length && /^-+|=+$/.test(lines[i + 1].trim())) {
              i++; // Skip the separator line
          }
          continue;
        }

        if (isAnswerKey) {
           // Process answer key lines: Keep numbering if present, otherwise add as is
           const answerMatch = line.match(/^(\d+\.?\)?)\s*(.*)$/); // Match "1.", "1)", "1" etc.
           if (answerMatch) {
                answerKey.push(answerMatch[2].trim());        // keep answer ONLY
           } else if (line) { // Only add non-empty lines
               answerKey.push(line); // Add line as is if no standard numbering
           }
        } else {
           // Process question paper lines
           // Regex to detect potential section headers (more flexible)
           // Matches lines like "SECTION A", "SECTION B: MCQS", "PART 1 - SHORT ANSWER", "Marks: 10" etc.
           const sectionHeaderRegex = /^(SECTION|PART)\s*([A-Z0-9]+)?(\s*[:\-]\s*.*)?$|^.*(QUESTIONS|MARKS:\s*\d+).*$/i;

           // Regex to detect numbered list items (more robust)
           // Matches "1.", "1)", "a.", "a)", "(i)" etc.
           const numberedItemRegex = /^\s*(\d+\.|\(?[a-z]\)|\(?[ivx]+\))\s+/i;

          if (sectionHeaderRegex.test(line) && line.length < 80) {
              // ------- SECTION HEADER -------
              currentSection = { title: line, questions: [] };
              sections.push(currentSection);
          
          } else if (                             // ONE (and only one) else‑if
              currentSection &&
              numberedItemRegex.test(line) &&
              /[?]|[:.]$/.test(line)              // heuristic: looks like a real question stem
          ) {
              // -------- NEW QUESTION --------
              // strip the numbering and store the stem
              currentSection.questions.push(
                  line.replace(numberedItemRegex, '').trim()
              );
          
          } else if (currentSection) {
              // ------ CONTINUATION LINE (options, extra text, etc.) ------
              if (currentSection.questions.length > 0) {
                   currentSection.questions[currentSection.questions.length - 1] +=
                   '\n' + line.replace(numberedItemRegex, '').trim(); 
              } else {
                  currentSection.questions.push(line); // first line in otherwise‑empty section
              }
          
          } else if (line) {
              // -------- TEXT BEFORE ANY SECTION FOUND --------
              currentSection = {
                  title: 'General Instructions / Questions',
                  questions: [line]
              };
              sections.push(currentSection);
          }
        }
    }

    // Ensure we have at least one section if questions were expected
    if (sections.length === 0 && !isAnswerKey && text.trim() !== '') {
      console.warn("Parsing resulted in no sections, adding default.");
      sections.push({
        title: "Questions",
        questions: ["Could not automatically parse sections. Full text included.", text] // Include full text
      });
    }

    // Prepare the payload using the retrieved and parsed data
    const payload = {
      subject: subject,
      metadata: metadata,
      sections: sections,
      answerKey: answerKey
    };

    console.log("Sending payload to server:", JSON.stringify(payload, null, 2)); // Pretty print for easier debugging

    try {
      const response = await fetch(`${backendURL}/download-docx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'useremail': localStorage.getItem('userEmail') || 'anonymous' // Adjust as needed
        },
        body: JSON.stringify(payload)
      });

      console.log("Server response status:", response.status);

      if (!response.ok) {
        let errorData = { message: `Server responded with status ${response.status}` };
        try {
          // Try to get specific error message from backend JSON response
          errorData = await response.json();
        } catch (e) {
          console.warn("Could not parse error response as JSON. Response text:", await response.text());
        }
        console.error("Download failed with status:", response.status, errorData);
        throw new Error(`Download failed: ${errorData.message || response.statusText}`);
      }

      console.log("Download response received, processing blob...");
      const blob = await response.blob();

       // Check blob type - should be WordprocessingML
       if (!blob.type.includes('officedocument.wordprocessingml.document')) {
           console.warn(`Received blob of type ${blob.type}, expected Word document. Attempting download anyway.`);
       }

      console.log("Blob received with type:", blob.type, "Size:", blob.size);
      if (blob.size === 0) {
           throw new Error("Received empty file from server.");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none'; // Hide the link
      a.href = url;
      // Sanitize filename slightly
      const safeSubject = subject.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `Question_Paper_${safeSubject || 'Untitled'}.docx`;
      document.body.appendChild(a);
      console.log("Triggering download...");
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      a.remove();

      console.log("Download initiated successfully");

    } catch (error) {
       console.error("Download error:", error);
       alert(`Failed to download Word file: ${error.message}`);

       // Fallback method - try downloading the raw text (keep this)
       try {
         console.log("Attempting fallback download method as text file...");
         const fallbackBlob = new Blob([text], { type: 'text/plain;charset=utf-8' });
         const fallbackUrl = window.URL.createObjectURL(fallbackBlob);
         const fallbackA = document.createElement('a');
         fallbackA.style.display = 'none';
         fallbackA.href = fallbackUrl;
         const safeSubject = subject.replace(/[^a-z0-9]/gi, '_').toLowerCase();
         fallbackA.download = `Question_Paper_${safeSubject || 'Untitled'}_RAW.txt`;
         document.body.appendChild(fallbackA);
         fallbackA.click();
         window.URL.revokeObjectURL(fallbackUrl);
         fallbackA.remove();
         console.log("Fallback download (text) completed");
       } catch (fallbackError) {
         console.error("Fallback download also failed:", fallbackError);
         alert('Primary download failed, and fallback text download also failed.');
       }
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
