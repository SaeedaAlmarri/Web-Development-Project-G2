document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../task1-2/login.html';
        return;
    }
    const allowedRoles = ['student', 'course_instructor', 'coordinator'];
    if (!allowedRoles.includes(currentUser.userType)) {
        window.location.href = '../mainPage.html';
        return;
    }
    const courseCode = localStorage.getItem('currentCourse');
    const isReply = localStorage.getItem('replyingToComment');
    
    if (isReply) {
        document.getElementById('courseTitle').textContent = `Respond to Comment in ${courseCode}`;
        document.getElementById('formTitle').textContent = 'Post Your Response';
    } else {
        document.getElementById('courseTitle').textContent = 
            `${currentUser.userType === 'course_instructor' ? 'Add Course Announcement for' : 'Add Comment for'} ${courseCode}`;
    }
    document.getElementById('commentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const commentData = {
            id: `comment-${Date.now()}`,
            course: courseCode,
            title: formData.get('title'),
            body: formData.get('body'),
            author: currentUser.userId,
            authorName: currentUser.displayName,
            userType: currentUser.userType, // Track author role
            date: new Date().toISOString(),
            isReply: !!isReply,
            parentId: isReply || null
        };

        try {
            let comments = JSON.parse(localStorage.getItem('courseComments') || '[]');
            comments.push(commentData);
            localStorage.setItem('courseComments', JSON.stringify(comments));
            await simulateSaveToJSON(commentData);
            if (isReply) localStorage.removeItem('replyingToComment');
            const successMessage = isReply ? 'Response posted successfully!' : 
                                 currentUser.userType === 'course_instructor' ? 'Announcement posted!' : 
                                 'Comment added successfully!';
            alert(successMessage);        
            window.location.href = '../mainPage.html';
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });

    if (isReply && currentUser.userType === 'course_instructor') {
        const originalCommentId = localStorage.getItem('replyingToComment');
        const originalComment = getCommentById(originalCommentId);
        
        if (originalComment) {
            document.getElementById('title').value = `Re: ${originalComment.title}`;
            document.getElementById('title').readOnly = true;
        }
    }
});

function getCommentById(commentId) {
    const comments = JSON.parse(localStorage.getItem('courseComments') || '[]');
    return comments.find(c => c.id === commentId);
}

async function simulateSaveToJSON(newComment) {
    try {
        console.log('Would send to server to save in JSON:', newComment);
        const existingFromJSON = await fetch('../tasks(comments)/comments.json')
            .then(res => res.json())
            .catch(() => []);
        
        const combinedData = [...existingFromJSON, newComment];
        console.log('Combined data that would be saved:', combinedData);
    } catch (error) {
        console.error('Error simulating save:', error);
        throw error;
    }
}