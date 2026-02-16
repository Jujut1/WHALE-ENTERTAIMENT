/* ============================================
   BLUEWHALE AUTH SYSTEM - MASTER JAVASCRIPT
   Version: 3.0 PRO MAX (FIXED & OPTIMIZED)
   Author: JejeDev
   Last Updated: 2026
   ============================================ */

// ============================================
// GLOBAL VARIABLES & CONFIGURATION
// ============================================
const CONFIG = {
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 menit dalam milliseconds
    DEFAULT_USERS: [
        {
            id: '1',
            firstName: 'Jeje',
            lastName: 'Dev',
            username: 'jejedev',
            email: 'jeje@bluewhale.com',
            password: btoa('admin123') + '_hash',
            joinDate: '2024-01-15',
            lastLogin: null,
            status: 'active',
            loginHistory: []
        },
        {
            id: '2',
            firstName: 'Demo',
            lastName: 'User',
            username: 'demouser',
            email: 'demo@bluewhale.com',
            password: btoa('demo123') + '_hash',
            joinDate: '2024-02-20',
            lastLogin: null,
            status: 'active',
            loginHistory: []
        },
        {
            id: '3',
            firstName: 'Test',
            lastName: 'Account',
            username: 'testacc',
            email: 'test@bluewhale.com',
            password: btoa('test123') + '_hash',
            joinDate: '2024-03-01',
            lastLogin: null,
            status: 'active',
            loginHistory: []
        }
    ]
};

// State management
let AppState = {
    isVerified: false,
    currentUser: null,
    mathAnswer: 0,
    isDragging: false,
    dragStartX: 0,
    users: [],
    session: null
};

// ============================================
// INITIALIZATION - RUNS ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 BlueWhale System Activated - Version 3.0');
    
    // Initialize database
    initializeDatabase();
    
    // Load users ke memory
    loadUsersFromStorage();
    
    // Check session
    checkSession();
    
    // Setup berdasarkan halaman
    const path = window.location.pathname;
    setupPageBasedOnURL(path);
    
    // Global event listeners
    setupGlobalEventListeners();
    
    // Welcome message
    setTimeout(() => {
        if (!window.location.pathname.includes('dashboard.html')) {
            showBubble('🚀 Welcome to BlueWhale Auth System!', 'info', 'info-circle');
        }
    }, 1000);
});

// ============================================
// DATABASE FUNCTIONS
// ============================================
function initializeDatabase() {
    if (!localStorage.getItem('bluewhale_users')) {
        localStorage.setItem('bluewhale_users', JSON.stringify(CONFIG.DEFAULT_USERS));
        console.log('✅ Database initialized with default users');
    }
}

function loadUsersFromStorage() {
    try {
        AppState.users = JSON.parse(localStorage.getItem('bluewhale_users')) || [];
    } catch (e) {
        console.error('Error loading users:', e);
        AppState.users = [];
    }
}

function saveUsersToStorage() {
    try {
        localStorage.setItem('bluewhale_users', JSON.stringify(AppState.users));
    } catch (e) {
        console.error('Error saving users:', e);
        showBubble('❌ Failed to save data', 'error', 'exclamation-triangle');
    }
}

// Password hashing (simple - for demo only)
function hashPassword(password) {
    return btoa(password) + '_hash';
}

function verifyPassword(inputPassword, storedPassword) {
    return hashPassword(inputPassword) === storedPassword;
}

// ============================================
// SESSION MANAGEMENT
// ============================================
function checkSession() {
    const sessionStr = sessionStorage.getItem('bluewhale_session');
    if (!sessionStr) return false;
    
    try {
        const session = JSON.parse(sessionStr);
        const loginTime = new Date(session.loginTime).getTime();
        const now = new Date().getTime();
        
        // Check if session expired
        if (now - loginTime > CONFIG.SESSION_TIMEOUT) {
            sessionStorage.removeItem('bluewhale_session');
            showBubble('⏰ Session expired. Please login again.', 'warning', 'clock');
            return false;
        }
        
        // Find user
        AppState.currentUser = AppState.users.find(u => u.id === session.userId);
        AppState.session = session;
        
        return !!AppState.currentUser;
    } catch (e) {
        console.error('Session error:', e);
        sessionStorage.removeItem('bluewhale_session');
        return false;
    }
}

function createSession(user) {
    const session = {
        userId: user.id,
        loginTime: new Date().toISOString()
    };
    sessionStorage.setItem('bluewhale_session', JSON.stringify(session));
    AppState.session = session;
    AppState.currentUser = user;
}

function destroySession() {
    sessionStorage.removeItem('bluewhale_session');
    AppState.session = null;
    AppState.currentUser = null;
}

// ============================================
// PAGE SETUP BASED ON URL
// ============================================
function setupPageBasedOnURL(path) {
    if (path.includes('login.html')) {
        setupLoginPage();
    } else if (path.includes('register.html')) {
        setupRegisterPage();
    } else if (path.includes('dashboard.html')) {
        setupDashboardPage();
    } else if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        setupLandingPage();
    }
}

// ============================================
// LOGIN PAGE SETUP
// ============================================
function setupLoginPage() {
    console.log('🔐 Setting up login page...');
    
    // Reset verification state
    AppState.isVerified = false;
    
    // Setup slider verification
    setupSliderVerification();
    
    // Setup form submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Setup toggle password
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            togglePasswordVisibility(this);
        });
    });
    
    // Setup demo users click
    const demoUsersBtn = document.querySelector('.demo-users');
    if (demoUsersBtn) {
        demoUsersBtn.addEventListener('click', showDemoUsers);
    }
    
    // Auto-fill demo (for testing) - hapus di production
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') {
        document.getElementById('loginIdentifier').value = 'demo@bluewhale.com';
        document.getElementById('loginPassword').value = 'demo123';
    }
}

// Slider Verification
function setupSliderVerification() {
    const slider = document.querySelector('.slider-verify');
    const thumb = document.querySelector('.slider-thumb');
    const verifyStatus = document.getElementById('verifyStatus');
    const loginBtn = document.getElementById('loginBtn');
    
    if (!slider || !thumb) return;
    
    // Mouse events
    thumb.addEventListener('mousedown', startDrag);
    thumb.addEventListener('touchstart', startDrag, { passive: false });
    
    function startDrag(e) {
        e.preventDefault();
        AppState.isDragging = true;
        AppState.dragStartX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        thumb.style.transition = 'none';
        
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('touchmove', onDrag, { passive: false });
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }
    
    function onDrag(e) {
        if (!AppState.isDragging) return;
        e.preventDefault();
        
        const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const diff = currentX - AppState.dragStartX;
        const maxDiff = slider.offsetWidth - thumb.offsetWidth - 20;
        
        let newLeft = Math.min(Math.max(diff, 0), maxDiff);
        thumb.style.left = newLeft + 'px';
        
        // Check if reached the end
        if (newLeft >= maxDiff) {
            // Verification success
            AppState.isVerified = true;
            if (verifyStatus) {
                verifyStatus.innerHTML = '<i class="fas fa-check-circle" style="color:#10B981"></i> Verified';
                verifyStatus.style.color = '#10B981';
            }
            if (loginBtn) loginBtn.disabled = false;
            thumb.innerHTML = '<i class="fas fa-check"></i>';
            
            showBubble('✅ Verification successful!', 'success', 'check-circle');
            stopDrag();
        }
    }
    
    function stopDrag() {
        if (AppState.isDragging) {
            AppState.isDragging = false;
            thumb.style.transition = 'left 0.3s';
            
            if (!AppState.isVerified) {
                thumb.style.left = '0';
                thumb.innerHTML = '<i class="fas fa-arrow-right"></i>';
            }
            
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('touchmove', onDrag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchend', stopDrag);
        }
    }
}

// Login Handler
async function handleLogin(e) {
    e.preventDefault();
    
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loginBtn = e.target.querySelector('button');
    const originalText = loginBtn.innerHTML;
    
    // Validasi
    if (!identifier || !password) {
        showBubble('⚠️ Please fill in all fields', 'warning', 'exclamation-triangle');
        return;
    }
    
    if (!AppState.isVerified) {
        showBubble('⚠️ Please complete verification first!', 'warning', 'shield');
        return;
    }
    
    // Disable button
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    // Simulate network delay (300ms for fast response)
    setTimeout(() => {
        // Find user
        const user = AppState.users.find(u => 
            (u.username === identifier || u.email === identifier) && 
            u.status === 'active'
        );
        
        if (!user) {
            showBubble('❌ User not found!', 'error', 'user-slash');
            resetButton(loginBtn, originalText);
            return;
        }
        
        if (!verifyPassword(password, user.password)) {
            showBubble('❌ Wrong password!', 'error', 'lock');
            resetButton(loginBtn, originalText);
            return;
        }
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        user.loginHistory = user.loginHistory || [];
        user.loginHistory.push({
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
        });
        
        // Save to storage
        saveUsersToStorage();
        
        // Create session
        createSession(user);
        
        // Show success
        showBubble(`🎉 Welcome back, ${user.firstName}!`, 'success', 'party');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 800);
        
    }, 300); // Fast 300ms response
}

// ============================================
// REGISTER PAGE SETUP
// ============================================
function setupRegisterPage() {
    console.log('📝 Setting up register page...');
    
    // Reset verification
    AppState.isVerified = false;
    
    // Setup math verification
    setupMathVerification();
    
    // Setup form submit
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Setup password strength checker
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
        passwordInput.addEventListener('input', checkPasswordMatch);
    }
    
    // Setup confirm password checker
    const confirmInput = document.getElementById('confirmPassword');
    if (confirmInput) {
        confirmInput.addEventListener('input', checkPasswordMatch);
    }
    
    // Setup username availability
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('input', debounce(checkUsernameAvailability, 400));
    }
    
    // Setup toggle password
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            togglePasswordVisibility(this);
        });
    });
    
    // Setup terms checkbox
    const termsCheck = document.getElementById('termsCheck');
    if (termsCheck) {
        termsCheck.addEventListener('change', checkRegisterButton);
    }
}

// Math Verification
function setupMathVerification() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    AppState.mathAnswer = num1 + num2;
    
    const questionEl = document.getElementById('mathQuestion');
    if (questionEl) {
        questionEl.textContent = `${num1} + ${num2} = ?`;
    }
    
    const verifyBtn = document.querySelector('.verify-btn');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', checkMathVerify);
    }
    
    const mathInput = document.getElementById('mathAnswer');
    if (mathInput) {
        mathInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkMathVerify();
            }
        });
    }
}

function checkMathVerify() {
    const answer = parseInt(document.getElementById('mathAnswer').value);
    const verifyStatus = document.getElementById('verifyStatus');
    const registerBtn = document.getElementById('registerBtn');
    
    if (isNaN(answer)) {
        showBubble('⚠️ Please enter an answer', 'warning', 'exclamation-triangle');
        return;
    }
    
    if (answer === AppState.mathAnswer) {
        AppState.isVerified = true;
        if (verifyStatus) {
            verifyStatus.innerHTML = '<i class="fas fa-check-circle" style="color:#10B981"></i> Verified';
        }
        checkRegisterButton();
        showBubble('✅ Math verification passed!', 'success', 'check');
    } else {
        showBubble('❌ Wrong answer! Try again', 'error', 'times-circle');
        if (verifyStatus) {
            verifyStatus.innerHTML = '<i class="fas fa-times-circle" style="color:#EF4444"></i> Wrong answer';
        }
    }
}

// Password Strength Checker
function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthBar) return;
    
    let strength = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) {
        strength++;
        feedback.push('✓ Good length');
    } else {
        feedback.push('✗ Min 8 characters');
    }
    
    if (password.length >= 12) strength++;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) {
        strength++;
        feedback.push('✓ Has uppercase');
    } else {
        feedback.push('✗ Add uppercase');
    }
    
    // Number check
    if (/[0-9]/.test(password)) {
        strength++;
        feedback.push('✓ Has number');
    } else {
        feedback.push('✗ Add number');
    }
    
    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) {
        strength++;
        feedback.push('✓ Has special char');
    } else {
        feedback.push('✗ Add special char');
    }
    
    // Calculate percentage
    const percentage = (strength / 5) * 100;
    strengthBar.style.width = percentage + '%';
    
    // Change color and text
    let strengthLevel = '';
    if (percentage < 40) {
        strengthBar.style.background = '#EF4444';
        strengthLevel = 'Weak';
    } else if (percentage < 70) {
        strengthBar.style.background = '#F59E0B';
        strengthLevel = 'Medium';
    } else {
        strengthBar.style.background = '#10B981';
        strengthLevel = 'Strong';
    }
    
    if (strengthText) {
        strengthText.textContent = strengthLevel;
        strengthText.className = 'strength-text strength-' + strengthLevel.toLowerCase();
    }
    
    // Update register button state
    checkRegisterButton();
}

// Check password match
function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;
    const confirmWrapper = document.getElementById('confirmPassword')?.closest('.input-wrapper');
    
    if (confirm.length > 0 && confirmWrapper) {
        if (password === confirm) {
            confirmWrapper.style.borderColor = '#10B981';
            confirmWrapper.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)';
        } else {
            confirmWrapper.style.borderColor = '#EF4444';
            confirmWrapper.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
        }
    }
    
    checkRegisterButton();
}

// Check username availability
function checkUsernameAvailability() {
    const username = document.getElementById('username').value;
    const hint = document.getElementById('usernameHint');
    
    if (!hint) return false;
    
    if (username.length < 3) {
        hint.innerHTML = '❌ Too short (min 3 chars)';
        hint.style.color = '#EF4444';
        checkRegisterButton();
        return false;
    }
    
    // Check if username exists
    const exists = AppState.users.some(u => u.username === username);
    
    if (exists) {
        hint.innerHTML = '❌ Username taken';
        hint.style.color = '#EF4444';
        checkRegisterButton();
        return false;
    } else {
        hint.innerHTML = '✅ Available';
        hint.style.color = '#10B981';
        checkRegisterButton();
        return true;
    }
}

// Check register button state
function checkRegisterButton() {
    const registerBtn = document.getElementById('registerBtn');
    const termsCheck = document.getElementById('termsCheck');
    
    if (!registerBtn || !termsCheck) return;
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;
    const email = document.getElementById('email').value;
    
    const usernameAvailable = username.length >= 3 && !AppState.users.some(u => u.username === username);
    const passwordMatch = password === confirm && password.length >= 6;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const termsAccepted = termsCheck.checked;
    
    if (AppState.isVerified && termsAccepted && usernameAvailable && passwordMatch && emailValid) {
        registerBtn.disabled = false;
    } else {
        registerBtn.disabled = true;
    }
}

// Register Handler
async function handleRegister(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const termsCheck = docume// ============================================
// DATABASE INITIALIZATION
// ============================================
function initializeDatabase() {
    // Cek apakah database sudah ada
    if (!localStorage.getItem('bluewhale_users')) {
        // Create default users
        const defaultUsers = [
            {
                id: '1',
                firstName: 'Jeje',
                lastName: 'Dev',
                username: 'jejedev',
                email: 'jeje@bluewhale.com',
                password: hashPassword('admin123'),
                joinDate: '2024-01-15',
                lastLogin: null,
                status: 'active',
                loginHistory: []
            },
            {
                id: '2',
                firstName: 'Demo',
                lastName: 'User',
                username: 'demouser',
                email: 'demo@bluewhale.com',
                password: hashPassword('demo123'),
                joinDate: '2024-02-20',
                lastLogin: null,
                status: 'active',
                loginHistory: []
            },
            {
                id: '3',
                firstName: 'Test',
                lastName: 'Account',
                username: 'testacc',
                email: 'test@bluewhale.com',
                password: hashPassword('test123'),
                joinDate: '2024-03-01',
                lastLogin: null,
                status: 'active',
                loginHistory: []
            }
        ];
        
        localStorage.setItem('bluewhale_users', JSON.stringify(defaultUsers));
        console.log('✅ Database initialized with default users');
    }
    
    // Load current user from session
    const session = sessionStorage.getItem('bluewhale_session');
    if (session) {
        try {
            const sessionData = JSON.parse(session);
            const users = JSON.parse(localStorage.getItem('bluewhale_users'));
            currentUser = users.find(u => u.id === sessionData.userId);
            
            // Check session timeout (30 minutes)
            const loginTime = new Date(sessionData.loginTime).getTime();
            const now = new Date().getTime();
            
            if (now - loginTime > 30 * 60 * 1000) {
                // Session expired
                sessionStorage.removeItem('bluewhale_session');
                currentUser = null;
                showBubble('Session expired. Please login again.', 'warning', 'clock');
            }
        } catch (e) {
            console.error('Session error:', e);
            sessionStorage.removeItem('bluewhale_session');
        }
    }
}

// Simple hash function (for demo only - jangan pake di production!)
function hashPassword(password) {
    return btoa(password) + '_' + password.length + '_' + password.split('').reverse().join('');
}

// Verify password
function verifyPassword(inputPassword, storedPassword) {
    const hashedInput = hashPassword(inputPassword);
    return hashedInput === storedPassword;
}

// ============================================
// LOGIN PAGE SETUP
// ============================================
function setupLoginPage() {
    console.log('🔐 Setting up login page...');
    
    // Setup slider verification
    setupSliderVerification();
    
    // Setup form submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Setup toggle password
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            togglePassword(this);
        });
    });
    
    // Auto-fill demo credentials (for testing)
    const demoLink = document.querySelector('.demo-users');
    if (demoLink) {
        demoLink.addEventListener('click', showDemoUsers);
    }
}

// Slider Verification
function setupSliderVerification() {
    const slider = document.getElementById('sliderVerify');
    const thumb = document.getElementById('sliderThumb');
    const verifyStatus = document.getElementById('verifyStatus');
    const loginBtn = document.getElementById('loginBtn');
    
    if (!slider || !thumb) return;
    
    let isDragging = false;
    let startX;
    
    // Mouse events
    thumb.addEventListener('mousedown', startDrag);
    thumb.addEventListener('touchstart', startDrag);
    
    function startDrag(e) {
        e.preventDefault();
        isDragging = true;
        startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        thumb.style.transition = 'none';
        
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('touchmove', onDrag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }
    
    function onDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const diff = currentX - startX;
        const maxDiff = slider.offsetWidth - thumb.offsetWidth - 20;
        
        let newLeft = Math.min(Math.max(diff, 0), maxDiff);
        thumb.style.left = newLeft + 'px';
        
        // Check if reached the end
        if (newLeft >= maxDiff) {
            // Verification success
            isVerified = true;
            verifyStatus.innerHTML = '<i class="fas fa-check-circle" style="color: #10B981;"></i> Verified';
            verifyStatus.style.color = '#10B981';
            if (loginBtn) loginBtn.disabled = false;
            thumb.innerHTML = '<i class="fas fa-check"></i>';
            
            showBubble('✅ Verification successful!', 'success', 'check-circle');
            stopDrag();
        }
    }
    
    function stopDrag() {
        if (isDragging) {
            isDragging = false;
            thumb.style.transition = 'left 0.3s';
            
            if (!isVerified) {
                thumb.style.left = '0';
                thumb.innerHTML = '<i class="fas fa-arrow-right"></i>';
            }
            
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('touchmove', onDrag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchend', stopDrag);
        }
    }
}

// ============================================
// REGISTER PAGE SETUP
// ============================================
function setupRegisterPage() {
    console.log('📝 Setting up register page...');
    
    // Setup math verification
    setupMathVerification();
    
    // Setup form submit
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Setup password strength checker
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }
    
    // Setup confirm password checker
    const confirmInput = document.getElementById('confirmPassword');
    if (confirmInput) {
        confirmInput.addEventListener('input', checkPasswordMatch);
    }
    
    // Setup username availability
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('input', debounce(checkUsernameAvailability, 500));
    }
    
    // Setup toggle password
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            togglePassword(this);
        });
    });
    
    // Setup terms checkbox
    const termsCheck = document.getElementById('termsCheck');
    if (termsCheck) {
        termsCheck.addEventListener('change', function() {
            checkRegisterButton();
        });
    }
}

// Math Verification
function setupMathVerification() {
    // Generate random math question
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '×'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let question, answer;
    switch(operator) {
        case '+':
            question = `${num1} + ${num2}`;
            answer = num1 + num2;
            break;
        case '-':
            question = `${num1} - ${num2}`;
            answer = num1 - num2;
            break;
        case '×':
            question = `${num1} × ${num2}`;
            answer = num1 * num2;
            break;
    }
    
    const questionEl = document.getElementById('mathQuestion');
    if (questionEl) {
        questionEl.textContent = question + ' = ?';
    }
    
    mathAnswer = answer;
    
    // Setup verify button
    const verifyBtn = document.querySelector('.verify-btn');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', checkMathVerify);
    }
    
    // Setup enter key on input
    const mathInput = document.getElementById('mathAnswer');
    if (mathInput) {
        mathInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkMathVerify();
            }
        });
    }
}

function checkMathVerify() {
    const answer = parseInt(document.getElementById('mathAnswer').value);
    const verifyStatus = document.getElementById('verifyStatus');
    const registerBtn = document.getElementById('registerBtn');
    
    if (answer === mathAnswer) {
        isVerified = true;
        verifyStatus.innerHTML = '<i class="fas fa-check-circle" style="color: #10B981;"></i> Verified';
        verifyStatus.style.color = '#10B981';
        checkRegisterButton();
        
        showBubble('✅ Math verification passed!', 'success', 'check');
    } else {
        showBubble('❌ Wrong answer! Try again', 'error', 'times-circle');
        verifyStatus.innerHTML = '<i class="fas fa-times-circle"></i> Wrong answer';
    }
}

// Password Strength Checker
function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthBar) return;
    
    let strength = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) {
        strength++;
        feedback.push('✓ Good length');
    } else {
        feedback.push('✗ Min 8 characters');
    }
    
    if (password.length >= 12) strength++;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) {
        strength++;
        feedback.push('✓ Has uppercase');
    } else {
        feedback.push('✗ Add uppercase');
    }
    
    // Number check
    if (/[0-9]/.test(password)) {
        strength++;
        feedback.push('✓ Has number');
    } else {
        feedback.push('✗ Add number');
    }
    
    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) {
        strength++;
        feedback.push('✓ Has special char');
    } else {
        feedback.push('✗ Add special char');
    }
    
    // Calculate percentage
    const percentage = (strength / 5) * 100;
    strengthBar.style.width = percentage + '%';
    
    // Change color and text
    let strengthLevel = '';
    if (percentage < 40) {
        strengthBar.style.background = '#EF4444';
        strengthLevel = 'Weak';
    } else if (percentage < 70) {
        strengthBar.style.background = '#F59E0B';
        strengthLevel = 'Medium';
    } else {
        strengthBar.style.background = '#10B981';
        strengthLevel = 'Strong';
    }
    
    // Update strength text if exists
    if (strengthText) {
        strengthText.textContent = strengthLevel;
        strengthText.className = 'strength-' + strengthLevel.toLowerCase();
    }
    
    // Show feedback tooltip on hover (optional)
    // You can display feedback array somewhere
}

// Check password match
function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;
    const confirmWrapper = document.getElementById('confirmPassword').closest('.input-wrapper');
    
    if (confirm.length > 0) {
        if (password === confirm) {
            confirmWrapper.style.borderColor = '#10B981';
            confirmWrapper.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)';
        } else {
            confirmWrapper.style.borderColor = '#EF4444';
            confirmWrapper.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
        }
    }
}

// Check username availability
function checkUsernameAvailability() {
    const username = document.getElementById('username').value;
    const hint = document.getElementById('usernameHint');
    
    if (!hint) return;
    
    if (username.length < 3) {
        hint.innerHTML = '❌ Too short (min 3 chars)';
        hint.style.color = '#EF4444';
        return false;
    }
    
    // Get users from database
    const users = JSON.parse(localStorage.getItem('bluewhale_users')) || [];
    const exists = users.some(u => u.username === username);
    
    if (exists) {
        hint.innerHTML = '❌ Username taken';
        hint.style.color = '#EF4444';
        return false;
    } else {
        hint.innerHTML = '✅ Available';
        hint.style.color = '#10B981';
        return true;
    }
}

// Check register button state
function checkRegisterButton() {
    const registerBtn = document.getElementById('registerBtn');
    const termsCheck = document.getElementById('termsCheck');
    
    if (!registerBtn || !termsCheck) return;
    
    const usernameAvailable = checkUsernameAvailability();
    const passwordMatch = document.getElementById('password').value === document.getElementById('confirmPassword').value;
    const passwordLength = document.getElementById('password').value.length >= 6;
    
    if (isVerified && termsCheck.checked && usernameAvailable && passwordMatch && passwordLength) {
        registerBtn.disabled = false;
    } else {
        registerBtn.disabled = true;
    }
}

// ============================================
// AUTH HANDLERS
// ============================================
function handleLogin(e) {
    e.preventDefault();
    
    const identifier = document.getElementById('loginIdentifier').value;
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    
    if (!isVerified) {
        showBubble('⚠️ Please complete verification first!', 'warning', 'shield');
        return;
    }
    
    // Disable button
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    // Simulate network delay
    setTimeout(() => {
        // Get users from database
        const users = JSON.parse(localStorage.getItem('bluewhale_users')) || [];
        
        // Find user
        const user = users.find(u => 
            (u.username === identifier || u.email === identifier) && 
            u.status === 'active'
        );
        
        if (!user) {
            showBubble('❌ User not found!', 'error', 'user-slash');
            resetLoginButton();
            return;
        }
        
        if (!verifyPassword(password, user.password)) {
            showBubble('❌ Wrong password!', 'error', 'lock');
            resetLoginButton();
            return;
        }
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        user.loginHistory = user.loginHistory || [];
        user.loginHistory.push({
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            platform: navigator.platform
        });
        
        // Save to localStorage
        localStorage.setItem('bluewhale_users', JSON.stringify(users));
        
        // Create session
        const session = {
            userId: user.id,
            loginTime: new Date().toISOString()
        };
        sessionStorage.setItem('bluewhale_session', JSON.stringify(session));
        
        // Set current user
        currentUser = user;
        
        // Show success
        showBubble(`🎉 Welcome back, ${user.firstName}!`, 'success', 'party');
        
        // Redirect
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    }, 1000);
    
    function resetLoginButton() {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span>Login</span><i class="fas fa-arrow-right"></i>';
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsCheck = document.getElementById('termsCheck').checked;
    
    const registerBtn = document.getElementById('registerBtn');
    
    // Validations
    if (!isVerified) {
        showBubble('⚠️ Please complete verification first!', 'warning', 'shield');
        return;
    }
    
    if (password !== confirmPassword) {
        showBubble('❌ Passwords do not match!', 'error', 'times-circle');
        return;
    }
    
    if (password.length < 6) {
        showBubble('⚠️ Password must be at least 6 characters', 'warning', 'lock');
        return;
    }
    
    if (!termsCheck) {
        showBubble('⚠️ Please accept Terms of Service', 'warning', 'file-contract');
        return;
    }
    
    // Check if email valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showBubble('❌ Invalid email format!', 'error', 'envelope');
        return;
    }
    
    // Disable button
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    
    // Simulate network delay
    setTimeout(() => {
        // Get users from database
        const users = JSON.parse(localStorage.getItem('bluewhale_users')) || [];
        
        // Check if username exists
        if (users.find(u => u.username === username)) {
            showBubble('❌ Username already exists!', 'error', 'user');
            resetRegisterButton();
            return;
        }
        
        // Check if email exists
        if (users.find(u => u.email === email)) {
            showBubble('❌ Email already registered!', 'error', 'envelope');
            resetRegisterButton();
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            firstName,
            lastName,
            username,
            email,
            password: hashPassword(password),
            joinDate: new Date().toISOString().split('T')[0],
            lastLogin: null,
            status: 'active',
            loginHistory: []
        };
        
        users.push(newUser);
        localStorage.setItem('bluewhale_users', JSON.stringify(users));
        
        // Show success
        showBubble('✅ Account created! Redirecting to login...', 'success', 'check-circle');
        
        // Redirect to login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    }, 1000);
    
    function resetRegisterButton() {
        registerBtn.disabled = false;
        registerBtn.innerHTML = '<span>Create Account</span><i class="fas fa-user-plus"></i>';
    }
}

// ============================================
// DASHBOARD SETUP
// ============================================
function setupDashboardPage() {
    console.log('📊 Setting up dashboard...');
    
    // Check if user is logged in
    if (!currentUser) {
        // Try to get from session
        const session = sessionStorage.getItem('bluewhale_session');
        if (!session) {
            showBubble('🔒 Please login first', 'warning', 'lock');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }
        
        // Reload user from session
        const sessionData = JSON.parse(session);
        const users = JSON.parse(localStorage.getItem('bluewhale_users'));
        currentUser = users.find(u => u.id === sessionData.userId);
        
        if (!currentUser) {
            sessionStorage.removeItem('bluewhale_session');
            window.location.href = 'login.html';
            return;
        }
    }
    
    // Update UI with user data
    updateDashboardUI();
    
    // Setup logout
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Setup sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Setup search
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Setup charts
    setupCharts();
    
    // Welcome bubble
    setTimeout(() => {
        showBubble(`👋 Welcome back, ${currentUser.firstName}!`, 'success', 'hand-wave');
    }, 500);
}

function updateDashboardUI() {
    if (!currentUser) return;
    
    // Update display name
    const displayName = document.getElementById('displayName');
    if (displayName) {
        displayName.textContent = currentUser.firstName;
    }
    
    // Update user profile in sidebar
    const userProfile = document.getElementById('userProfile');
    if (userProfile) {
        const fullName = `${currentUser.firstName} ${currentUser.lastName}`;
        userProfile.innerHTML = `
            <img src="https://ui-avatars.com/api/?name=${fullName}&background=2A5C9E&color=fff&size=128" alt="${fullName}">
            <div class="user-info">
                <h4>${fullName}</h4>
                <p>@${currentUser.username}</p>
            </div>
        `;
    }
    
    // Update join date
    const joinDate = document.getElementById('joinDate');
    if (joinDate) {
        joinDate.textContent = currentUser.joinDate;
    }
    
    // Update database stats
    const users = JSON.parse(localStorage.getItem('bluewhale_users')) || [];
    
    const totalUsers = document.getElementById('totalUsers');
    if (totalUsers) {
        totalUsers.textContent = users.length;
    }
    
    const onlineUsers = document.getElementById('onlineUsers');
    if (onlineUsers) {
        // Simulasi online users (hari ini yang login)
        const today = new Date().toISOString().split('T')[0];
        const online = users.filter(u => {
            if (!u.lastLogin) return false;
            return u.lastLogin.split('T')[0] === today;
        }).length;
        onlineUsers.textContent = online || '1';
    }
    
    const newToday = document.getElementById('newToday');
    if (newToday) {
        const today = new Date().toISOString().split('T')[0];
        const newUsers = users.filter(u => u.joinDate === today).length;
        newToday.textContent = newUsers || '0';
    }
    
    // Update users table
    updateUsersTable(users);
}

function updateUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = users.map(user => {
        const fullName = `${user.firstName} ${user.lastName}`;
        const isOnline = user.lastLogin ? 
            (new Date().getTime() - new Date(user.lastLogin).getTime()) < 5 * 60 * 1000 : false;
        
        return `
            <tr>
                <td class="user-cell">
                    <img src="https://ui-avatars.com/api/?name=${fullName}&background=2A5C9E&color=fff&size=32" alt="${fullName}">
                    <span>${user.username}</span>
                    ${isOnline ? '<span class="online-dot"></span>' : ''}
                </td>
                <td>${user.email}</td>
                <td>${fullName}</td>
                <td>${user.joinDate}</td>
                <td>
                    <span class="status-badge ${user.status}">
                        ${isOnline ? '🟢 Online' : '⚪ Offline'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const users = JSON.parse(localStorage.getItem('bluewhale_users')) || [];
    
    if (query.length < 2) {
        updateUsersTable(users);
        return;
    }
    
    const filtered = users.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query)
    );
    
    updateUsersTable(filtered);
}

function setupCharts() {
    // Check if Chart is available
    if (typeof Chart === 'undefined') {
        console.log('Chart.js not loaded');
        return;
    }
    
    // User Growth Chart
    const ctx1 = document.getElementById('userChart');
    if (ctx1) {
        // Get user growth data
        const users = JSON.parse(localStorage.getItem('bluewhale_users')) || [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        
        // Count users per month (simplified)
        const monthlyData = months.map((month, index) => {
            const monthNum = index + 1;
            return users.filter(u => {
                const joinMonth = parseInt(u.joinDate.split('-')[1]);
                return joinMonth === monthNum;
            }).length;
        });
        
        new Chart(ctx1, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'New Users',
                    data: monthlyData,
                    borderColor: '#2A5C9E',
                    backgroundColor: 'rgba(42, 92, 158, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#2A5C9E',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1F2937',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Traffic Sources Chart
    const ctx2 = document.getElementById('trafficChart');
    if (ctx2) {
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Direct', 'Organic', 'Social', 'Referral'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: [
                        '#2A5C9E',
                        '#4A90E2',
                        '#8B5CF6',
                        '#10B981'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }
}

// ============================================
// LANDING PAGE SETUP
// ============================================
function setupLandingPage() {
    console.log('🏠 Setting up landing page...');
    
    // Animated welcome
    setTimeout(() => {
        showBubble('🚀 Welcome to BlueWhale!', 'party', 'rocket', 3000);
    }, 1000);
    
    setTimeout(() => {
        showBubble('✨ Modern auth system with custom verification', 'info', 'info-circle', 3000);
    }, 2000);
    
    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// GLOBAL FUNCTIONS
// ============================================
function setupGlobalFeatures() {
    // Setup notification close buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.bubble-close')) {
            e.target.closest('.notification-bubble').remove();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+K for search focus
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-bar input');
            if (searchInput) {
                searchInput.focus();
                showBubble('🔍 Type to search...', 'info', 'search', 2000);
            }
        }
        
        // Escape to close all bubbles
        if (e.key === 'Escape') {
            const bubbles = document.querySelectorAll('.notification-bubble');
            bubbles.forEach(bubble => {
                bubble.style.animation = 'slideOut 0.3s forwards';
                setTimeout(() => bubble.remove(), 300);
            });
        }
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        
        if (mainContent) {
            if (sidebar.classList.contains('collapsed')) {
                mainContent.style.marginLeft = '80px';
            } else {
                mainContent.style.marginLeft = '280px';
            }
        }
        
        // Show notification
        const state = sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded';
        showBubble(`Sidebar ${state}`, 'info', 'arrows-alt-h', 1500);
    }
}

function togglePassword(element) {
    const input = element.closest('.input-wrapper').querySelector('input');
    
    if (input.type === 'password') {
        input.type = 'text';
        element.classList.remove('fa-eye');
        element.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        element.classList.remove('fa-eye-slash');
        element.classList.add('fa-eye');
    }
}

function handleLogout() {
    // Confirmation with custom bubble
    showBubble('👋 Logging out...', 'info', 'power-off', 2000);
    
    setTimeout(() => {
        // Clear session
        sessionStorage.removeItem('bluewhale_session');
        currentUser = null;
        
        // Redirect to login
        window.location.href = 'login.html';
    }, 1500);
}

function showDemoUsers() {
    const users = JSON.parse(localStorage.getItem('bluewhale_users')) || [];
    const demos = users.slice(0, 3).map(u => {
        const password = atob(u.password.split('_')[0]);
        return `📧 ${u.email} | 🔑 ${password}`;
    }).join('\n');
    
    showBubble('📋 Demo Accounts:\n' + demos, 'info', 'info-circle', 8000);
}

// ============================================
// BUBBLE NOTIFICATION SYSTEM
// ============================================
function showBubble(message, type = 'info', icon = 'info-circle', duration = 4000) {
    const container = document.getElementById('bubbleContainer');
    if (!container) {
        // Create container if not exists
        const newContainer = document.createElement('div');
        newContainer.id = 'bubbleContainer';
        newContainer.className = 'bubble-container';
        document.body.appendChild(newContainer);
    }
    
    const container2 = document.getElementById('bubbleContainer');
    
    // Bubble styles berdasarkan type
    const styles = {
        success: {
            gradient: 'linear-gradient(135deg, #10B981, #34D399)',
            emoji: '✅'
        },
        error: {
            gradient: 'linear-gradient(135deg, #EF4444, #F87171)',
            emoji: '❌'
        },
        warning: {
            gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
            emoji: '⚠️'
        },
        info: {
            gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
            emoji: 'ℹ️'
        },
        party: {
            gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
            emoji: '🎉'
        },
        love: {
            gradient: 'linear-gradient(135deg, #EC4899, #F472B6)',
            emoji: '❤️'
        }
    };
    
    const style = styles[type] || styles.info;
    
    // Random animation
    const animations = ['bounce', 'pop', 'slide', 'rotate', 'flip'];
    const randomAnim = animations[Math.floor(Math.random() * animations.length)];
    
    // Create bubble
    const bubble = document.createElement('div');
    bubble.className = `notification-bubble ${type} animate-${randomAnim}`;
    bubble.style.background = style.gradient;
    
    bubble.innerHTML = `
        <div class="bubble-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="bubble-content">
            <div class="bubble-message">${message}</div>
            <div class="bubble-time">just now</div>
        </div>
        <div class="bubble-emoji">${style.emoji}</div>
        <div class="bubble-progress"></div>
        <button class="bubble-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container2.appendChild(bubble);
    
    // Auto remove
    setTimeout(() => {
        if (bubble.parentElement) {
            bubble.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => bubble.remove(), 300);
        }
    }, duration);
    
    return bubble;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Generate random color
function getRandomColor() {
    const colors = ['#2A5C9E', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ============================================
// EXPORT FUNCTIONS (for global use)
// ============================================
window.showBubble = showBubble;
window.togglePassword = togglePassword;
window.handleLogout = handleLogout;
window.toggleSidebar = toggleSidebar;
window.showDemoUsers = showDemoUsers;
window.checkMathVerify = checkMathVerify;
