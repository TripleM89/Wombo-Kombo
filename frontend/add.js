const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');

if (!username) window.location.href = 'index.html';

document.getElementById('dateAdded').value = new Date().toISOString().split('T')[0];

const params = new URLSearchParams(window.location.search);
const editId = params.get('edit');
let isEditing = false;

if (editId) loadBookForEdit(editId);

/**
 * @param {string|number} id - book id to load for editing
 */
async function loadBookForEdit(id) {
  const res = await fetch('/Books');
  const books = await res.json();
  const book = books.find(b => b.id == id);

  if (!book) return;

  isEditing = true;
  document.getElementById('pageTitle').textContent = 'Edit book';
  document.getElementById('submitBtn').textContent = 'Save changes';
  document.getElementById('title').value = book.title;
  document.getElementById('author').value = book.author;
  document.getElementById('status').value = book.status;
  document.getElementById('dateAdded').value = book.date_added?.split('T')[0] || '';
  document.getElementById('review').value = book.review || '';

  if (book.status === 'finished') {
    document.getElementById('finishDateField').style.display = 'block';
    document.getElementById('dateFinished').value = book.date_finished?.split('T')[0] || '';
  }
}

function toggleFinishDate() {
  const finished = document.getElementById('status').value === 'finished';
  document.getElementById('finishDateField').style.display = finished ? 'block' : 'none';
}

/**
 * @param {string} text - message to display
 * @param {string} type - 'error' or 'success'
 */
function showMsg(text, type) {
  const el = document.getElementById('formMsg');
  el.textContent = text;
  el.className = 'message ' + type;
}

async function handleSubmit() {
  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const status = document.getElementById('status').value;
  const date_added = document.getElementById('dateAdded').value;
  const date_finished = document.getElementById('dateFinished').value || null;
  const review = document.getElementById('review').value.trim() || null;

  if (!title || !author) return showMsg('Title and author are required', 'error');

  try {
    if (isEditing) {
      await fetch(`/Books/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, date_finished, review })
      });
    } else {
      await fetch('/Books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, title, author, status, date_added })
      });
    }

    showMsg(isEditing ? 'Book updated!' : 'Book added!', 'success');
    setTimeout(() => window.location.href = 'books.html', 1000);
  } catch (err) {
    showMsg('Something went wrong', 'error');
  }
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}