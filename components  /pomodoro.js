// Pomodoro Timer component
class Pomodoro {
	static interval = null;
	static timeLeft = 25 * 60; // 25 minutes in seconds
	static isWorking = true;
	static isRunning = false;
	static completedSessions = 0;

	static init() {
		const settings = storage.getPomodoroSettings();
		this.timeLeft = settings.workMinutes * 60;

		// Update input values from storage
		const workInput = document.getElementById('workMinutes');
		const breakInput = document.getElementById('breakMinutes');

		if (workInput) workInput.value = settings.workMinutes;
		if (breakInput) breakInput.value = settings.breakMinutes;

		const startBtn = document.getElementById('startBtn');
		if (startBtn) {
			startBtn.textContent = 'Start';
			startBtn.disabled = false;
		}

		this.updateDisplay();
		this.setupEventListeners();
		document.title = 'Productivity Dashboard';
	}

	static setupEventListeners() {
		// Update settings when inputs change
		const workInput = document.getElementById('workMinutes');
		const breakInput = document.getElementById('breakMinutes');

		if (workInput) {
			workInput.addEventListener('change', () => this.updateSettings());
		}

		if (breakInput) {
			breakInput.addEventListener('change', () => this.updateSettings());
		}

		// Start/Pause button
		const startBtn = document.getElementById('startBtn');
		if (startBtn) {
			startBtn.addEventListener('click', () => {
				if (this.isRunning) {
					this.pause();
				} else {
					this.start();
				}
			});
		}

		// Reset button
		const resetBtn = document.getElementById('resetBtn');
		if (resetBtn) {
			resetBtn.addEventListener('click', () => this.reset());
		}

		// Skip button
		const skipBtn = document.getElementById('skipBtn');
		if (skipBtn) {
			skipBtn.addEventListener('click', () => this.skip());
		}
	}

	static updateDisplay() {
		const minutes = Math.floor(this.timeLeft / 60);
		const seconds = this.timeLeft % 60;

		const timerDisplay = document.getElementById('timerDisplay');
		const timerLabel = document.getElementById('timerLabel');
		const sessionCount = document.getElementById('sessionCount');

		if (timerDisplay) {
			timerDisplay.textContent =
				`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}

		if (timerLabel) {
			timerLabel.textContent = this.isWorking ? 'Work Time' : 'Break Time';
			timerLabel.className = this.isWorking ? 'work-session' : 'break-session';
		}

		if (sessionCount) {
			sessionCount.textContent = `Completed Sessions: ${this.completedSessions}`;
		}

		// Update page title with timer
		const displayText = timerDisplay ? timerDisplay.textContent : '00:00';
		const labelText = timerLabel ? timerLabel.textContent : 'Timer';
		document.title = `${displayText} - ${labelText} | Productivity Dashboard`;

		// Update progress bar if it exists
		const progressBar = document.getElementById('progressBar');
		if (progressBar) {
			const settings = storage.getPomodoroSettings();
			const totalTime = this.isWorking ? settings.workMinutes * 60 : settings.breakMinutes * 60;
			const progress = ((totalTime - this.timeLeft) / totalTime) * 100;
			progressBar.style.width = `${progress}%`;
		}
	}

	static start() {
		if (!this.isRunning) {
			this.isRunning = true;
			const startBtn = document.getElementById('startBtn');
			if (startBtn) {
				startBtn.textContent = 'Pause';
				startBtn.disabled = false;
			}

			this.interval = setInterval(() => {
				this.timeLeft--;
				this.updateDisplay();

				if (this.timeLeft === 0) {
					this.complete();
				}
			}, 1000);
		}
	}

	static pause() {
		if (this.isRunning) {
			clearInterval(this.interval);
			this.isRunning = false;
			const startBtn = document.getElementById('startBtn');
			if (startBtn) {
				startBtn.textContent = 'Start';
				startBtn.disabled = false;
			}
		}
	}

	static reset() {
		clearInterval(this.interval);
		this.isRunning = false;
		this.isWorking = true;

		const settings = storage.getPomodoroSettings();
		this.timeLeft = settings.workMinutes * 60;

		const startBtn = document.getElementById('startBtn');
		if (startBtn) {
			startBtn.textContent = 'Start';
			startBtn.disabled = false;
		}

		this.updateDisplay();
		document.title = 'Productivity Dashboard';
	}

	static skip() {
		clearInterval(this.interval);
		this.isRunning = false;
		this.complete();
	}

	static complete() {
		clearInterval(this.interval);
		this.isRunning = false;

		const startBtn = document.getElementById('startBtn');
		if (startBtn) {
			startBtn.textContent = 'Start';
			startBtn.disabled = false;
		}

		// Update completed sessions count
		if (this.isWorking) {
			this.completedSessions++;
			// Save completed sessions to storage
			storage.updatePomodoroStats({
				completedSessions: this.completedSessions,
				lastSessionDate: new Date().toISOString()
			});
		}

		// Switch between work and break
		this.isWorking = !this.isWorking;
		const settings = storage.getPomodoroSettings();
		this.timeLeft = this.isWorking ?
			settings.workMinutes * 60 :
			settings.breakMinutes * 60;

		this.updateDisplay();

		// Show notification
		this.showNotification();

		// Play sound notification (if available)
		this.playNotificationSound();
	}

	static showNotification() {
		const settings = storage.getPomodoroSettings();
		const message = this.isWorking ?
			'Break time is over! Time to get back to work!' :
			`Work session complete! Take a ${settings.breakMinutes}-minute break!`;

		// Try to use browser notifications first
		if ('Notification' in window && Notification.permission === 'granted') {
			new Notification('Pomodoro Timer', {
				body: message,
				icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Im0xMiA2IDAgNiA0IDQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+'
			});
		} else if ('Notification' in window && Notification.permission !== 'denied') {
			Notification.requestPermission().then(permission => {
				if (permission === 'granted') {
					new Notification('Pomodoro Timer', {
						body: message,
						icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Im0xMiA2IDAgNiA0IDQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+'
					});
				}
			});
		} else {
			// Fallback to alert
			alert(message);
		}
	}

	static playNotificationSound() {
		// Create a simple beep sound using Web Audio API
		try {
			const audioContext = new (window.AudioContext || window.webkitAudioContext)();
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);

			oscillator.frequency.value = 800;
			oscillator.type = 'sine';

			gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

			oscillator.start(audioContext.currentTime);
			oscillator.stop(audioContext.currentTime + 0.5);
		} catch (error) {
			console.log('Audio notification not available');
		}
	}

	static updateSettings() {
		const workMinutes = parseInt(document.getElementById('workMinutes').value);
		const breakMinutes = parseInt(document.getElementById('breakMinutes').value);

		// Validate inputs
		if (workMinutes < 1 || workMinutes > 60) {
			document.getElementById('workMinutes').value = 25;
			return;
		}

		if (breakMinutes < 1 || breakMinutes > 30) {
			document.getElementById('breakMinutes').value = 5;
			return;
		}

		// Save to storage
		storage.updatePomodoroSettings({
			workMinutes: workMinutes,
			breakMinutes: breakMinutes
		});

		// Update current timer if not running
		if (!this.isRunning) {
			this.timeLeft = this.isWorking ? workMinutes * 60 : breakMinutes * 60;
			this.updateDisplay();
		}
	}

	static getStats() {
		return {
			completedSessions: this.completedSessions,
			currentSession: this.isWorking ? 'work' : 'break',
			timeLeft: this.timeLeft,
			isRunning: this.isRunning,
			totalMinutesWorked: this.completedSessions * storage.getPomodoroSettings().workMinutes
		};
	}

	static resetStats() {
		this.completedSessions = 0;
		storage.updatePomodoroStats({
			completedSessions: 0,
			lastSessionDate: null
		});
		this.updateDisplay();
	}

	static loadStats() {
		const stats = storage.getPomodoroStats();
		if (stats && stats.completedSessions) {
			this.completedSessions = stats.completedSessions;
			this.updateDisplay();
		}
	}

	static requestNotificationPermission() {
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission().then(permission => {
				console.log('Notification permission:', permission);
			});
		}
	}

	static formatTime(seconds) {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	static getTimeRemaining() {
		return this.formatTime(this.timeLeft);
	}

	static getCurrentSessionType() {
		return this.isWorking ? 'work' : 'break';
	}

	static isActive() {
		return this.isRunning;
	}

	static getProgress() {
		const settings = storage.getPomodoroSettings();
		const totalTime = this.isWorking ? settings.workMinutes * 60 : settings.breakMinutes * 60;
		return Math.round(((totalTime - this.timeLeft) / totalTime) * 100);
	}
}