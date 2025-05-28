// Calendar component
class Calendar {
	static currentDate = new Date();
	static months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	static days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	static init() {
		this.render();
	}

	static render() {
		this.updateMonthDisplay();
		this.renderCalendarGrid();
	}

	static updateMonthDisplay() {
		const monthDisplay = document.getElementById('currentMonth');
		if (monthDisplay) {
			monthDisplay.textContent = `${this.months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
		}
	}

	static renderCalendarGrid() {
		const calendar = document.getElementById('calendar');
		if (!calendar) return;

		calendar.innerHTML = '';

		// Add day headers
		this.days.forEach(day => {
			const dayHeader = document.createElement('div');
			dayHeader.className = 'calendar-day-header';
			dayHeader.textContent = day;
			calendar.appendChild(dayHeader);
		});

		// Get first day of month and total days
		const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
		const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
		const totalDays = lastDay.getDate();
		const firstDayIndex = firstDay.getDay();

		// Add empty cells for days before first of month
		for (let i = 0; i < firstDayIndex; i++) {
			const emptyDay = document.createElement('div');
			emptyDay.className = 'calendar-day empty';
			calendar.appendChild(emptyDay);
		}

		// Add days of month
		const today = new Date();
		for (let day = 1; day <= totalDays; day++) {
			const dayElement = document.createElement('div');
			dayElement.className = 'calendar-day';

			// Check if this day is today
			if (this.currentDate.getMonth() === today.getMonth() &&
				this.currentDate.getFullYear() === today.getFullYear() &&
				day === today.getDate()) {
				dayElement.classList.add('today');
			}

			dayElement.textContent = day;
			calendar.appendChild(dayElement);
		}
	}

	static previousMonth() {
		this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
		this.render();
	}

	static nextMonth() {
		this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
		this.render();
	}

	static goToToday() {
		this.currentDate = new Date();
		this.render();
	}
}