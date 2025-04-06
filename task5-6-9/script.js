document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: [],
        eventDidMount: function(info) {
            let googleCalendarUrl = createGoogleCalendarLink(info.event);
            let button = document.createElement('a');
            button.href = googleCalendarUrl;
            button.target = '_blank';
            button.innerText = '📅 Add to Google Calendar';
            button.classList.add('google-calendar-btn');
            info.el.appendChild(button);
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
                allEvents.push({
                    title: `${courseCode} - ${assessment.title}`,
                    date: assessment.due_date,
                    color: getColorByType(assessment.type),
                    extendedProps: {
                        effortHours: parseInt(assessment.effort_hours || 0),
                        weight: parseInt(assessment.weight || 0)
                    }
                });
            });
        }
    });

    calendar.addEventSource(allEvents);
}

function getColorByType(type) {
    switch (type) {
        case 'Quiz': return 'blue';
        case 'Homework': return 'orange';
        case 'Project Phase': return 'green';
        case 'Midterm': return 'red';
        case 'Final Exam': return 'black';
        default: return 'gray';
    }
}

function createGoogleCalendarLink(event) {
    let startDate = event.startStr;
    let endDate = event.startStr;  // Single-day events
    let title = encodeURIComponent(event.title);
    let details = encodeURIComponent(`Effort Hours: ${event.extendedProps.effortHours} hrs\nWeight: ${event.extendedProps.weight}%`);

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&sf=true&output=xml`;
}