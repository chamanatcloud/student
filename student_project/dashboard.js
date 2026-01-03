// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadStudentInfo();
});

function checkAuth() {
    const studentEmail = sessionStorage.getItem('studentEmail');
    
    if (!studentEmail) {
        // Not logged in, redirect to login
        window.location.href = '/login.html';
        return;
    }
}

function loadStudentInfo() {
    const studentName = sessionStorage.getItem('studentName') || 'Student';
    const studentEmail = sessionStorage.getItem('studentEmail') || '-';
    const studentId = sessionStorage.getItem('studentId') || '-';
    const loginTime = sessionStorage.getItem('loginTime') || new Date().toLocaleString();
    
    document.getElementById('studentName').textContent = studentName;
    document.getElementById('studentEmail').textContent = studentEmail;
    document.getElementById('studentId').textContent = studentId;
    document.getElementById('loginTime').textContent = loginTime;
}

function logout() {
    // Clear session storage
    sessionStorage.clear();
    
    // Redirect to login
    window.location.href = '/login.html';
}

