document.addEventListener('DOMContentLoaded', function () {
    fetch('assessments.json')
        .then(response => response.json())
        .then(data => {
            generateSummaryReport(data);  
        })
        .catch(error => console.error("Error loading assessments:", error));
});

function generateSummaryReport(data) {
    let reportContainer = document.querySelector('#report');
    let table = `<table border="1">
                    <tr>
                        <th>Course</th>
                        <th>Homework</th>
                        <th>Quizzes</th>
                        <th>Project Phases</th>
                        <th>Exams</th>
                        <th>Total Assessments</th>
                        <th>Effort Hours</th>
                    </tr>`;

    let courses = [];
    let homeworks = [];
    let quizzes = [];
    let projectPhases = [];
    let exams = [];
    let totalAssessments = [];
    let effortHours = [];

    Object.keys(data).forEach(course => {
        let assessments = data[course];

        let totalHomeworks = assessments.filter(a => a.type === "Homework").length;
        let totalQuizzes = assessments.filter(a => a.type === "Quiz").length;
        let totalProjectPhases = assessments.filter(a => a.type === "Project").length;
        let totalExams = assessments.filter(a => a.type === "Midterm" || a.type === "Final").length;
        let totalAssessmentCount = totalHomeworks+totalQuizzes+totalProjectPhases+totalExams;
        let totalEffortHours = assessments.reduce((sum, a) => sum + a.effortHours, 0);

        courses.push(course);
        homeworks.push(totalHomeworks);
        quizzes.push(totalQuizzes);
        projectPhases.push(totalProjectPhases);
        exams.push(totalExams);
        totalAssessments.push(totalAssessmentCount);
        effortHours.push(totalEffortHours);

        table += `<tr>
                    <td>${course}</td>
                    <td>${totalHomeworks}</td>
                    <td>${totalQuizzes}</td>
                    <td>${totalProjectPhases}</td>
                    <td>${totalExams}</td>
                    <td>${totalAssessmentCount}</td>
                    <td>${totalEffortHours}</td>
                  </tr>`;
    });

    table += `</table>`;
    reportContainer.innerHTML = table;

    generateBarChart(courses, effortHours);
}

function generateBarChart(courses, effortHours) {
    let ctx = document.getElementById('barChart').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: courses, // X-axis: Courses
            datasets: [{
                label: 'Effort Hours',
                data: effortHours, // Y-axis: Effort Hours
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: "Effort Hours" }
                },
                x: {
                    title: { display: true, text: "Courses" }
                }
            }
        }
    });
}