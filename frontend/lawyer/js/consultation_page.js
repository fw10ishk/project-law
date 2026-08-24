/* ============================================================
   LEGALCONNECT — VIRTUAL CONSULTATION ROOM
   consultation_page.js — Live Video/Audio call, Screen share, In-call chat & documents
   ============================================================ */

const ConsultationPage = {
  _isMicOn: true,
  _isCamOn: true,
  _isSharingScreen: false,
  _activeSidebar: null, // 'chat', 'docs' or null
  _timerSeconds: 0,
  _timerInterval: null,

  render() {
    const client = Store.getState('clients')[0] || { name: 'Rahul Verma', caseCategory: 'Property Dispute' };

    const contentHtml = `
      <div class="consultation-container">
        <!-- Main Video Stage -->
        <div class="consultation-main">
          <!-- Video Call Stage -->
          <div class="video-stage">
            <!-- Header Overlay -->
            <div class="call-header-overlay">
              <span class="status-dot status-dot-online"></span>
              <span class="call-badge">Encrypted Legal Session</span>
              <span class="call-timer" id="call-duration-timer">00:00</span>
            </div>

            <!-- Remote Video Placeholder -->
            <div class="remote-video-placeholder">
              <div class="remote-avatar">
                ${client.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 class="remote-name">${client.name}</h3>
              <div class="remote-status">
                <span class="material-symbols-rounded icon-sm">mic</span> Active Audio • ${client.caseCategory}
              </div>
            </div>

            <!-- Local Lawyer Video PiP -->
            <div class="local-video-pip">
              <div class="local-pip-content">
                <div class="local-pip-avatar">
                  <span class="material-symbols-rounded">person</span>
                </div>
                <div class="local-pip-label">You (Advocate)</div>
              </div>
            </div>
          </div>

          <!-- In-Call Sidebar -->
          <div class="consultation-sidebar ${this._activeSidebar ? '' : 'hidden'}" id="call-sidebar">
            <div class="c-sidebar-header">
              <h4 id="c-sidebar-title">Session Chat</h4>
              <button class="btn-icon btn-icon-sm" onclick="ConsultationPage.toggleSidebar(null)" style="color:var(--color-white)">
                <span class="material-symbols-rounded">close</span>
              </button>
            </div>
            <div class="c-sidebar-body" id="c-sidebar-content">
              <!-- Rendered dynamically -->
            </div>
          </div>
        </div>

        <!-- Glass Controls Bar -->
        <div class="consultation-controls">
          <button class="control-btn ${this._isMicOn ? '' : 'active-off'}" id="btn-toggle-mic" onclick="ConsultationPage.toggleMic()" title="Mute / Unmute">
            <span class="material-symbols-rounded">${this._isMicOn ? 'mic' : 'mic_off'}</span>
          </button>

          <button class="control-btn ${this._isCamOn ? '' : 'active-off'}" id="btn-toggle-cam" onclick="ConsultationPage.toggleCam()" title="Camera On / Off">
            <span class="material-symbols-rounded">${this._isCamOn ? 'videocam' : 'videocam_off'}</span>
          </button>

          <button class="control-btn" onclick="ConsultationPage.toggleScreenShare()" title="Share Screen / Evidence">
            <span class="material-symbols-rounded">present_to_all</span>
          </button>

          <button class="control-btn" onclick="ConsultationPage.toggleSidebar('chat')" title="In-call Chat">
            <span class="material-symbols-rounded">chat</span>
          </button>

          <button class="control-btn" onclick="ConsultationPage.toggleSidebar('docs')" title="Case Documents">
            <span class="material-symbols-rounded">description</span>
          </button>

          <button class="control-btn btn-end-call" onclick="ConsultationPage.endCall()" title="End Consultation">
            <span class="material-symbols-rounded">call_end</span>
          </button>
        </div>
      </div>
    `;

    return Components.AppLayout(contentHtml, 'consultation', 'Virtual Court & Consultation Chamber', ['Consultation Room']);
  },

  onEnter() {
    this._timerSeconds = 0;
    clearInterval(this._timerInterval);
    const timerEl = document.getElementById('call-duration-timer');

    this._timerInterval = setInterval(() => {
      this._timerSeconds++;
      const mins = String(Math.floor(this._timerSeconds / 60)).padStart(2, '0');
      const secs = String(this._timerSeconds % 60).padStart(2, '0');
      if (timerEl) timerEl.textContent = `${mins}:${secs}`;
    }, 1000);
  },

  onLeave() {
    clearInterval(this._timerInterval);
  },

  toggleMic() {
    this._isMicOn = !this._isMicOn;
    const btn = document.getElementById('btn-toggle-mic');
    if (btn) {
      btn.classList.toggle('active-off', !this._isMicOn);
      btn.querySelector('.material-symbols-rounded').textContent = this._isMicOn ? 'mic' : 'mic_off';
    }
    Utils.showToast(this._isMicOn ? 'Microphone enabled' : 'Microphone muted', 'info');
  },

  toggleCam() {
    this._isCamOn = !this._isCamOn;
    const btn = document.getElementById('btn-toggle-cam');
    if (btn) {
      btn.classList.toggle('active-off', !this._isCamOn);
      btn.querySelector('.material-symbols-rounded').textContent = this._isCamOn ? 'videocam' : 'videocam_off';
    }
    Utils.showToast(this._isCamOn ? 'Camera enabled' : 'Camera disabled', 'info');
  },

  toggleScreenShare() {
    this._isSharingScreen = !this._isSharingScreen;
    Utils.showToast(this._isSharingScreen ? 'Broadcasting legal evidence screen share...' : 'Screen share stopped', 'info');
  },

  toggleSidebar(type) {
    const sidebar = document.getElementById('call-sidebar');
    const title = document.getElementById('c-sidebar-title');
    const content = document.getElementById('c-sidebar-content');

    if (!type || this._activeSidebar === type) {
      this._activeSidebar = null;
      if (sidebar) sidebar.classList.add('hidden');
      return;
    }

    this._activeSidebar = type;
    if (sidebar) sidebar.classList.remove('hidden');

    if (type === 'chat') {
      if (title) title.textContent = 'Session Chat & Notes';
      if (content) {
        content.innerHTML = `
          <div style="color:var(--color-gray-300);font-size:var(--text-body-sm);margin-bottom:var(--space-4)">
            Secure end-to-end encrypted discussion
          </div>
          <div style="background:rgba(255,255,255,0.08);padding:var(--space-3);border-radius:var(--radius-md);color:white;margin-bottom:var(--space-3)">
            <strong>Client:</strong> Good morning Adv. Sharma, I have attached the lease copy.
          </div>
          <div style="background:rgba(13,148,136,0.2);padding:var(--space-3);border-radius:var(--radius-md);color:white;margin-bottom:var(--space-4)">
            <strong>You:</strong> Received. Let us review clause 14 regarding eviction notice.
          </div>
          <input type="text" class="form-input" placeholder="Type a message..." style="background:rgba(255,255,255,0.1);color:white">
        `;
      }
    } else if (type === 'docs') {
      if (title) title.textContent = 'Case Exhibits & Documents';
      if (content) {
        content.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:var(--space-2)">
            <div class="client-doc-item" style="background:rgba(255,255,255,0.08);color:white">
              <span class="material-symbols-rounded text-accent">picture_as_pdf</span>
              <div class="flex-1">
                <div style="font-size:var(--text-body-sm);color:white">Rental_Agreement.pdf</div>
                <div style="font-size:var(--text-label-sm);color:var(--color-gray-400)">2.4 MB • Verified</div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="Utils.showToast('Exhibiting document to client screen...', 'info')">Exhibit</button>
            </div>
            <div class="client-doc-item" style="background:rgba(255,255,255,0.08);color:white">
              <span class="material-symbols-rounded text-accent">picture_as_pdf</span>
              <div class="flex-1">
                <div style="font-size:var(--text-body-sm);color:white">Security_Deposit_Receipt.pdf</div>
                <div style="font-size:var(--text-label-sm);color:var(--color-gray-400)">1.1 MB • Bank Copy</div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="Utils.showToast('Exhibiting document to client screen...', 'info')">Exhibit</button>
            </div>
          </div>
        `;
      }
    }
  },

  async endCall() {
    const confirmed = await Utils.showConfirm('End Consultation Session', 'Are you sure you want to conclude the consultation and generate attendance notes?', {
      confirmText: 'End Session',
      type: 'danger'
    });
    if (confirmed) {
      clearInterval(this._timerInterval);
      Utils.showToast('Consultation concluded successfully. Fee credited to earnings ledger.', 'success');
      Router.navigate('/cases');
    }
  }
};
