// auth.js - Authentication logic

// Global variables
let isVerified = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check session
    if (window.location.pathname.includes('dashboard.html')) {
        if (!db.checkSession()) {
            window.location.href = 'login.html';
            showBubble('Please login first', 'warning', 'lock');
        } else {
            updateDashboardUI();
        }
    }

    // Setup verification for login page
    if (document.getElementById('sliderVerify')) {
        setupSliderVerification();
    }

    // Setup verification for register page
    if (document.getElementById('mathVerify')) {
        setupMathVerification();
    }

    // Password strength checker
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }

    // Username availability checker
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('input', debounce(checkUsernameAvailability, 500));
    }
});

// LOGIN HANDLER
function handleLogin(event) {
    event.preventDefault();
    
    const identifier = document.getElementById('loginIdentifier').value;
    const password = document.getElementById('loginPassword').value;

    if (!isVerified) {
        showBubble('Please complete verification first!', 'warning', 'shield');
        return;
    }

    // Disable button
    const btn = document.getElementById('loginBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

    // Attempt login
    setTimeout(() => {
        if (db.login(identifier, password)) {
            showBubble('Login successful! Redirecting...', 'success', 'check-circle');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            btn.disabled = false;
            btn.innerHTML = '<span>Login</span><i class="fas fa-arrow-right"></i>';
        }
    }, 1000);
}

// REGISTER HANDLER
function handleRegister(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsCheck = document.getElementById('termsCheck').checked;

    // Validations
    if (!isVerified) {
        showBubble('Please complete verification first!', 'warning', 'shield');
        return;
    }

    if (password !== confirmPassword) {
        showBubble('Passwords do not match!', 'error', 'times-circle');
        return;
    }

    if (password.length < 6) {
        showBubble('Password must be at least 6 characters', 'warning', 'lock');
        return;
    }

    if (!termsCheck) {
        showBubble('Please accept Terms of Service', 'warning', 'file-contract');
        return;
    }

    // Disable button
    const btn = document.getElementById('registerBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

    // Attempt register
    setTimeout(() => {
        const userData = {
            firstName,
            lastName,
            username,
            email,
            password
        };

        if (db.register(userData)) {
            showBubble('Account created! Redirecting to login...', 'success', 'check-circle');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            btn.disabled = false;
            btn.innerHTML = '<span>Create Account</span><i class="fas fa-user-plus"></i>';
        }
    }, 1000);
}

// SLIDER VERIFICATION (Login page)
function setupSliderVerification() {
    const slider = document.getElementById('sliderVerify');
    const thumb = document.getElementById('sliderThumb');
    const verifyStatus = document.getElementById('verifyStatus');
    const loginBtn = document.getElementById('loginBtn');
    
    let isDragging = false;
    let startX;
    let currentX;

    thumb.addEventListener('mousedown', startDrag);
    thumb.addEventListener('touchstart', startDrag);

    function startDrag(e) {
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
        
        currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const diff = currentX - startX;
        const maxDiff = slider.offsetWidth - thumb.offsetWidth - 20;
        
        let newLeft = Math.min(Math.max(diff, 0), maxDiff);
        thumb.style.left = newLeft + 'px';

        if (newLeft >= maxDiff) {
            // Verification success
            isVerified = true;
            verifyStatus.innerHTML = '<i class="fas fa-check-circle" style="color: #10B981;"></i> Verified';
            verifyStatus.style.color = '#10B981';
            loginBtn.disabled = false;
            thumb.innerHTML = '<i class="fas fa-check"></i>';
            stopDrag();
            
            showBubble('Verification successful! ✅', 'success', 'check');
        }
    }

    function stopDrag() {
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

// MATH VERIFICATION (Register page)
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
    
    document.getElementById('mathQuestion').textContent = question + ' = ?';
    window.currentMathAnswer = answer;
}

function checkMathVerify() {
    const answer = parseInt(document.getElementById('mathAnswer').value);
    const verifyStatus = document.getElementById('verifyStatus');
    const registerBtn = document.getElementById('registerBtn');
    
    if (answer === window.currentMathAnswer) {
        isVerified = true;
        verifyStatus.innerHTML = '<i class="fas fa-check-circle" style="color: #10B981;"></i> Verified';
        verifyStatus.style.color = '#10B981';
        registerBtn.disabled = false;
        showBubble('Verification passed! ✅', 'success', 'check');
    } else {
        showBubble('Wrong answer! Try again', 'error', 'times-circle');
        verifyStatus.innerHTML = '<i class="fas fa-times-circle"></i> Wrong answer';
    }
}

// PASSWORD STRENGTH CHECKER
function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthBar = document.getElementById('strengthBar');
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character variety
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    // Update bar
    const percentage = (strength / 5) * 100;
    strengthBar.style.width = percentage + '%';
    
    // Change color
    if (percentage < 40) {
        strengthBar.style.background = '#EF4444';
    } else if (percentage < 70) {
        strengthBar.style.background = '#F59E0B';
    } else {
        strengthBar.style.background = '#10B981';
    }
}

// USERNAME AVAILABILITY
function checkUsernameAvailability() {
    const username = document.getElementById('username').value;
    const hint = document.getElementById('usernameHint');
    
    if (username.length < 3) {
        hint.innerHTML = '❌ Too short';
        hint.style.color = '#EF4444';
        return;
    }
    
    const exists = db.users.some(u => u.username === username);
    
    if (exists) {
        hint.innerHTML = '❌ Username taken';
        hint.style.color = '#EF4444';
    } else {
        hint.innerHTML = '✅ Available';
        hint.style.color = '#10B981';
    }
}

// DASHBOARD UI UPDATE
function updateDashboardUI() {
    if (!db.currentUser) return;
    
    const user = db.currentUser;
    
    // Update display name
    document.getElementById('displayName').textContent = user.firstName;
    
    // Update user profile
    const profileDiv = document.getElementById('userProfile');
    if (profileDiv) {
        profileDiv.innerHTML = `
            <img src="https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=2A5C9E&color=fff&size=128" alt="profile">
            <div class="user-info">
                <h4>${user.firstName} ${user.lastName}</h4>
                <p>@${user.username}</p>
            </div>
        `;
    }
    
    // Update join date
    document.getElementById('joinDate').textContent = user.joinDate;
    
    // Update database stats
    document.getElementById('totalUsers').textContent = db.users.length;
    document.getElementById('onlineUsers').textContent = Math.floor(Math.random() * 10) + 1; // Simulasi
    
    // Update users table
    const tbody = document.getElementById('usersTableBody');
    if (tbody) {
        tbody.innerHTML = db.getAllUsers().map(u => `
            <tr>
                <td><i class="fas fa-user-circle"></i> ${u.username}</td>
                <td>${u.email}</td>
                <td>${u.firstName} ${u.lastName}</td>
                <td>${u.joinDate}</td>
                <td><span class="status-badge ${u.status}">${u.status}</span></td>
            </tr>
        `).join('');
    }
}

// TOGGLE PASSWORD VISIBILITY
function togglePassword(inputId, element) {
    const input = document.getElementById(inputId);
    
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

// SHOW DEMO USERS
function showDemoUsers() {
    const demos = db.users.slice(0, 3).map(u => 
        `📧 ${u.email} | 🔑 ${atob(u.password.split('_')[0])}`
    ).join('\n');
    
    showBubble('Demo Accounts:\n' + demos, 'info', 'info-circle', 8000);
}

// DEBOUNCE UTILITY
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