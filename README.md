# Web-Development-Project-G2
# Ruaa Elshiekh 202208914
# Dima Faris 202208793
# Asma Abdi 202004957
# Saeeda Al Marri 202106704


## Project Overview
A web application for students to:
- Track course assessments (exams, projects, homework)
- Manage deadlines
- Add comments for feedback
- Estimate workload
- Sync with Google Calendar
- Have a user friendly website


### 1. User System
- Login with saved credentials
- Have different access according to your role (student, instructor, course coordinator)
- Using JSON files to save the users and fetch it during login process

### 2. Assessment Management
- Add/edit assessments:
  - Types: Quizzes, Homework, Projects, Exams
  - Due dates
  - Weight percentages
  - Effort estimates
- Automatic input validation
- Visual calendar display

### 3. Calendar Integration
- Interactive FullCalendar view
- Color-coded assessment types
- Google Calendar export

### Languages used
- HTML5, CSS3, JavaScript
- FullCalendar.js (v6.1.8)
- LocalStorage API to fetch and save data in the website

### Project Structure
Web-Development-Project-G2/
├── mainPage.html     
├── main.js   
├── README.md
├── styles.css
├── classDiagram.jpeg   
├── htmls/
│   ├── login.html      
│   └── addComment.html  
│   └── assessments.html
│   └── calendar.html 
│   └── getComments.html
│   └── add.html  
│   └── report.html  
├── javascripts/
│   ├── add.js        
│   ├── login.js     
│   └── backButton.js 
│   └── reportscript.js   
│   └── script.js   
│   └── addComments.js            
├── data/
│   └── assessments.json   
│   └── comments.json  
│   └── users.json  
└── results/
    └── example.png 

## Data
- Assessments: It saves each assessment with its title, due date, type and corresponding course 
- Comments: It saves each comment with the title, content, course and the replies with the dates
- Users: It saves each user and their logins and their type (instructor, student or course coordinator)


### Dividing Work
# Ruaa Elshiekh 
- Comments 
- Main JS 
- Main HTML
# Dima Faris 
- Calendar
- Script
- Main JS
# Asma Abdi 
- Delete assessment
- Update assessment
- Get assessment
# Saeeda Al Marri 
- Login
- Add assessment
- Main HTML
- Main JS