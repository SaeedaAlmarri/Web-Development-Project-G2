document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [],
        eventContent: function(arg) {
            let titleEl = document.createElement('div');
            titleEl.classList.add('fc-event-title');
            titleEl.innerText = arg.event.title;
            
            let container = document.createElement('div');
            container.classList.add('fc-event-main');
            container.appendChild(titleEl);
            
            return { domNodes: [container] };
        },
        eventDidMount: function(info) {
            let googleCalendarUrl = createGoogleCalendarLink(info.event);
            let button = document.createElement('a');
            button.href = googleCalendarUrl;
            button.target = '_blank';
            button.innerText = 'Add to Google Calendar';
            button.classList.add('google-calendar-btn', 'btn', 'btn-small');
            info.el.appendChild(button);
            
            
            const eventHeight = info.el.scrollHeight;
            info.el.style.height = `${eventHeight}px`;
        }
    });
    calendar.render();
    loadAndAddCalendarEvents(calendar);
});

function loadAndAddCalendarEvents(calendar) {
    const storedUser = localStorage.getItem('currentUser');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    if (!currentUser || !currentUser.courses) {
        console.log('No user information or courses found for calendar.');
        return;
    }

    const storedAssessments = localStorage.getItem('assessmentsData');
    let assessmentsData = storedAssessments ? JSON.parse(storedAssessments) : {};
    let allEvents = [];
    const userCourses = currentUser.courses;

    Object.keys(assessmentsData).forEach(courseCode => {
        if (userCourses.includes(courseCode)) {
            const course = assessmentsData[courseCode];
            course?.assessments?.forEach(assessment => {
                
                const shortTitle = assessment.title.length > 20 
                    ? `${assessment.title.substring(0, 20)}...` 
                    : assessment.title;
                
                allEvents.push({
                    title: `${courseCode} - ${shortTitle}`,
                    date: assessment.due_date,
                    color: getColorByType(assessment.type),
                    extendedProps: {
                        fullTitle: `${courseCode} - ${assessment.title}`,
                        effortHours: parseInt(assessment.effort_hours || 0),
                        weight: parseInt(assessment.weight || 0),
                        type: assessment.type
                    }
                });
            });
        }
    });

    calendar.addEventSource(allEvents);
}

function getColorByType(type) {
    switch (type) {
        case 'Quiz': return '#4285F4';
        case 'Homework': return '#FBBC05'; 
        case 'Project Phase': return '#34A853'; 
        case 'Midterm': return '#EA4335'; 
        case 'Final Exam': return '#673AB7'; 
        default: return '#9E9E9E'; 
    }
}

function createGoogleCalendarLink(event) {
    let startDate = event.startStr;
    let endDate = event.startStr;  
    let title = encodeURIComponent(event.extendedProps.fullTitle || event.title);
    let details = encodeURIComponent(
        `Type: ${event.extendedProps.type}\n` +
        `Effort Hours: ${event.extendedProps.effortHours} hrs\n` +
        `Weight: ${event.extendedProps.weight}%`
    );

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&sf=true&output=xml`;
}