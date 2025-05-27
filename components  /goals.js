// Goals component
class Goals {
	static init() {
		this.render();
		this.setupEventListeners();
	}

	static setupEventListeners() {
		// Enter key listener for goal input
		const goalInput = document.getElementById('goalInput');
		if (goalInput) {
			goalInput.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					this.add();
				}
			});
		}
	}

	static add() {
		const input = document.getElementById('goalInput');
		const text = input.value.trim();

		if (text) {
			const goal = {
				id: Date.now(),
				text: text,
				completed: false,
				createdAt: new Date().toISOString()
			};

			storage.addGoal(goal);
			input.value = '';
			this.render();
		}
	}

	static toggle(id) {
		const goals = storage.getGoals();
		const goal = goals.find(g => g.id === id);

		if (goal) {
			storage.updateGoal(id, { completed: !goal.completed });
			this.render();
		}
	}

	static delete(id) {
		storage.deleteGoal(id);
		this.render();
	}

	static render() {
		const container = document.getElementById('goalsList');
		if (!container) return;

		const goals = storage.getGoals();
		container.innerHTML = '';

		if (goals.length === 0) {
			container.innerHTML = '<p style="text-align: center; color: #718096; font-style: italic;">No goals yet. Add one above!</p>';
			return;
		}

		goals.forEach(goal => {
			const div = document.createElement('div');
			div.className = `goal-item ${goal.completed ? 'completed' : ''}`;
			div.innerHTML = `
                <span class="goal-text" onclick="Goals.toggle(${goal.id})">${this.escapeHtml(goal.text)}</span>
                <button class="delete-btn" onclick="Goals.delete(${goal.id})">Delete</button>
            `;
			container.appendChild(div);
		});
	}

	static escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	static getCompletedCount() {
		const goals = storage.getGoals();
		return goals.filter(g => g.completed).length;
	}

	static getTotalCount() {
		return storage.getGoals().length;
	}

	static getProgress() {
		const total = this.getTotalCount();
		if (total === 0) return 0;
		return Math.round((this.getCompletedCount() / total) * 100);
	}
}