/* ============================================================
   LEGALCONNECT — CENTRAL STATE STORE
   store.js — State management, mock data, event emitter
   ============================================================ */

const Store = {
  _state: {},
  _listeners: {},
  STORAGE_KEY: 'lc_store',

  /* --------------------------------------------------------
     STATE MANAGEMENT
     -------------------------------------------------------- */
  getState(key) {
    if (key) return this._state[key];
    return { ...this._state };
  },

  setState(key, value) {
    this._state[key] = value;
    this.persist();
    this.notify(key);
  },

  updateState(key, updater) {
    const current = this._state[key];
    this._state[key] = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    this.persist();
    this.notify(key);
  },

  /* --------------------------------------------------------
     EVENT SYSTEM
     -------------------------------------------------------- */
  subscribe(key, callback) {
    if (!this._listeners[key]) this._listeners[key] = [];
    this._listeners[key].push(callback);
    return () => {
      this._listeners[key] = this._listeners[key].filter(cb => cb !== callback);
    };
  },

  notify(key) {
    if (this._listeners[key]) {
      this._listeners[key].forEach(cb => cb(this._state[key]));
    }
    if (this._listeners['*']) {
      this._listeners['*'].forEach(cb => cb(key, this._state[key]));
    }
  },

  /* --------------------------------------------------------
     PERSISTENCE
     -------------------------------------------------------- */
  persist() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._state));
    } catch (e) {
      console.warn('[Store] Failed to persist state:', e);
    }
  },

  hydrate() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this._state = JSON.parse(data);
        return true;
      }
    } catch (e) {
      console.warn('[Store] Failed to hydrate state:', e);
    }
    return false;
  },

  /* --------------------------------------------------------
     INITIALIZATION
     -------------------------------------------------------- */
  init() {
    const hydrated = this.hydrate();
    if (!hydrated || !this._state.clients || this._state.clients.length === 0) {
      this.seedMockData();
    }
  },

  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
    this._state = {};
    this.seedMockData();
  },

  /* --------------------------------------------------------
     MOCK DATA GENERATOR
     -------------------------------------------------------- */
  seedMockData() {
    // Indian names for realistic data
    const clientNames = [
      'Rahul Verma', 'Priya Sharma', 'Amit Patel', 'Neha Gupta', 'Suresh Kumar',
      'Anita Desai', 'Vikram Singh', 'Kavita Reddy', 'Manoj Tiwari', 'Sunita Rao',
      'Deepak Joshi', 'Rina Mehta', 'Arun Nair', 'Pooja Saxena', 'Ravi Chopra'
    ];

    const caseTypes = [
      'Property Dispute', 'Criminal Defense', 'Divorce & Family', 'Cyber Crime',
      'Consumer Complaint', 'Bail Application', 'Cheque Bounce', 'Employment Dispute',
      'Land Acquisition', 'Insurance Claim', 'Contract Breach', 'Defamation',
      'Domestic Violence', 'Tax Dispute', 'Intellectual Property'
    ];

    const courts = ['Supreme Court', 'High Court', 'District Court', 'Sessions Court', 'Family Court', 'Consumer Forum'];
    const statuses = ['New', 'Under Review', 'Consultation Completed', 'Documents Pending', 'Filed', 'Hearing Scheduled', 'Ongoing', 'Resolved'];
    const consultTypes = ['Video Call', 'Audio Call', 'In-Person', 'Chat'];

    // Generate Clients
    const clients = clientNames.map((name, i) => ({
      id: `cli_${i + 1}`,
      name,
      email: `${name.toLowerCase().replace(/\s/g, '.')}@email.com`,
      phone: `${Utils.randomBetween(7, 9)}${String(Utils.randomBetween(100000000, 999999999))}`,
      avatar: null,
      caseCategory: Utils.randomFrom(caseTypes),
      briefProblem: this.generateCaseDescription(Utils.randomFrom(caseTypes)),
      preferredDate: this.generateFutureDate(Utils.randomBetween(1, 14)),
      preferredTime: Utils.randomFrom(['10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']),
      consultationType: Utils.randomFrom(consultTypes),
      estimatedFee: Utils.randomFrom([500, 750, 1000, 1500, 2000]),
      documents: this.generateDocuments(Utils.randomBetween(1, 4)),
      status: i < 3 ? 'pending' : Utils.randomFrom(['accepted', 'rejected', 'pending', 'completed']),
      createdAt: Utils.randomDate(new Date(2025, 0, 1), new Date()).toISOString()
    }));

    // Generate Cases
    const cases = [];
    clients.filter(c => c.status === 'accepted' || c.status === 'completed').forEach((client, i) => {
      cases.push({
        id: `case_${i + 1}`,
        caseNumber: `LC/${new Date().getFullYear()}/${String(i + 1).padStart(4, '0')}`,
        clientId: client.id,
        clientName: client.name,
        caseType: client.caseCategory,
        legalCategory: client.caseCategory,
        court: Utils.randomFrom(courts),
        filingDate: Utils.randomDate(new Date(2024, 6, 1), new Date()).toISOString(),
        status: Utils.randomFrom(statuses),
        nextHearing: this.generateFutureDate(Utils.randomBetween(3, 30)),
        documents: client.documents,
        notes: [
          {
            id: `note_${i}_1`,
            text: 'Initial consultation completed. Client has provided basic documents.',
            isPrivate: true,
            createdAt: new Date(Date.now() - Utils.randomBetween(1, 30) * 86400000).toISOString()
          },
          {
            id: `note_${i}_2`,
            text: 'Need to review property documents in detail before next hearing.',
            isPrivate: true,
            createdAt: new Date(Date.now() - Utils.randomBetween(1, 15) * 86400000).toISOString()
          }
        ],
        description: client.briefProblem,
        createdAt: client.createdAt
      });
    });

    // Generate Appointments
    const appointments = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const apptDate = new Date(today);
      apptDate.setDate(today.getDate() + i);
      apptDate.setHours(Utils.randomBetween(9, 17), Utils.randomFrom([0, 30]), 0);
      
      appointments.push({
        id: `appt_${i + 1}`,
        clientId: clients[i]?.id,
        clientName: clients[i]?.name || 'Unknown Client',
        caseType: clients[i]?.caseCategory || 'General Consultation',
        date: apptDate.toISOString(),
        duration: Utils.randomFrom([30, 45, 60]),
        type: Utils.randomFrom(consultTypes),
        status: i === 0 ? 'upcoming' : Utils.randomFrom(['upcoming', 'confirmed', 'completed']),
        fee: Utils.randomFrom([500, 750, 1000, 1500])
      });
    }

    // Generate Transactions
    const transactions = [];
    for (let i = 0; i < 20; i++) {
      const amount = Utils.randomFrom([500, 750, 1000, 1500, 2000, 3000, 5000]);
      const platformFee = Math.round(amount * 0.1);
      transactions.push({
        id: `txn_${i + 1}`,
        clientName: Utils.randomFrom(clientNames),
        service: Utils.randomFrom(['Initial Consultation', 'Detailed Consultation', 'Document Review', 'Court Appearance', 'Case Filing']),
        date: Utils.randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
        amount,
        platformFee,
        netEarnings: amount - platformFee,
        paymentStatus: Utils.randomFrom(['completed', 'completed', 'completed', 'pending', 'processing']),
        paymentMethod: Utils.randomFrom(['UPI', 'Card', 'Net Banking'])
      });
    }
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Generate Reviews
    const reviews = [];
    for (let i = 0; i < 12; i++) {
      reviews.push({
        id: `rev_${i + 1}`,
        clientName: Utils.randomFrom(clientNames),
        rating: Utils.randomFrom([4, 4, 4, 5, 5, 5, 5, 3, 5, 4]),
        review: Utils.randomFrom([
          'Excellent lawyer! Very knowledgeable and professional. Explained everything clearly.',
          'Very helpful in understanding my legal rights. Highly recommended.',
          'Provided great guidance on my property dispute case. Very patient and thorough.',
          'Outstanding legal advice. Resolved my case efficiently.',
          'Professional and responsive. Kept me informed throughout the process.',
          'Great experience. The lawyer understood my case immediately and provided practical solutions.',
          'Very competent and well-versed in criminal law. Won my case successfully.',
          'Highly professional. Worth every rupee spent on consultation.',
          'Knowledgeable and supportive. Made a complex legal process seem simple.',
          'Good consultation experience. Would definitely recommend to others.',
          'Exceptional lawyer with deep understanding of civil matters.',
          'Prompt responses and thorough case preparation. Very satisfied.'
        ]),
        wouldRecommend: Utils.randomFrom([true, true, true, true, false]),
        date: Utils.randomDate(new Date(2024, 6, 1), new Date()).toISOString()
      });
    }
    reviews.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Generate Notifications
    const notifications = [
      { id: 'notif_1', type: 'client', title: 'New Consultation Request', message: `${clients[0]?.name} has requested a consultation for ${clients[0]?.caseCategory}.`, read: false, time: new Date(Date.now() - 1800000).toISOString() },
      { id: 'notif_2', type: 'appointment', title: 'Upcoming Appointment', message: 'Your consultation with Rahul Verma starts in 30 minutes.', read: false, time: new Date(Date.now() - 3600000).toISOString() },
      { id: 'notif_3', type: 'payment', title: 'Payment Received', message: `₹1,000 received for consultation with ${clients[2]?.name}.`, read: true, time: new Date(Date.now() - 7200000).toISOString() },
      { id: 'notif_4', type: 'verification', title: 'Certificate Verified', message: 'Your LLB certificate has been successfully verified.', read: true, time: new Date(Date.now() - 86400000).toISOString() },
      { id: 'notif_5', type: 'security', title: 'New Device Login', message: 'A new device logged into your account from Chrome, Windows.', read: false, time: new Date(Date.now() - 172800000).toISOString() },
      { id: 'notif_6', type: 'case', title: 'Hearing Reminder', message: `Your case LC/2025/0001 has a hearing scheduled for ${this.generateFutureDate(3)}.`, read: false, time: new Date(Date.now() - 259200000).toISOString() },
      { id: 'notif_7', type: 'client', title: 'Client Document Uploaded', message: 'Priya Sharma has uploaded new documents for review.', read: true, time: new Date(Date.now() - 345600000).toISOString() },
      { id: 'notif_8', type: 'payment', title: 'Weekly Earnings Summary', message: 'You earned ₹12,500 this week from 8 consultations.', read: true, time: new Date(Date.now() - 604800000).toISOString() }
    ];

    // Chat Conversations
    const conversations = clients.slice(0, 5).map((client, i) => ({
      id: `conv_${i + 1}`,
      clientId: client.id,
      clientName: client.name,
      lastMessage: Utils.randomFrom([
        'Thank you for the consultation.',
        'I have uploaded the required documents.',
        'When is the next hearing?',
        'Please review the attached agreement.',
        'Can we schedule a follow-up?'
      ]),
      lastMessageTime: new Date(Date.now() - Utils.randomBetween(1, 72) * 3600000).toISOString(),
      unreadCount: i < 2 ? Utils.randomBetween(1, 3) : 0,
      category: client.caseCategory,
      messages: this.generateChatMessages(client.name)
    }));

    // Lawyer Profile Experience
    const experience = [
      { id: 'exp_1', organization: 'Sharma & Associates Law Firm', position: 'Senior Associate', startYear: 2019, endYear: 2024, role: 'Lead Counsel', area: 'Criminal & Civil Litigation' },
      { id: 'exp_2', organization: 'Kumar Legal Services', position: 'Associate', startYear: 2015, endYear: 2019, role: 'Counsel', area: 'Criminal Law' },
      { id: 'exp_3', organization: 'District Court Practice', position: 'Independent Advocate', startYear: 2010, endYear: 2015, role: 'Advocate', area: 'General Practice' }
    ];

    // Case Experience
    const caseExperience = [
      { id: 'cexp_1', type: 'Property Dispute', area: 'Civil Law', court: 'High Court', year: 2023, role: 'Lead Counsel', status: 'Completed', outcome: 'Successfully Resolved', description: 'Complex property dispute involving multiple parties. Successfully obtained favorable verdict for client.' },
      { id: 'cexp_2', type: 'Criminal Defense', area: 'Criminal Law', court: 'Sessions Court', year: 2022, role: 'Defense Counsel', status: 'Completed', outcome: 'Acquitted', description: 'Defended client against serious criminal charges. Secured acquittal based on insufficient evidence.' },
      { id: 'cexp_3', type: 'Cyber Crime', area: 'Cyber Law', court: 'District Court', year: 2024, role: 'Counsel', status: 'Ongoing', outcome: 'In Progress', description: 'Representing victim of online fraud and identity theft.' },
      { id: 'cexp_4', type: 'Bail Application', area: 'Criminal Law', court: 'High Court', year: 2023, role: 'Defense Counsel', status: 'Completed', outcome: 'Bail Granted', description: 'Successfully argued bail application for client in economic offense case.' }
    ];

    // Certificates
    const certificates = [
      { id: 'cert_1', name: 'Bar Council Enrollment Certificate', type: 'required', status: 'verified', verifiedDate: '2024-01-15', file: 'bar_council_cert.pdf' },
      { id: 'cert_2', name: 'LLB Degree Certificate', type: 'required', status: 'verified', verifiedDate: '2024-01-15', file: 'llb_degree.pdf' },
      { id: 'cert_3', name: 'Government Identity Proof', type: 'required', status: 'verified', verifiedDate: '2024-01-15', file: 'aadhaar.pdf' },
      { id: 'cert_4', name: 'LLM Certificate', type: 'optional', status: 'verified', verifiedDate: '2024-02-20', file: 'llm_cert.pdf' },
      { id: 'cert_5', name: 'Cyber Law Certification', type: 'optional', status: 'verified', verifiedDate: '2024-03-10', file: 'cyber_law_cert.pdf' },
      { id: 'cert_6', name: 'Mediation Certification', type: 'optional', status: 'pending', verifiedDate: null, file: 'mediation_cert.pdf' }
    ];

    // Pricing
    const pricing = [
      { id: 'price_1', service: 'Initial Consultation', fee: 500, duration: '30 min', type: 'fixed' },
      { id: 'price_2', service: 'Detailed Consultation', fee: 1000, duration: '60 min', type: 'fixed' },
      { id: 'price_3', service: 'Document Review', fee: 750, duration: 'Per Document', type: 'fixed' },
      { id: 'price_4', service: 'Case Representation', fee: 5000, duration: 'Per Case', type: 'starting' },
      { id: 'price_5', service: 'Court Appearance', fee: 3000, duration: 'Per Hearing', type: 'starting' },
      { id: 'price_6', service: 'Legal Notice Drafting', fee: 2000, duration: 'Per Notice', type: 'negotiable' }
    ];

    // Availability
    const availability = {
      monday: [{ start: '10:00', end: '13:00' }, { start: '16:00', end: '19:00' }],
      tuesday: [{ start: '10:00', end: '14:00' }],
      wednesday: [],
      thursday: [{ start: '10:00', end: '13:00' }, { start: '15:00', end: '18:00' }],
      friday: [{ start: '10:00', end: '14:00' }, { start: '16:00', end: '19:00' }],
      saturday: [{ start: '10:00', end: '13:00' }],
      sunday: []
    };

    // Settings
    const settings = {
      notifications: {
        clientRequests: true,
        payments: true,
        appointments: true,
        securityAlerts: true,
        caseUpdates: true,
        marketing: false
      },
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowReviews: true,
        shareDocuments: 'with_permission'
      },
      security: {
        twoFactorEnabled: true,
        loginAlerts: true,
        sessionTimeout: 24 // hours
      }
    };

    // Verification Status
    const verification = {
      identity: { status: 'verified', date: '2024-01-15', method: 'Aadhaar + Selfie' },
      barCouncil: { status: 'verified', date: '2024-01-15', registrationNumber: 'DL/1234/2010' },
      education: { status: 'verified', date: '2024-01-15', institution: 'Delhi University' },
      practiceCertificate: { status: 'verified', date: '2024-01-20', validUntil: '2025-12-31' },
      professionalProfile: { status: 'verified', date: '2024-01-20' },
      verificationId: 'VER_2024_001',
      overallStatus: 'verified',
      riskLevel: 'low'
    };

    // Set all state
    this._state = {
      clients,
      cases,
      appointments,
      transactions,
      reviews,
      notifications,
      conversations,
      experience,
      caseExperience,
      certificates,
      pricing,
      availability,
      settings,
      verification,
      registeredLawyers: this._state.registeredLawyers || [],
      profileDeactivated: false
    };

    this.persist();
  },

  /* --------------------------------------------------------
     DATA HELPERS
     -------------------------------------------------------- */
  generateCaseDescription(caseType) {
    const descriptions = {
      'Property Dispute': 'I have a dispute regarding property ownership. The other party is claiming rights over my ancestral property despite having no legal documents.',
      'Criminal Defense': 'I have been falsely accused in a criminal case and need legal representation for my defense.',
      'Divorce & Family': 'I am seeking legal help for divorce proceedings and custody matters.',
      'Cyber Crime': 'I am a victim of online fraud and need legal help to file a case and recover my losses.',
      'Consumer Complaint': 'I purchased a defective product and the company is refusing to provide a replacement or refund.',
      'Bail Application': 'My family member has been arrested and I need immediate help with bail application.',
      'Cheque Bounce': 'A cheque issued to me bounced and I want to file a case under Section 138 of NI Act.',
      'Employment Dispute': 'I was terminated from my job without proper notice and due process. I need legal advice.',
      'Land Acquisition': 'My agricultural land is being acquired by the government and I believe the compensation offered is inadequate.',
      'Insurance Claim': 'My insurance claim has been wrongfully rejected despite meeting all policy conditions.',
      'Contract Breach': 'The other party has breached the terms of our business contract and I want to seek damages.',
      'Defamation': 'False statements are being made against me publicly and I want to file a defamation case.',
      'Domestic Violence': 'I need legal protection and help filing a case under the Domestic Violence Act.',
      'Tax Dispute': 'I have received an unfair tax assessment and want to appeal the decision.',
      'Intellectual Property': 'Someone has copied my original work and I need to protect my intellectual property rights.'
    };
    return descriptions[caseType] || 'I need legal consultation regarding my case.';
  },

  generateDocuments(count) {
    const docs = [
      { name: 'ID_Proof.pdf', type: 'ID Proof', size: '1.2 MB' },
      { name: 'Property_Document.pdf', type: 'Property Document', size: '3.5 MB' },
      { name: 'Agreement_Copy.pdf', type: 'Agreement', size: '2.1 MB' },
      { name: 'Evidence_Photos.zip', type: 'Evidence', size: '8.7 MB' },
      { name: 'Bank_Statements.pdf', type: 'Financial Document', size: '1.8 MB' },
      { name: 'Court_Notice.pdf', type: 'Court Document', size: '0.5 MB' }
    ];
    return docs.slice(0, count);
  },

  generateFutureDate(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  },

  generateChatMessages(clientName) {
    const now = Date.now();
    return [
      { id: 'm1', sender: 'client', text: 'Hello, I need help with my case.', time: new Date(now - 86400000 * 3).toISOString() },
      { id: 'm2', sender: 'lawyer', text: `Hello ${clientName.split(' ')[0]}, I have reviewed your case details. Let me explain what I found.`, time: new Date(now - 86400000 * 3 + 3600000).toISOString() },
      { id: 'm3', sender: 'lawyer', text: 'Based on the documents you shared, I can see a strong case. We should proceed with filing.', time: new Date(now - 86400000 * 2).toISOString() },
      { id: 'm4', sender: 'client', text: 'Thank you. What documents do I need to submit next?', time: new Date(now - 86400000 * 2 + 1800000).toISOString() },
      { id: 'm5', sender: 'lawyer', text: 'Please upload the original agreement copy and any correspondence you have with the other party.', time: new Date(now - 86400000).toISOString() },
      { id: 'm6', sender: 'client', text: 'I have uploaded the documents. Please review them.', time: new Date(now - 43200000).toISOString() }
    ];
  },

  /* --------------------------------------------------------
     COMPUTED GETTERS
     -------------------------------------------------------- */
  getPendingRequests() {
    return (this._state.clients || []).filter(c => c.status === 'pending');
  },

  getActiveClients() {
    return (this._state.clients || []).filter(c => c.status === 'accepted');
  },

  getTodayAppointments() {
    const today = new Date().toDateString();
    return (this._state.appointments || []).filter(a => 
      new Date(a.date).toDateString() === today
    );
  },

  getUnreadNotifications() {
    return (this._state.notifications || []).filter(n => !n.read);
  },

  getMonthlyEarnings() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return (this._state.transactions || [])
      .filter(t => new Date(t.date) >= startOfMonth && t.paymentStatus === 'completed')
      .reduce((sum, t) => sum + t.netEarnings, 0);
  },

  getTotalEarnings() {
    return (this._state.transactions || [])
      .filter(t => t.paymentStatus === 'completed')
      .reduce((sum, t) => sum + t.netEarnings, 0);
  },

  getAverageRating() {
    const reviews = this._state.reviews || [];
    if (reviews.length === 0) return 0;
    return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  },

  getWeeklyEarnings() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return (this._state.transactions || [])
      .filter(t => new Date(t.date) >= startOfWeek && t.paymentStatus === 'completed')
      .reduce((sum, t) => sum + t.netEarnings, 0);
  },

  getTodayEarnings() {
    const today = new Date().toDateString();
    return (this._state.transactions || [])
      .filter(t => new Date(t.date).toDateString() === today && t.paymentStatus === 'completed')
      .reduce((sum, t) => sum + t.netEarnings, 0);
  }
};
