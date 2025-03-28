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

    fetch('assessments.json')
        .then(response => response.json())
        .then(data => {
            let allEvents = [];

            Object.keys(data).forEach(course => {
                data[course].forEach(assessment => {
                    allEvents.push({
                        title: `${course} - ${assessment.title}`, 
                        date: assessment.date,
                        color: getColorByType(assessment.type),
                        extendedProps: {
                            effortHours: assessment.effortHours,
                            weight: assessment.weight
                        }
                    });
                });
            });

            calendar.addEventSource(allEvents);
        })
        .catch(error => console.error("Error loading assessments:", error));

    function getColorByType(type) {
        switch (type) {
            case 'Quiz': return 'blue';
            case 'Homework': return 'orange';
            case 'Project': return 'green';
            case 'Midterm Exam': return 'red';
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
});