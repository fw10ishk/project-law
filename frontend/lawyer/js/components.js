/* ============================================================
   LEGALCONNECT — UI COMPONENTS BUILDER
   components.js — Reusable HTML builders (Sidebar, TopBar, Cards)
   ============================================================ */

const Components = {
  /* --------------------------------------------------------
     SIDEBAR
     -------------------------------------------------------- */
  Sidebar(activeItem = 'dashboard') {
    const unreadCount = Store.getUnreadNotifications().length;
    const pendingReqs = Store.getPendingRequests().length;
    const lawyer = AuthManager.getSession() || AuthManager.getDemoLawyer();

    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
      { id: 'clients', label: 'Client Requests', icon: 'person_search', route: '/clients', badge: pendingReqs || null },
      { id: 'consultation', label: 'Consultation', icon: 'video_camera_front', route: '/consultation' },
      { id: 'chat', label: 'Client Chat', icon: 'chat', route: '/chat' },
      { id: 'cases', label: 'Case Management', icon: 'folder_open', route: '/cases' },
      { id: 'payments', label: 'Earnings & Payments', icon: 'payments', route: '/payments' },
      { id: 'reviews', label: 'Client Reviews', icon: 'star', route: '/reviews' },
      { id: 'profile', label: 'Portfolio & Profile', icon: 'badge', route: '/profile' },
      { id: 'verification', label: 'Verification Center', icon: 'verified_user', route: '/verification' },
      { id: 'settings', label: 'Settings & Security', icon: 'settings', route: '/settings', badge: unreadCount || null }
    ];

    return `
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <span class="material-symbols-rounded icon-filled">gavel</span>
          </div>
          <div class="sidebar-brand">
            <span class="sidebar-brand-name">LegalConnect</span>
            <span class="sidebar-brand-tagline">Lawyer Portal</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="sidebar-section">
            <div class="sidebar-section-title">Navigation</div>
            ${navItems.map(item => `
              <div class="sidebar-item ${activeItem === item.id ? 'active' : ''}" onclick="Router.navigate('${item.route}')">
                <span class="material-symbols-rounded ${activeItem === item.id ? 'icon-filled' : ''}">${item.icon}</span>
                <span class="sidebar-item-text">${item.label}</span>
                ${item.badge ? `<span class="sidebar-item-badge">${item.badge}</span>` : ''}
              </div>
            `).join('')}
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-profile" onclick="Router.navigate('/profile')">
            <div class="avatar avatar-sm">
              ${lawyer.fullName ? lawyer.fullName.split(' ').map(n => n[0]).slice(0, 2).join('') : 'ADV'}
            </div>
            <div class="sidebar-profile-info">
              <div class="sidebar-profile-name">
                <span class="truncate">${lawyer.professionalName || lawyer.fullName || 'Advocate'}</span>
                <span class="verified-tick" title="Verified Lawyer">
                  <span class="material-symbols-rounded">check</span>
                </span>
              </div>
              <div class="sidebar-profile-role">High Court Advocate</div>
            </div>
          </div>
        </div>
      </aside>
      <div class="sidebar-overlay" onclick="document.querySelector('.sidebar').classList.remove('open'); document.querySelector('.sidebar-overlay').classList.remove('active');"></div>
    `;
  },

  /* --------------------------------------------------------
     TOPBAR
     -------------------------------------------------------- */
  TopBar(title = 'Dashboard', breadcrumbs = []) {
    const unread = Store.getUnreadNotifications().length;
    const lawyer = AuthManager.getSession() || AuthManager.getDemoLawyer();

    return `
      <header class="topbar">
        <div class="topbar-left">
          <button class="sidebar-toggle" onclick="document.querySelector('.sidebar').classList.toggle('open'); document.querySelector('.sidebar-overlay').classList.toggle('active');">
            <span class="material-symbols-rounded">menu</span>
          </button>
          <div>
            <h1 class="topbar-title">${title}</h1>
            ${breadcrumbs.length > 0 ? `
              <div class="topbar-breadcrumb">
                <a href="#/dashboard">Home</a>
                ${breadcrumbs.map(b => `<span>/</span><span>${b}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        </div>

        <div class="topbar-right">
          <div class="topbar-search">
            <span class="material-symbols-rounded topbar-search-icon">search</span>
            <input type="text" class="topbar-search-input" placeholder="Search cases, clients, documents..." onkeyup="Components.handleGlobalSearch(event)">
          </div>

          <div class="topbar-notification">
            <button class="btn-icon ${unread > 0 ? 'notification-dot' : ''}" onclick="Router.navigate('/settings', { tab: 'notifications' })" title="Notifications">
              <span class="material-symbols-rounded">notifications</span>
            </button>
          </div>

          <button class="btn-icon" onclick="Router.navigate('/settings', { tab: 'security' })" title="Security Center">
            <span class="material-symbols-rounded">shield</span>
          </button>

          <button class="btn-icon" onclick="Components.handleLogout()" title="Logout">
            <span class="material-symbols-rounded">logout</span>
          </button>
        </div>
      </header>
    `;
  },

  /* --------------------------------------------------------
     APP LAYOUT WRAPPER
     -------------------------------------------------------- */
  AppLayout(contentHtml, activeNav = 'dashboard', pageTitle = 'Dashboard', breadcrumbs = []) {
    return `
      <div class="app-layout">
        ${this.Sidebar(activeNav)}
        <div class="app-main">
          ${this.TopBar(pageTitle, breadcrumbs)}
          <main class="app-content">
            ${contentHtml}
          </main>
        </div>
      </div>
    `;
  },

  /* --------------------------------------------------------
     STAT CARD
     -------------------------------------------------------- */
  StatCard(label, value, icon, trend = null, isCurrency = false) {
    const formattedValue = isCurrency ? Utils.formatCurrency(value) : value;
    return `
      <div class="stat-card">
        <div class="stat-card-icon">
          <span class="material-symbols-rounded">${icon}</span>
        </div>
        <div class="stat-card-value">${formattedValue}</div>
        <div class="stat-card-label">${label}</div>
        ${trend ? `
          <div class="stat-card-trend ${trend.type || 'up'}">
            <span class="material-symbols-rounded icon-sm">${trend.type === 'down' ? 'trending_down' : 'trending_up'}</span>
            ${trend.text}
          </div>
        ` : ''}
      </div>
    `;
  },

  /* --------------------------------------------------------
     HANDLERS
     -------------------------------------------------------- */
  handleGlobalSearch(e) {
    if (e.key === 'Enter') {
      const q = e.target.value.trim();
      if (q) {
        Utils.showToast(`Searching for "${q}" across cases and clients...`, 'info');
      }
    }
  },

  async handleLogout() {
    const confirmed = await Utils.showConfirm('Confirm Logout', 'Are you sure you want to securely end your session?', {
      confirmText: 'Logout',
      type: 'danger'
    });
    if (confirmed) {
      AuthManager.logout();
      Utils.showToast('Session securely terminated.', 'info');
    }
  }
};
