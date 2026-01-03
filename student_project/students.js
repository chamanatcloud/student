// Load students when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadStudents();
});

async function loadStudents() {
    const loadingMessage = document.getElementById('loadingMessage');
    const studentsTable = document.getElementById('studentsTable');
    const studentsTableBody = document.getElementById('studentsTableBody');
    const noStudentsMessage = document.getElementById('noStudentsMessage');
    const errorMessage = document.getElementById('errorMessage');
    const totalStudents = document.getElementById('totalStudents');
    const todayCount = document.getElementById('todayCount');
    
    // Show loading, hide others
    loadingMessage.style.display = 'block';
    studentsTable.style.display = 'none';
    noStudentsMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    
    try {
        const response = await fetch('/api/students');
        const data = await response.json();
        
        if (response.ok) {
            loadingMessage.style.display = 'none';
            
            if (data.students && data.students.length > 0) {
                // Display students table
                studentsTable.style.display = 'table';
                studentsTableBody.innerHTML = '';
                
                // Count students registered today
                const today = new Date().toDateString();
                const todayStudents = data.students.filter(student => {
                    const regDate = new Date(student.createdAt).toDateString();
                    return regDate === today;
                });
                
                // Update stats
                totalStudents.textContent = data.students.length;
                todayCount.textContent = todayStudents.length;
                
                // Populate table
                data.students.forEach((student, index) => {
                    const row = document.createElement('tr');
                    const regDate = new Date(student.createdAt).toLocaleString();
                    
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td><strong>${student.fullName}</strong></td>
                        <td>${student.email}</td>
                        <td>${student.studentId}</td>
                        <td>${regDate}</td>
                    `;
                    
                    studentsTableBody.appendChild(row);
                });
            } else {
                // No students
                noStudentsMessage.style.display = 'block';
                totalStudents.textContent = '0';
                todayCount.textContent = '0';
            }
        } else {
            loadingMessage.style.display = 'none';
            errorMessage.textContent = data.message || 'Failed to load students.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        loadingMessage.style.display = 'none';
        errorMessage.textContent = 'An error occurred while loading students. Please try again.';
        errorMessage.style.display = 'block';
        console.error('Error loading students:', error);
    }
}

