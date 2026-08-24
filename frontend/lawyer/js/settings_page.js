/* ============================================================
   LEGALCONNECT — SETTINGS & SECURITY COMMAND CENTER
   settings_page.js — Points 37 to 43: Verification Center, Security 2FA, Notifications, Privacy, Deactivation, Logout
   ============================================================ */

const SettingsPage = {
  _activeTab: 'verification-center', // 'verification-center', 'security', 'notifications', 'privacy', 'account', 'support', 'deactivate'

  render(params = {}) {
    if (params.tab) {
      this._activeTab = params.tab;
    }

    const lawyer = AuthManager.getSession() || AuthManager.getDemoLawyer();
    const trustedDevices = AuthManager.getTrustedDevices();
    const activity = AuthManager.getLoginActivity();
    const notifs = Store.getState('notifications') || [];
    const verification = Store.getState('verification') || {};

    const contentHtml = `
      <div class="page-header">
        <div class="page-header-left">
          <h2 class="page-title">Advocate Command & Security Center</h2>
          <p class="page-subtitle">Points 37–43: Statutory Verification Status, 2FA, Active Sessions, Alerts & Settings</p>
        </div>
      </div>

      <div class="settings-layout">
        <!-- Left Navigation Tabs -->
        <div class="settings-nav">
          <div class="settings-nav-item ${this._activeTab === 'verification-center' ? 'active' : ''}" onclick="SettingsPage.setTab('verification-center')">
            <span class="material-symbols-rounded">verified_user</span> 37. Verification Center
          </div>
          <div class="settings-nav-item ${this._activeTab === 'security' ? 'active' : ''}" onclick="SettingsPage.setTab('security')">
            <span class="material-symbols-rounded">shield</span> 38. Security & 2FA
          </div>
          <div class="settings-nav-item ${this._activeTab === 'notifications' ? 'active' : ''}" onclick="SettingsPage.setTab('notifications')">
            <span class="material-symbols-rounded">notifications</span> 39. Notifications (${notifs.length})
          </div>
          <div class="settings-nav-item ${this._activeTab === 'privacy' ? 'active' : ''}" onclick="SettingsPage.setTab('privacy')">
            <span class="material-symbols-rounded">lock</span> Privacy & Privilege
          </div>
          <div class="settings-nav-item ${this._activeTab === 'account' ? 'active' : ''}" onclick="SettingsPage.setTab('account')">
            <span class="material-symbols-rounded">person</span> 41. Account & Contact
          </div>
          <div class="settings-nav-item ${this._activeTab === 'support' ? 'active' : ''}" onclick="SettingsPage.setTab('support')">
            <span class="material-symbols-rounded">help</span> Support & Help Center
          </div>
          <div class="settings-nav-item ${this._activeTab === 'deactivate' ? 'active' : ''}" onclick="SettingsPage.setTab('deactivate')" style="color:var(--color-error)">
            <span class="material-symbols-rounded">pause_circle</span> 42. Deactivate Profile
          </div>
        </div>

        <!-- Right Content Panes -->
        <div class="settings-content">
          <!-- --------------------------------------------------------
               POINT 37: Lawyer Verification Center
               -------------------------------------------------------- -->
          <div class="settings-pane ${this._activeTab === 'verification-center' ? 'active' : ''}">
            <div class="settings-pane-header">
              <h3 class="settings-pane-title">Point 37: Lawyer Verification Center</h3>
              <p class="settings-pane-desc">Permanent statutory verification record and accreditation telemetry</p>
            </div>

            <div class="grid-2 mb-6">
              <div class="card p-4" style="background:var(--color-success-light);border:1px solid rgba(16,185,129,0.3)">
                <div class="d-flex items-center gap-3">
                  <span class="material-symbols-rounded icon-lg text-success">verified</span>
                  <div>
                    <div class="font-bold text-title-md text-success-dark">Identity Verification — Verified</div>
                    <div class="text-body-sm text-muted">Aadhaar / Passport & Biometric Liveness Passed</div>
                  </div>
                </div>
              </div>

              <div class="card p-4" style="background:var(--color-success-light);border:1px solid rgba(16,185,129,0.3)">
                <div class="d-flex items-center gap-3">
                  <span class="material-symbols-rounded icon-lg text-success">verified</span>
                  <div>
                    <div class="font-bold text-title-md text-success-dark">Bar Council Verification — Verified</div>
                    <div class="text-body-sm text-muted">Roll: ${lawyer.barCouncil || 'DL/1234/2010'} • Active Standing</div>
                  </div>
                </div>
              </div>

              <div class="card p-4" style="background:var(--color-success-light);border:1px solid rgba(16,185,129,0.3)">
                <div class="d-flex items-center gap-3">
                  <span class="material-symbols-rounded icon-lg text-success">verified</span>
                  <div>
                    <div class="font-bold text-title-md text-success-dark">Education Verification — Verified</div>
                    <div class="text-body-sm text-muted">LLB (Hons) • University of Delhi</div>
                  </div>
                </div>
              </div>

              <div class="card p-4" style="background:var(--color-success-light);border:1px solid rgba(16,185,129,0.3)">
                <div class="d-flex items-center gap-3">
                  <span class="material-symbols-rounded icon-lg text-success">verified</span>
                  <div>
                    <div class="font-bold text-title-md text-success-dark">Practice Certificate — Verified</div>
                    <div class="text-body-sm text-muted">Valid All India Practice Standing</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="data-table">
              <table>
                <tbody>
                  <tr><td><strong>Lawyer Verification ID:</strong></td><td class="font-mono text-accent"><strong>LC-VER-2026-9882</strong></td></tr>
                  <tr><td><strong>Verification Date:</strong></td><td>${Utils.formatDate(new Date(), 'long')}</td></tr>
                  <tr><td><strong>Public Badge Status:</strong></td><td><span class="badge badge-success">🟢 VERIFIED ADVOCATE ACTIVE</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- --------------------------------------------------------
               POINT 38: Security Center
               -------------------------------------------------------- -->
          <div class="settings-pane ${this._activeTab === 'security' ? 'active' : ''}">
            <div class="settings-pane-header">
              <h3 class="settings-pane-title">Point 38: Advocate Security & Account Defense</h3>
              <p class="settings-pane-desc">Manage Two-Factor Authentication, Authorized Devices, and Active Login Sessions</p>
            </div>

            <!-- Security Alert Box with Incident Response Simulation (Point 38) -->
            <div class="security-alert-box mb-6">
              <span class="material-symbols-rounded">warning</span>
              <div class="flex-1">
                <div class="security-alert-title">Security Alert Simulation: New Login Detected</div>
                <div class="security-alert-text">
                  Login detected from iPhone on 23 August at 10:42 PM (Approx. New Delhi).
                </div>
                <div class="d-flex gap-3 mt-3">
                  <button class="btn btn-secondary btn-sm" onclick="SettingsPage.handleThisWasMe()">
                    Yes, This was me
                  </button>
                  <button class="btn btn-danger btn-sm" onclick="SettingsPage.handleThisWasntMe()">
                    This wasn't me (Trigger Lock & Revocation)
                  </button>
                </div>
              </div>
            </div>

            <!-- Trusted Devices -->
            <h4 class="card-title mt-6 mb-3">Trusted & Authorized Hardware Devices</h4>
            <div class="devices-list">
              ${trustedDevices.map(d => `
                <div class="device-item-card">
                  <div class="device-item-left">
                    <div class="device-item-icon">
                      <span class="material-symbols-rounded">devices</span>
                    </div>
                    <div>
                      <div class="font-semibold text-body-md">${d.deviceType} (${d.browser} on ${d.os})</div>
                      <div class="text-body-sm text-muted">First Authorized: ${Utils.formatDate(d.timestamp)} • Location: ${d.location}</div>
                    </div>
                  </div>
                  <button class="btn btn-secondary btn-sm" onclick="SettingsPage.handleRevokeDevice('${d.deviceId}')">
                    Revoke Device Access
                  </button>
                </div>
              `).join('')}
            </div>

            <!-- Login Activity Log -->
            <h4 class="card-title mt-8 mb-3">Recent Authentication Activity Log</h4>
            <div class="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Event Type</th>
                    <th>Device & Operating System</th>
                    <th>Timestamp</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  ${activity.slice(0, 5).map(a => `
                    <tr>
                      <td><strong>${a.type}</strong></td>
                      <td>${a.device.browser} on ${a.device.os}</td>
                      <td>${Utils.formatDate(a.timestamp)}</td>
                      <td><span class="badge badge-success">Authorized</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- --------------------------------------------------------
               POINT 39: Lawyer Notifications
               -------------------------------------------------------- -->
          <div class="settings-pane ${this._activeTab === 'notifications' ? 'active' : ''}">
            <div class="settings-pane-header">
              <h3 class="settings-pane-title">Point 39: Advocate Notification Center</h3>
              <p class="settings-pane-desc">Alerts for Client Requests, Appointments, Payments, Verifications, Security & Hearings</p>
            </div>

            <div class="client-docs-list">
              ${notifs.map(n => `
                <div class="client-doc-item">
                  <span class="material-symbols-rounded text-accent">${n.type === 'client' ? 'person_add' : n.type === 'payment' ? 'payments' : n.type === 'verification' ? 'verified' : n.type === 'security' ? 'shield' : 'calendar_today'}</span>
                  <div class="client-doc-info">
                    <div class="client-doc-name">${n.title}</div>
                    <div class="client-doc-size">${n.message} • ${Utils.timeAgo(n.time)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Privacy Tab -->
          <div class="settings-pane ${this._activeTab === 'privacy' ? 'active' : ''}">
            <div class="settings-pane-header">
              <h3 class="settings-pane-title">Privacy & Legal Privilege Protection</h3>
              <p class="settings-pane-desc">Client-Attorney privilege and search discovery settings</p>
            </div>

            <div class="setting-toggle-row">
              <div class="setting-toggle-info">
                <span class="setting-toggle-label">Public Portfolio Search Indexing</span>
                <span class="setting-toggle-desc">Allow prospective clients to discover and book consultations with you</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-toggle-row">
              <div class="setting-toggle-info">
                <span class="setting-toggle-label">Client Data Encryption & Privilege Isolation</span>
                <span class="setting-toggle-desc">Private advocate notes are cryptographically restricted from client view</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" checked disabled>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Account Tab -->
          <div class="settings-pane ${this._activeTab === 'account' ? 'active' : ''}">
            <div class="settings-pane-header">
              <h3 class="settings-pane-title">Point 41: Advocate Account & Contact Records</h3>
              <p class="settings-pane-desc">Accredited contact information on file</p>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Full Legal Name</label>
                <input type="text" class="form-input" value="${lawyer.fullName}" disabled style="background:var(--color-gray-100)">
              </div>
              <div class="form-group">
                <label class="form-label">Bar Registration Number</label>
                <input type="text" class="form-input" value="${lawyer.barCouncil}" disabled style="background:var(--color-gray-100)">
              </div>
              <div class="form-group">
                <label class="form-label">Registered Email</label>
                <input type="email" class="form-input" value="${lawyer.email}">
              </div>
              <div class="form-group">
                <label class="form-label">Mobile Number</label>
                <input type="tel" class="form-input" value="${lawyer.phone}">
              </div>
            </div>
            <button class="btn btn-primary mt-4" onclick="Utils.showToast('Account credentials saved.', 'success')">Save Changes</button>
          </div>

          <!-- Support Tab -->
          <div class="settings-pane ${this._activeTab === 'support' ? 'active' : ''}">
            <div class="settings-pane-header">
              <h3 class="settings-pane-title">Advocate Help & Support Center</h3>
              <p class="settings-pane-desc">Direct assistance, statutory compliance guidance & grievance redressal</p>
            </div>

            <div class="grid-2">
              <div class="card card-glass">
                <h4 class="card-title mb-2">Priority Advocate Desk</h4>
                <p class="text-body-md text-muted mb-4">24/7 dedicated support for live court hearing issues, document verification, and client disputes.</p>
                <button class="btn btn-secondary btn-sm" onclick="Utils.showToast('Connecting with Advocate Desk Priority Line...', 'info')">
                  Connect with Support
                </button>
              </div>

              <div class="card card-glass">
                <h4 class="card-title mb-2">Statutory Compliance Help</h4>
                <p class="text-body-md text-muted mb-4">Guidelines on State Bar Council compliance, Certificate of Practice renewals, and legal ethics rules.</p>
                <button class="btn btn-secondary btn-sm" onclick="Utils.showToast('Opening Bar Council Guidelines Handbook...', 'info')">
                  View Guidelines
                </button>
              </div>
            </div>
          </div>

          <!-- --------------------------------------------------------
               POINT 42: Deactivate Profile
               -------------------------------------------------------- -->
          <div class="settings-pane ${this._activeTab === 'deactivate' ? 'active' : ''}">
            <div class="settings-pane-header">
              <h3 class="settings-pane-title" style="color:var(--color-error)">Point 42: Deactivate Professional Profile</h3>
              <p class="settings-pane-desc">Temporarily pause public discovery and stop receiving new client bookings</p>
            </div>

            <div class="danger-zone">
              <h4 class="danger-zone-title">Temporary Public Practice Pause</h4>
              <p class="text-body-md text-muted mb-4">
                If you need to take time off from accepting new client consultations:
                <br>• Your profile becomes temporarily unavailable for new bookings.
                <br>• <strong>Existing active cases and scheduled hearings remain active and accessible.</strong>
                <br>• You can re-activate your profile instantly upon logging in.
              </p>
              <button class="btn btn-danger btn-lg" onclick="SettingsPage.handleDeactivateProfile()">
                Deactivate Professional Profile (Point 42)
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    return Components.AppLayout(contentHtml, 'settings', 'Settings & Security Command Center', ['Settings']);
  },

  setTab(tab) {
    this._activeTab = tab;
    Router.transitionPage('/settings', { tab });
  },

  handleThisWasMe() {
    Utils.showToast('Security alert acknowledged and resolved.', 'success');
  },

  async handleThisWasntMe() {
    const confirmed = await Utils.showConfirm('Security Incident Response (Point 38)', 'Initiating account defense protocol: Suspicious sessions terminated, password reset required, and security team notified. Proceed?', {
      confirmText: 'Execute Lockout',
      type: 'danger'
    });
    if (confirmed) {
      Utils.showToast('Suspicious session terminated. Security lock enabled.', 'error');
    }
  },

  handleRevokeDevice(devId) {
    AuthManager.removeTrustedDevice(devId);
    Utils.showToast('Device authorization revoked. Target session terminated.', 'info');
    Router.transitionPage('/settings', { tab: 'security' });
  },

  async handleDeactivateProfile() {
    const confirmed = await Utils.showConfirm('Point 42: Deactivate Professional Profile', 'Are you sure you want to pause public discovery? Existing active cases will remain intact.', {
      confirmText: 'Deactivate Profile',
      type: 'danger'
    });
    if (confirmed) {
      Store.setState('profileDeactivated', true);
      Utils.showToast('Profile deactivated for new bookings. Active cases remain operational.', 'warning');
    }
  }
};
