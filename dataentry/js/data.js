const API_URL = 'Your_Backend_API_For_Storing_Data';

const messageElement = document.getElementById('message');
const loadingElement = document.getElementById('loading');
const noDataElement = document.getElementById('no-data');
const dataTableContainer = document.getElementById('data-table-container');
const dataTableBody = document.getElementById('data-table-body');
const backButton = document.getElementById('back-button');
const goDashboardButton = document.getElementById('go-dashboard');
const spinner = document.querySelector('.spinner');

spinner.addEventListener('animationend', () => {
  spinner.style.display = 'none'; 
});

function showMessage(text, type) {
  messageElement.textContent = text;
  messageElement.className = `message ${type}`;
}

function hideMessage() {
  messageElement.className = 'message hidden';
}

function checkAuth() {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  return token;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function formatCurrency(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

async function fetchData() {
  const token = checkAuth();
  
  try {
    const response = await fetch (`${API_URL}/api/entries`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Server returned: ${text.slice(0, 100)}`);
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const entries = await response.json();
    
    loadingElement.classList.add('hidden');
    
    if (entries.length === 0) {
      noDataElement.classList.remove('hidden');
    } else {
      dataTableContainer.classList.remove('hidden');
      dataTableBody.innerHTML = '';
      entries.forEach((entry, index) => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${formatDate(entry.date)}</td>
          <td>${entry.quantity}</td>
          <td>${formatCurrency(entry.price)}</td>
          <td>
            <button class="delete-btn" data-id="${entry._id}">Delete</button>
          </td>
        `;
        
        dataTableBody.appendChild(tr);
      });
      document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', handleDelete);
      });
    }
    
  } catch (error) {
    loadingElement.classList.add('hidden');
    showMessage(error.message, 'error');
  }
}
async function handleDelete(e) {
  const token = checkAuth();
  const id = e.target.dataset.id;
  
  if (!confirm('Delete this entry permanently?')) return;

  const button = e.target;
  button.disabled = true;
  button.textContent = 'Deleting...';

  try {
    const response = await fetch(`${API_URL}/api/entries/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.headers.get('content-type')?.includes('application/json')) {
      const text = await response.text();
      throw new Error(text.slice(0, 100));
    }
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Delete failed');
    }
    button.textContent = '✓ Deleted';
    setTimeout(() => button.closest('tr').remove(), 500);

  } catch (error) {
    console.error('Delete failed:', error);
    button.textContent = 'Delete';
    button.disabled = false;
    showMessage(error.message, 'error');
  }
}
document.addEventListener('DOMContentLoaded', fetchData);

if (backButton) {
  backButton.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
}

if (goDashboardButton) {
  goDashboardButton.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
}
