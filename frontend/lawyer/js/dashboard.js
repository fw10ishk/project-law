/* ============================================================
   LEGALCONNECT — LAWYER DASHBOARD
   dashboard.js — Dashboard overview, statistics, schedule, AI insights
   ============================================================ */

const DashboardPage = {
  render() {
    const lawyer = AuthManager.getSession() || AuthManager.getDemoLawyer();
    const activeClients = Store.getActiveClients().length;
    const pendingReqs = Store.getPendingRequests();
    const todayAppts = Store.getTodayAppointments();
    const monthlyEarnings = Store.getMonthlyEarnings();
    const rating = Store.getAverageRating();
    const greeting = Utils.getGreeting();

    const contentHtml = `
      <!-- Greeting Banner -->
      <div class="dashboard-greeting">
        <div class="greeting-left">
          <h2 class="greeting-text">${greeting}, <span>${lawyer.professionalName || lawyer.fullName || 'Adv. R.K. Sharma'}</span></h2>
          <div class="d-flex items-center gap-3">
            <span class="greeting-badge">
              <span class="verified-tick"><span class="material-symbols-rounded">check</span></span>
              🟢 Verified Advocate (Bar ID: ${lawyer.barCouncil || 'DL/1234/2010'})
            </span>
            <span class="greeting-date">${Utils.formatDate(new Date(), 'full')}</span>
          </div>
        </div>

        <div class="d-flex gap-3">
          <button class="btn btn-primary" onclick="Router.navigate('/consultation')">
            <span class="material-symbols-rounded">video_call</span> Join Live Room
          </button>
          <button class="btn btn-secondary" onclick="Router.navigate('/cases', { create: true })">
            <span class="material-symbols-rounded">add_circle</span> New Case File
          </button>
        </div>
      </div>

      <!-- 5 Stat Cards -->
      <div class="stat-cards">
        ${Components.StatCard('Active Clients', activeClients || 14, 'groups', { text: '+2 this week', type: 'up' })}
        ${Components.StatCard('New Requests', pendingReqs.length || 3, 'person_add', { text: 'Needs review', type: 'up' })}
        ${Components.StatCard("Today's Hearings", todayAppts.length || 2, 'calendar_today', { text: '3 scheduled', type: 'up' })}
        ${Components.StatCard('Monthly Earnings', monthlyEarnings || 84500, 'account_balance_wallet', { text: '+18.4% MoM', type: 'up' }, true)}
        ${Components.StatCard('Client Rating', `${rating || 4.9} ★`, 'hotel_class', { text: '128 Reviews', type: 'up' })}
      </div>

      <!-- Main Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Left: Today's Schedule & Requests -->
        <div>
          <!-- Today's Schedule -->
          <div class="card mb-6">
            <div class="card-header">
              <h3 class="card-title d-flex items-center gap-2">
                <span class="material-symbols-rounded text-accent">today</span> Today's Consultations & Hearings
              </h3>
              <a class="btn-ghost" onclick="Router.navigate('/consultation')">View Calendar</a>
            </div>

            <div class="schedule-list">
              <div class="schedule-item">
                <div class="schedule-time">
                  <div class="schedule-time-hour">10:30</div>
                  <div class="schedule-time-period">AM</div>
                </div>
                <div class="schedule-divider-line"></div>
                <div class="schedule-info">
                  <div class="schedule-client">Rahul Verma — Property Dispute Injunction</div>
                  <div class="schedule-type">Video Consultation • 45 Mins • ₹1,000</div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="Router.navigate('/consultation')">
                  Join Room
                </button>
              </div>

              <div class="schedule-item">
                <div class="schedule-time">
                  <div class="schedule-time-hour">02:00</div>
                  <div class="schedule-time-period">PM</div>
                </div>
                <div class="schedule-divider-line"></div>
                <div class="schedule-info">
                  <div class="schedule-client">Priya Sharma — Bail Application Hearing Review</div>
                  <div class="schedule-type">High Court Virtual Prep • 30 Mins • ₹1,500</div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="Router.navigate('/consultation')">
                  Ready
                </button>
              </div>
            </div>
          </div>

          <!-- Pending Client Requests -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title d-flex items-center gap-2">
                <span class="material-symbols-rounded text-accent">person_search</span> Pending Client Consultation Requests
              </h3>
              <a class="btn-ghost" onclick="Router.navigate('/clients')">View All (${pendingReqs.length})</a>
            </div>

            <div class="request-mini">
              ${pendingReqs.slice(0, 3).map(req => `
                <div class="request-mini-card" onclick="Router.navigate('/clients', { id: '${req.id}' })">
                  <div class="avatar avatar-sm">
                    ${req.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div class="request-mini-info">
                    <div class="request-mini-name">${req.name}</div>
                    <div class="request-mini-case">${req.caseCategory}: ${req.briefProblem}</div>
                  </div>
                  <div class="request-mini-time">${Utils.timeAgo(req.createdAt)}</div>
                  <span class="badge badge-accent">${Utils.formatCurrency(req.estimatedFee)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right: AI Insights & Quick Actions -->
        <div>
          <!-- AI Insights Card -->
          <div class="card mb-6">
            <div class="card-header">
              <h3 class="card-title d-flex items-center gap-2">
                <span class="material-symbols-rounded text-accent">psychology</span> AI Case Assistant Insights
              </h3>
            </div>

            <div class="ai-insight-card">
              <div class="ai-insight-header">
                <span class="ai-insight-badge">Urgent Notice</span>
                <span class="text-body-sm font-semibold">Rahul Verma Case</span>
              </div>
              <p class="ai-insight-text">
                Preliminary AI document scan detected missing <strong>Jamabandi / Mutation Deed</strong>. Upload recommended before 10:30 AM hearing.
              </p>
            </div>

            <div class="ai-insight-card">
              <div class="ai-insight-header">
                <span class="ai-insight-badge">Precedent Match</span>
                <span class="text-body-sm font-semibold">Cyber Fraud Remedy</span>
              </div>
              <p class="ai-insight-text">
                Matched Supreme Court citation regarding immediate freeze of fraudulent bank accounts under Section 102 CrPC.
              </p>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="card">
            <h4 class="card-title mb-4">Quick Advocate Tools</h4>
            <div class="quick-actions" style="margin-top:0">
              <div class="quick-action-btn" onclick="Router.navigate('/clients')">
                <div class="quick-action-icon"><span class="material-symbols-rounded">inbox</span></div>
                <div class="quick-action-text">Requests</div>
              </div>
              <div class="quick-action-btn" onclick="Router.navigate('/chat')">
                <div class="quick-action-icon"><span class="material-symbols-rounded">chat</span></div>
                <div class="quick-action-text">Chat</div>
              </div>
              <div class="quick-action-btn" onclick="Router.navigate('/payments')">
                <div class="quick-action-icon"><span class="material-symbols-rounded">receipt_long</span></div>
                <div class="quick-action-text">Invoices</div>
              </div>
              <div class="quick-action-btn" onclick="Router.navigate('/profile')">
                <div class="quick-action-icon"><span class="material-symbols-rounded">schedule</span></div>
                <div class="quick-action-text">Slots</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    return Components.AppLayout(contentHtml, 'dashboard', 'Advocate Dashboard');
  }
};
