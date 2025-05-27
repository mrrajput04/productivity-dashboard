// Main application initialization and coordination
class App {
	static init() {
		// Wait for DOM to be ready
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => this.initialize());
		} else {
			this.initialize();
		}
	}

	static initialize() {
		console.log('Initializing Productivity Dashboard...');

		// Initialize all components
		Goals.init();
		Calendar.init();
		Pomodoro.init();
		Bookmarks.init();

		// Setup global event listeners
		this.setupGlobalEventListeners();

		// Setup periodic saves (if using localStorage)
		this.setupPeriodicSave();

		// Show welcome message for first-time users
		this.checkFirstTime();

		console.log('Productivity Dashboard initialized successfully!');
	}

	static setupGlobalEventListeners() {
		// Keyboard shortcuts
		document.addEventListener('keydown', (e) => {
			// Ctrl/Cmd + S to trigger manual save
			if ((e.ctrlKey || e.metaKey) && e.key === 's') {
				e.preventDefault();
				this.saveAllData();
				this.showNotification('Data saved successfully!');
			}

			// Ctrl/Cmd + G to focus on goal input
			if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
				e.preventDefault();
				const goalInput = document.getElementById('goalInput');
				if (goalInput) goalInput.focus();
			}

			// Ctrl/Cmd + B to focus on bookmark input
			if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
				e.preventDefault();
				const bookmarkInput = document.getElementById('bookmarkTitle');
				if (bookmarkInput) bookmarkInput.focus();
			}

			// Space to start/pause timer
			if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
				e.preventDefault();
				if (Pomodoro.isRunning) {
					Pomodoro.pause();
				} else {
					Pomodoro.start();
				}
			}
		});

		// Handle page visibility change (pause timer when tab is not active)
		document.addEventListener('visibilitychange', () => {
			if (document.hidden) {
				// Page is hidden - could pause non-essential updates
				console.log('Dashboard is now hidden');
			} else {
				// Page is visible - resume updates
				console.log('Dashboard is now visible');
				// Refresh components in case data changed in another tab
				this.refreshAllComponents();
			}
		});

		// Handle beforeunload (page close/refresh)
		window.addEventListener('beforeunload', (e) => {
			this.saveAllData();

			// Show warning if timer is running
			if (Pomodoro.isRunning) {
				e.preventDefault();
				e.returnValue = 'You have a running Pomodoro timer. Are you sure you want to leave?';
				return e.returnValue;
			}
		});

		// Handle window resize for responsive updates
		window.addEventListener('resize', () => {
			// Refresh calendar layout if needed
			Calendar.render();
		});
	}

	static setupPeriodicSave() {
		// Auto-save every 30 seconds if localStorage is available
		if (storage.isLocalStorageAvailable) {
			setInterval(() => {
				this.saveAllData();
			}, 30000);
		}
	}

	static saveAllData() {
		try {
			storage.saveToLocalStorage();
		} catch (error) {
			console.error('Error saving data:', error);
		}
	}

	static refreshAllComponents() {
		Goals.render();
		Calendar.render();
		Bookmarks.render();
		// Pomodoro doesn't need refresh as it manages its own state
	}

	static checkFirstTime() {
		const hasData = storage.getGoals().length > 0 ||
			storage.getBookmarks().length > 0;

		if (!hasData && storage.isLocalStorageAvailable) {
			// Show welcome message after a short delay
			setTimeout(() => {
				this.showWelcomeMessage();
			}, 1000);
		}
	}

	static showWelcomeMessage() {
		const welcome = document.createElement('div');
		welcome.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            text-align: center;
            max-width: 400px;
            z-index: 1000;
        `;

		welcome.innerHTML = `
            <h3 style="color: #4a5568; margin-bottom: 15px;">Welcome to Your Productivity Dashboard! 🚀</h3>
            <p style="color: #718096; margin-bottom: 20px; line-height: 1.5;">
                Get started by adding your daily goals, exploring the calendar, 
                setting up a Pomodoro session, or saving your favorite bookmarks.
            </p>
            <div style="margin-bottom: 15px; font-size: 14px; color: #718096;">
                <strong>Keyboard Shortcuts:</strong><br>
                Ctrl/Cmd + G: Focus on goals<br>
                Ctrl/Cmd + B: Focus on bookmarks<br>
                Space: Start/pause timer
            </div>
            <button onclick="this.parentElement.remove()" 
                    style="background: linear-gradient(135deg, #667eea, #764ba2); 
                           color: white; border: none; padding: 10px 20px; 
                           border-radius: 8px; cursor: pointer; font-weight: 600;">
                Let's Get Started!
            </button>
        `;

		document.body.appendChild(welcome);

		// Auto-remove after 10 seconds
		setTimeout(() => {
			if (document.body.contains(welcome)) {
				welcome.style.opacity = '0';
				welcome.style.transition = 'opacity 0.5s ease';
				setTimeout(() => {
					if (document.body.contains(welcome)) {
						document.body.removeChild(welcome);
					}
				}, 500);
			}
		}, 10000);
	}

	static showNotification(message, type = 'success') {
		const notification = document.createElement('div');
		const bgColor = type === 'success' ? '#48bb78' : '#e53e3e';

		notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-weight: 500;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
		notification.textContent = message;

		document.body.appendChild(notification);

		// Animate in
		setTimeout(() => {
			notification.style.opacity = '1';
			notification.style.transform = 'translateX(0)';
		}, 100);

		// Animate out and remove
		setTimeout(() => {
			notification.style.opacity = '0';
			notification.style.transform = 'translateX(100%)';
			setTimeout(() => {
				if (document.body.contains(notification)) {
					document.body.removeChild(notification);
				}
			}, 300);
		}, 3000);
	}

	static getAppStats() {
		return {
			goals: {
				total: Goals.getTotalCount(),
				completed: Goals.getCompletedCount(),
				progress: Goals.getProgress()
			},
			pomodoro: Pomodoro.getStats(),
			bookmarks: {
				total: storage.getBookmarks().length
			},
			storage: {
				available: storage.isLocalStorageAvailable
			}
		};
	}

	static exportAllData() {
		const data = {
			goals: storage.getGoals(),
			bookmarks: storage.getBookmarks(),
			pomodoroSettings: storage.getPomodoroSettings(),
			exportDate: new Date().toISOString()
		};

		const dataStr = JSON.stringify(data, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });

		const link = document.createElement('a');
		link.href = URL.createObjectURL(dataBlob);
		link.download = `productivity-dashboard-${new Date().toISOString().split('T')[0]}.json`;
		link.click();

		this.showNotification('Data exported successfully!');
	}

	static importAllData(fileInput) {
		const file = fileInput.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = JSON.parse(e.target.result);

				if (data.goals) storage.data.goals = data.goals;
				if (data.bookmarks) storage.data.bookmarks = data.bookmarks;
				if (data.pomodoroSettings) storage.data.pomodoroSettings = data.pomodoroSettings;

				storage.saveToLocalStorage();
				this.refreshAllComponents();
				this.showNotification('Data imported successfully!');
			} catch (error) {
				this.showNotification('Error importing data. Invalid file format.', 'error');
			}
		};
		reader.readAsText(file);
	}
}

// Initialize the app
App.init();