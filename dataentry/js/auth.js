const API_URL = 'Your_Backend_API_For_Storing_Data';

//Loading DOM
const togglePasswordButtons = document.querySelectorAll('.toggle-password');
const messageElement = document.getElementById('message');

// Password show system
togglePasswordButtons.forEach(button => {
  button.addEventListener('click', () => {
    const input = button.previousElementSibling;
    if (input.type === 'password') {
      input.type = 'text';
      button.textContent = 'Hide';
    } else {
      input.type = 'password';
      button.textContent = 'Show';
    }
  });
});

// Showing message function
function showMessage(text, type) {
  messageElement.textContent = text;
  messageElement.className = `message ${type}`;
}

// Hide message function
function hideMessage() {
  messageElement.className = 'message hidden';
}

// user authentication checking
function checkAuth() {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  return token;
}

// Signup form for user
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // error reset system
    document.querySelectorAll('.error').forEach(el => el.textContent = '');
    hideMessage();
    
    //form data fetching
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // form validation
    let hasError = false;
    
    if (!username) {
      document.getElementById('username-error').textContent = 'Username is required';
      hasError = true;
    }
    
    if (!email) {
      document.getElementById('email-error').textContent = 'Email is required';
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      document.getElementById('email-error').textContent = 'Email is invalid';
      hasError = true;
    }
    
    if (!password) {
      document.getElementById('password-error').textContent = 'Password is required';
      hasError = true;
    } else if (password.length < 6) {
      document.getElementById('password-error').textContent = 'Password must be at least 6 characters';
      hasError = true;
    }
    
    if (password !== confirmPassword) {
      document.getElementById('confirm-password-error').textContent = 'Passwords do not match';
      hasError = true;
    }
    
    if (hasError) return;
    
    // show loading state 
    const button = document.getElementById('signup-button');
    const buttonText = button.querySelector('span:not(.spinner)');
    const spinner = button.querySelector('.spinner');
    
    buttonText.classList.add('hidden');
    spinner.classList.remove('hidden');
    button.disabled = true;
    
    try {
      // Send request to backend API
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          email,
          password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      // success message
      showMessage('Account created successfully! Redirecting to login...', 'success');
      
      // Redirect to login page
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      buttonText.classList.remove('hidden');
      spinner.classList.add('hidden');
      button.disabled = false;
    }
  });
}

// Login form for user
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
  
    document.querySelectorAll('.error').forEach(el => el.textContent = '');
    hideMessage();
    // Get form data from user
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    let hasError = false;
    
    if (!email) {
      document.getElementById('email-error').textContent = 'Email is required';
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      document.getElementById('email-error').textContent = 'Email is invalid';
      hasError = true;
    }
    
    if (!password) {
      document.getElementById('password-error').textContent = 'Password is required';
      hasError = true;
    }
    
    if (hasError) return;
    const button = document.getElementById('login-button');
    const buttonText = button.querySelector('span:not(.spinner)');
    const spinner = button.querySelector('.spinner');
    
    buttonText.classList.add('hidden');
    spinner.classList.remove('hidden');
    button.disabled = true;
    
    try {
      // Send request to backend API
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }
      
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('username', data.username);

      window.location.href = 'dashboard.html';
      
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      buttonText.classList.remove('hidden');
      spinner.classList.add('hidden');
      button.disabled = false;
    }
  });
}

const changePasswordForm = document.getElementById('change-password-form');
if (changePasswordForm) {

  const token = checkAuth();
  
  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelectorAll('.error').forEach(el => el.textContent = '');
    hideMessage();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    let hasError = false;
    if (!currentPassword) {
      document.getElementById('current-password-error').textContent = 'Current password is required';
      hasError = true;
    }
    
    if (!newPassword) {
      document.getElementById('new-password-error').textContent = 'New password is required';
      hasError = true;
    } else if (newPassword.length < 6) {
      document.getElementById('new-password-error').textContent = 'New password must be at least 6 characters';
      hasError = true;
    }
    
    if (newPassword !== confirmPassword) {
      document.getElementById('confirm-password-error').textContent = 'Passwords do not match';
      hasError = true;
    }
    
    if (hasError) return;

    const button = document.getElementById('submit-button');
    const buttonText = button.querySelector('span:not(.spinner)');
    const spinner = button.querySelector('.spinner');
    
    buttonText.classList.add('hidden');
    spinner.classList.remove('hidden');
    button.disabled = true;
    
    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }
      showMessage('Password changed successfully!', 'success');
      changePasswordForm.reset();
      
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      buttonText.classList.remove('hidden');
      spinner.classList.add('hidden');
      button.disabled = false;
    }
  });
  const backButton = document.getElementById('back-button');
  if (backButton) {
    backButton.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }
}
