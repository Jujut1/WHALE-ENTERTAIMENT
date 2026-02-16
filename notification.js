// notifications.js - Custom bubble notification system

// Bubble types with unique styles
const bubbleStyles = {
    success: {
        icon: 'fas fa-check-circle',
        gradient: 'linear-gradient(135deg, #10B981, #34D399)',
        emoji: '✅',
        sound: 'success'
    },
    error: {
        icon: 'fas fa-times-circle',
        gradient: 'linear-gradient(135deg, #EF4444, #F87171)',
        emoji: '❌',
        sound: 'error'
    },
    warning: {
        icon: 'fas fa-exclamation-triangle',
        gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
        emoji: '⚠️',
        sound: 'warning'
    },
    info: {
        icon: 'fas fa-info-circle',
        gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
        emoji: 'ℹ️',
        sound: 'info'
    },
    party: {
        icon: 'fas fa-party-horn',
        gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
        emoji: '🎉',
        sound: 'party'
    },
    love: {
        icon: 'fas fa-heart',
        gradient: 'linear-gradient(135deg, #EC4899, #F472B6)',
        emoji: '❤️',
        sound: 'love'
    },
    alert: {
        icon: 'fas fa-bell',
        gradient: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
        emoji: '🔔',
        sound: 'alert'
    },
    database: {
        icon: 'fas fa-database',
        gradient: 'linear-gradient(135deg, #1F2937, #374151)',
        emoji: '💾',
        sound: 'database'
    },
    lock: {
        icon: 'fas fa-lock',
        gradient: 'linear-gradient(135deg, #2A5C9E, #4A90E2)',
        emoji: '🔒',
        sound: 'lock'
    },
    check: {
        icon: 'fas fa-check-circle',
        gradient: 'linear-gradient(135deg, #059669, #10B981)',
        emoji: '✅',
        sound: 'check'
    },
    trash: {
        icon: 'fas fa-trash',
        gradient: 'linear-gradient(135deg, #B91C1C, #DC2626)',
        emoji: '🗑️',
        sound: 'trash'
    },
    power: {
        icon: 'fas fa-power-off',
        gradient: 'linear-gradient(135deg, #4B5563, #6B7280)',
        emoji: '🔌',
        sound: 'power'
    },
    party: {
        icon: 'fas fa-glass-cheers',
        gradient: 'linear-gradient(135deg, #D97706, #F59E0B)',
        emoji: '🥂',
        sound: 'party'
    },
    skull: {
        icon: 'fas fa-skull',
        gradient: 'linear-gradient(135deg, #1E1B4B, #312E81)',
        emoji: '💀',
        sound: 'skull'
    }
};

// Show bubble notification
function showBubble(message, type = 'info', icon = null, duration = 4000) {
    const container = document.getElementById('bubbleContainer');
    if (!container) return;

    const style = bubbleStyles[type] || bubbleStyles.info;
    const bubbleIcon = icon ? `fas fa-${icon}` : style.icon;

    // Create bubble element
    const bubble = document.createElement('div');
    bubble.className = `notification-bubble ${type}`;
    bubble.style.background = style.gradient;

    // Add random variation
    const variations = ['bounce', 'pop', 'slide', 'fade', 'rotate', 'flip'];
    const randomVar = variations[Math.floor(Math.random() * variations.length)];
    bubble.classList.add(`animate-${randomVar}`);

    // Bubble content
    bubble.innerHTML = `
        <div class="bubble-icon">
            <i class="${bubbleIcon}"></i>
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

    // Add to container
    container.appendChild(bubble);

    // Play sound effect (simulasi)
    console.log(`🔊 Playing ${style.sound} sound`);

    // Auto remove after duration
    setTimeout(() => {
        if (bubble.parentElement) {
            bubble.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => bubble.remove(), 300);
        }
    }, duration);

    return bubble;
}

// Error bubble with retry
function showErrorBubble(message, retryFunction) {
    const container = document.getElementById('bubbleContainer');
    
    const bubble = document.createElement('div');
    bubble.className = 'notification-bubble error with-actions';
    bubble.style.background = 'linear-gradient(135deg, #EF4444, #F87171)';

    bubble.innerHTML = `
        <div class="bubble-icon">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="bubble-content">
            <div class="bubble-message">${message}</div>
        </div>
        <div class="bubble-actions">
            <button onclick="retryAction()" class="bubble-btn retry">
                <i class="fas fa-redo"></i> Retry
            </button>
            <button onclick="this.closest('.notification-bubble').remove()" class="bubble-btn close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    container.appendChild(bubble);

    // Retry function
    window.retryAction = () => {
        bubble.remove();
        if (retryFunction) retryFunction();
    };
}

// Success celebration bubbles
function showSuccessBubble(message) {
    showBubble(message, 'success', 'check-circle');
    
    // Create mini confetti effect
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            showBubble('✨', 'party', 'star', 1000);
        }, i * 100);
    }
}

// Sequential bubbles (for tutorials)
async function showTutorialBubbles(messages) {
    for (let i = 0; i < messages.length; i++) {
        showBubble(messages[i], 'info', 'info-circle', 3000);
        await new Promise(resolve => setTimeout(resolve, 3200));
    }
}

// Loading bubble
function showLoadingBubble(message = 'Processing...') {
    const container = document.getElementById('bubbleContainer');
    
    const bubble = document.createElement('div');
    bubble.className = 'notification-bubble loading';
    bubble.style.background = 'linear-gradient(135deg, #6B7280, #9CA3AF)';
    bubble.id = 'loadingBubble';

    bubble.innerHTML = `
        <div class="bubble-icon">
            <i class="fas fa-spinner fa-spin"></i>
        </div>
        <div class="bubble-content">
            <div class="bubble-message">${message}</div>
        </div>
    `;

    container.appendChild(bubble);
    return bubble;
}

// Hide loading bubble
function hideLoadingBubble() {
    const bubble = document.getElementById('loadingBubble');
    if (bubble) bubble.remove();
}

// Database sync bubble
function showDatabaseSync(count) {
    showBubble(`Syncing ${count} records...`, 'database', 'database');
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 20;
        if (progress >= 100) {
            clearInterval(interval);
            showSuccessBubble('Database synced!');
        } else {
            showBubble(`Sync ${progress}% complete`, 'info', 'sync', 1000);
        }
    }, 800);
}

// Export functions
window.showBubble = showBubble;
window.showErrorBubble = showErrorBubble;
window.showSuccessBubble = showSuccessBubble;
window.showLoadingBubble = showLoadingBubble;
window.hideLoadingBubble = hideLoadingBubble;
window.showDatabaseSync = showDatabaseSync;