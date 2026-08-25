/* ============================================================
   LEGALCONNECT — AUTHENTICATION PAGES
   auth_page.js — Role Selection, Login, and Forgot Password
   ============================================================ */

const AuthPage = {
  /* --------------------------------------------------------
     ROLE SELECTION (Point 2)
     -------------------------------------------------------- */
  renderRoleSelect() {
    return `
      <div class="fullscreen-page">
        <div class="role-selection">
          <div class="login-logo">
            <div class="login-logo-icon">
              <span class="material-symbols-rounded">balance</span>
            </div>
            <div class="login-logo-text" style="color:var(--color-white)">LegalConnect</div>
          </div>
          <h2 class="role-question">How would you like to use LegalConnect?</h2>
          <p class="role-hint">Select your role to access customized legal tools, workflows and simulated courtrooms</p>

          <div class="role-cards">
            <!-- User / Client Role -->
            <div class="role-card" onclick="Utils.showToast('Client Portal is under preparation. Please select Lawyer / Advocate to explore the portal.', 'info')">
              <div class="role-card-icon">
                <span class="material-symbols-rounded">person</span>
              </div>
              <h3 class="role-card-title">User / Client</h3>
              <p class="role-card-desc">Find top verified advocates, get AI legal assistance & book virtual consultations</p>
              <button class="btn btn-secondary btn-sm mt-4 w-full">I am a Client</button>
            </div>

            <!-- Lawyer / Advocate Role -->
            <div class="role-card" onclick="Router.navigate('/login')">
              <div class="role-card-icon">
                <span class="material-symbols-rounded">gavel</span>
              </div>
              <h3 class="role-card-title">Lawyer / Advocate</h3>
              <p class="role-card-desc">Manage clients, virtual court hearings, case dossiers, litigation pipelines & earnings</p>
              <button class="btn btn-accent btn-sm mt-4 w-full">I am a Lawyer / Advocate</button>
            </div>
          </div>

          <div class="mt-8 text-center" style="color:rgba(255,255,255,0.7);font-size:var(--text-body-sm)">
            New Advocate to LegalConnect? 
            <a onclick="Router.navigate('/register')" style="color:var(--color-accent-lighter);font-weight:600;cursor:pointer;text-decoration:underline">
              Start Advocate Registration →
            </a>
          </div>
        </div>
      </div>
    `;
  },

  /* --------------------------------------------------------
     LOGIN PAGE (Point 3)
     -------------------------------------------------------- */
  renderLogin() {
    return `
      <div class="fullscreen-page">
        <div class="fullscreen-card">
          <div class="login-logo">
            <div class="login-logo-icon">
              <span class="material-symbols-rounded">gavel</span>
            </div>
            <div class="login-logo-text">LegalConnect</div>
          </div>

          <h2 class="login-title">Advocate Practice Portal</h2>
          <p class="login-subtitle">Sign in to manage your cases, hearings & clients</p>

          <form class="login-form" onsubmit="AuthPage.handleLogin(event)">
            <div class="form-group">
              <label class="form-label">Registered Email or Mobile Number</label>
              <div class="input-icon-wrapper">
                <input type="text" id="login-identifier" class="form-input" placeholder="demo@legalconnect.in or 9876543210" value="demo@legalconnect.in" required>
                <span class="material-symbols-rounded input-icon">mail</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-icon-wrapper">
                <input type="password" id="login-password" class="form-input" placeholder="Enter password" value="Demo@1234" required>
                <span class="material-symbols-rounded input-icon">lock</span>
              </div>
            </div>

            <div class="login-extras">
              <label class="login-remember">
                <input type="checkbox" id="login-remember" checked>
                Remember Me
              </label>
              <a class="login-forgot" onclick="Router.navigate('/forgot-password')">Forgot Password?</a>
            </div>

            <button type="submit" id="btn-login-submit" class="btn btn-primary btn-block btn-lg">
              Sign In to Practice
            </button>
          </form>

          <div class="demo-hint">
            <strong>Pre-filled Demo Login:</strong> <code>demo@legalconnect.in</code> / <code>Demo@1234</code>
          </div>

          <div class="login-divider">
            <span>or sign in with</span>
          </div>

          <div class="social-login">
            <button type="button" class="social-btn" onclick="AuthPage.handleSocialLogin('Google')">
              <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
              Google
            </button>
            <button type="button" class="social-btn" onclick="AuthPage.handleSocialLogin('Apple')">
              <svg viewBox="0 0 24 24"><path fill="#000" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.61 1.34-.55.63-.99 1.68-.86 2.7.99.08 2.01-.52 2.55-1.19z"/></svg>
              Apple
            </button>
          </div>

          <div class="login-footer">
            Don't have an advocate account? 
            <a onclick="Router.navigate('/register')" style="font-weight:600">Register as Lawyer →</a>
          </div>
        </div>
      </div>
    `;
  },

  async handleLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('login-remember').checked;
    const submitBtn = document.getElementById('btn-login-submit');

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';

    const result = await AuthManager.login(identifier, password, remember);

    if (result.success) {
      Utils.showToast('Credentials authenticated. Completing 2FA OTP verification...', 'info');
      Router.navigate('/otp');
    } else {
      Utils.showToast(result.error || 'Authentication failed', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Sign In to Practice';
    }
  },

  handleSocialLogin(provider) {
    Utils.showModal(
      `<p>Sign-in with ${provider} requires OAuth credentials that are not configured in this environment yet.</p>
       <p>Please continue with your registered email or mobile and password — every other security step is fully active.</p>`,
      {
        title: `${provider} Sign-In Unavailable`,
        actions: [{ text: 'Got it', class: 'btn btn-primary', onclick: 'Utils.hideModal()' }]
      }
    );
  },

  /* --------------------------------------------------------
     FORGOT PASSWORD
     -------------------------------------------------------- */
  renderForgotPassword() {
    return `
      <div class="fullscreen-page">
        <div class="fullscreen-card">
          <div class="forgot-back" onclick="Router.navigate('/login')">
            <span class="material-symbols-rounded">arrow_back</span> Back to Login
          </div>

          <div class="forgot-icon">
            <span class="material-symbols-rounded">lock_reset</span>
          </div>

          <h2 class="login-title">Reset Password</h2>
          <p class="login-subtitle">Enter your registered email to receive a password recovery link</p>

          <form id="forgot-form" onsubmit="AuthPage.handleForgotSubmit(event)">
            <div class="form-group">
              <label class="form-label">Registered Email</label>
              <div class="input-icon-wrapper">
                <input type="email" id="forgot-email" class="form-input" placeholder="advocate@example.com" value="demo@legalconnect.in" required>
                <span class="material-symbols-rounded input-icon">mail</span>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-block btn-lg">Send Recovery Link</button>
          </form>
        </div>
      </div>
    `;
  },

  async handleForgotSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    const res = await AuthManager.forgotPassword(email);
    const card = document.querySelector('.fullscreen-card');
    card.innerHTML = `
      <div class="forgot-success">
        <div class="forgot-success-icon">
          <span class="material-symbols-rounded">mark_email_read</span>
        </div>
        <h2 class="login-title">Recovery Link Dispatched</h2>
        <p class="login-subtitle">${res.message}</p>
        <button class="btn btn-primary btn-block mt-6" onclick="Router.navigate('/login')">Return to Sign In</button>
      </div>
    `;
  }
};
