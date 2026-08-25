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
        ${filtered.length === 0 ? Components.emptyState('inbox', 'No requests here', this._filter === 'pending' ? 'New consultation requests will arrive in this queue.' : 'Nothing matches this filter yet.') : filtered.map(c => `
          <div class="client-request-card">
            <div class="client-request-left">
              <div class="avatar avatar-lg">${Utils.escapeHtml(c.name.split(' ').map(n => n[0]).join('').slice(0, 2))}</div>
              <div class="client-request-info">
                <div class="d-flex items-center gap-3 flex-wrap">
                  <h3 class="client-request-name">${Utils.escapeHtml(c.name)}</h3>
                  <span class="client-request-category">${Utils.escapeHtml(c.caseCategory)}</span>
                </div>
                <p class="client-request-problem">${Utils.escapeHtml(c.briefProblem)}</p>

                <div class="client-request-meta">
                  <span class="client-meta-item">
                    <span class="material-symbols-rounded">calendar_month</span> ${c.preferredDate} at ${Utils.escapeHtml(c.preferredTime)}
                  </span>
                  <span class="client-meta-item">
                    <span class="material-symbols-rounded">videocam</span> ${Utils.escapeHtml(c.consultationType)}
                  </span>
                  <span class="client-meta-item">
                    <span class="material-symbols-rounded">description</span> ${(c.documents || []).length} document${(c.documents || []).length === 1 ? '' : 's'} attached
                  </span>
                </div>
              </div>
            </div>

            <div class="client-request-actions">
              <div class="client-request-fee">${Utils.formatCurrency(c.estimatedFee)}</div>
              ${c.status === 'pending' ? `
                <button class="btn btn-primary btn-sm btn-block" onclick="ClientsPage.acceptClient('${c.id}')">Accept</button>
                <button class="btn btn-secondary btn-sm btn-block" onclick="ClientsPage.rejectClient('${c.id}')">Reject</button>
              ` : `
                <span class="badge ${c.status === 'accepted' ? 'badge-success' : c.status === 'rejected' ? 'badge-danger' : 'badge-neutral'}">${c.status.toUpperCase()}</span>
              `}
              <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/clients/id/${c.id}')">View Details</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    return Components.AppLayout(contentHtml, 'clients', 'Client Requests', ['Requests']);
  },

  /* Client Case Detail & AI Pre-analysis */
  renderClientDetail(clientId) {
    const clients = Store.getState('clients') || [];
    const client = clients.find(c => c.id === clientId) || clients[0];
    if (!client) {
      return Components.AppLayout(
        Components.emptyState('person_off', 'Request not found', 'This consultation request may have been withdrawn.', 'Back to Requests', "Router.navigate('/clients')"),
        'clients', 'Case Evaluation', ['Requests']);
    }
    const aiAnalysis = CaseAnalysisEngine.generateAnalysis(client.briefProblem, client.caseCategory);

    const contentHtml = `
      <div class="client-detail-header">
        <div class="avatar avatar-xl">${Utils.escapeHtml(client.name.split(' ').map(n => n[0]).join('').slice(0, 2))}</div>
        <div class="flex-1 min-w-0">
          <div class="d-flex items-center justify-between flex-wrap gap-3">
            <div class="min-w-0">
              <h2 class="client-detail-name">${Utils.escapeHtml(client.name)}</h2>
              <div class="client-detail-email truncate">${Utils.escapeHtml(client.email)} • ${Utils.escapeHtml(String(client.phone))}</div>
            </div>
            <div class="d-flex gap-3 flex-wrap">
              <button class="btn btn-secondary" onclick="Router.navigate('/clients')">
                <span class="material-symbols-rounded">arrow_back</span> Back
              </button>
              ${client.status === 'pending' ? `
                <button class="btn btn-primary" onclick="ClientsPage.acceptClient('${client.id}')">Accept & Open Case</button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- Preliminary Case Analysis -->
      <div class="ai-analysis-card">
        <div class="ai-analysis-header">
          <span class="material-symbols-rounded icon-lg text-accent">psychology</span>
          <div>
            <h3 class="ai-analysis-title">Preliminary Case Summary</h3>
            <span class="text-body-sm text-muted">Rule-based pre-consultation brief generated inside LegalConnect — verify everything independently</span>
          </div>
          <span class="badge badge-neutral ml-auto">Preliminary</span>
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
          <h3 class="client-detail-section-title">Client's Description</h3>
          <p class="text-body-lg" style="line-height:1.7;color:var(--color-gray-700)">
            "${Utils.escapeHtml(client.briefProblem)}"
          </p>

          <h4 class="client-detail-section-title mt-6">Requested Consultation</h4>
          <div class="d-flex gap-6 mt-3 flex-wrap">
            <div><strong>Date:</strong> ${client.preferredDate}</div>
            <div><strong>Time:</strong> ${Utils.escapeHtml(client.preferredTime)}</div>
            <div><strong>Mode:</strong> ${Utils.escapeHtml(client.consultationType)}</div>
            <div><strong>Estimated Fee:</strong> ${Utils.formatCurrency(client.estimatedFee)}</div>
          </div>
        </div>

        <div class="client-detail-section">
          <h3 class="client-detail-section-title">Attached Documents</h3>
          <div class="client-docs-list">
            ${(client.documents || []).map(doc => `
              <div class="client-doc-item">
                <span class="material-symbols-rounded client-doc-icon">picture_as_pdf</span>
                <div class="client-doc-info">
                  <div class="client-doc-name">${Utils.escapeHtml(doc.name)}</div>
                  <div class="client-doc-size">${Utils.escapeHtml(doc.type)} • ${Utils.escapeHtml(doc.size)}</div>
                </div>
                <button class="btn-icon btn-icon-sm" title="Demo dataset file — binary preview not available" onclick="Utils.showToast('Sample document from the demo dataset. Live uploads open in the secure viewer.', 'info')" aria-label="Preview ${Utils.escapeHtml(doc.name)}">
                  <span class="material-symbols-rounded">visibility</span>
                </button>
              </div>
            `).join('') || '<p class="text-body-sm text-muted">No documents attached.</p>'}
          </div>
        </div>
      </div>
    `;

    return Components.AppLayout(contentHtml, 'clients', 'Case Evaluation', ['Requests', client.name]);
  },

  setFilter(filter) {
    this._filter = filter;
    Router.transitionPage('/clients');
  },

  async acceptClient(clientId) {
    const confirmed = await Utils.showConfirm('Accept Consultation Request',
      'Accepting books the appointment for the requested slot, opens the case file, and creates the payment entry.',
      { confirmText: 'Accept & Book' });
    if (!confirmed) return;
    await ApiClient.acceptClientRequest(clientId);
    Utils.showToast('Client accepted — case file, appointment and payment entry created.', 'success');
    ApiClient.startReminderEngine();
    Router.navigate('/cases');
  },

  async rejectClient(clientId) {
    const confirmed = await Utils.showConfirm('Decline Request', 'The client will be notified that this request was declined.', { confirmText: 'Decline', type: 'danger' });
    if (confirmed) {
      await ApiClient.rejectClientRequest(clientId);
      Utils.showToast('Request declined.', 'info');
      Router.transitionPage('/clients');
    }
  }
};
