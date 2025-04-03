
let assessmentsData = {};

document.addEventListener('DOMContentLoaded', async function() {
    try {

        await loadAllAssessments();
        initAssessmentForm();
        
        document.getElementById('course').addEventListener('change', function() {
            if (this.value) {
                displayCourseAssessments(this.value);
            }
        });
        
    } catch (error) {
        console.error('Initialization error:', error);
        showFeedback('Failed to initialize application', 'error');
    }
});

async function loadAllAssessments() {
    try {
        const response = await fetch('assessments.json');
        assessmentsData = await response.json();
        populateCourseDropdown();
    } catch (error) {
        console.error('Error loading assessments:', error);
        throw new Error('Failed to load assessment data');
    }
}

function populateCourseDropdown() {
    const courseSelect = document.getElementById('course');
    courseSelect.innerHTML = '<option value="">Select a course</option>';
    
    Object.keys(assessmentsData).forEach(courseCode => {
        const option = document.createElement('option');
        option.value = courseCode;
        option.textContent = `${courseCode} - ${assessmentsData[courseCode].course_name}`;
        courseSelect.appendChild(option);
    });
}

function initAssessmentForm() {
    const form = document.getElementById('assessmentForm');
    

    document.getElementById('assessmentType').addEventListener('change', updateDefaultTitle);
    

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleFormSubmission(this);
    });
}

function updateDefaultTitle() {
    const type = document.getElementById('assessmentType').value;
    const titleInput = document.getElementById('title');
    const courseSelect = document.getElementById('course').value;
    
    if (type && !titleInput.value && courseSelect) {

        const existingAssessments = assessmentsData[courseSelect]?.assessments || [];
        const similarAssessments = existingAssessments.filter(a => a.type === type);
        const nextNumber = similarAssessments.length + 1;
        
        const defaultTitles = {
            'Homework': `Homework ${nextNumber}`,
            'Quiz': `Quiz ${nextNumber}`,
            'Midterm': `Midterm ${nextNumber}`,
            'Final Exam': 'Final Exam',
            'Project Phase': `Project Phase ${nextNumber}`
        };
        
        titleInput.value = defaultTitles[type] || type;
    }
}

async function handleFormSubmission(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    if (!validateAssessment(data)) return;
    
    try {
    
        const newAssessment = {
            id: `asmt${Date.now()}`,
            title: data.title,
            type: data.assessmentType,
            due_date: data.dueDate,
            effort_hours: parseInt(data.effortHours),
            weight: parseInt(data.weight)
        };

        if (!assessmentsData[data.course]) {

            const courseName = document.querySelector(`#course option[value="${data.course}"]`).text.split(' - ')[1];
            assessmentsData[data.course] = {
                course_name: courseName,
                assessments: []
            };
        }
        
        assessmentsData[data.course].assessments.push(newAssessment);
        
    
        showFeedback('Assessment added successfully!', 'success');
        form.reset();
        
   
        displayCourseAssessments(data.course);
        
    } catch (error) {
        console.error('Error adding assessment:', error);
        showFeedback('Failed to add assessment', 'error');
    }
}

function validateAssessment(data) {

    const requiredFields = ['course', 'assessmentType', 'title', 'dueDate', 'effortHours', 'weight'];
    for (const field of requiredFields) {
        if (!data[field]) {
            showFeedback(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
            return false;
        }
    }
    
    // Validate due date is in the future
    if (new Date(data.dueDate) < new Date()) {
        showFeedback('Due date must be in the future', 'error');
        return false;
    }
    
    // Validate weight (1-100%)
    const weight = parseInt(data.weight);
    if (weight < 1 || weight > 100) {
        showFeedback('Weight must be between 1-100%', 'error');
        return false;
    }
    
    // Validate effort hours
    const effortHours = parseInt(data.effortHours);
    if (effortHours < 1) {
        showFeedback('Effort hours must be at least 1', 'error');
        return false;
    }
    
    return true;
}

function displayCourseAssessments(courseCode) {
    const container = document.getElementById('assessmentsContainer');
    container.innerHTML = '';
    
    if (!assessmentsData[courseCode] || assessmentsData[courseCode].assessments.length === 0) {
        container.innerHTML = '<p class="no-assessments">No assessments found for this course</p>';
        return;
    }
    
    const assessments = assessmentsData[courseCode].assessments;
    
    assessments.forEach(assessment => {
        const element = document.createElement('div');
        element.className = 'assessment-card';
        element.innerHTML = `
            <h3>${assessment.title}</h3>
            <p><strong>Type:</strong> ${assessment.type}</p>
            <p><strong>Due:</strong> ${formatDate(assessment.due_date)}</p>
            <p><strong>Weight:</strong> ${assessment.weight}%</p>
            <p><strong>Effort Hours:</strong> ${assessment.effort_hours}</p>
            <button class="delete-btn" data-course="${courseCode}" data-id="${assessment.id}">Delete</button>
        `;
        container.appendChild(element);
    });
    
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteAssessment);
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function handleDeleteAssessment(e) {
    const courseCode = e.target.dataset.course;
    const assessmentId = e.target.dataset.id;
    
    if (confirm('Are you sure you want to delete this assessment?')) {
       
        assessmentsData[courseCode].assessments = assessmentsData[courseCode].assessments.filter(
            a => a.id !== assessmentId
        );
        
      
        
        showFeedback('Assessment deleted successfully', 'success');
        displayCourseAssessments(courseCode);
    }
}

function showFeedback(message, type) {
    const feedback = document.getElementById('formFeedback');
    feedback.textContent = message;
    feedback.className = type;
    feedback.style.display = 'block';
    
    setTimeout(() => {
        feedback.style.display = 'none';
    }, 5000);
}


async function saveAssessmentsToBackend(data) {
    console.log('Would save to backend:', data);
   
}
function updateDefaultTitle() {
    const type = document.getElementById('assessmentType').value;
    const titleInput = document.getElementById('title');
    const courseSelect = document.getElementById('course').value;

    if (!type || !courseSelect) return;

    const existingAssessments = assessmentsData[courseSelect]?.assessments || [];
    const similarAssessments = existingAssessments.filter(a => a.type === type);

    let nextNumber = similarAssessments.length + 1;
    let defaultTitle = type; 
    if (similarAssessments.length > 0) {
        defaultTitle = `${type} ${nextNumber}`;
    }


    if (!titleInput.value || titleInput.dataset.autoGenerated === "true") {
        titleInput.value = defaultTitle;
        titleInput.dataset.autoGenerated = "true"; 
    }


    titleInput.addEventListener('input', function () {
        titleInput.dataset.autoGenerated = "false";
    });
}
function validateAssessment(data) {
    const requiredFields = ['course', 'assessmentType', 'title', 'dueDate', 'effortHours', 'weight'];
    
    for (const field of requiredFields) {
        if (!data[field]) {
            showFeedback(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
            return false;
        }
    }

    const courseAssessments = assessmentsData[data.course]?.assessments || [];
    
    // Rule: Only one final exam allowed
    if (data.assessmentType === "Final Exam") {
        const finalExamExists = courseAssessments.some(a => a.type === "Final Exam");
        if (finalExamExists) {
            showFeedback("Only one final exam can be added per course.", "error");
            return false;
        }
    }

    // Rule: At most 2 midterm exams
    if (data.assessmentType === "Midterm") {
        const midtermCount = courseAssessments.filter(a => a.type === "Midterm").length;
        if (midtermCount >= 2) {
            showFeedback("At most 2 midterm exams can be added per course.", "error");
            return false;
        }
    }

    // Rule: No two assessments for a course can have the same due date
    const duplicateDueDate = courseAssessments.some(a => a.due_date === data.dueDate);
    if (duplicateDueDate) {
        showFeedback("Two assessments cannot have the same due date.", "error");
        return false;
    }

    // Rule: Project phases should be between 1 to 4
    if (data.assessmentType === "Project Phase") {
        const projectCount = courseAssessments.filter(a => a.type.startsWith("Project Phase")).length;
        if (projectCount >= 4) {
            showFeedback("A course can have a maximum of 4 project phases.", "error");
            return false;
        }
    }

    // Rule: Maximum 8 homework assignments per course
    if (data.assessmentType === "Homework") {
        const homeworkCount = courseAssessments.filter(a => a.type === "Homework").length;
        if (homeworkCount >= 8) {
            showFeedback("A course can have a maximum of 8 homework assignments.", "error");
            return false;
        }
    }

    // Rule: Validate due date is in the future
    if (new Date(data.dueDate) < new Date()) {
        showFeedback("Due date must be in the future.", "error");
        return false;
    }

    // Rule: Validate weight (1-100%)
    const weight = parseInt(data.weight);
    if (weight < 1 || weight > 100) {
        showFeedback("Weight must be between 1-100%.", "error");
        return false;
    }

    // Rule: Validate effort hours
    const effortHours = parseInt(data.effortHours);
    if (effortHours < 1) {
        showFeedback("Effort hours must be at least 1.", "error");
        return false;
    }

    return true;
}
