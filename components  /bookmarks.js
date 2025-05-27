// Bookmarks component
class Bookmarks {
	static init() {
		this.render();
		this.setupEventListeners();
	}

	static setupEventListeners() {
		// Enter key listener for bookmark inputs
		const titleInput = document.getElementById('bookmarkTitle');
		const urlInput = document.getElementById('bookmarkUrl');

		if (urlInput) {
			urlInput.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					this.add();
				}
			});
		}

		if (titleInput) {
			titleInput.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					document.getElementById('bookmarkUrl').focus();
				}
			});
		}
	}

	static add() {
		const titleInput = document.getElementById('bookmarkTitle');
		const urlInput = document.getElementById('bookmarkUrl');

		const title = titleInput.value.trim();
		const url = urlInput.value.trim();

		if (title && url) {
			// Validate URL
			if (!this.isValidUrl(url)) {
				alert('Please enter a valid URL');
				return;
			}

			// Add https:// if no protocol specified
			const formattedUrl = url.startsWith('http') ? url : `https://${url}`;

			const bookmark = {
				id: Date.now(),
				title: title,
				url: formattedUrl,
				createdAt: new Date().toISOString(),
				favicon: this.getFaviconUrl(formattedUrl)
			};

			storage.addBookmark(bookmark);

			titleInput.value = '';
			urlInput.value = '';
			this.render();
		} else {
			alert('Please fill in both title and URL');
		}
	}

	static delete(id) {
		if (confirm('Are you sure you want to delete this bookmark?')) {
			storage.deleteBookmark(id);
			this.render();
		}
	}

	static render() {
		const container = document.getElementById('bookmarksList');
		if (!container) return;

		const bookmarks = storage.getBookmarks();
		container.innerHTML = '';

		if (bookmarks.length === 0) {
			container.innerHTML = '<p style="text-align: center; color: #718096; font-style: italic;">No bookmarks yet. Add one above!</p>';
			return;
		}

		bookmarks.forEach(bookmark => {
			const div = document.createElement('div');
			div.className = 'bookmark-item';
			div.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                    <img src="${bookmark.favicon}" 
                         alt="favicon" 
                         style="width: 16px; height: 16px; border-radius: 2px;"
                         onerror="this.style.display='none'">
                    <div style="flex: 1;">
                        <a href="${bookmark.url}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="bookmark-link">${this.escapeHtml(bookmark.title)}</a>
                        <div class="bookmark-url">${this.truncateUrl(bookmark.url)}</div>
                    </div>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button class="btn" 
                            style="padding: 4px 8px; font-size: 12px;" 
                            onclick="Bookmarks.copyUrl('${bookmark.url}')">Copy</button>
                    <button class="delete-btn" onclick="Bookmarks.delete(${bookmark.id})">Delete</button>
                </div>
            `;
			container.appendChild(div);
		});
	}

	static isValidUrl(string) {
		try {
			// Remove protocol if present for validation
			const urlWithoutProtocol = string.replace(/^https?:\/\//, '');
			// Check if it contains at least one dot and valid characters
			return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}/.test(urlWithoutProtocol) ||
				/^localhost(:[0-9]+)?/.test(urlWithoutProtocol) ||
				/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/.test(urlWithoutProtocol);
		} catch (e) {
			return false;
		}
	}

	static getFaviconUrl(url) {
		try {
			const domain = new URL(url).hostname;
			return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
		} catch (e) {
			return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="%23ddd"/></svg>';
		}
	}

	static truncateUrl(url, maxLength = 50) {
		if (url.length <= maxLength) return url;
		return url.substring(0, maxLength) + '...';
	}

	static escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	static async copyUrl(url) {
		try {
			if (navigator.clipboard && navigator.clipboard.writeText) {
				await navigator.clipboard.writeText(url);
				this.showToast('URL copied to clipboard!');
			} else {
				// Fallback for older browsers
				const textArea = document.createElement('textarea');
				textArea.value = url;
				textArea.style.position = 'fixed';
				textArea.style.left = '-999999px';
				textArea.style.top = '-999999px';
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();

				try {
					document.execCommand('copy');
					this.showToast('URL copied to clipboard!');
				} catch (err) {
					this.showToast('Copy failed. Please copy manually.');
				}

				document.body.removeChild(textArea);
			}
		} catch (err) {
			this.showToast('Copy failed. Please copy manually.');
		}
	}

	static showToast(message) {
		// Create a simple toast notification
		const toast = document.createElement('div');
		toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4a5568;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 1000;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
		toast.textContent = message;

		document.body.appendChild(toast);

		// Fade in
		setTimeout(() => {
			toast.style.opacity = '1';
		}, 100);

		// Fade out and remove
		setTimeout(() => {
			toast.style.opacity = '0';
			setTimeout(() => {
				if (document.body.contains(toast)) {
					document.body.removeChild(toast);
				}
			}, 300);
		}, 2000);
	}

	static exportBookmarks() {
		const bookmarks = storage.getBookmarks();
		const dataStr = JSON.stringify(bookmarks, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });

		const link = document.createElement('a');
		link.href = URL.createObjectURL(dataBlob);
		link.download = 'bookmarks.json';
		link.click();
	}

	static importBookmarks(fileInput) {
		const file = fileInput.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const importedBookmarks = JSON.parse(e.target.result);
				if (Array.isArray(importedBookmarks)) {
					importedBookmarks.forEach(bookmark => {
						if (bookmark.title && bookmark.url) {
							bookmark.id = Date.now() + Math.random();
							storage.addBookmark(bookmark);
						}
					});
					this.render();
					this.showToast('Bookmarks imported successfully!');
				}
			} catch (error) {
				this.showToast('Error importing bookmarks. Invalid file format.');
			}
		};
		reader.readAsText(file);
	}
}