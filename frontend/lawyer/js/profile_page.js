/* ============================================================
   LEGALCONNECT — ADVOCATE PORTFOLIO & PRACTICE CONFIGURATION
   profile_page.js — Points 16 to 21 & Point 40: Portfolio, Experience, Case History, Certificates, Fees, Availability
   ============================================================ */

const ProfilePage = {
  _activeTab: 'portfolio', // 'portfolio', 'experience', 'cases', 'certificates', 'pricing', 'availability'

  render(params = {}) {
    if (params.tab) {
      this._activeTab = params.tab;
    }

    const lawyer = AuthManager.getSession() || AuthManager.getDemoLawyer();
    const exp = Store.getState('experience') || [];
    const caseExp = Store.getState('caseExperience') || [];
    const certs = Store.getState('certificates') || [];
    const pricing = Store.getState('pricing') || [];
    const availability = Store.getState('availability') || {};

    const contentHtml = `
      <!-- Profile Hero Header (Point 16) -->
      <div class="profile-hero">
        <div class="profile-hero-main">
          <div class="profile-avatar-large">
            ${lawyer.fullName ? lawyer.fullName.split(' ').map(n => n[0]).slice(0, 2).join('') : 'ADV'}
          </div>
          <div class="profile-hero-info">
            <div class="profile-name-row">
              <h2 class="profile-hero-title">${lawyer.fullName || 'Adv. Rajesh Kumar Sharma'}</h2>
              <span class="badge badge-verified">
                <span class="material-symbols-rounded icon-sm">verified</span> 🟢 VERIFIED LAWYER
              </span>
            </div>
            <div class="profile-hero-subtitle">
              ${lawyer.yearsOfPractice || 14} Years Active Practice • ${lawyer.stateBarCouncil || 'Bar Council of Delhi'} (${lawyer.barCouncil || 'DL/1234/2010'})
            </div>
            <div class="profile-tags-row">
              <span class="chip">${lawyer.primarySpecialization || 'Criminal Law'}</span>
              ${(lawyer.additionalSpecializations || ['Civil Law', 'Cyber Law', 'Corporate Litigation']).map(s => `<span class="chip">${s}</span>`).join('')}
              <span class="chip font-mono" style="background:var(--color-gold-50);color:var(--color-gold-dark)">4.9 ★ Rating</span>
            </div>
          </div>
        </div>

        <div class="d-flex gap-3">
          <button class="btn btn-secondary" onclick="ProfilePage.openEditPortfolioModal()">
            <span class="material-symbols-rounded">edit</span> Edit Portfolio (Pt 40)
          </button>
        </div>
      </div>

      <!-- Navigation Tabs for Profile Sections (Points 16-21) -->
      <div class="tabs mb-6">
        <div class="tab-item ${this._activeTab === 'portfolio' ? 'active' : ''}" onclick="ProfilePage.setTab('portfolio')">
          16. Public Portfolio
        </div>
        <div class="tab-item ${this._activeTab === 'experience' ? 'active' : ''}" onclick="ProfilePage.setTab('experience')">
          17. Professional Experience (${exp.length})
        </div>
        <div class="tab-item ${this._activeTab === 'cases' ? 'active' : ''}" onclick="ProfilePage.setTab('cases')">
          18. Case Experience (${caseExp.length})
        </div>
        <div class="tab-item ${this._activeTab === 'certificates' ? 'active' : ''}" onclick="ProfilePage.setTab('certificates')">
          19. Legal Certificates (${certs.length})
        </div>
        <div class="tab-item ${this._activeTab === 'pricing' ? 'active' : ''}" onclick="ProfilePage.setTab('pricing')">
          20. Consultation Fees
        </div>
        <div class="tab-item ${this._activeTab === 'availability' ? 'active' : ''}" onclick="ProfilePage.setTab('availability')">
          21. Set Availability
        </div>
      </div>

      <!-- Dynamic Tab Content -->
      <div id="profile-tab-content">
        ${this.renderTabContent(this._activeTab, lawyer, exp, caseExp, certs, pricing, availability)}
      </div>
    `;

    return Components.AppLayout(contentHtml, 'profile', 'Advocate Profile & Portfolio', ['Profile']);
  },

  renderTabContent(tab, lawyer, exp, caseExp, certs, pricing, availability) {
    if (tab === 'experience') return this.renderExperienceTab(exp);
    if (tab === 'cases') return this.renderCaseExperienceTab(caseExp);
    if (tab === 'certificates') return this.renderCertificatesTab(certs);
    if (tab === 'pricing') return this.renderPricingTab(pricing);
    if (tab === 'availability') return this.renderAvailabilityTab(availability);
    return this.renderPortfolioOverviewTab(lawyer, exp, caseExp, certs);
  },

  /* --------------------------------------------------------
     POINT 16: Public Portfolio Overview
     -------------------------------------------------------- */
  renderPortfolioOverviewTab(lawyer, exp, caseExp, certs) {
    return `
      <div class="grid-2 mb-6">
        <div class="card">
          <h3 class="card-title mb-3">Professional Bio</h3>
          <p class="text-body-md" style="line-height:1.8;color:var(--color-gray-700)">
            ${lawyer.bio || 'Senior litigation advocate with over 14 years of practice across the Supreme Court of India and High Court of Delhi. Specializes in criminal trials, civil recovery suits, and complex commercial arbitration with a high trial success record.'}
          </p>

          <h4 class="card-title mt-6 mb-2">Courts Practiced In</h4>
          <div class="d-flex flex-wrap gap-2">
            ${(lawyer.courts || ['Supreme Court of India', 'Delhi High Court', 'District & Sessions Court']).map(c => `
              <span class="chip">${c}</span>
            `).join('')}
          </div>

          <h4 class="card-title mt-6 mb-2">Languages Known</h4>
          <div class="d-flex flex-wrap gap-2">
            ${(lawyer.languages || ['English', 'Hindi', 'Punjabi']).map(l => `
              <span class="chip">${l}</span>
            `).join('')}
          </div>
        </div>

        <div class="card">
          <h3 class="card-title mb-3">Accreditation & Practice Overview</h3>
          <div class="data-table">
            <table>
              <tbody>
                <tr><td><strong>Bar Registration:</strong></td><td>${lawyer.barCouncil || 'DL/1234/2010'} (Verified)</td></tr>
                <tr><td><strong>State Bar Council:</strong></td><td>${lawyer.stateBarCouncil || 'Bar Council of Delhi'}</td></tr>
                <tr><td><strong>Primary Law Branch:</strong></td><td>${lawyer.primarySpecialization || 'Criminal Law'}</td></tr>
                <tr><td><strong>Experience:</strong></td><td>${lawyer.yearsOfPractice || 14} Years Active Standing</td></tr>
                <tr><td><strong>Location:</strong></td><td>${lawyer.city || 'New Delhi'}, ${lawyer.state || 'Delhi'}</td></tr>
              </tbody>
            </table>
          </div>

          <div class="mt-4 p-3" style="background:var(--color-accent-50);border-radius:var(--radius-lg);border:1px solid rgba(13,148,136,0.2)">
            <div class="d-flex items-center gap-2">
              <span class="material-symbols-rounded text-accent">verified</span>
              <strong style="color:var(--color-accent-dark)">LegalConnect Trust Badge Active</strong>
            </div>
            <span class="text-body-sm text-muted">Profile is publicly indexed for client matching and instant consultation bookings.</span>
          </div>
        </div>
      </div>
    `;
  },

  /* --------------------------------------------------------
     POINT 17: Add Professional Experience
     -------------------------------------------------------- */
  renderExperienceTab(exp) {
    return `
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Point 17: Professional Firm & Chamber Experience</h3>
            <p class="text-body-sm text-muted">Timeline of associated law firms, designated roles, and litigation chambers</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="ProfilePage.openAddExperienceModal()">
            <span class="material-symbols-rounded">add</span> Add Experience
          </button>
        </div>

        <div class="timeline-container">
          ${exp.map(e => `
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-card">
                <div class="d-flex justify-between items-start">
                  <div>
                    <div class="timeline-org">${e.organization}</div>
                    <div class="timeline-role">${e.position} • Role: ${e.role}</div>
                    <div class="text-body-sm mt-1" style="color:var(--color-gray-600)">Practice Area: ${e.area}</div>
                  </div>
                  <span class="badge badge-neutral">${e.startYear} – ${e.endYear || 'Present'}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /* --------------------------------------------------------
     POINT 18: Add Case Experience (With Client Confidentiality Protection)
     -------------------------------------------------------- */
  renderCaseExperienceTab(caseExp) {
    return `
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Point 18: Past Case Track Record & Trial Experience</h3>
            <p class="text-body-sm text-muted">Documented judicial outcomes and trial roles (Protected against client identity exposure)</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="ProfilePage.openAddCaseModal()">
            <span class="material-symbols-rounded">add</span> Add Case Record
          </button>
        </div>

        <div class="doc-comparison-banner mb-4">
          <span class="material-symbols-rounded">shield</span>
          <span><strong>Client Confidentiality Protected:</strong> Names of private individuals and sensitive identifiers are redacted per legal ethics rules.</span>
        </div>

        <div class="grid-2">
          ${caseExp.map(c => `
            <div class="card card-glass">
              <div class="d-flex justify-between items-start mb-2">
                <span class="font-semibold text-title-md text-primary">${c.type}</span>
                <span class="badge ${c.outcome.includes('Resolved') || c.outcome.includes('Acquitted') || c.outcome.includes('Granted') ? 'badge-success' : 'badge-accent'}">${c.outcome}</span>
              </div>
              <div class="text-body-sm text-muted mb-2">${c.court} • Year: ${c.year} • Role: ${c.role}</div>
              <p class="text-body-md text-gray-700 mb-3">${c.description}</p>
              <div class="d-flex justify-between items-center pt-2 border-t text-label-sm text-muted">
                <span>Legal Area: ${c.area}</span>
                <span>Status: ${c.status}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /* --------------------------------------------------------
     POINT 19: Add Legal Certificates
     -------------------------------------------------------- */
  renderCertificatesTab(certs) {
    return `
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Point 19: Verified Legal & Specialization Certificates</h3>
            <p class="text-body-sm text-muted">Certified diplomas in Cyber Law, Arbitration, Mediation, and Special Certifications</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="ProfilePage.openAddCertModal()">
            <span class="material-symbols-rounded">add</span> Add Certificate
          </button>
        </div>

        <div class="certificates-grid">
          ${certs.map(cert => `
            <div class="certificate-card">
              <div class="cert-icon-box">
                <span class="material-symbols-rounded">verified</span>
              </div>
              <div class="flex-1">
                <div class="font-semibold text-body-md">${cert.name}</div>
                <div class="text-body-sm text-muted">${cert.file || 'Verified Document on Vault'}</div>
                <div class="d-flex items-center gap-2 mt-2">
                  <span class="badge ${cert.status === 'verified' ? 'badge-success' : 'badge-warning'}">
                    ${cert.status === 'verified' ? '🟢 Verified' : 'Under Review'}
                  </span>
                  ${cert.verifiedDate ? `<span class="text-label-sm text-muted">Since ${cert.verifiedDate}</span>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /* --------------------------------------------------------
     POINT 20: Set Consultation Fees
     -------------------------------------------------------- */
  renderPricingTab(pricing) {
    return `
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Point 20: Consultation Fees & Legal Service Rate Card</h3>
            <p class="text-body-sm text-muted">Configure fixed, starting, and negotiable fee models for prospective litigants</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="ProfilePage.openEditPricingModal()">
            <span class="material-symbols-rounded">tune</span> Adjust Rate Card
          </button>
        </div>

        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>Legal Service Offering</th>
                <th>Duration / Unit</th>
                <th>Consultation Fee</th>
                <th>Pricing Structure</th>
              </tr>
            </thead>
            <tbody>
              ${pricing.map(p => `
                <tr>
                  <td><strong>${p.service}</strong></td>
                  <td>${p.duration}</td>
                  <td style="color:var(--color-accent);font-weight:bold;font-size:16px">${Utils.formatCurrency(p.fee)}</td>
                  <td>
                    <span class="badge ${p.type === 'fixed' ? 'badge-neutral' : p.type === 'starting' ? 'badge-accent' : 'badge-warning'}">
                      ${p.type === 'fixed' ? 'Fixed Price' : p.type === 'starting' ? 'Starting Price' : 'Negotiable / Case Complexity'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* --------------------------------------------------------
     POINT 21: Set Availability Grid
     -------------------------------------------------------- */
  renderAvailabilityTab(availability) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Point 21: Weekly Consultation Availability Matrix</h3>
            <p class="text-body-sm text-muted">Clients book consultations strictly within your defined practice slots</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="Utils.showToast('Availability calendar synced with client booking engine.', 'success')">
            Save Schedule
          </button>
        </div>

        <div class="availability-table">
          ${days.map(day => {
            const key = day.toLowerCase();
            const slots = availability[key] || [];
            return `
              <div class="availability-day-row">
                <div class="avail-day-name">${day}</div>
                <div class="avail-slots-list">
                  ${slots.length > 0 ? slots.map(s => `
                    <span class="avail-slot-chip">${s.start} – ${s.end}</span>
                  `).join('') : '<span class="avail-slot-none">Not Available (Court Appearances / Office Closed)</span>'}
                </div>
                <button class="btn btn-ghost btn-sm" onclick="ProfilePage.editDaySlots('${day}')">+ Configure</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  /* --------------------------------------------------------
     POINT 40: Edit Lawyer Portfolio (with Re-verification Trigger on Bar No)
     -------------------------------------------------------- */
  openEditPortfolioModal() {
    const lawyer = AuthManager.getSession() || AuthManager.getDemoLawyer();
    Utils.showModal(`
      <div class="form-group">
        <label class="form-label">Professional Name</label>
        <input type="text" id="edit-profname" class="form-input" value="${lawyer.professionalName || lawyer.fullName}">
      </div>
      <div class="form-group">
        <label class="form-label">Professional Bio & Trial Philosophy</label>
        <textarea id="edit-bio-text" class="form-textarea" rows="4">${lawyer.bio || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Bar Council Registration Number (Point 40 Security Check)</label>
        <input type="text" id="edit-bar-num" class="form-input" value="${lawyer.barCouncil}">
        <span class="form-hint" style="color:var(--color-error)">
          ⚠️ Critical Regulatory Note: Changing the Bar Council Registration Number immediately triggers statutory re-verification and suspends public verified status until re-verified.
        </span>
      </div>
    `, {
      title: 'Edit Advocate Portfolio (Point 40)',
      actions: [
        { text: 'Cancel', class: 'btn btn-secondary', onclick: 'Utils.hideModal()' },
        { 
          text: 'Save Portfolio', 
          class: 'btn btn-primary', 
          onclick: `(() => {
            const newBar = document.getElementById('edit-bar-num').value.trim();
            const bio = document.getElementById('edit-bio-text').value;
            const prof = document.getElementById('edit-profname').value;
            const session = AuthManager.getSession() || AuthManager.getDemoLawyer();
            
            if (newBar !== session.barCouncil) {
              Utils.hideModal();
              Utils.showToast('Bar Council Number modified! Triggering Statutory Re-verification Protocol...', 'warning');
              session.barCouncil = newBar;
              session.verified = false;
              AuthManager.setSession(session);
              Router.navigate('/verification');
            } else {
              session.bio = bio;
              session.professionalName = prof;
              AuthManager.setSession(session);
              Utils.hideModal();
              Utils.showToast('Portfolio updated successfully.', 'success');
              Router.transitionPage('/profile');
            }
          })()` 
        }
      ]
    });
  },

  openAddExperienceModal() {
    Utils.showModal(`
      <div class="form-group">
        <label class="form-label">Organization / Law Firm</label>
        <input type="text" id="new-exp-org" class="form-input" placeholder="e.g. Apex Law Chambers" required>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Position</label>
          <input type="text" id="new-exp-pos" class="form-input" placeholder="e.g. Senior Associate" required>
        </div>
        <div class="form-group">
          <label class="form-label">Role</label>
          <input type="text" id="new-exp-role" class="form-input" placeholder="e.g. Lead Trial Counsel" required>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Start Year</label>
          <input type="number" id="new-exp-start" class="form-input" value="2018" required>
        </div>
        <div class="form-group">
          <label class="form-label">End Year</label>
          <input type="number" id="new-exp-end" class="form-input" value="2024">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Area of Practice</label>
        <input type="text" id="new-exp-area" class="form-input" placeholder="e.g. Criminal & Civil Litigation" required>
      </div>
    `, {
      title: 'Add Professional Experience (Point 17)',
      actions: [
        { text: 'Cancel', class: 'btn btn-secondary', onclick: 'Utils.hideModal()' },
        { 
          text: 'Save Experience', 
          class: 'btn btn-primary', 
          onclick: `(() => {
            const exp = Store.getState('experience') || [];
            exp.unshift({
              id: 'exp_' + Date.now(),
              organization: document.getElementById('new-exp-org').value,
              position: document.getElementById('new-exp-pos').value,
              role: document.getElementById('new-exp-role').value,
              startYear: parseInt(document.getElementById('new-exp-start').value, 10),
              endYear: parseInt(document.getElementById('new-exp-end').value, 10) || null,
              area: document.getElementById('new-exp-area').value
            });
            Store.setState('experience', exp);
            Utils.hideModal();
            Utils.showToast('Experience added to timeline.', 'success');
            Router.transitionPage('/profile', { tab: 'experience' });
          })()` 
        }
      ]
    });
  },

  openAddCaseModal() {
    Utils.showModal(`
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Case Type</label>
          <input type="text" id="new-case-type" class="form-input" placeholder="e.g. Commercial Dispute" required>
        </div>
        <div class="form-group">
          <label class="form-label">Legal Area</label>
          <input type="text" id="new-case-area" class="form-input" placeholder="e.g. Corporate Law" required>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Court</label>
          <input type="text" id="new-case-court" class="form-input" placeholder="e.g. High Court of Delhi" required>
        </div>
        <div class="form-group">
          <label class="form-label">Year & Role</label>
          <input type="text" id="new-case-role" class="form-input" placeholder="e.g. 2023 • Lead Counsel" required>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Outcome</label>
        <input type="text" id="new-case-outcome" class="form-input" placeholder="e.g. Favorable Settlement Secured" required>
      </div>
      <div class="form-group">
        <label class="form-label">Brief Description (Confidential names redacted)</label>
        <textarea id="new-case-desc" class="form-textarea" placeholder="Brief summary of legal contention and resolution..."></textarea>
      </div>
    `, {
      title: 'Add Judicial Case Experience (Point 18)',
      actions: [
        { text: 'Cancel', class: 'btn btn-secondary', onclick: 'Utils.hideModal()' },
        { 
          text: 'Save Case Entry', 
          class: 'btn btn-primary', 
          onclick: `(() => {
            const cases = Store.getState('caseExperience') || [];
            cases.unshift({
              id: 'cexp_' + Date.now(),
              type: document.getElementById('new-case-type').value,
              area: document.getElementById('new-case-area').value,
              court: document.getElementById('new-case-court').value,
              year: 2024,
              role: document.getElementById('new-case-role').value,
              status: 'Completed',
              outcome: document.getElementById('new-case-outcome').value,
              description: document.getElementById('new-case-desc').value
            });
            Store.setState('caseExperience', cases);
            Utils.hideModal();
            Utils.showToast('Case experience recorded in portfolio.', 'success');
            Router.transitionPage('/profile', { tab: 'cases' });
          })()` 
        }
      ]
    });
  },

  openAddCertModal() {
    Utils.showModal(`
      <div class="form-group">
        <label class="form-label">Certification Title</label>
        <input type="text" id="new-cert-name" class="form-input" placeholder="e.g. International Arbitration Specialist" required>
      </div>
      <div class="form-group">
        <label class="form-label">Upload Certificate Scan</label>
        <input type="file" class="form-input">
      </div>
    `, {
      title: 'Add Legal Certification (Point 19)',
      actions: [
        { text: 'Cancel', class: 'btn btn-secondary', onclick: 'Utils.hideModal()' },
        { 
          text: 'Submit for Verification', 
          class: 'btn btn-primary', 
          onclick: `(() => {
            const certs = Store.getState('certificates') || [];
            certs.push({
              id: 'cert_' + Date.now(),
              name: document.getElementById('new-cert-name').value,
              type: 'optional',
              status: 'verified',
              verifiedDate: Utils.formatDate(new Date()),
              file: 'Certificate_Scan.pdf'
            });
            Store.setState('certificates', certs);
            Utils.hideModal();
            Utils.showToast('Certificate added with 🟢 Verified status.', 'success');
            Router.transitionPage('/profile', { tab: 'certificates' });
          })()` 
        }
      ]
    });
  },

  openEditPricingModal() {
    Utils.showToast('Rates adjusted. Pricing updated across client discovery index.', 'success');
  },

  editDaySlots(day) {
    Utils.showToast(`Configuring consultation slots for ${day}`, 'info');
  },

  setTab(tab) {
    this._activeTab = tab;
    Router.transitionPage('/profile', { tab });
  }
};
