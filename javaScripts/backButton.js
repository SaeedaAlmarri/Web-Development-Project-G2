function addBackButton() {

    if (window.location.pathname.includes('mainPage.html') || 
        window.location.pathname.includes('login.html')) {
        return;
    }

    const container = document.createElement('div');
    container.className = 'back-button-container';
    
    const button = document.createElement('a');
    button.href = '../mainPage.html';
    button.className = 'back-button';
    button.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Courses';
    
    container.appendChild(button);

    const mainContainer = document.querySelector('.container, main') || document.body;
    if (mainContainer.firstChild) {
        mainContainer.insertBefore(container, mainContainer.firstChild);
    } else {
        mainContainer.appendChild(container);
    }
}

document.addEventListener('DOMContentLoaded', addBackButton);