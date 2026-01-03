// Available courses data
const availableCourses = [
    {
        id: 'CS101',
        name: 'Introduction to Computer Science',
        code: 'CS101',
        credits: 3,
        description: 'Fundamentals of computer science and programming concepts.',
        instructor: 'Dr. Smith'
    },
    {
        id: 'MATH201',
        name: 'Calculus I',
        code: 'MATH201',
        credits: 4,
        description: 'Differential and integral calculus with applications.',
        instructor: 'Prof. Johnson'
    },
    {
        id: 'ENG101',
        name: 'English Composition',
        code: 'ENG101',
        credits: 3,
        description: 'Develop writing skills and critical thinking through essays.',
        instructor: 'Dr. Williams'
    },
    {
        id: 'PHYS101',
        name: 'Physics I',
        code: 'PHYS101',
        credits: 4,
        description: 'Mechanics, thermodynamics, and waves.',
        instructor: 'Dr. Brown'
    },
    {
        id: 'HIST101',
        name: 'World History',
        code: 'HIST101',
        credits: 3,
        description: 'Survey of world history from ancient to modern times.',
        instructor: 'Prof. Davis'
    },
    {
        id: 'CHEM101',
        name: 'General Chemistry',
        code: 'CHEM101',
        credits: 4,
        description: 'Fundamental principles of chemistry and chemical reactions.',
        instructor: 'Dr. Miller'
    }
];

let enrolledCourses = [];

// Load page data
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadEnrolledCourses();
    displayCourses();
});

function checkAuth() {
    const studentEmail = sessionStorage.getItem('studentEmail');
    if (!studentEmail) {
        window.location.href = '/login.html';
        return;
    }
}

async function loadEnrolledCourses() {
    const studentEmail = sessionStorage.getItem('studentEmail');
    
    try {
        const response = await fetch(`/api/student/courses?email=${encodeURIComponent(studentEmail)}`);
        if (response.ok) {
            const data = await response.json();
            enrolledCourses = data.courses || [];
        }
    } catch (error) {
        console.error('Error loading enrolled courses:', error);
    }
    
    displayEnrolledCourses();
}

function displayCourses() {
    const loadingMessage = document.getElementById('loadingMessage');
    const coursesGrid = document.getElementById('coursesGrid');
    
    loadingMessage.style.display = 'none';
    coursesGrid.style.display = 'grid';
    coursesGrid.innerHTML = '';
    
    availableCourses.forEach(course => {
        const isEnrolled = enrolledCourses.some(ec => ec.id === course.id);
        
        const courseCard = document.createElement('div');
        courseCard.className = `course-card ${isEnrolled ? 'enrolled' : ''}`;
        
        courseCard.innerHTML = `
            <div class="course-code">${course.code}</div>
            <h3>${course.name}</h3>
            <p>${course.description}</p>
            <p><strong>Instructor:</strong> ${course.instructor}</p>
            <p class="course-credits"><strong>Credits:</strong> ${course.credits}</p>
            <span class="badge ${isEnrolled ? 'badge-enrolled' : 'badge-available'}">
                ${isEnrolled ? '✓ Enrolled' : 'Available'}
            </span>
            <button 
                class="enroll-btn ${isEnrolled ? 'enrolled' : ''}" 
                onclick="toggleEnrollment('${course.id}')"
                ${isEnrolled ? 'disabled' : ''}
            >
                ${isEnrolled ? 'Enrolled' : 'Enroll Now'}
            </button>
        `;
        
        coursesGrid.appendChild(courseCard);
    });
}

function displayEnrolledCourses() {
    const enrolledContainer = document.getElementById('enrolledCourses');
    const noEnrolledMessage = document.getElementById('noEnrolledMessage');
    
    if (enrolledCourses.length === 0) {
        enrolledContainer.innerHTML = '';
        noEnrolledMessage.style.display = 'block';
        return;
    }
    
    noEnrolledMessage.style.display = 'none';
    enrolledContainer.innerHTML = '';
    
    enrolledCourses.forEach(courseId => {
        const course = availableCourses.find(c => c.id === courseId);
        if (!course) {
            // If courseId is a string, try to find it directly
            const foundCourse = availableCourses.find(c => c.id === courseId || c.code === courseId);
            if (foundCourse) {
                const courseCard = document.createElement('div');
                courseCard.className = 'course-card enrolled';
                
                courseCard.innerHTML = `
                    <div class="course-code">${foundCourse.code}</div>
                    <h3>${foundCourse.name}</h3>
                    <p>${foundCourse.description}</p>
                    <p><strong>Instructor:</strong> ${foundCourse.instructor}</p>
                    <p class="course-credits"><strong>Credits:</strong> ${foundCourse.credits}</p>
                    <span class="badge badge-enrolled">✓ Enrolled</span>
                    <button class="enroll-btn enrolled" onclick="unenroll('${foundCourse.id}')">
                        Unenroll
                    </button>
                `;
                
                enrolledContainer.appendChild(courseCard);
            }
        } else {
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card enrolled';
            
            courseCard.innerHTML = `
                <div class="course-code">${course.code}</div>
                <h3>${course.name}</h3>
                <p>${course.description}</p>
                <p><strong>Instructor:</strong> ${course.instructor}</p>
                <p class="course-credits"><strong>Credits:</strong> ${course.credits}</p>
                <span class="badge badge-enrolled">✓ Enrolled</span>
                <button class="enroll-btn enrolled" onclick="unenroll('${course.id}')">
                    Unenroll
                </button>
            `;
            
            enrolledContainer.appendChild(courseCard);
        }
    });
}

async function toggleEnrollment(courseId) {
    const studentEmail = sessionStorage.getItem('studentEmail');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    
    try {
        const response = await fetch('/api/student/enroll', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: studentEmail,
                courseId: courseId
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            successMessage.textContent = `Successfully enrolled in ${data.courseName}!`;
            successMessage.style.display = 'block';
            
            // Reload courses
            await loadEnrolledCourses();
            displayCourses();
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
        } else {
            errorMessage.textContent = data.message || 'Failed to enroll in course.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
        console.error('Enrollment error:', error);
    }
}

async function unenroll(courseId) {
    if (!confirm('Are you sure you want to unenroll from this course?')) {
        return;
    }
    
    const studentEmail = sessionStorage.getItem('studentEmail');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    
    try {
        const response = await fetch('/api/student/unenroll', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: studentEmail,
                courseId: courseId
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            successMessage.textContent = `Successfully unenrolled from ${data.courseName}!`;
            successMessage.style.display = 'block';
            
            // Reload courses
            await loadEnrolledCourses();
            displayCourses();
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
        } else {
            errorMessage.textContent = data.message || 'Failed to unenroll from course.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
        console.error('Unenrollment error:', error);
    }
}

