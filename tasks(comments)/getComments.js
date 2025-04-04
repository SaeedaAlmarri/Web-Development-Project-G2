document.addEventListener('DOMContentLoaded', async function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../task1-2/login.html';
        return;
    }

    const courseCode = localStorage.getItem('currentCourse');
    document.getElementById('courseTitle').textContent = `Comments for ${courseCode}`;

    try {
        const comments = await getCombinedComments(courseCode);
        displayComments(comments, currentUser.userType);
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('commentsContainer').innerHTML = 
            '<p class="error">Failed to load comments</p>';
    }
});

async function getCombinedComments(courseCode) {
    const localComments = JSON.parse(localStorage.getItem('courseComments') || '[]');
    const jsonComments = await fetch('../tasks(comments)/comments.json')
        .then(res => res.json())
        .catch(() => []);
    const allComments = [...jsonComments, ...localComments];
    return allComments.filter(c => c.course === courseCode);
}

function displayComments(comments, userType) {
    const container = document.getElementById('commentsContainer');
    container.innerHTML = '';

    if (comments.length === 0) {
        container.innerHTML = '<p>No comments yet for this course</p>';
        return;
    }

    const parentComments = comments.filter(c => !c.isReply);
    const replies = comments.filter(c => c.isReply);

    parentComments.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(comment => {
        const commentEl = createCommentElement(comment, userType);
        const commentReplies = replies.filter(r => r.parentId === comment.id);
        if (commentReplies.length > 0) {
            const repliesContainer = document.createElement('div');
            repliesContainer.className = 'replies-container';
            commentReplies.forEach(reply => {
                repliesContainer.appendChild(createCommentElement(reply, userType, true));
            });
            commentEl.appendChild(repliesContainer);
        }
        
        container.appendChild(commentEl);
    });
}

function createCommentElement(comment, userType, isReply = false) {
    const commentEl = document.createElement('div');
    commentEl.className = `comment ${isReply ? 'reply' : ''}`;
    
    let buttons = '';
    if (!isReply && userType === 'course_instructor') {
        buttons = `<button class="reply-btn" data-id="${comment.id}">Respond</button>`;
    }

    commentEl.innerHTML = `
        <h4>${comment.title}</h4>
        <p class="meta">
            Posted by ${comment.authorName} 
            (${comment.isReply ? 'Instructor Response' : comment.author}) 
            on ${new Date(comment.date).toLocaleString()}
        </p>
        <div class="comment-body">${comment.body}</div>
        ${buttons}
    `;

    if (!isReply && userType === 'course_instructor') {
        commentEl.querySelector('.reply-btn').addEventListener('click', function() {
            localStorage.setItem('replyingToComment', comment.id);
            window.location.href = 'addComments.html';
        });
    }

    return commentEl;
}