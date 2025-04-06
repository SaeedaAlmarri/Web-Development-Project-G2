document.addEventListener('DOMContentLoaded', function () {
    loadAndGenerateReport();
});

function loadAndGenerateReport() {
    const storedUser = localStorage.getItem('currentUser');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    if (!currentUser || !currentUser.courses) {
        document.getElementById('report').innerHTML = '<p>No user information or courses found.</p>';
        return;
    }

    const storedAssessments = localStorage.getItem('assessmentsData');
    let assessmentsData = storedAssessments ? JSON.parse(storedAssessments) : {};

    const userCourses = currentUser.courses;
    const filteredAssessmentsData = {};

    userCourses.forEach(courseCode => {
        if (assessmentsData[courseCode]) {
            filteredAssessmentsData[courseCode] = assessmentsData[courseCode];
        }
    });

    generateSummaryReport(filteredAssessmentsData);
}

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
        const assessmentsForCourse = data[course]?.assessments || [];

        let totalHomeworks = assessmentsForCourse.filter(a => a.type === "Homework").length;
        let totalQuizzes = assessmentsForCourse.filter(a => a.type === "Quiz").length;
        let totalProjectPhases = assessmentsForCourse.filter(a => a.type.startsWith("Project Phase")).length;
        let totalExams = assessmentsForCourse.filter(a => a.type === "Midterm" || a.type === "Final Exam").length;
        let totalAssessmentCount = totalHomeworks + totalQuizzes + totalProjectPhases + totalExams;
        let totalEffortHours = assessmentsForCourse.reduce((sum, a) => sum + parseInt(a.effort_hours || 0), 0);

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