
console.log('js is linked');


document.addEventListener('DOMContentLoaded', function() {
    // Initialize the form
    initAssessmentForm();
});

function initAssessmentForm() {
    const form = document.getElementById('assessmentForm');
    
    // Load courses for dropdown
    loadCourses();
    
    // Auto-generate title when type changes
    document.getElementById('assessmentType').addEventListener('change', updateDefaultTitle);
    
    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleFormSubmission(form);
    });
}

async function loadCourses() {
    try {
        // In a real app, fetch from your API
        const mockCourses = [
            { code: 'CS101', name: 'Introduction to Programming' },
            { code: 'CS350', name: 'Web Development' }
        ];
        
        const courseSelect = document.getElementById('course');
        courseSelect.innerHTML = '<option value="">Select a course</option>';
        
        mockCourses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.code;
            option.textContent = `${course.code} - ${course.name}`;
            courseSelect.appendChild(option);
        });
    } catch (error) {
        showFeedback('Failed to load courses', 'error');
    }
}

function updateDefaultTitle() {
    const type = document.getElementById('assessmentType').value;
    const titleInput = document.getElementById('title');
    
    if (type && !titleInput.value) {
        const defaultTitles = {
            homework: 'Homework',
            quiz: 'Quiz',
            midterm: 'Midterm Exam',
            final: 'Final Exam',
            project: 'Project'
        };
        titleInput.value = defaultTitles[type] || type;
    }
}

async function handleFormSubmission(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validate data
    if (!validateAssessment(data)) return;
    
    try {
        // In a real app, replace with actual fetch to your backend
        const response = await mockAddAssessment(data);
        
        if (response.success) {
            showFeedback('Assessment added successfully!', 'success');
            form.reset();
            
            // Load and display the updated assessments
            await loadAndDisplayAssessments(data.course);
        } else {
            showFeedback(response.message, 'error');
        }
    } catch (error) {
        showFeedback('Error submitting assessment', 'error');
        console.error('Submission error:', error);
    }
}

function validateAssessment(data) {
    // Required fields
    if (!data.course || !data.assessmentType || !data.dueDate) {
        showFeedback('Please fill all required fields', 'error');
        return false;
    }
    
    // Validate due date is in the future
    if (new Date(data.dueDate) < new Date()) {
        showFeedback('Due date must be in the future', 'error');
        return false;
    }
    
    // Validate weight (1-100%)
    if (data.weight < 1 || data.weight > 100) {
        showFeedback('Weight must be between 1-100%', 'error');
        return false;
    }
    
    return true;
}

async function loadAndDisplayAssessments(courseCode) {
    try {
        // In a real app, fetch from your API
        const assessments = await mockGetAssessments(courseCode);
        displayAssessments(assessments);
    } catch (error) {
        console.error('Error loading assessments:', error);
    }
}

function displayAssessments(assessments) {
    const container = document.getElementById('assessmentsContainer') || createAssessmentsContainer();
    container.innerHTML = '';
    
    if (assessments.length === 0) {
        container.innerHTML = '<p>No assessments found</p>';
        return;
    }
    
    assessments.forEach(assessment => {
        const assessmentElement = createAssessmentElement(assessment);
        container.appendChild(assessmentElement);
    });
}

function createAssessmentsContainer() {
    const container = document.createElement('div');
    container.id = 'assessmentsContainer';
    container.className = 'assessments-list';
    document.getElementById('assessmentForm').after(container);
    return container;
}

function createAssessmentElement(assessment) {
    const element = document.createElement('div');
    element.className = 'assessment-card';
    
    const dueDate = new Date(assessment.dueDate).toLocaleString();
    
    element.innerHTML = `
        <h3>${assessment.title}</h3>
        <p><strong>Course:</strong> ${assessment.course}</p>
        <p><strong>Type:</strong> ${assessment.assessmentType}</p>
        <p><strong>Due:</strong> ${dueDate}</p>
        <p><strong>Weight:</strong> ${assessment.weight}%</p>
        <p><strong>Effort:</strong> ${assessment.effortHours} hours</p>
    `;
    
    return element;
}

// Mock API functions (replace with real API calls)
async function mockAddAssessment(data) {
    console.log('Adding assessment:', data);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    
    // In a real app, this would return the created assessment with ID
    return { 
        success: true,
        assessment: { ...data, id: Date.now().toString() }
    };
}

async function mockGetAssessments(courseCode) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock data - in a real app this would come from your backend
    return [
        {
            course: courseCode,
            assessmentType: 'homework',
            title: 'Homework 1',
            dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
            weight: 15,
            effortHours: 5
        },
        // Include the newly added assessment
        {
            course: courseCode,
            assessmentType: document.getElementById('assessmentType').value,
            title: document.getElementById('title').value,
            dueDate: document.getElementById('dueDate').value,
            weight: document.getElementById('weight').value,
            effortHours: document.getElementById('effortHours').value
        }
    ].filter(a => a.course === courseCode);
}

function showFeedback(message, type) {
    const feedback = document.getElementById('formFeedback');
    if (!feedback) return;
    
    feedback.textContent = message;
    feedback.className = type;
    feedback.style.display = 'block';
    
    setTimeout(() => {
        feedback.style.display = 'none';
    }, 5000);
}

