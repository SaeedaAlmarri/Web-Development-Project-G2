document.addEventListener('DOMContentLoaded', function () {
    const currentUser = getValidUserSession();

    if (!currentUser) {
        redirectToLogin();
        return;
    }

    initializeUI(currentUser);
    loadCourseData(currentUser);
});

function getValidUserSession() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) return null;

    try {
        const user = JSON.parse(userData);
        const loginTime = new Date(user.lastLogin);
        const currentTime = new Date();
        const sessionAge = (currentTime - loginTime) / (1000 * 60 * 60); // hours

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

    const globalActions = document.createElement('div');
    globalActions.className = 'global-actions';
    
    const allAssessBtn = document.createElement('button');
    allAssessBtn.className = 'btn get-all-assessments';
    allAssessBtn.innerHTML = '<i class="fas fa-file-alt"></i> Get All Assessments';
    allAssessBtn.addEventListener('click', () => {
        localStorage.setItem('viewAllAssessments', 'true');
        window.location.href = 'Phase1/index.html';
    });
    globalActions.appendChild(allAssessBtn);
    
    if (user.userType === 'student') {
        const allCalendarBtn = document.createElement('button');
        allCalendarBtn.className = 'btn view-all-calendar';
        allCalendarBtn.innerHTML = '<i class="fas fa-calendar"></i> View All Calendar';
        allCalendarBtn.addEventListener('click', () => {
            localStorage.setItem('viewAllCalendar', 'true');
            window.location.href = 'task5-6-9/calender.html';
        });
        globalActions.appendChild(allCalendarBtn);
    }
    
    if (user.userType === 'coordinator') {
        const workloadBtn = document.createElement('button');
        workloadBtn.className = 'btn workload-report';
        workloadBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Workload Reports';
        workloadBtn.addEventListener('click', () => {
            window.location.href = 'task5-6-9/report.html';
        });
        globalActions.appendChild(workloadBtn);
    }
    
    const container = document.querySelector('.container');
    const coursesContainer = document.getElementById('coursesContainer');
    container.insertBefore(globalActions, coursesContainer);

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
            'get-assessments': 'Phase1/index.html',
            'view-comments': 'tasks(comments)/getComments.html',
            'add-comment': 'tasks(comments)/addComments.html',
            'add-assessment': 'task1-2/add.html',
            'workload-report': 'task5-6-9/report.html'
        };
        window.location.href = pages[action];
    };

    document.querySelectorAll('[data-course]').forEach(btn => {
        btn.addEventListener('click', function () {
            const course = this.dataset.course;
            const action =
                this.classList.contains('view-assessments') ? 'view-assessments' :
                this.classList.contains('get-assessments') ? 'get-assessments' :
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
        student: 'Student',
        course_instructor: 'Course Instructor',
        coordinator: 'Course Coordinator'
    }[userType] || 'Unknown Role';
}
