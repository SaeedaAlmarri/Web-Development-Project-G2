document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Check for existing session
    const currentUser = getCurrentUser();
    if (currentUser) {
        showDashboard(currentUser);
        return;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        errorMessage.textContent = '';
        
        const userId = document.getElementById('userId').value.trim();
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('users.json');
            const data = await response.json();
            const user = data.users.find(u => 
                u.user_id === userId && 
                u.password === password
            );

            if (user) {
                // PROPERLY save all user data
                const userData = {
                    userId: user.user_id,
                    userType: user.user_type,
                    courses: user.courses || [],
                    displayName: getDisplayName(user.user_type)
                };
                localStorage.setItem('currentUser', JSON.stringify(userData));
                
                showDashboard(userData);
            } else {
                showError('Invalid User ID or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Login failed. Please try again.');
        }
    });

    function showDashboard(user) {
        document.querySelector('.login-container').style.display = 'none';
        
        const dashboard = document.createElement('div');
        dashboard.className = 'dashboard';
        dashboard.innerHTML = `
            <h1>Welcome, ${user.displayName}</h1>
            <div class="user-info">
                <p><strong>User ID:</strong> ${user.userId}</p>
                <p><strong>Role:</strong> ${user.userType.replace('_', ' ')}</p>
                ${user.courses.length ? `
                <h2>Your Courses:</h2>
                <ul>
                    ${user.courses.map(course => `<li>${course}</li>`).join('')}
                </ul>
                ` : ''}
            </div>
            <button id="logoutBtn" class="logout-btn">Logout</button>
        `;
        
        document.body.appendChild(dashboard);
        document.getElementById('logoutBtn').addEventListener('click', logout);
    }

    function getDisplayName(userType) {
        // Map JSON user types to display names
        const names = {
            'student': 'Student',
            'course_instructor': 'Instructor',
            'coordinator': 'Coordinator'
        };
        return names[userType] || 'User';
    }

    function getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function logout() {
        localStorage.removeItem('currentUser');
        location.reload();
    }
});