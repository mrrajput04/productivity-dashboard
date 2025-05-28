// Pomodoro Timer Component
class Pomodoro {
	static WORK_TIME = 25 * 60; // 25 minutes in seconds
	static SHORT_BREAK = 5 * 60; // 5 minutes in seconds
	static LONG_BREAK = 15 * 60; // 15 minutes in seconds
	static POMODOROS_BEFORE_LONG_BREAK = 4;

	static init() {
		if (!window.storage) {
			console.error('Storage not initialized');
			return;
		}

		this.settings = window.storage.getPomodoroSettings() || {
			workTime: this.WORK_TIME,
			shortBreak: this.SHORT_BREAK,
			longBreak: this.LONG_BREAK,
			pomodorosBeforeLongBreak: this.POMODOROS_BEFORE_LONG_BREAK
		};

		this.timeLeft = this.settings.workTime;
		this.isRunning = false;
		this.isPaused = false;
		this.isBreak = false;
		this.completedPomodoros = 0;
		this.timer = null;

		this.initializeElements();
		this.initializeEventListeners();
		this.updateDisplay();
	}

	static initializeElements() {
		this.timerDisplay = document.getElementById('timer-display');
		this.startButton = document.getElementById('start-timer');
		this.pauseButton = document.getElementById('pause-timer');
		this.resetButton = document.getElementById('reset-timer');
		this.pomodoroCount = document.getElementById('pomodoro-count');
		this.modeDisplay = document.getElementById('timer-mode');
	}

	static initializeEventListeners() {
		this.startButton.addEventListener('click', () => this.startTimer());
		this.pauseButton.addEventListener('click', () => this.pauseTimer());
		this.resetButton.addEventListener('click', () => this.resetTimer());

		// Keyboard shortcuts
		document.addEventListener('keydown', (e) => {
			if (e.ctrlKey || e.metaKey) {
				switch (e.key.toLowerCase()) {
					case 's':
						e.preventDefault();
						this.startTimer();
						break;
					case 'p':
						e.preventDefault();
						this.pauseTimer();
						break;
					case 'r':
						e.preventDefault();
						this.resetTimer();
						break;
				}
			}
		});
	}

	static startTimer() {
		if (this.isRunning && !this.isPaused) return;

		if (!this.isRunning) {
			this.isRunning = true;
			this.startButton.textContent = 'Start';
		}

		this.isPaused = false;
		this.timer = setInterval(() => this.tick(), 1000);
		this.updateDisplay();
	}

	static pauseTimer() {
		if (!this.isRunning || this.isPaused) return;

		this.isPaused = true;
		clearInterval(this.timer);
		this.updateDisplay();
	}

	static resetTimer() {
		this.isRunning = false;
		this.isPaused = false;
		clearInterval(this.timer);
		this.timeLeft = this.settings.workTime;
		this.isBreak = false;
		this.updateDisplay();
	}

	static tick() {
		if (this.timeLeft > 0) {
			this.timeLeft--;
			this.updateDisplay();
		} else {
			this.completeInterval();
		}
	}

	static completeInterval() {
		clearInterval(this.timer);
		this.playNotification();

		if (!this.isBreak) {
			this.completedPomodoros++;
			if (this.completedPomodoros % this.settings.pomodorosBeforeLongBreak === 0) {
				this.timeLeft = this.settings.longBreak;
				this.isBreak = true;
			} else {
				this.timeLeft = this.settings.shortBreak;
				this.isBreak = true;
			}
		} else {
			this.timeLeft = this.settings.workTime;
			this.isBreak = false;
		}

		this.updateDisplay();
		this.startTimer();
	}

	static updateDisplay() {
		const minutes = Math.floor(this.timeLeft / 60);
		const seconds = this.timeLeft % 60;
		this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

		this.pomodoroCount.textContent = `Pomodoros: ${this.completedPomodoros}`;
		this.modeDisplay.textContent = this.isBreak ? 'Break Time' : 'Work Time';

		// Update button states
		this.startButton.disabled = this.isRunning && !this.isPaused;
		this.pauseButton.disabled = !this.isRunning || this.isPaused;
		document.title = `${this.timerDisplay.textContent} - ${this.modeDisplay.textContent}`;
	}

	static playNotification() {
		try {
			const audio = new Audio('data:audio/wav;base64,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');
			audio.play();
		} catch (e) {
			console.log('Notification sound failed to play:', e);
		}
	}
}