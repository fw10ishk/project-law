/* ============================================================
   LEGALCONNECT — API CLIENT
   api_client.js — Simulated Backend API layer
   ============================================================ */

const ApiClient = {
  delay(ms = 400) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /* Bar Council Verification */
  async verifyBarCouncil(number, state) {
    await this.delay(800);
    // Realistic simulation: valid format check
    if (number.length < 5) {
      return { status: 'error', message: 'Invalid Bar Council Registration Number format.' };
    }
    // Duplicate check in existing store
    const existing = Store.getState('registeredLawyers') || [];
    if (existing.some(l => l.barCouncil === number && l.id !== AuthManager.getSession()?.id)) {
      return {
        status: 'duplicate',
        message: 'This professional registration is already associated with another account.'
      };
    }
    return {
      status: 'verified',
      enrollmentName: 'Rajesh Kumar Sharma',
      state: state || 'Bar Council of Delhi',
      year: '2010',
      activeStatus: 'Active'
    };
  },

  /* Document OCR & Authenticity check */
  async analyzeDocument(fileName) {
    await this.delay(1000);
    return {
      readability: 'High (98%)',
      docType: 'Official Bar Certificate',
      tamperingDetected: false,
      authenticityScore: 99,
      status: 'Verified'
    };
  },

  /* Liveness & Face Match check */
  async verifyLiveness() {
    await this.delay(1500);
    return {
      livenessPassed: true,
      confidenceScore: 97.4,
      matchWithID: true,
      riskLevel: 'Low'
    };
  },

  /* Client Request Actions */
  async acceptClientRequest(clientId) {
    await this.delay(300);
    const clients = Store.getState('clients') || [];
    const client = clients.find(c => c.id === clientId);
    if (client) {
      client.status = 'accepted';
      Store.setState('clients', clients);
      
      // Auto-create case
      const cases = Store.getState('cases') || [];
      const newCase = {
        id: `case_${Date.now()}`,
        caseNumber: `LC/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
        clientId: client.id,
        clientName: client.name,
        caseType: client.caseCategory,
        legalCategory: client.caseCategory,
        court: 'District Court',
        filingDate: new Date().toISOString(),
        status: 'New',
        nextHearing: Store.generateFutureDate(14),
        documents: client.documents,
        notes: [
          {
            id: `note_${Date.now()}`,
            text: 'Case file automatically initialized upon client request acceptance.',
            isPrivate: true,
            createdAt: new Date().toISOString()
          }
        ],
        description: client.briefProblem,
        createdAt: new Date().toISOString()
      };
      cases.unshift(newCase);
      Store.setState('cases', cases);

      // Create notification
      const notifs = Store.getState('notifications') || [];
      notifs.unshift({
        id: `notif_${Date.now()}`,
        type: 'client',
        title: 'Client Request Accepted',
        message: `You accepted the request from ${client.name}. Case file created.`,
        read: false,
        time: new Date().toISOString()
      });
      Store.setState('notifications', notifs);
    }
    return { success: true };
  },

  async rejectClientRequest(clientId, reason = 'Schedule Conflict') {
    await this.delay(300);
    const clients = Store.getState('clients') || [];
    const client = clients.find(c => c.id === clientId);
    if (client) {
      client.status = 'rejected';
      client.rejectionReason = reason;
      Store.setState('clients', clients);
    }
    return { success: true };
  },

  /* Update Case Status */
  async updateCaseStatus(caseId, newStatus) {
    await this.delay(200);
    const cases = Store.getState('cases') || [];
    const caseItem = cases.find(c => c.id === caseId);
    if (caseItem) {
      caseItem.status = newStatus;
      Store.setState('cases', cases);
    }
    return { success: true };
  },

  /* Add Private Note */
  async addCaseNote(caseId, noteText) {
    await this.delay(200);
    const cases = Store.getState('cases') || [];
    const caseItem = cases.find(c => c.id === caseId);
    if (caseItem) {
      caseItem.notes.unshift({
        id: `note_${Date.now()}`,
        text: noteText,
        isPrivate: true,
        createdAt: new Date().toISOString()
      });
      Store.setState('cases', cases);
    }
    return { success: true };
  }
};
