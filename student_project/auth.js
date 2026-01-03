// Handle login form submission
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Play success sound
            if (typeof playSuccessSound === 'function') {
                playSuccessSound();
            }
            
            // Store user info in sessionStorage
            sessionStorage.setItem('studentName', data.name);
            sessionStorage.setItem('studentEmail', data.email);
            sessionStorage.setItem('studentId', data.studentId);
            sessionStorage.setItem('loginTime', new Date().toLocaleString());
            
            // Show success animation before redirect
            createConfetti();
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        } else {
            errorMessage.textContent = data.message || 'Login failed. Please check your credentials.';
            errorMessage.classList.add('show');
        }
    } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.classList.add('show');
        console.error('Login error:', error);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const studentId = document.getElementById('studentId').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    errorMessage.classList.remove('show');
    successMessage.classList.remove('show');
    errorMessage.textContent = '';
    successMessage.textContent = '';
    
    // Client-side validation
    if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match!';
        errorMessage.classList.add('show');
        return;
    }
    
    if (password.length < 6) {
        errorMessage.textContent = 'Password must be at least 6 characters long!';
        errorMessage.classList.add('show');
        return;
    }
    
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                fullName, 
                email, 
                studentId, 
                password 
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Play success sound
            if (typeof playSuccessSound === 'function') {
                playSuccessSound();
            }
            
            successMessage.textContent = '🎉 Account created successfully! Redirecting to login... 🎉';
            successMessage.classList.add('show');
            
            // Create confetti
            if (typeof createConfetti === 'function') {
                createConfetti();
            }
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else {
            errorMessage.textContent = data.message || 'Registration failed. Please try again.';
            errorMessage.classList.add('show');
        }
    } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.classList.add('show');
        console.error('Signup error:', error);
    }
}

