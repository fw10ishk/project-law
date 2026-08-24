/* ============================================================
   LEGALCONNECT — SPLASH SCREEN LOGIC
   splash.js — Splash animation and session routing
   ============================================================ */

const SplashPage = {
  render() {
    return `
      <div class="splash-screen">
        <div class="splash-particles">
          <div class="splash-particle"></div>
          <div class="splash-particle"></div>
          <div class="splash-particle"></div>
          <div class="splash-particle"></div>
          <div class="splash-particle"></div>
          <div class="splash-particle"></div>
          <div class="splash-particle"></div>
          <div class="splash-particle"></div>
        </div>

        <div class="splash-content">
          <div class="splash-logo">
            <span class="material-symbols-rounded">balance</span>
          </div>
          <h1 class="splash-title">Legal<span>Connect</span></h1>
          <p class="splash-subtitle">AI-Powered Legal Assistant & Virtual Court Simulator</p>
          <p class="splash-tagline">“Empowering Justice with AI & Trust”</p>

          <div class="splash-loader">
            <div class="splash-loader-bar" id="splash-progress"></div>
          </div>
        </div>
      </div>
    `;
  },

  onEnter() {
    const bar = document.getElementById('splash-progress');
    if (bar) {
      setTimeout(() => bar.classList.add('loading'), 100);
    }

    // Check auth after 2.5s and route
    setTimeout(() => {
      if (AuthManager.isLoggedIn()) {
        Router.navigate('/dashboard');
      } else {
        Router.navigate('/role-select');
      }
    }, 2600);
  }
};
