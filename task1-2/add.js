let assessmentsData = {};

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Get current user from localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        await loadAllAssessments();
        initAssessmentForm(currentUser); // Pass currentUser to init

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
        // Store initial data in localStorage
        localStorage.setItem('assessmentsData', JSON.stringify(assessmentsData));
    } catch (error) {
        console.error('Error loading assessments:', error);
        throw new Error('Failed to load assessment data');
    }
}

// CHANGED: Now accepts currentUser parameter
function initAssessmentForm(currentUser) {
    const form = document.getElementById('assessmentForm');

    // CHANGED: Only populate courses for this user
    populateCourseDropdown(currentUser.courses);

    document.getElementById('assessmentType').addEventListener('change', updateDefaultTitle);

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleFormSubmission(this);
    });
}

// CHANGED: Now filters by user's courses
function populateCourseDropdown(userCourses) {
    const courseSelect = document.getElementById('course');
    courseSelect.innerHTML = '<option value="">Select a course</option>';

    // Get the latest assessments data from localStorage
    const storedAssessmentsData = JSON.parse(localStorage.getItem('assessmentsData')) || {};

    // Only show courses that exist in both storedAssessmentsData AND user's courses
    userCourses.forEach(courseCode => {
        if (storedAssessmentsData[courseCode]) {
            const option = document.createElement('option');
            option.value = courseCode;
            option.textContent = `${courseCode} - ${storedAssessmentsData[courseCode].course_name}`;
            courseSelect.appendChild(option);
        }
    });

    // If no valid courses found, disable the dropdown
    if (courseSelect.options.length === 1) {
        courseSelect.disabled = true;
        showFeedback('No courses available to add assessments', 'error');
    }
}

function updateDefaultTitle() {
    const type = document.getElementById('assessmentType').value;
    const titleInput = document.getElementById('title');
    const courseSelect = document.getElementById('course').value;

    if (type && !titleInput.value && courseSelect) {
        // Get the latest assessments data from localStorage
        const storedAssessmentsData = JSON.parse(localStorage.getItem('assessmentsData')) || {};
        const existingAssessments = storedAssessmentsData[courseSelect]?.assessments || [];
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

        // Get the latest assessments data from localStorage
        const storedAssessmentsData = JSON.parse(localStorage.getItem('assessmentsData')) || {};

        if (!storedAssessmentsData[data.course]) {
            const courseName = document.querySelector(`#course option[value="${data.course}"]`).text.split(' - ')[1];
            storedAssessmentsData[data.course] = {
                course_name: courseName,
                assessments: []
            };
        }

        storedAssessmentsData[data.course].assessments.push(newAssessment);

        // Update localStorage with the new data
        localStorage.setItem('assessmentsData', JSON.stringify(storedAssessmentsData));
        assessmentsData = storedAssessmentsData; // Update in-memory data as well

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

    if (new Date(data.dueDate) < new Date()) {
        showFeedback('Due date must be in the future', 'error');
        return false;
    }

    const weight = parseInt(data.weight);
    if (weight < 1 || weight > 100) {
        showFeedback('Weight must be between 1-100%', 'error');
        return false;
    }

    const effortHours = parseInt(data.effortHours);
    if (effortHours < 1) {
        showFeedback('Effort hours must be at least 1', 'error');
        return false;
    }

    // Get the latest assessments data from localStorage
    const storedAssessmentsData = JSON.parse(localStorage.getItem('assessmentsData')) || {};
    const courseAssessments = storedAssessmentsData[data.course]?.assessments || [];

    if (data.assessmentType === "Final Exam") {
        const finalExamExists = courseAssessments.some(a => a.type === "Final Exam");
        if (finalExamExists) {
            showFeedback("Only one final exam can be added per course.", "error");
            return false;
        }
    }

    if (data.assessmentType === "Midterm") {
        const midtermCount = courseAssessments.filter(a => a.type === "Midterm").length;
        if (midtermCount >= 2) {
            showFeedback("At most 2 midterm exams can be added per course.", "error");
            return false;
        }
    }

    const duplicateDueDate = courseAssessments.some(a => a.due_date === data.dueDate);
    if (duplicateDueDate) {
        showFeedback("Two assessments cannot have the same due date.", "error");
        return false;
    }

    if (data.assessmentType === "Project Phase") {
        const projectCount = courseAssessments.filter(a => a.type.startsWith("Project Phase")).length;
        if (projectCount >= 4) {
            showFeedback("A course can have a maximum of 4 project phases.", "error");
            return false;
        }
    }

    if (data.assessmentType === "Homework") {
        const homeworkCount = courseAssessments.filter(a => a.type === "Homework").length;
        if (homeworkCount >= 8) {
            showFeedback("A course can have a maximum of 8 homework assignments.", "error");
            return false;
        }
    }

    return true;
}

function displayCourseAssessments(courseCode) {
    const container = document.getElementById('assessmentsContainer');
    container.innerHTML = '';

    // Get the latest assessments data from localStorage
    const storedAssessmentsData = JSON.parse(localStorage.getItem('assessmentsData')) || {};

    if (!storedAssessmentsData[courseCode] || storedAssessmentsData[courseCode].assessments.length === 0) {
        container.innerHTML = '<p class="no-assessments">No assessments found for this course</p>';
        return;
    }

    const assessments = storedAssessmentsData[courseCode].assessments;

    assessments.forEach(assessment => {
        const element = document.createElement('div');
        element.className = 'assessment-card';
        element.innerHTML = `
            <h3>${assessment.title}</h3>
            <p><strong>Type:</strong> ${assessment.type}</p>
            <p><strong>Due:</strong> ${formatDate(assessment.due_date)}</p>
            <p><strong>Weight:</strong> ${assessment.weight}%</p>
            <p><strong>Effort Hours:</strong> ${assessment.effort_hours}</p>
        `;
        container.appendChild(element);
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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