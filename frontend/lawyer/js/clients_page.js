/* ============================================================
   LEGALCONNECT — CLIENT REQUESTS & CASE EVALUATION
   clients_page.js — Requests list, case details, AI analysis, accept/reject
   ============================================================ */

const ClientsPage = {
  _selectedClientId: null,
  _filter: 'all',

  render(params = {}) {
    if (params.id) {
      return this.renderClientDetail(params.id);
    }

    const allClients = Store.getState('clients') || [];
    let filtered = allClients;
    if (this._filter === 'pending') filtered = allClients.filter(c => c.status === 'pending');
    if (this._filter === 'accepted') filtered = allClients.filter(c => c.status === 'accepted');

    const contentHtml = `
      <div class="page-header">
        <div class="page-header-left">
          <h2 class="page-title">Client Consultation Requests</h2>
          <p class="page-subtitle">Evaluate incoming client grievances, case summaries and book consultations</p>
        </div>

        <div class="clients-filter">
          <span class="chip ${this._filter === 'all' ? 'active' : ''}" onclick="ClientsPage.setFilter('all')">All Requests (${allClients.length})</span>
          <span class="chip ${this._filter === 'pending' ? 'active' : ''}" onclick="ClientsPage.setFilter('pending')">Pending Review (${allClients.filter(c => c.status === 'pending').length})</span>
          <span class="chip ${this._filter === 'accepted' ? 'active' : ''}" onclick="ClientsPage.setFilter('accepted')">Accepted Clients</span>
        </div>
      </div>

      <div class="client-request-list">
        ${filtered.map(c => `
          <div class="client-request-card">
            <div class="client-request-left">
              <div class="avatar avatar-lg">
                ${c.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div class="client-request-info">
                <div class="d-flex items-center gap-3">
                  <h3 class="client-request-name">${c.name}</h3>
                  <span class="client-request-category">${c.caseCategory}</span>
                </div>
                <p class="client-request-problem">${c.briefProblem}</p>

                <div class="client-request-meta">
                  <span class="client-meta-item">
                    <span class="material-symbols-rounded">calendar_month</span> ${c.preferredDate} at ${c.preferredTime}
                  </span>
                  <span class="client-meta-item">
                    <span class="material-symbols-rounded">videocam</span> ${c.consultationType}
                  </span>
                  <span class="client-meta-item">
                    <span class="material-symbols-rounded">description</span> ${c.documents.length} Documents Attached
                  </span>
                </div>
              </div>
            </div>

            <div class="client-request-actions">
              <div class="client-request-fee">${Utils.formatCurrency(c.estimatedFee)}</div>
              ${c.status === 'pending' ? `
                <button class="btn btn-primary btn-sm btn-block" onclick="ClientsPage.acceptClient('${c.id}')">
                  Accept
                </button>
                <button class="btn btn-secondary btn-sm btn-block" onclick="ClientsPage.rejectClient('${c.id}')">
                  Reject
                </button>
              ` : `
                <span class="badge ${c.status === 'accepted' ? 'badge-success' : 'badge-neutral'}">
                  ${c.status.toUpperCase()}
                </span>
              `}
              <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/clients', { id: '${c.id}' })">
                View Details
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    return Components.AppLayout(contentHtml, 'clients', 'Client Requests', ['Requests']);
  },

  /* Client Case Detail & AI Pre-analysis */
  renderClientDetail(clientId) {
    const client = (Store.getState('clients') || []).find(c => c.id === clientId) || Store.getState('clients')[0];
    const aiAnalysis = CaseAnalysisEngine.generateAnalysis(client.briefProblem, client.caseCategory);

    const contentHtml = `
      <div class="client-detail-header">
        <div class="avatar avatar-xl">
          ${client.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div class="flex-1">
          <div class="d-flex items-center justify-between">
            <div>
              <h2 class="client-detail-name">${client.name}</h2>
              <div class="client-detail-email">${client.email} • ${client.phone}</div>
            </div>
            <div class="d-flex gap-3">
              <button class="btn btn-secondary" onclick="Router.navigate('/clients')">
                <span class="material-symbols-rounded">arrow_back</span> Back to Requests
              </button>
              ${client.status === 'pending' ? `
                <button class="btn btn-primary" onclick="ClientsPage.acceptClient('${client.id}')">
                  Accept Client & Open Case
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- AI Case Analysis Section -->
      <div class="ai-analysis-card">
        <div class="ai-analysis-header">
          <span class="material-symbols-rounded icon-lg text-accent">psychology</span>
          <div>
            <h3 class="ai-analysis-title">AI Case Preliminary Summary & Strategic Analysis</h3>
            <span class="text-body-sm text-muted">Automated pre-consultation dossier synthesized from client description</span>
          </div>
        </div>

        <div class="ai-analysis-grid">
          <div class="ai-analysis-item">
            <div class="ai-analysis-item-title">Probable Legal Ground & Statutory Provisions</div>
            <div class="ai-analysis-item-content">
              <strong>${aiAnalysis.legalCategory}</strong>
              <ul>
                ${aiAnalysis.relevantTopics.map(t => `<li>${t}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="ai-analysis-item">
            <div class="ai-analysis-item-title">Key Verified Facts</div>
            <div class="ai-analysis-item-content">
              <ul>
                ${aiAnalysis.keyFacts.map(f => `<li>${f}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="ai-analysis-item">
            <div class="ai-analysis-item-title">Missing Supporting Documents to Request</div>
            <div class="ai-analysis-item-content">
              <ul>
                ${aiAnalysis.missingDocuments.map(d => `<li>${d}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="ai-analysis-item">
            <div class="ai-analysis-item-title">Strategic Questions for Consultation</div>
            <div class="ai-analysis-item-content">
              <ul>
                ${aiAnalysis.suggestedQuestions.map(q => `<li>${q}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>

        <div class="ai-disclaimer">
          <span class="material-symbols-rounded icon-sm">info</span>
          <span>AI-generated preliminary information. It assists preliminary case review and does not replace independent professional legal judgment.</span>
        </div>
      </div>

      <!-- Client Documents & Details Grid -->
      <div class="client-detail-grid">
        <div class="client-detail-section">
          <h3 class="client-detail-section-title">Client Grievance Statement</h3>
          <p class="text-body-lg" style="line-height:1.7;color:var(--color-gray-700)">
            "${client.briefProblem}"
          </p>

          <h4 class="client-detail-section-title mt-6">Consultation Schedule Requested</h4>
          <div class="d-flex gap-6 mt-3">
            <div><strong>Date:</strong> ${client.preferredDate}</div>
            <div><strong>Time:</strong> ${client.preferredTime}</div>
            <div><strong>Mode:</strong> ${client.consultationType}</div>
            <div><strong>Estimated Fee:</strong> ${Utils.formatCurrency(client.estimatedFee)}</div>
          </div>
        </div>

        <div class="client-detail-section">
          <h3 class="client-detail-section-title">Attached Evidence Documents</h3>
          <div class="client-docs-list">
            ${client.documents.map(doc => `
              <div class="client-doc-item">
                <span class="material-symbols-rounded client-doc-icon">picture_as_pdf</span>
                <div class="client-doc-info">
                  <div class="client-doc-name">${doc.name}</div>
                  <div class="client-doc-size">${doc.type} • ${doc.size}</div>
                </div>
                <button class="btn-icon btn-icon-sm" onclick="Utils.showToast('Opening ${doc.name} in secure document viewer...', 'info')">
                  <span class="material-symbols-rounded">visibility</span>
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    return Components.AppLayout(contentHtml, 'clients', 'Case Evaluation Dossier', ['Requests', client.name]);
  },

  setFilter(filter) {
    this._filter = filter;
    Router.transitionPage('/clients');
  },

  async acceptClient(clientId) {
    await ApiClient.acceptClientRequest(clientId);
    Utils.showToast('Client accepted! Case file and calendar slot have been locked.', 'success');
    Router.navigate('/cases');
  },

  async rejectClient(clientId) {
    const confirmed = await Utils.showConfirm('Reject Consultation Request', 'Are you sure you want to decline this consultation request?');
    if (confirmed) {
      await ApiClient.rejectClientRequest(clientId);
      Utils.showToast('Consultation request declined.', 'info');
      Router.transitionPage('/clients');
    }
  }
};
