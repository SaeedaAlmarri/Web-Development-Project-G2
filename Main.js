document.addEventListener('DOMContentLoaded', function() {
    const currentUser = getValidUserSession();
    
    if (!currentUser) {
        redirectToLogin();
        return;
    }
    initializeUI(currentUser);
        loadCourseData(currentUser);
});
function bindCourseActions() {
    const handleAction = (course, action) => {
        localStorage.setItem('currentCourse', course);
        const pages = {
            'view-assessments': 'task5-6-9/calender.html',
            'view-comments': 'tasks(comments)/getComments.html',
            'add-comment': 'tasks(comments)/addComments.html',
            'add-assessment': 'task1-2/add.html',
            'workload-report': 'task5-6-9/report.html'
        };
        window.location.href = pages[action];
    };
    
    document.querySelectorAll('[data-course]').forEach(btn => {
        btn.addEventListener('click', function() {
            const course = this.dataset.course;
            const action = this.classList.contains('view-assessments') ? 'view-assessments' :
                          this.classList.contains('view-comments') ? 'view-comments' :
                          this.classList.contains('add-comment') ? 'add-comment' :
                          this.classList.contains('add-assessment') ? 'add-assessment' : 
                          'workload-report';
            handleAction(course, action);
        });
    });
}

function getValidUserSession() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) return null;
    
    try {
        const user = JSON.parse(userData);
        
        const loginTime = new Date(user.lastLogin);
        const currentTime = new Date();
        const sessionAge = (currentTime - loginTime) / (1000 * 60 * 60); 
        
        if (sessionAge > 1) { 
            localStorage.removeItem('currentUser');
            return null;
        }
        
        return user;
    } catch {
        return null;
    }
}

function initializeUI(user) {
    document.getElementById('welcomeMessage').textContent = `Welcome, ${user.userId}`;
    document.getElementById('userRole').textContent = formatUserRole(user.userType);
    
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        redirectToLogin();
    });
}

function loadCourseData(user) {
    const container = document.getElementById('coursesContainer');
    container.innerHTML = '<div class="loading">Loading courses...</div>';
        setTimeout(() => {
        displayCourses(user);
    }, 300);
}

function displayCourses(user) {
    const container = document.getElementById('coursesContainer');
    
    if (!user.courses || user.courses.length === 0) {
        container.innerHTML = '<div class="no-courses">No courses found for this user.</div>';
        return;
    }
    
    container.innerHTML = '';
    
    user.courses.forEach(course => {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.innerHTML = generateCourseCardHTML(course, user.userType);
        container.appendChild(card);
    });
    
    bindCourseActions();
}

function generateCourseCardHTML(courseCode, userType) {
    let buttons = `
        <button class="btn view-assessments" data-course="${courseCode}">
            <i class="fas fa-calendar"></i> Assessments
        </button>
        <button class="btn view-comments" data-course="${courseCode}">
            <i class="fas fa-comments"></i> Comments
        </button>
    `;
    
    if (userType !== 'course_instructor') {
        buttons += `
            <button class="btn add-comment" data-course="${courseCode}">
                <i class="fas fa-plus-circle"></i> Add Comment
            </button>
        `;
    }
    
    if (userType === 'course_instructor') {
        buttons += `
            <button class="btn add-assessment" data-course="${courseCode}">
                <i class="fas fa-tasks"></i> Add Assessment
            </button>
        `;
    }
    
    if (userType === 'coordinator') {
        buttons += `
            <button class="btn workload-report" data-course="${courseCode}">
                <i class="fas fa-chart-bar"></i> Workload
            </button>
        `;
    }
    
    return `
        <h3>${courseCode}</h3>
        <div class="course-actions">
            ${buttons}
        </div>
    `;
}

function bindCourseActions() {
    const handleAction = (course, action) => {
        localStorage.setItem('currentCourse', course);
        const pages = {
            'view-assessments': 'task5-6-9/calender.html',
            'view-comments': 'tasks(comments)/getComments.html',
            'add-comment': 'tasks(comments)/addComments.html',
            'add-assessment': 'task1-2/add.html',
            'workload-report': 'task5-6-9/report.html'
        };
        window.location.href = pages[action];
    };
    
    document.querySelectorAll('[data-course]').forEach(btn => {
        btn.addEventListener('click', function() {
            const course = this.dataset.course;
            const action = this.classList.contains('view-assessments') ? 'view-assessments' :
                          this.classList.contains('view-comments') ? 'view-comments' :
                          this.classList.contains('add-comment') ? 'add-comment' :
                          this.classList.contains('add-assessment') ? 'add-assessment' : 
                          'workload-report';
            handleAction(course, action);
        });
    });
}

function redirectToLogin() {
    window.location.href = 'task1-2/login.html';
}

function formatUserRole(userType) {
    return {
        'student': 'STUDENT',
        'course_instructor': 'INSTRUCTOR',
        'coordinator': 'COORDINATOR'
    }[userType] || userType;
}