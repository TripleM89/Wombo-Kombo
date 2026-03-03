const username = localStorage.getItem('username');

if (!username) window.location.href = 'index.html';

let allBooks = [];

// load books for current user
async function loadBooks() {
  const usersRes = await fetch('/Users');
  const users = await usersRes.json();
  const user = users.find(u => u.username === username);

  if (!user) return;

  localStorage.setItem('userId', user.id);

  const booksRes = await fetch(`/Books/user/${user.id}`);
  allBooks = await booksRes.json();
  renderBooks(allBooks);
}

/**
 * @param {Array} books - list of books to render
 */
function renderBooks(books) {
  const grid = document.getElementById('booksGrid');
  const count = document.getElementById('bookCount');

  count.textContent = `${books.length} book${books.length !== 1 ? 's' : ''}`;

  if (books.length === 0) {
    grid.innerHTML = `<div class="empty">
      <p>No books yet. <a href="add.html" style="color:var(--accent)">Add one!</a></p>
    </div>`;
    return;
  }

  grid.innerHTML = books.map(book => `
    <div class="book-card">
      <span class="book-status ${book.status}">${book.status}</span>
      <div class="book-title">${book.title}</div>
      <div class="book-author">${book.author}</div>
      ${book.review ? `<div class="book-review">"${book.review}"</div>` : ''}
      <div class="book-date">
        Added ${formatDate(book.date_added)}
        ${book.date_finished ? `· Finished ${formatDate(book.date_finished)}` : ''}
      </div>
      <div class="book-actions">
        <a class="action-btn" href="add.html?edit=${book.id}">Edit</a>
        <button class="action-btn delete" onclick="deleteBook(${book.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

/**
 * @param {string} status - 'all', 'reading' or 'finished'
 * @param {HTMLElement} btn - the clicked filter button
 */
function filterBooks(status, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBooks(status === 'all' ? allBooks : allBooks.filter(b => b.status === status));
}

/**
 * @param {number} id - book id to delete
 */
async function deleteBook(id) {
  if (!confirm('Remove this book?')) return;
  await fetch(`/Books/${id}`, { method: 'DELETE' });
  allBooks = allBooks.filter(b => b.id !== id);
  renderBooks(allBooks);
}

/**
 * @param {string} d - date string from db
 * @returns {string} formatted date
 */
function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

loadBooks();