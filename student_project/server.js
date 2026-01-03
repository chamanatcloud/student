const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// File path for storing users data
const USERS_FILE = path.join(__dirname, 'users.json');
const ENROLLMENTS_FILE = path.join(__dirname, 'enrollments.json');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'student-login-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// User storage - loaded from file
let users = [];

// Course enrollments storage
let enrollments = {};

// Available courses
const availableCourses = {
    'CS101': { id: 'CS101', name: 'Introduction to Computer Science', code: 'CS101', credits: 3, description: 'Fundamentals of computer science and programming concepts.', instructor: 'Dr. Smith' },
    'MATH201': { id: 'MATH201', name: 'Calculus I', code: 'MATH201', credits: 4, description: 'Differential and integral calculus with applications.', instructor: 'Prof. Johnson' },
    'ENG101': { id: 'ENG101', name: 'English Composition', code: 'ENG101', credits: 3, description: 'Develop writing skills and critical thinking through essays.', instructor: 'Dr. Williams' },
    'PHYS101': { id: 'PHYS101', name: 'Physics I', code: 'PHYS101', credits: 4, description: 'Mechanics, thermodynamics, and waves.', instructor: 'Dr. Brown' },
    'HIST101': { id: 'HIST101', name: 'World History', code: 'HIST101', credits: 3, description: 'Survey of world history from ancient to modern times.', instructor: 'Prof. Davis' },
    'CHEM101': { id: 'CHEM101', name: 'General Chemistry', code: 'CHEM101', credits: 4, description: 'Fundamental principles of chemistry and chemical reactions.', instructor: 'Dr. Miller' }
};

// Load users from JSON file
async function loadUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        const parsedData = JSON.parse(data);
        users = parsedData.users || [];
        
        // Convert date strings back to Date objects
        users.forEach(user => {
            if (user.createdAt && typeof user.createdAt === 'string') {
                user.createdAt = new Date(user.createdAt);
            }
        });
        
        console.log(`✅ Loaded ${users.length} user(s) from storage`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist yet, start with empty array
            console.log('📝 No existing users file found. Starting with empty database.');
            users = [];
        } else {
            console.error('❌ Error loading users:', error);
            users = [];
        }
    }
}

// Save users to JSON file
async function saveUsers() {
    try {
        const data = {
            users: users,
            lastUpdated: new Date().toISOString()
        };
        await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log(`💾 Saved ${users.length} user(s) to storage`);
    } catch (error) {
        console.error('❌ Error saving users:', error);
        throw error;
    }
}

// Load enrollments from JSON file
async function loadEnrollments() {
    try {
        const data = await fs.readFile(ENROLLMENTS_FILE, 'utf8');
        const parsedData = JSON.parse(data);
        enrollments = parsedData.enrollments || {};
        console.log(`✅ Loaded enrollments for ${Object.keys(enrollments).length} student(s)`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('📝 No existing enrollments file found. Starting with empty enrollments.');
            enrollments = {};
        } else {
            console.error('❌ Error loading enrollments:', error);
            enrollments = {};
        }
    }
}

// Save enrollments to JSON file
async function saveEnrollments() {
    try {
        const data = {
            enrollments: enrollments,
            lastUpdated: new Date().toISOString()
        };
        await fs.writeFile(ENROLLMENTS_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log(`💾 Saved enrollments to storage`);
    } catch (error) {
        console.error('❌ Error saving enrollments:', error);
        throw error;
    }
}

// Serve static files from the current directory
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/dashboard.html', (req, res) => {
    // Check if user is logged in
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'dashboard.html'));
    } else {
        res.redirect('/login.html');
    }
});

app.get('/students.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'students.html'));
});

app.get('/enrollments.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'enrollments.html'));
});

app.get('/shear-centre.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'shear-centre.html'));
});

app.get('/courses.html', (req, res) => {
    // Check if user is logged in
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'courses.html'));
    } else {
        res.redirect('/login.html');
    }
});

// API Routes
// Signup endpoint
app.post('/api/signup', async (req, res) => {
    try {
        const { fullName, email, studentId, password } = req.body;
        
        // Validation
        if (!fullName || !email || !studentId || !password) {
            return res.status(400).json({ 
                message: 'All fields are required' 
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ 
                message: 'Password must be at least 6 characters long' 
            });
        }
        
        // Check if user already exists
        const existingUser = users.find(u => u.email === email || u.studentId === studentId);
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Email or Student ID already exists' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = {
            id: users.length + 1,
            fullName,
            email,
            studentId,
            password: hashedPassword,
            createdAt: new Date()
        };
        
        users.push(newUser);
        
        // Save to file
        await saveUsers();
        
        res.status(201).json({ 
            message: 'Account created successfully',
            user: {
                name: newUser.fullName,
                email: newUser.email,
                studentId: newUser.studentId
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            message: 'Server error. Please try again.' 
        });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required' 
            });
        }
        
        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }
        
        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }
        
        // Create session
        req.session.user = {
            id: user.id,
            name: user.fullName,
            email: user.email,
            studentId: user.studentId
        };
        
        res.json({ 
            message: 'Login successful',
            name: user.fullName,
            email: user.email,
            studentId: user.studentId
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error. Please try again.' 
        });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                message: 'Error logging out' 
            });
        }
        res.json({ 
            message: 'Logged out successfully' 
        });
    });
});

// Get current user endpoint
app.get('/api/user', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ 
            message: 'Not authenticated' 
        });
    }
});

// Get all students endpoint
app.get('/api/students', (req, res) => {
    try {
        // Return all students without passwords
        const studentsList = users.map(user => ({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            studentId: user.studentId,
            createdAt: user.createdAt
        }));
        
        res.json({ 
            students: studentsList,
            count: studentsList.length
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ 
            message: 'Server error. Please try again.' 
        });
    }
});

// Get student's enrolled courses
app.get('/api/student/courses', async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ 
                message: 'Email is required' 
            });
        }
        
        const studentCourses = enrollments[email] || [];
        
        res.json({ 
            courses: studentCourses,
            count: studentCourses.length
        });
    } catch (error) {
        console.error('Error fetching student courses:', error);
        res.status(500).json({ 
            message: 'Server error. Please try again.' 
        });
    }
});

// Enroll in a course
app.post('/api/student/enroll', async (req, res) => {
    try {
        const { email, courseId } = req.body;
        
        if (!email || !courseId) {
            return res.status(400).json({ 
                message: 'Email and course ID are required' 
            });
        }
        
        // Check if course exists
        if (!availableCourses[courseId]) {
            return res.status(400).json({ 
                message: 'Invalid course ID' 
            });
        }
        
        // Initialize enrollments for student if not exists
        if (!enrollments[email]) {
            enrollments[email] = [];
        }
        
        // Check if already enrolled
        if (enrollments[email].includes(courseId)) {
            return res.status(400).json({ 
                message: 'Already enrolled in this course' 
            });
        }
        
        // Add course to enrollments
        enrollments[email].push(courseId);
        
        // Save to file
        await saveEnrollments();
        
        res.json({ 
            message: 'Successfully enrolled in course',
            courseName: availableCourses[courseId].name,
            courseId: courseId
        });
    } catch (error) {
        console.error('Error enrolling in course:', error);
        res.status(500).json({ 
            message: 'Server error. Please try again.' 
        });
    }
});

// Unenroll from a course
app.post('/api/student/unenroll', async (req, res) => {
    try {
        const { email, courseId } = req.body;
        
        if (!email || !courseId) {
            return res.status(400).json({ 
                message: 'Email and course ID are required' 
            });
        }
        
        // Check if student has enrollments
        if (!enrollments[email] || !enrollments[email].includes(courseId)) {
            return res.status(400).json({ 
                message: 'Not enrolled in this course' 
            });
        }
        
        // Remove course from enrollments
        enrollments[email] = enrollments[email].filter(id => id !== courseId);
        
        // Save to file
        await saveEnrollments();
        
        res.json({ 
            message: 'Successfully unenrolled from course',
            courseName: availableCourses[courseId]?.name || courseId,
            courseId: courseId
        });
    } catch (error) {
        console.error('Error unenrolling from course:', error);
        res.status(500).json({ 
            message: 'Server error. Please try again.' 
        });
    }
});

// Get all enrollments (for admin view)
app.get('/api/enrollments/all', (req, res) => {
    try {
        res.json({ 
            enrollments: enrollments,
            count: Object.keys(enrollments).length
        });
    } catch (error) {
        console.error('Error fetching all enrollments:', error);
        res.status(500).json({ 
            message: 'Server error. Please try again.' 
        });
    }
});

// Initialize and start the server
async function startServer() {
    // Load users and enrollments from file before starting server
    await loadUsers();
    await loadEnrollments();
    
    // Start the server
    app.listen(PORT, () => {
        console.log(`\n🚀 Student Login Server is running!`);
        console.log(`📱 Open your browser and navigate to:`);
        console.log(`   http://localhost:${PORT}`);
        console.log(`\n📝 Available pages:`);
        console.log(`   - Login: http://localhost:${PORT}/login.html`);
        console.log(`   - Signup: http://localhost:${PORT}/signup.html`);
        console.log(`   - Dashboard: http://localhost:${PORT}/dashboard.html`);
        console.log(`   - Courses: http://localhost:${PORT}/courses.html`);
        console.log(`   - All Students: http://localhost:${PORT}/students.html`);
        console.log(`   - Enrollments: http://localhost:${PORT}/enrollments.html`);
        console.log(`\n💾 Data persistence: Enabled (users.json, enrollments.json)\n`);
    });
}

// Start the server
startServer();

