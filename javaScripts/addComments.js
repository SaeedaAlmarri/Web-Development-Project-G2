document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../htmls/login.html';
        return;
    }
    
    const allowedRoles = ['student', 'course_instructor', 'coordinator'];
    if (!allowedRoles.includes(currentUser.userType)) {
        window.location.href = '../mainPage.html';
        return;
    }
    
    const courseCode = localStorage.getItem('currentCourse');
    const isReply = localStorage.getItem('replyingToComment');
    
    if (isReply && !getCommentById(isReply)) {
        localStorage.removeItem('replyingToComment');
    }
    
    const currentIsReply = localStorage.getItem('replyingToComment');
    
    if (currentIsReply) {
        document.getElementById('courseTitle').textContent = `Respond to Comment in ${courseCode}`;
        document.getElementById('formTitle').textContent = 'Post Your Response';
        
        if (currentUser.userType === 'course_instructor') {
            const originalComment = getCommentById(currentIsReply);
            if (originalComment) {
                document.getElementById('title').value = `Re: ${originalComment.title}`;
                document.getElementById('title').readOnly = true;
            }
        }
    } else {
        const formTitle = currentUser.userType === 'course_instructor' 
            ? 'Add Course Announcement' 
            : 'Add Comment';
        
        document.getElementById('courseTitle').textContent = `${formTitle} for ${courseCode}`;
        document.getElementById('formTitle').textContent = formTitle;
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
            userType: currentUser.userType, 
            date: new Date().toISOString(),
            isReply: !!currentIsReply,
            parentId: currentIsReply || null
        };

        try {
            let comments = JSON.parse(localStorage.getItem('courseComments') || []);
            comments.push(commentData);
            localStorage.setItem('courseComments', JSON.stringify(comments));
            await simulateSaveToJSON(commentData);
            
            if (currentIsReply) {
                localStorage.removeItem('replyingToComment');
            }
            
            const successMessage = currentIsReply ? 'Response posted successfully!' : 
                                     currentUser.userType === 'course_instructor' ? 'Announcement posted!' : 
                                     'Comment added successfully!';
            alert(successMessage);        
            window.location.href = '../mainPage.html';
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
});

function getCommentById(commentId) {
    if (!commentId) return null;
    const comments = JSON.parse(localStorage.getItem('courseComments') || []);
    return comments.find(c => c.id === commentId);
}

async function simulateSaveToJSON(newComment) {
    try {
        console.log('Would send to server to save in JSON:', newComment);
        const existingFromJSON = await fetch('../data/comments.json')
            .then(res => res.json())
            .catch(() => []);
        
        const combinedData = [...existingFromJSON, newComment];
        console.log('Combined data that would be saved:', combinedData);
    } catch (error) {
        console.error('Error simulating save:', error);
        throw error;
    }
}