// Goals component
class Goals {
	static init() {
		// Ensure storage is initialized
		if (!window.storage) {
			window.storage = new Storage();
		}
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
		const priority = document.getElementById('goalPriority').value;

		if (text) {
			const goal = {
				id: Date.now(),
				text: text,
				priority: priority,
				completed: false,
				createdAt: new Date().toISOString()
			};

			window.storage.addGoal(goal);
			input.value = '';
			this.render();
		}
	}

	static toggle(id) {
		const goals = window.storage.getGoals();
		const goal = goals.find(g => g.id === id);

		if (goal) {
			window.storage.updateGoal(id, { completed: !goal.completed });
			this.render();
		}
	}

	static delete(id) {
		window.storage.deleteGoal(id);
		this.render();
	}

	static render() {
		const container = document.getElementById('goalsList');
		if (!container) return;

		const goals = window.storage.getGoals();
		container.innerHTML = '';

		if (goals.length === 0) {
			container.innerHTML = '<p style="text-align: center; color: #718096; font-style: italic;">No goals yet. Add one above!</p>';
			return;
		}

		// Sort goals by priority (High > Medium > Low)
		const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
		const sortedGoals = goals.sort((a, b) => {
			return priorityOrder[a.priority] - priorityOrder[b.priority];
		});

		sortedGoals.forEach(goal => {
			const div = document.createElement('div');
			div.className = `goal-item ${goal.completed ? 'completed' : ''} priority-${goal.priority}`;
			div.innerHTML = `
                <div class="goal-content">
                    <span class="priority-badge ${goal.priority}">${goal.priority.charAt(0).toUpperCase()}</span>
                    <span class="goal-text" onclick="Goals.toggle(${goal.id})">${this.escapeHtml(goal.text)}</span>
                </div>
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
		const goals = window.storage.getGoals();
		return goals.filter(g => g.completed).length;
	}

	static getTotalCount() {
		return window.storage.getGoals().length;
	}

	static getProgress() {
		const total = this.getTotalCount();
		if (total === 0) return 0;
		return Math.round((this.getCompletedCount() / total) * 100);
	}
}