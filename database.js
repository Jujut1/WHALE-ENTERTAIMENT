// database.js - Simulasi database user
class UserDatabase {
    constructor() {
        this.users = this.loadUsers() || [
            // Default demo users
            {
                id: '1',
                firstName: 'Jeje',
                lastName: 'Dev',
                username: 'jejedev',
                email: 'jeje@bluewhale.com',
                password: this.hashPassword('admin123'),
                joinDate: '2024-01-15',
                lastLogin: new Date().toISOString(),
                status: 'active'
            },
            {
                id: '2',
                firstName: 'Demo',
                lastName: 'User',
                username: 'demouser',
                email: 'demo@bluewhale.com',
                password: this.hashPassword('demo123'),
                joinDate: '2024-02-20',
                lastLogin: new Date().toISOString(),
                status: 'active'
            },
            {
                id: '3',
                firstName: 'Test',
                lastName: 'Account',
                username: 'testacc',
                email: 'test@bluewhale.com',
                password: this.hashPassword('test123'),
                joinDate: '2024-03-01',
                lastLogin: new Date().toISOString(),
                status: 'active'
            }
        ];
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 menit
    }

    // Hash password sederhana (simulasi)
    hashPassword(password) {
        // Ini cuma simulasi, di real pakai bcrypt
        return btoa(password) + '_hashed_' + password.length;
    }

    // Verify password
    verifyPassword(inputPassword, storedPassword) {
        return this.hashPassword(inputPassword) === storedPassword;
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('bluewhale_users', JSON.stringify(this.users));
        this.showNotification('Database updated', 'success', 'database');
    }

    // Load users from localStorage
    loadUsers() {
        const stored = localStorage.getItem('bluewhale_users');
        return stored ? JSON.parse(stored) : null;
    }

    // Register new user
    register(userData) {
        // Check if username exists
        if (this.users.find(u => u.username === userData.username)) {
            this.showNotification('Username already exists!', 'error', 'warning');
            return false;
        }

        // Check if email exists
        if (this.users.find(u => u.email === userData.email)) {
            this.showNotification('Email already registered!', 'error', 'warning');
            return false;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            ...userData,
            password: this.hashPassword(userData.password),
            joinDate: new Date().toISOString().split('T')[0],
            lastLogin: null,
            status: 'active',
            loginHistory: []
        };

        this.users.push(newUser);
        this.saveUsers();
        
        this.showNotification('Registration successful! Please login.', 'success', 'check');
        return true;
    }

    // Login
    login(identifier, password) {
        // Cari user berdasarkan username atau email
        const user = this.users.find(u => 
            (u.username === identifier || u.email === identifier) && 
            u.status === 'active'
        );

        if (!user) {
            this.showNotification('User not found!', 'error', 'exclamation');
            return false;
        }

        if (!this.verifyPassword(password, user.password)) {
            this.showNotification('Wrong password!', 'error', 'lock');
            return false;
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        user.loginHistory = user.loginHistory || [];
        user.loginHistory.push({
            timestamp: new Date().toISOString(),
            ip: '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
            userAgent: navigator.userAgent
        });

        this.currentUser = user;
        this.saveUsers();
        
        // Set session
        sessionStorage.setItem('bluewhale_session', JSON.stringify({
            userId: user.id,
            loginTime: new Date().toISOString()
        }));

        this.showNotification(`Welcome back, ${user.firstName}! 🎉`, 'success', 'party');
        return true;
    }

    // Logout
    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('bluewhale_session');
        this.showNotification('Logged out successfully', 'info', 'power-off');
    }

    // Check session
    checkSession() {
        const session = sessionStorage.getItem('bluewhale_session');
        if (!session) return false;

        const sessionData = JSON.parse(session);
        const loginTime = new Date(sessionData.loginTime).getTime();
        const now = new Date().getTime();

        if (now - loginTime > this.sessionTimeout) {
            this.logout();
            return false;
        }

        this.currentUser = this.users.find(u => u.id === sessionData.userId);
        return !!this.currentUser;
    }

    // Get all users (untuk dashboard)
    getAllUsers() {
        return this.users.map(user => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            joinDate: user.joinDate,
            lastLogin: user.lastLogin,
            status: user.status
        }));
    }

    // Show notification bubble
    showNotification(message, type = 'info', icon = 'info-circle') {
        if (typeof showBubble === 'function') {
            showBubble(message, type, icon);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    // Delete user (admin only)
    deleteUser(userId) {
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            this.users.splice(index, 1);
            this.saveUsers();
            this.showNotification('User deleted', 'warning', 'trash');
            return true;
        }
        return false;
    }

    // Search users
    searchUsers(query) {
        query = query.toLowerCase();
        return this.users.filter(user => 
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.firstName.toLowerCase().includes(query) ||
            user.lastName.toLowerCase().includes(query)
        );
    }
}

// Initialize database
const db = new UserDatabase();

// Export for use in other files
window.db = db;