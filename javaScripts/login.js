document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    const currentUser = getCurrentUser();
    if (currentUser && !isSessionExpired(currentUser)) {
        window.location.href = '../mainPage.html';
        return;
    } else if (currentUser) {
        localStorage.removeItem('currentUser');
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        errorMessage.textContent = '';
        
        const userId = document.getElementById('userId').value.trim();
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('../data/users.json');
            const data = await response.json();
            const user = data.users.find(u => 
                u.user_id === userId && 
                u.password === password
            );

            if (user) {
                const userData = {
                    userId: user.user_id,
                    userType: user.user_type,
                    courses: user.courses || [],
                    displayName: getDisplayName(user.user_type),
                    loginTime: new Date().getTime() 
                };
                localStorage.setItem('currentUser', JSON.stringify(userData));
                
                window.location.href = '../mainPage.html?fresh=' + Date.now();
            } else {
                showError('Invalid User ID or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Login failed. Please try again.');
        }
    });

    function isSessionExpired(user) {
        const oneHour = 60 * 60 * 1000;
        return (new Date().getTime() - user.loginTime) > oneHour;
    }

    function getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    function getDisplayName(userType) {
        const names = {
            'student': 'Student',
            'course_instructor': 'Instructor',
            'coordinator': 'Coordinator'
        };
        return names[userType] || 'User';
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});