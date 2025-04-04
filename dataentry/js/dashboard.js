const API_URL = 'https://fan-data-store.onrender.com';

// DOM Elements
const messageElement = document.getElementById('message');
const usernameElement = document.getElementById('username');
const logoutButton = document.getElementById('logout-button');
const entryForm = document.getElementById('entry-form');
const showDataButton = document.getElementById('show-data-button');
const changePasswordButton = document.getElementById('change-password-button');


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


function handleAuthError(errorMessage = 'Authentication failed') {
  console.error('Auth error:', errorMessage);
  localStorage.removeItem('authToken');
  localStorage.removeItem('username');
  
  alert(errorMessage);
  
  if (!window.location.pathname.endsWith('login.html')) {
    window.location.href = 'login.html';
  }
}

async function initDashboard() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      handleAuthError('Please login first');
      return;
    }

    usernameElement.textContent = 'Loading dashboard...';

    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Server error: ${text.slice(0, 50)}...`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API request failed (${response.status})`);
    }

    const userData = await response.json();
    usernameElement.textContent=localStorage.getItem('username', userData.username); 

  } catch (error) {
    console.error('Dashboard error:', error);
    handleAuthError(error.message);
  }
}

document.addEventListener('DOMContentLoaded', initDashboard);

if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
  });
}

if (entryForm) {
  entryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = checkAuth();
    document.querySelectorAll('.error').forEach(el => el.textContent = '');
    hideMessage();
    const date = document.getElementById('date').value;
    const quantity = document.getElementById('quantity').value;
    const price = document.getElementById('price').value;
    
    let hasError = false;
    
    if (!date) {
      document.getElementById('date-error').textContent = 'Date is required';
      hasError = true;
    }
    
    if (!quantity) {
      document.getElementById('quantity-error').textContent = 'Quantity is required';
      hasError = true;
    } else if (isNaN(quantity) || Number(quantity) <= 0) {
      document.getElementById('quantity-error').textContent = 'Quantity must be a positive number';
      hasError = true;
    }
    
    if (!price) {
      document.getElementById('price-error').textContent = 'Price is required';
      hasError = true;
    } else if (isNaN(price) || Number(price) <= 0) {
      document.getElementById('price-error').textContent = 'Price must be a positive number';
      hasError = true;
    }
    
    if (hasError) return;
    
    const button = document.getElementById('submit-button');
    const buttonText = button.querySelector('span');

    const originalText = buttonText.textContent;
    buttonText.textContent = 'Submitting...';
    button.disabled = true;
    
    try {
      const response = await fetch(`${API_URL}/api/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date,
          quantity: Number(quantity),
          price: Number(price)
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit data');
      }

      showMessage('Data submitted successfully!', 'success');

      entryForm.reset();
      
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      buttonText.textContent = originalText;
      button.disabled = false;
    }
  });
}

if (showDataButton) {
  showDataButton.addEventListener('click', () => {
    window.location.href = 'data.html';
  });
}
if (changePasswordButton) {
  changePasswordButton.addEventListener('click', () => {
    window.location.href = 'change-password.html';
  });
}