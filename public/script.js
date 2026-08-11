document.addEventListener('DOMContentLoaded', () => {
  const authForm = document.getElementById('auth-form');
  const emailInput = document.getElementById('email-input');
  const loginBtn = document.getElementById('login-btn');
  const btnText = loginBtn.querySelector('.btn-text');
  const btnLoader = loginBtn.querySelector('.btn-loader');
  const statusMessage = document.getElementById('status-message');
  
  const loginFlowScreen = document.getElementById('login-flow-screen');
  const successFlowScreen = document.getElementById('success-flow-screen');
  const userStatusBadge = document.getElementById('user-status-badge');
  const userEmailDisplay = document.getElementById('user-email-display');
  const userIdDisplay = document.getElementById('user-id-display');
  const userDateDisplay = document.getElementById('user-date-display');
  const resetBtn = document.getElementById('reset-btn');

  // Simple RFC-compliant email regex helper
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Handle Form Submission
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const emailValue = emailInput.value.trim();

    // 1. Client-side Validation
    if (!emailValue) {
      showStatus('Please enter an email address.', 'error');
      return;
    }

    if (!EMAIL_REGEX.test(emailValue)) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    // 2. Set loading state
    setLoading(true);
    showStatus('Verifying email and authenticating...', 'info');

    try {
      // 3. Post to Express endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: emailValue })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed. Please try again.');
      }

      // 4. Success: Transition to logged-in state screen
      setTimeout(() => {
        setLoading(false);
        showAuthenticatedState(data);
      }, 800); // Small delay for visual fluid animation

    } catch (err) {
      setLoading(false);
      showStatus(err.message, 'error');
    }
  });

  // Reset form and screens for testing again
  resetBtn.addEventListener('click', () => {
    // Clean up forms
    authForm.reset();
    
    // Hide success screen, show login screen
    successFlowScreen.classList.add('hidden');
    loginFlowScreen.classList.remove('hidden');
    
    // Clear status messages
    statusMessage.classList.add('hidden');
    statusMessage.textContent = '';
    
    emailInput.focus();
  });

  // UI state transition helpers
  function setLoading(isLoading) {
    if (isLoading) {
      loginBtn.disabled = true;
      emailInput.disabled = true;
      btnText.classList.add('hidden');
      btnLoader.classList.remove('hidden');
    } else {
      loginBtn.disabled = false;
      emailInput.disabled = false;
      btnText.classList.remove('hidden');
      btnLoader.classList.add('hidden');
    }
  }

  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message'; // reset styles
    statusMessage.classList.add(type);
    statusMessage.classList.remove('hidden');
  }

  function showAuthenticatedState(payload) {
    const { action, user } = payload;

    // Set badge text & styling based on whether user is new or existing
    if (action === 'signup') {
      userStatusBadge.textContent = 'New User Created';
      userStatusBadge.className = 'badge new-user';
    } else {
      userStatusBadge.textContent = 'Existing User';
      userStatusBadge.className = 'badge existing-user';
    }

    // Set detail values
    userEmailDisplay.textContent = user.email;
    userIdDisplay.textContent = `#${user.id}`;
    
    // Format timestamp nicely
    const formattedDate = formatDate(user.created_at);
    userDateDisplay.textContent = formattedDate;

    // Transition screens
    loginFlowScreen.classList.add('hidden');
    successFlowScreen.classList.remove('hidden');
  }

  function formatDate(isoString) {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  }
});
