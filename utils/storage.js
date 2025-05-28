// Storage utility - handles localStorage or Firebase logic
class Storage {
	constructor() {
		this.isLocalStorageAvailable = this.checkLocalStorage();
		this.data = {
			goals: [],
			bookmarks: [],
			pomodoroSettings: {
				workMinutes: 25,
				breakMinutes: 5
			}
		};

		if (this.isLocalStorageAvailable) {
			this.loadFromLocalStorage();
		}
	}

	checkLocalStorage() {
		try {
			const test = 'test';
			localStorage.setItem(test, test);
			localStorage.removeItem(test);
			return true;
		} catch (e) {
			return false;
		}
	}

	// Load data from localStorage
	loadFromLocalStorage() {
		try {
			const storedGoals = localStorage.getItem('productivity_goals');
			const storedBookmarks = localStorage.getItem('productivity_bookmarks');
			const storedSettings = localStorage.getItem('productivity_pomodoro_settings');

			if (storedGoals) {
				this.data.goals = JSON.parse(storedGoals);
			}

			if (storedBookmarks) {
				this.data.bookmarks = JSON.parse(storedBookmarks);
			}

			if (storedSettings) {
				this.data.pomodoroSettings = JSON.parse(storedSettings);
			}
		} catch (error) {
			console.error('Error loading from localStorage:', error);
		}
	}

	// Save data to localStorage
	saveToLocalStorage() {
		if (!this.isLocalStorageAvailable) return;

		try {
			localStorage.setItem('productivity_goals', JSON.stringify(this.data.goals));
			localStorage.setItem('productivity_bookmarks', JSON.stringify(this.data.bookmarks));
			localStorage.setItem('productivity_pomodoro_settings', JSON.stringify(this.data.pomodoroSettings));
		} catch (error) {
			console.error('Error saving to localStorage:', error);
		}
	}

	// Goals methods
	getGoals() {
		return this.data.goals;
	}

	addGoal(goal) {
		this.data.goals.push(goal);
		this.saveToLocalStorage();
	}

	updateGoal(id, updates) {
		const goalIndex = this.data.goals.findIndex(g => g.id === id);
		if (goalIndex !== -1) {
			this.data.goals[goalIndex] = { ...this.data.goals[goalIndex], ...updates };
			this.saveToLocalStorage();
		}
	}

	deleteGoal(id) {
		this.data.goals = this.data.goals.filter(g => g.id !== id);
		this.saveToLocalStorage();
	}

	// Bookmarks methods
	getBookmarks() {
		return this.data.bookmarks;
	}

	addBookmark(bookmark) {
		this.data.bookmarks.push(bookmark);
		this.saveToLocalStorage();
	}

	deleteBookmark(id) {
		this.data.bookmarks = this.data.bookmarks.filter(b => b.id !== id);
		this.saveToLocalStorage();
	}

	// Pomodoro settings methods
	getPomodoroSettings() {
		return this.data.pomodoroSettings;
	}

	updatePomodoroSettings(settings) {
		this.data.pomodoroSettings = { ...this.data.pomodoroSettings, ...settings };
		this.saveToLocalStorage();
	}

	// Firebase integration (placeholder for future implementation)
	async initFirebase(config) {
		// This would initialize Firebase with the provided config
		// For now, it's a placeholder for future Firebase integration
		console.log('Firebase integration not implemented yet');
	}

	async syncWithFirebase() {
		// This would sync local data with Firebase
		console.log('Firebase sync not implemented yet');
	}
}

// Export the Storage class
window.Storage = Storage;