let enrollmentsData = {};
let studentsData = [];
let currentView = 'byStudent';

// Available courses mapping
const courseNames = {
    'CS101': 'Introduction to Computer Science',
    'MATH201': 'Calculus I',
    'ENG101': 'English Composition',
    'PHYS101': 'Physics I',
    'HIST101': 'World History',
    'CHEM101': 'General Chemistry'
};

// Load page data
document.addEventListener('DOMContentLoaded', function() {
    loadEnrollments();
});

async function loadEnrollments() {
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const noDataMessage = document.getElementById('noDataMessage');
    
    loadingMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    noDataMessage.style.display = 'none';
    
    try {
        // Load enrollments
        const enrollmentsResponse = await fetch('/api/enrollments/all');
        if (!enrollmentsResponse.ok) {
            throw new Error('Failed to load enrollments');
        }
        const enrollmentsResult = await enrollmentsResponse.json();
        enrollmentsData = enrollmentsResult.enrollments || {};
        
        // Load students
        const studentsResponse = await fetch('/api/students');
        if (!studentsResponse.ok) {
            throw new Error('Failed to load students');
        }
        const studentsResult = await studentsResponse.json();
        studentsData = studentsResult.students || [];
        
        loadingMessage.style.display = 'none';
        
        // Update statistics
        updateStatistics();
        
        // Display based on current view
        if (Object.keys(enrollmentsData).length === 0) {
            noDataMessage.style.display = 'block';
            hideAllViews();
        } else {
            displayCurrentView();
        }
    } catch (error) {
        loadingMessage.style.display = 'none';
        errorMessage.textContent = 'An error occurred while loading enrollments. Please try again.';
        errorMessage.style.display = 'block';
        console.error('Error loading enrollments:', error);
    }
}

function updateStatistics() {
    let totalEnrollments = 0;
    let studentsEnrolled = 0;
    const courseSet = new Set();
    
    Object.keys(enrollmentsData).forEach(email => {
        if (enrollmentsData[email] && enrollmentsData[email].length > 0) {
            studentsEnrolled++;
            enrollmentsData[email].forEach(courseId => {
                totalEnrollments++;
                courseSet.add(courseId);
            });
        }
    });
    
    document.getElementById('totalEnrollments').textContent = totalEnrollments;
    document.getElementById('studentsEnrolled').textContent = studentsEnrolled;
    document.getElementById('activeCourses').textContent = courseSet.size;
}

function switchView(view) {
    currentView = view;
    
    // Update button states
    document.getElementById('btnByStudent').classList.toggle('active', view === 'byStudent');
    document.getElementById('btnByCourse').classList.toggle('active', view === 'byCourse');
    document.getElementById('btnTable').classList.toggle('active', view === 'table');
    
    displayCurrentView();
}

function displayCurrentView() {
    hideAllViews();
    
    switch (currentView) {
        case 'byStudent':
            displayByStudent();
            break;
        case 'byCourse':
            displayByCourse();
            break;
        case 'table':
            displayTable();
            break;
    }
}

function hideAllViews() {
    document.getElementById('viewByStudent').style.display = 'none';
    document.getElementById('viewByCourse').style.display = 'none';
    document.getElementById('viewTable').style.display = 'none';
}

function displayByStudent() {
    const container = document.getElementById('studentsList');
    container.innerHTML = '';
    
    if (Object.keys(enrollmentsData).length === 0) {
        container.innerHTML = '<div class="no-data"><p>No enrollments found.</p></div>';
        return;
    }
    
    studentsData.forEach(student => {
        const studentEmail = student.email;
        const courses = enrollmentsData[studentEmail] || [];
        
        if (courses.length === 0) return; // Skip students with no enrollments
        
        const studentCard = document.createElement('div');
        studentCard.className = 'student-card';
        
        studentCard.innerHTML = `
            <h3>${student.fullName}</h3>
            <div class="student-info"><strong>Email:</strong> ${student.email}</div>
            <div class="student-info"><strong>Student ID:</strong> ${student.studentId}</div>
            <div class="courses-list">
                ${courses.map(courseId => 
                    `<span class="course-badge">${courseId} - ${courseNames[courseId] || courseId}</span>`
                ).join('')}
            </div>
        `;
        
        container.appendChild(studentCard);
    });
    
    document.getElementById('viewByStudent').style.display = 'block';
}

function displayByCourse() {
    const container = document.getElementById('coursesList');
    container.innerHTML = '';
    
    // Get all unique courses
    const allCourses = new Set();
    Object.values(enrollmentsData).forEach(courses => {
        courses.forEach(courseId => allCourses.add(courseId));
    });
    
    if (allCourses.size === 0) {
        container.innerHTML = '<div class="no-data"><p>No enrollments found.</p></div>';
        return;
    }
    
    Array.from(allCourses).sort().forEach(courseId => {
        // Find all students enrolled in this course
        const enrolledStudents = studentsData.filter(student => {
            const studentCourses = enrollmentsData[student.email] || [];
            return studentCourses.includes(courseId);
        });
        
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        
        courseCard.innerHTML = `
            <h3>${courseId} - ${courseNames[courseId] || courseId}</h3>
            <p><strong>Enrolled Students:</strong> ${enrolledStudents.length}</p>
            <ul class="student-list">
                ${enrolledStudents.map(student => 
                    `<li><strong>${student.fullName}</strong> (${student.studentId})<br><small>${student.email}</small></li>`
                ).join('')}
            </ul>
        `;
        
        container.appendChild(courseCard);
    });
    
    document.getElementById('viewByCourse').style.display = 'block';
}

function displayTable() {
    const tbody = document.getElementById('enrollmentsTableBody');
    tbody.innerHTML = '';
    
    let index = 1;
    
    studentsData.forEach(student => {
        const studentEmail = student.email;
        const courses = enrollmentsData[studentEmail] || [];
        
        if (courses.length === 0) return; // Skip students with no enrollments
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index++}</td>
            <td><strong>${student.fullName}</strong></td>
            <td>${student.email}</td>
            <td>${student.studentId}</td>
            <td>
                ${courses.map(courseId => 
                    `<span class="course-badge">${courseId}</span>`
                ).join('')}
            </td>
            <td><strong>${courses.length}</strong></td>
        `;
        
        tbody.appendChild(row);
    });
    
    document.getElementById('viewTable').style.display = 'block';
}

