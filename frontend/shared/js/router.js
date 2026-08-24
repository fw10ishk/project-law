/* ============================================================
   LEGALCONNECT — SPA ROUTER
   router.js — Hash-based routing with page transitions
   ============================================================ */

const Router = {
  routes: {},
  currentRoute: null,
  previousRoute: null,
  _guards: [],
  _onNavigate: [],

  /* --------------------------------------------------------
     ROUTE REGISTRATION
     -------------------------------------------------------- */
  register(path, handler, options = {}) {
    this.routes[path] = {
      handler,
      requiresAuth: options.requiresAuth || false,
      title: options.title || 'LegalConnect',
      onEnter: options.onEnter || null,
      onLeave: options.onLeave || null
    };
  },

  /* --------------------------------------------------------
     GUARDS
     -------------------------------------------------------- */
  addGuard(guardFn) {
    this._guards.push(guardFn);
  },

  onNavigate(callback) {
    this._onNavigate.push(callback);
  },

  /* --------------------------------------------------------
     NAVIGATION
     -------------------------------------------------------- */
  async navigate(path, params = {}) {
    // Run guards
    for (const guard of this._guards) {
      const result = guard(path, this.currentRoute);
      if (result === false) return;
      if (typeof result === 'string') {
        path = result;
        break;
      }
    }

    // Check auth requirement
    const route = this.routes[path];
    if (!route) {
      console.warn(`[Router] Route not found: ${path}`);
      if (this.routes['/404']) {
        path = '/404';
      } else {
        path = '/login';
      }
    }

    const targetRoute = this.routes[path];
    if (targetRoute.requiresAuth && !AuthManager.isLoggedIn()) {
      window.location.hash = '#/login';
      return;
    }

    // Leave current route
    if (this.currentRoute && this.routes[this.currentRoute]) {
      const currentRouteObj = this.routes[this.currentRoute];
      if (currentRouteObj.onLeave) {
        await currentRouteObj.onLeave();
      }
    }

    this.previousRoute = this.currentRoute;
    this.currentRoute = path;

    // Update URL hash
    if (window.location.hash !== `#${path}`) {
      window.location.hash = path;
    }

    // Update page title
    document.title = targetRoute.title + ' — LegalConnect';

    // Animate page transition
    await this.transitionPage(path, params);

    // Notify listeners
    this._onNavigate.forEach(cb => cb(path, params));

    // Scroll to top
    Utils.scrollToTop(false);
  },

  /* --------------------------------------------------------
     PAGE TRANSITIONS
     -------------------------------------------------------- */
  async transitionPage(path, params) {
    const app = document.getElementById('app');
    if (!app) return;

    const route = this.routes[path];
    if (!route) return;

    // Fade out current content
    app.style.opacity = '0';
    app.style.transform = 'translateY(8px)';
    
    await new Promise(resolve => setTimeout(resolve, 150));

    // Render new content
    try {
      const content = route.handler(params);
      if (typeof content === 'string') {
        app.innerHTML = content;
      }
    } catch (err) {
      console.error(`[Router] Error rendering route ${path}:`, err);
      app.innerHTML = `
        <div class="empty-state min-h-screen">
          <div class="empty-state-icon"><span class="material-symbols-rounded icon-xl">error</span></div>
          <h3 class="empty-state-title">Something went wrong</h3>
          <p class="empty-state-text">${err.message}</p>
          <button class="btn btn-primary" onclick="Router.navigate('/dashboard')">Go to Dashboard</button>
        </div>
      `;
    }

    // Fade in new content
    requestAnimationFrame(() => {
      app.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      app.style.opacity = '1';
      app.style.transform = 'translateY(0)';
    });

    // Run onEnter hook
    if (route.onEnter) {
      setTimeout(() => route.onEnter(params), 50);
    }
  },

  /* --------------------------------------------------------
     INITIALIZATION
     -------------------------------------------------------- */
  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      const path = this.getPathFromHash();
      if (path !== this.currentRoute) {
        this.navigate(path);
      }
    });

    // Handle initial route
    const initialPath = this.getPathFromHash() || '/splash';
    this.navigate(initialPath);
  },

  /* --------------------------------------------------------
     HELPERS
     -------------------------------------------------------- */
  getPathFromHash() {
    const hash = window.location.hash.replace('#', '');
    return hash || '/splash';
  },

  back() {
    if (this.previousRoute) {
      this.navigate(this.previousRoute);
    } else {
      window.history.back();
    }
  },

  getCurrentRoute() {
    return this.currentRoute;
  },

  isActive(path) {
    return this.currentRoute === path;
  }
};
