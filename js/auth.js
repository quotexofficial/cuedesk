/**
 * @file auth.js
 * @description BARE TALLIES - Authentication & Session Management Module
 * 
 * ============================================================================
 * SINGLE-OWNER AUTHORIZATION & ROW LEVEL SECURITY (RLS) NOTE:
 * ============================================================================
 * Supabase Auth handles authentication (verifying WHO the user is via email/password).
 * However, since BARE TALLIES is a single-owner snooker club management system,
 * authorization (ensuring ONLY the designated owner accesses the data) must be 
 * strictly enforced at the database level using Row Level Security (RLS) policies.
 * 
 * Recommended RLS Enforcement:
 * Ensure your database tables have policies checking that `auth.uid()` matches 
 * the specific owner's user ID, or ensure public sign-ups are disabled entirely 
 * in your Supabase dashboard (Authentication > Providers > Email > Disable signups) 
 * so only the pre-created owner account can ever exist.
 * ============================================================================
 */

import { supabase, getCurrentSession, getCurrentUser } from './supabase.js';

// Expected DOM Element IDs
const ELEMENT_IDS = {
  form: 'login-form',
  emailInput: 'email',
  passwordInput: 'password',
  passwordToggle: 'password-toggle',
  submitBtn: 'submit-btn',
  loadingIndicator: 'loading-indicator',
  errorMessage: 'error-message',
  logoutBtn: 'logout-btn'
};

/**
 * Automatically checks session status on page load and handles navigation protection.
 */
async function initAuthGuard() {
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/');
  
  const session = await getCurrentSession();

  if (session && isLoginPage) {
    // If already authenticated and on login page, redirect to dashboard
    window.location.href = 'dashboard.html';
    return;
  }

  if (!session && !isLoginPage) {
    // If not authenticated and on a protected page, redirect to login
    window.location.href = 'index.html';
    return;
  }

  // Listen to auth state changes for real-time session tracking
  supabase.auth.onAuthStateChange((event, currentSession) => {
    if (event === 'SIGNED_IN' && isLoginPage) {
      window.location.href = 'dashboard.html';
    } else if (event === 'SIGNED_OUT' && !isLoginPage) {
      window.location.href = 'index.html';
    }
  });
}

/**
 * Handles owner sign-in submission.
 * @param {SubmitEvent} event 
 */
async function handleLogin(event) {
  event.preventDefault();

  const emailInput = document.getElementById(ELEMENT_IDS.emailInput);
  const passwordInput = document.getElementById(ELEMENT_IDS.passwordInput);
  const submitBtn = document.getElementById(ELEMENT_IDS.submitBtn);
  const loadingIndicator = document.getElementById(ELEMENT_IDS.loadingIndicator);
  const errorMessage = document.getElementById(ELEMENT_IDS.errorMessage);

  if (!emailInput || !passwordInput || !submitBtn) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Clear previous errors & show loading state
  if (errorMessage) {
    errorMessage.textContent = '';
    errorMessage.hidden = true;
  }

  submitBtn.disabled = true;
  if (loadingIndicator) loadingIndicator.hidden = false;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.session) {
      window.location.href = 'dashboard.html';
    }
  } catch (err) {
    console.error('Login error:', err.message);
    if (errorMessage) {
      errorMessage.textContent = err.message === 'Invalid login credentials' 
        ? 'Invalid email or password. Please try again.' 
        : err.message || 'Failed to sign in. Please check your credentials.';
      errorMessage.hidden = false;
    }
  } finally {
    submitBtn.disabled = false;
    if (loadingIndicator) loadingIndicator.hidden = true;
  }
}

/**
 * Securely signs out the current owner and redirects to login.
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.href = 'index.html';
  } catch (err) {
    console.error('Sign out error:', err.message);
    window.location.href = 'index.html'; // Force redirect even on network error
  }
}

/**
 * Setup password show/hide toggle functionality.
 */
function setupPasswordToggle() {
  const toggleBtn = document.getElementById(ELEMENT_IDS.passwordToggle);
  const passwordInput = document.getElementById(ELEMENT_IDS.passwordInput);

  if (!toggleBtn || !passwordInput) return;

  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleBtn.textContent = isPassword ? 'Hide' : 'Show';
    toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  });
}

// Event Listeners initialization on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  initAuthGuard();
  setupPasswordToggle();

  const loginForm = document.getElementById(ELEMENT_IDS.form);
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const logoutBtn = document.getElementById(ELEMENT_IDS.logoutBtn);
  if (logoutBtn) {
    logoutBtn.addEventListener('click', signOut);
  }
});

export { getCurrentSession, getCurrentUser };