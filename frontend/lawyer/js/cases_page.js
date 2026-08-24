/* ============================================================
   LEGALCONNECT — CASE MANAGEMENT
   cases_page.js — Case listing, pipeline stepper, private notes & creation
   ============================================================ */

const CasesPage = {
  _selectedCaseId: null,

  render(params = {}) {
    if (params.id) {
      return this.renderCaseDetail(params.id);
    }
    if (params.create) {
      return this.renderCreateCaseModal();
    }

    const cases = Store.getState('cases') || [];

    const contentHtml = `
      <div class="page-header">
        <div class="page-header-left">
          <h2 class="page-title">Case File Management</h2>
          <p class="page-subtitle">Track litigation pipelines, hearing schedules & confidential lawyer notes</p>
        </div>

        <div class="cases-header-actions">
          <button class="btn btn-primary" onclick="Router.navigate('/cases', { create: true })">
            <span class="material-symbols-rounded">add</span> Create New Case
          </button>
        </div>
      </div>

      <div class="cases-grid">
        ${cases.map(c => `
          <div class="case-card" onclick="Router.navigate('/cases', { id: '${c.id}' })">
            <div class="case-card-header">
              <span class="case-number">${c.caseNumber}</span>
              <span class="badge ${this.getStatusBadgeClass(c.status)}">${c.status}</span>
            </div>

            <h3 class="case-client-name">${c.clientName}</h3>
            <div class="case-category-badge">${c.caseType} • ${c.court}</div>

            <div class="case-card-body">
              <div class="case-meta-row">
                <span class="material-symbols-rounded">calendar_month</span> Filing: ${Utils.formatDate(c.filingDate)}
              </div>
              <div class="case-meta-row">
                <span class="material-symbols-rounded">event</span> Next Hearing: <strong>${c.nextHearing}</strong>
              </div>
              <div class="case-meta-row">
                <span class="material-symbols-rounded">lock</span> ${c.notes.length} Private Advocate Notes
              </div>
            </div>

            <div class="case-card-footer">
              <span class="text-body-sm text-muted">${c.documents.length} Exhibits</span>
              <button class="btn btn-ghost btn-sm">Open File →</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    return Components.AppLayout(contentHtml, 'cases', 'Case Files', ['Cases']);
  },

  renderCaseDetail(caseId) {
    const caseItem = (Store.getState('cases') || []).find(c => c.id === caseId) || Store.getState('cases')[0];
    const statuses = ['New', 'Under Review', 'Consultation Completed', 'Documents Pending', 'Filed', 'Hearing Scheduled', 'Ongoing', 'Resolved'];
    const currentIdx = statuses.indexOf(caseItem.status);

    const contentHtml = `
      <div class="case-detail-hero">
        <div class="d-flex justify-between items-start mb-4">
          <div>
            <span class="case-number">${caseItem.caseNumber}</span>
            <h2 class="page-title mt-2">${caseItem.clientName} — ${caseItem.caseType}</h2>
            <div class="text-body-md text-muted">${caseItem.court} • Filed: ${Utils.formatDate(caseItem.filingDate, 'long')}</div>
          </div>

          <div class="d-flex gap-3">
            <button class="btn btn-secondary" onclick="Router.navigate('/cases')">
              <span class="material-symbols-rounded">arrow_back</span> Back
            </button>
            <button class="btn btn-primary" onclick="CasesPage.handleStatusDropdown('${caseItem.id}')">
              Update Case Stage
            </button>
          </div>
        </div>

        <!-- Visual Status Stepper Pipeline -->
        <h4 class="card-title mt-6">Litigation Pipeline & Stage Tracking</h4>
        <div class="case-status-stepper">
          ${statuses.map((st, i) => `
            <div class="status-step ${i < currentIdx ? 'completed' : ''} ${i === currentIdx ? 'current' : ''}">
              ${i < statuses.length - 1 ? '<div class="status-step-connector"></div>' : ''}
              <div class="status-step-node">${i < currentIdx ? '✓' : i + 1}</div>
              <div class="status-step-label">${st}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Private Notes & Documents Tabs -->
      <div class="grid-2">
        <!-- Private Lawyer Notes -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title d-flex items-center gap-2">
                <span class="material-symbols-rounded text-accent">lock</span> Confidential Practice Notes
              </h3>
              <span class="private-note-badge mt-1">🔒 Private — Visible to Counsel Only</span>
            </div>
          </div>

          <div class="notes-container">
            <form onsubmit="CasesPage.handleAddNote(event, '${caseItem.id}')" class="mb-4">
              <div class="form-group">
                <textarea id="new-note-text" class="form-textarea" placeholder="Add strategy observations, cross-examination points, client briefing notes..." required></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Save Confidential Note</button>
            </form>

            ${caseItem.notes.map(n => `
              <div class="note-card private">
                <div class="note-header">
                  <span class="private-note-badge">Counsel Only</span>
                  <span class="note-date">${Utils.timeAgo(n.createdAt)}</span>
                </div>
                <div class="note-content">${n.text}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Case Exhibits -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Exhibits & Court Filings</h3>
            <button class="btn btn-secondary btn-sm" onclick="Utils.showToast('Upload dialogue opened for Case Vault', 'info')">
              <span class="material-symbols-rounded">upload</span> Add Exhibit
            </button>
          </div>

          <div class="client-docs-list">
            ${caseItem.documents.map(doc => `
              <div class="client-doc-item">
                <span class="material-symbols-rounded client-doc-icon">picture_as_pdf</span>
                <div class="client-doc-info">
                  <div class="client-doc-name">${doc.name}</div>
                  <div class="client-doc-size">${doc.type} • ${doc.size}</div>
                </div>
                <button class="btn-icon btn-icon-sm" onclick="Utils.showToast('Opening ${doc.name}...', 'info')">
                  <span class="material-symbols-rounded">visibility</span>
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    return Components.AppLayout(contentHtml, 'cases', 'Case File Dossier', ['Cases', caseItem.caseNumber]);
  },

  renderCreateCaseModal() {
    const clients = Store.getState('clients') || [];
    const contentHtml = `
      <div class="card" style="max-width:680px;margin:0 auto">
        <div class="card-header">
          <h2 class="page-title">Initialize New Legal Case File</h2>
          <button class="btn-icon" onclick="Router.navigate('/cases')"><span class="material-symbols-rounded">close</span></button>
        </div>

        <form onsubmit="CasesPage.handleCreateSubmit(event)">
          <div class="form-group">
            <label class="form-label">Client Name <span class="required">*</span></label>
            <input type="text" id="newcase-client" class="form-input" placeholder="e.g. Rahul Verma" required>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Legal Category <span class="required">*</span></label>
              <select id="newcase-type" class="form-select" required>
                <option value="Property Dispute">Property Dispute</option>
                <option value="Criminal Defense">Criminal Defense</option>
                <option value="Corporate Litigation">Corporate Litigation</option>
                <option value="Cyber Crime">Cyber Crime</option>
                <option value="Family Law">Family Law</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Jurisdiction Court <span class="required">*</span></label>
              <select id="newcase-court" class="form-select" required>
                <option value="Supreme Court of India">Supreme Court of India</option>
                <option value="Delhi High Court">Delhi High Court</option>
                <option value="District & Sessions Court">District & Sessions Court</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Next Hearing Date</label>
            <input type="date" id="newcase-hearing" class="form-input" value="${Store.generateFutureDate(14)}">
          </div>

          <div class="form-group">
            <label class="form-label">Initial Brief / Gist of Case</label>
            <textarea id="newcase-desc" class="form-textarea" placeholder="Enter case summary..."></textarea>
          </div>

          <div class="d-flex justify-end gap-3 mt-6">
            <button type="button" class="btn btn-secondary" onclick="Router.navigate('/cases')">Cancel</button>
            <button type="submit" class="btn btn-primary btn-lg">Create Case File</button>
          </div>
        </form>
      </div>
    `;

    return Components.AppLayout(contentHtml, 'cases', 'Create Case', ['Cases', 'New']);
  },

  handleCreateSubmit(e) {
    e.preventDefault();
    const cases = Store.getState('cases') || [];
    const newCase = {
      id: `case_${Date.now()}`,
      caseNumber: `LC/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: document.getElementById('newcase-client').value,
      caseType: document.getElementById('newcase-type').value,
      court: document.getElementById('newcase-court').value,
      filingDate: new Date().toISOString(),
      status: 'New',
      nextHearing: document.getElementById('newcase-hearing').value,
      documents: [{ name: 'Initial_Brief.pdf', type: 'Brief', size: '1.0 MB' }],
      notes: [{ id: `n_${Date.now()}`, text: 'Initial case dossier opened.', isPrivate: true, createdAt: new Date().toISOString() }],
      description: document.getElementById('newcase-desc').value,
      createdAt: new Date().toISOString()
    };

    cases.unshift(newCase);
    Store.setState('cases', cases);
    Utils.showToast(`Case File ${newCase.caseNumber} created successfully!`, 'success');
    Router.navigate('/cases');
  },

  async handleAddNote(e, caseId) {
    e.preventDefault();
    const input = document.getElementById('new-note-text');
    const text = input.value.trim();
    if (!text) return;

    await ApiClient.addCaseNote(caseId, text);
    Utils.showToast('Confidential note recorded in case diary.', 'success');
    Router.transitionPage('/cases', { id: caseId });
  },

  async handleStatusDropdown(caseId) {
    const statuses = ['New', 'Under Review', 'Consultation Completed', 'Documents Pending', 'Filed', 'Hearing Scheduled', 'Ongoing', 'Resolved'];
    const optionsHtml = statuses.map(s => `<option value="${s}">${s}</option>`).join('');
    
    Utils.showModal(`
      <div class="form-group">
        <label class="form-label">Select Updated Litigation Stage</label>
        <select id="update-stage-select" class="form-select">${optionsHtml}</select>
      </div>
    `, {
      title: 'Update Case Litigation Stage',
      actions: [
        { text: 'Cancel', class: 'btn btn-secondary', onclick: 'Utils.hideModal()' },
        { 
          text: 'Update Stage', 
          class: 'btn btn-primary', 
          onclick: `(async () => {
            const val = document.getElementById('update-stage-select').value;
            await ApiClient.updateCaseStatus('${caseId}', val);
            Utils.hideModal();
            Utils.showToast('Case updated to stage: ' + val, 'success');
            Router.transitionPage('/cases', { id: '${caseId}' });
          })()` 
        }
      ]
    });
  },

  getStatusBadgeClass(status) {
    if (status === 'Resolved') return 'badge-success';
    if (status === 'Hearing Scheduled' || status === 'Ongoing') return 'badge-accent';
    if (status === 'Filed') return 'badge-info';
    return 'badge-warning';
  }
};
