const username = localStorage.getItem('username');
let userId = localStorage.getItem('userId');

if (!username) window.location.href = 'index.html';

document.getElementById('profileName').textContent = username;
document.getElementById('avatarLetter').textContent = username.charAt(0).toUpperCase();

async function loadProfile() {
  if (!userId) {
    const res = await fetch('/Users');
    const users = await res.json();
    const user = users.find(u => u.username === username);
    if (!user) return;
    userId = user.id;
    localStorage.setItem('userId', userId);
  }

  const res = await fetch(`/Books/user/${userId}`);
  const books = await res.json();

  // stats
  document.getElementById('statTotal').textContent = books.length;
  document.getElementById('statFinished').textContent = books.filter(b => b.status === 'finished').length;
  document.getElementById('statReading').textContent = books.filter(b => b.status === 'reading').length;

  // recent books
  const recent = [...books].reverse().slice(0, 5);
  const container = document.getElementById('recentBooks');

  if (recent.length === 0) {
    container.innerHTML = `<p style="color:var(--muted);font-size:0.9rem">No books yet. <a href="add.html" style="color:var(--accent)">Add your first one!</a></p>`;
    return;
  }

  container.innerHTML = recent.map(book => `
    <div class="recent-book">
      <div class="recent-book-info">
        <div class="recent-book-title">${book.title}</div>
        <div class="recent-book-author">${book.author}</div>
      </div>
      <span class="badge ${book.status}">${book.status}</span>
    </div>
  `).join('');
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

loadProfile();