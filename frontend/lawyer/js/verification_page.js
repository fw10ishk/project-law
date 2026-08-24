/* ============================================================
   LEGALCONNECT — DOCUMENT VERIFICATION & FRAUD-PREVENTION ENGINE
   verification_page.js — Points 8 to 15: Statutory Bar Verification, OCR Checks, Liveness, Fraud Risk
   ============================================================ */

const VerificationPage = {
  _stage: 1, // 1: Bar Council (Pt 8), 2: Doc Upload & OCR (Pts 9,10), 3: Liveness & Selfie (Pt 11), 4: Fraud Screening (Pts 12,13,14), 5: Result (Pt 15)
  _documents: [
    { id: 'doc_1', name: 'Bar Council Enrollment Certificate', type: 'Required', status: 'verified', file: 'Bar_Council_Enrollment_DL1234.pdf', ocr: 'Readability: 99% • DL/1234/2010 • Enrolled: 2010 • No Tampering Detected' },
    { id: 'doc_2', name: 'Certificate of Practice (COP)', type: 'Required', status: 'verified', file: 'All_India_Bar_Exam_COP.pdf', ocr: 'Valid All India Bar Practice Standing' },
    { id: 'doc_3', name: 'LLB Degree Certificate', type: 'Required', status: 'verified', file: 'LLB_Degree_DelhiUniversity.pdf', ocr: 'Institution: Faculty of Law, University of Delhi • Verified' },
    { id: 'doc_4', name: 'Government Identity Proof (Aadhaar / Voter ID / Passport)', type: 'Required', status: 'verified', file: 'Govt_ID_Proof_Aadhaar.pdf', ocr: 'Biometric UIDAI Verification Matched' },
    { id: 'doc_5', name: 'LLM Degree Certificate', type: 'Optional', status: 'uploaded', file: 'LLM_Specialization_Cert.pdf', ocr: 'LLM Criminal Jurisprudence Verified' },
    { id: 'doc_6', name: 'Cyber Law Certification', type: 'Optional', status: 'uploaded', file: 'Cyber_Forensics_Cert.pdf', ocr: 'National Law School IT Act Diploma' },
    { id: 'doc_7', name: 'Mediation & Arbitration Certification', type: 'Optional', status: 'pending', file: null, ocr: 'Click to upload certification' },
    { id: 'doc_8', name: 'Other Professional Qualifications', type: 'Optional', status: 'pending', file: null, ocr: 'Click to upload other diplomas' }
  ],

  render() {
    const lawyer = AuthManager.getSession() || AuthManager._pendingUser || AuthManager.getDemoLawyer();

    return `
      <div class="fullscreen-page">
        <div class="fullscreen-card fullscreen-card-xl">
          <div class="page-header" style="margin-bottom:var(--space-4)">
            <div>
              <h2 class="register-title">Advocate Statutory Verification Protocol</h2>
              <p class="register-subtitle">Comprehensive Regulatory Compliance & Anti-Fraud Security Layer</p>
            </div>
            <span class="badge badge-accent">Points 8–15 Engine</span>
          </div>

          <!-- Multi-tier Stepper Indicator -->
          <div class="verification-progress">
            <div class="register-stepper">
              <div class="register-step ${this._stage >= 1 ? 'active' : ''} ${this._stage > 1 ? 'completed' : ''}">
                <div class="register-step-circle">${this._stage > 1 ? '✓' : '1'}</div>
                <div class="register-step-label">Bar Registry</div>
              </div>
              <div class="register-step-line"></div>
              <div class="register-step ${this._stage >= 2 ? 'active' : ''} ${this._stage > 2 ? 'completed' : ''}">
                <div class="register-step-circle">${this._stage > 2 ? '✓' : '2'}</div>
                <div class="register-step-label">OCR & Credentials</div>
              </div>
              <div class="register-step-line"></div>
              <div class="register-step ${this._stage >= 3 ? 'active' : ''} ${this._stage > 3 ? 'completed' : ''}">
                <div class="register-step-circle">${this._stage > 3 ? '✓' : '3'}</div>
                <div class="register-step-label">Liveness & Selfie</div>
              </div>
              <div class="register-step-line"></div>
              <div class="register-step ${this._stage >= 4 ? 'active' : ''} ${this._stage > 4 ? 'completed' : ''}">
                <div class="register-step-circle">${this._stage > 4 ? '✓' : '4'}</div>
                <div class="register-step-label">Fraud Risk Screening</div>
              </div>
              <div class="register-step-line"></div>
              <div class="register-step ${this._stage >= 5 ? 'active' : ''}">
                <div class="register-step-circle">5</div>
                <div class="register-step-label">Badge Issued</div>
              </div>
            </div>
          </div>

          <!-- Stage View Container -->
          <div id="verification-stage-content">
            ${this.renderStage(this._stage, lawyer)}
          </div>
        </div>
      </div>
    `;
  },

  renderStage(stage, lawyer) {
    if (stage === 1) return this.renderStage1(lawyer);
    if (stage === 2) return this.renderStage2(lawyer);
    if (stage === 3) return this.renderStage3(lawyer);
    if (stage === 4) return this.renderStage4(lawyer);
    return this.renderStage5(lawyer);
  },

  /* --------------------------------------------------------
     POINT 8: Professional Registration Verification
     -------------------------------------------------------- */
  renderStage1(lawyer) {
    return `
      <div class="barcouncil-verify">
        <h3 class="card-title">Point 8: Authoritative State Bar Council Verification</h3>
        <p class="text-body-sm text-muted mb-4">
          Queries authoritative government Bar Council registry to verify registration validity, standing, and identity consistency.
        </p>

        <div class="form-group">
          <label class="form-label">Bar Council Registration Number</label>
          <div class="verify-input-group">
            <input type="text" id="bc-num-input" class="form-input" value="${lawyer.barCouncil || 'DL/1234/2010'}">
            <button class="btn btn-primary" id="btn-verify-bc" onclick="VerificationPage.handleVerifyBarCouncil()">
              <span class="material-symbols-rounded">verified</span> Query Bar Database
            </button>
          </div>
          <span class="form-hint">Checks: Registration Number Exists • Name Matches • State Matches • Enrollment Info Matches • Status Active</span>
        </div>

        <div id="bc-result-box">
          <div class="verify-result info">
            <span class="material-symbols-rounded">info</span>
            <div>
              <div class="verify-result-text">Registry Ready for Verification</div>
              <div class="text-body-sm">Click 'Query Bar Database' to execute real-time statutory lookup.</div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-between mt-8">
          <button class="btn btn-ghost" onclick="Router.navigate('/register')">← Back to Registration</button>
          <button class="btn btn-primary btn-lg" onclick="VerificationPage.setStage(2)">
            Next: Upload & OCR Check →
          </button>
        </div>
      </div>
    `;
  },

  /* --------------------------------------------------------
     POINTS 9 & 10: Upload Legal Credentials & OCR Authenticity Check
     -------------------------------------------------------- */
  renderStage2(lawyer) {
    return `
      <div>
        <div class="d-flex justify-between items-center mb-3">
          <div>
            <h3 class="card-title">Points 9 & 10: Legal Credentials & AI OCR Authenticity Analysis</h3>
            <p class="text-body-sm text-muted">
              4 Required Documents + 4 Optional Certifications. AI OCR verifies document integrity, fonts, dates & tampering markers.
            </p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="VerificationPage.simulateScanAllDocs()">
            <span class="material-symbols-rounded">scanner</span> Scan All with OCR
          </button>
        </div>

        <div class="doc-upload-grid">
          ${this._documents.map(doc => `
            <div class="doc-upload-card ${doc.type.toLowerCase()} ${doc.file ? 'uploaded' : ''}" onclick="VerificationPage.simulateUploadDoc('${doc.id}')">
              <div class="doc-upload-icon">
                <span class="material-symbols-rounded">${doc.file ? 'verified' : 'cloud_upload'}</span>
              </div>
              <div class="doc-upload-name">${doc.name}</div>
              <div class="doc-upload-hint">${doc.file ? doc.file : 'Click to select PDF or Image'}</div>
              <span class="doc-verification-badge ${doc.status === 'verified' ? 'verified' : doc.status === 'uploaded' ? 'verifying' : 'verifying'}">
                ${doc.status === 'verified' ? '🟢 OCR Verified (100%)' : doc.status === 'uploaded' ? 'AI Analyzing...' : 'Pending Upload'}
              </span>
              <div class="text-label-sm mt-2" style="color:var(--color-gray-500);font-size:11px">${doc.ocr}</div>
            </div>
          `).join('')}
        </div>

        <div class="d-flex justify-between mt-8">
          <button class="btn btn-secondary" onclick="VerificationPage.setStage(1)">← Back to Bar Registry</button>
          <button class="btn btn-primary btn-lg" onclick="VerificationPage.setStage(3)">
            Proceed to Identity Liveness Check →
          </button>
        </div>
      </div>
    `;
  },

  /* --------------------------------------------------------
     POINT 11: Identity Verification & Live Selfie Liveness Check
     -------------------------------------------------------- */
  renderStage3(lawyer) {
    return `
      <div class="identity-verify">
        <h3 class="card-title">Point 11: Identity Verification & Anti-Spoofing Liveness Check</h3>
        <p class="text-body-sm text-muted">
          Real-time biometric facial geometry mapping to confirm live human presence against submitted Government Identity Proof.
        </p>

        <div class="selfie-capture" id="selfie-box">
          <span class="material-symbols-rounded" id="selfie-icon">face</span>
          <div class="selfie-overlay" id="selfie-overlay" style="display:none">
            <span class="badge badge-accent">Scanning Facial Nodes...</span>
          </div>
        </div>

        <div class="liveness-steps">
          <div class="liveness-step completed" id="live-step-1">
            <div class="liveness-step-icon"><span class="material-symbols-rounded">check</span></div>
            <div class="liveness-step-text">1. Live Human Face Detected</div>
          </div>
          <div class="liveness-step completed" id="live-step-2">
            <div class="liveness-step-icon"><span class="material-symbols-rounded">check</span></div>
            <div class="liveness-step-text">2. Anti-Replay Liveness (99.8%)</div>
          </div>
          <div class="liveness-step completed" id="live-step-3">
            <div class="liveness-step-icon"><span class="material-symbols-rounded">check</span></div>
            <div class="liveness-step-text">3. Govt ID Facial Match (98.4%)</div>
          </div>
        </div>

        <div class="d-flex justify-between mt-6">
          <button class="btn btn-secondary" onclick="VerificationPage.setStage(2)">← Back to Documents</button>
          <button class="btn btn-primary btn-lg" id="btn-run-liveness" onclick="VerificationPage.runLivenessCheck()">
            Execute Live Biometric Scan →
          </button>
        </div>
      </div>
    `;
  },

  /* --------------------------------------------------------
     POINTS 12, 13 & 14: Duplicate Check, Fraud Risk Assessment & Manual Review Fallback
     -------------------------------------------------------- */
  renderStage4(lawyer) {
    return `
      <div>
        <h3 class="card-title">Points 12, 13 & 14: Multi-Identifier Duplicate & Fraud Risk Screening</h3>
        <p class="text-body-sm text-muted mb-4">
          Automated multi-vector risk engine compares Bar Council ID, Phone, Email, and Government ID cryptographic hashes.
        </p>

        <div class="grid-2 mb-6">
          <!-- Duplicate Check Matrix (Point 12) -->
          <div class="card">
            <h4 class="card-title mb-3 d-flex items-center gap-2">
              <span class="material-symbols-rounded text-success">fingerprint</span> Duplicate Identity Cross-Check
            </h4>
            <div class="data-table">
              <table>
                <tbody>
                  <tr>
                    <td>Bar Council No. (DL/1234/2010)</td>
                    <td><span class="badge badge-success">Unique • No Prior Association</span></td>
                  </tr>
                  <tr>
                    <td>Verified Mobile (+91 9876543210)</td>
                    <td><span class="badge badge-success">Unique • Zero Collisions</span></td>
                  </tr>
                  <tr>
                    <td>Govt ID Biometric Hash</td>
                    <td><span class="badge badge-success">Authentic Master Identity</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Fraud Risk Assessment (Point 13) -->
          <div class="card">
            <h4 class="card-title mb-3 d-flex items-center gap-2">
              <span class="material-symbols-rounded text-accent">shield</span> Fraud Risk Assessment Score
            </h4>
            <div class="p-4" style="background:var(--color-gray-50);border-radius:var(--radius-lg)">
              <div class="d-flex justify-between items-center mb-2">
                <span class="font-semibold text-body-md">Assessed Risk Rating:</span>
                <span class="risk-indicator risk-low">🟢 Low Risk (Score: 99.4/100)</span>
              </div>
              <p class="text-body-sm text-muted">
                Passed 12 of 12 regulatory fraud filters. Integrity confirmed for automatic verified badge grant.
              </p>
            </div>

            <!-- Manual Verification Simulation Button (Point 14) -->
            <div class="mt-4 pt-3 border-t">
              <div class="d-flex justify-between items-center">
                <span class="text-body-sm text-muted">Admin Verification Team Fallback Pipeline:</span>
                <button class="btn btn-ghost btn-sm" onclick="VerificationPage.simulateAdminManualReview()">
                  Simulate Admin Manual Review (Pt 14)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-between mt-8">
          <button class="btn btn-secondary" onclick="VerificationPage.setStage(3)">← Back to Liveness</button>
          <button class="btn btn-primary btn-lg" onclick="VerificationPage.setStage(5)">
            Grant Verified Advocate Status (Point 15) →
          </button>
        </div>
      </div>
    `;
  },

  /* --------------------------------------------------------
     POINT 15: Verification Result & Verified Lawyer Badge
     -------------------------------------------------------- */
  renderStage5(lawyer) {
    const verificationId = 'LC-VER-2026-9882';
    const verificationDate = Utils.formatDate(new Date(), 'long');

    return `
      <div class="verification-result">
        <div class="result-icon success">
          <span class="material-symbols-rounded">verified</span>
        </div>

        <h2 class="result-title success">🟢 VERIFIED ADVOCATE BADGE ISSUED</h2>
        <p class="text-body-md text-muted mb-4">
          Point 15: Your lawyer profile is fully verified, activated, and made discoverable to prospective clients.
        </p>

        <div class="result-details">
          <div class="result-detail-row">
            <span class="result-detail-label">Advocate Name</span>
            <span class="result-detail-value">${lawyer.fullName || 'Adv. Rajesh Kumar Sharma'}</span>
          </div>
          <div class="result-detail-row">
            <span class="result-detail-label">Bar Council Registration</span>
            <span class="result-detail-value font-mono">${lawyer.barCouncil || 'DL/1234/2010'}</span>
          </div>
          <div class="result-detail-row">
            <span class="result-detail-label">Lawyer Verification ID</span>
            <span class="result-detail-value font-mono" style="color:var(--color-accent)">${verificationId}</span>
          </div>
          <div class="result-detail-row">
            <span class="result-detail-label">Statutory Verification Status</span>
            <span class="result-detail-value"><span class="badge badge-success">ACTIVE & VERIFIED</span></span>
          </div>
          <div class="result-detail-row">
            <span class="result-detail-label">Verification Timestamp</span>
            <span class="result-detail-value">${verificationDate}</span>
          </div>
        </div>

        <div class="d-flex justify-center gap-4 mt-6">
          <button class="btn btn-secondary btn-lg" onclick="Utils.showToast('Official Digital Certificate of Verification downloaded.', 'success')">
            <span class="material-symbols-rounded">download</span> Download Verification Certificate
          </button>
          <button class="btn btn-primary btn-lg" onclick="VerificationPage.completeAndGoDashboard()">
            Complete Portfolio & Enter Dashboard →
          </button>
        </div>
      </div>
    `;
  },

  /* Handlers */
  async handleVerifyBarCouncil() {
    const num = document.getElementById('bc-num-input').value.trim();
    const btn = document.getElementById('btn-verify-bc');
    const resultBox = document.getElementById('bc-result-box');

    btn.disabled = true;
    btn.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div> Querying...';

    const res = await ApiClient.verifyBarCouncil(num);

    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-rounded">verified</span> Query Bar Database';

    if (res.status === 'verified') {
      resultBox.innerHTML = `
        <div class="verify-result success">
          <span class="material-symbols-rounded">verified</span>
          <div>
            <div class="verify-result-text">Official Registry Match: ${res.enrollmentName} (Active Standing)</div>
            <div class="text-body-sm">${res.state} • Enrolled: ${res.year} • Bar Council Status: ACTIVE • Point 8 Passed</div>
          </div>
        </div>
      `;
      Utils.showToast('Bar Council database lookup confirmed active standing.', 'success');
    } else {
      resultBox.innerHTML = `
        <div class="verify-result error">
          <span class="material-symbols-rounded">warning</span>
          <div class="verify-result-text">${res.message}</div>
        </div>
      `;
    }
  },

  simulateUploadDoc(docId) {
    const doc = this._documents.find(d => d.id === docId);
    if (doc) {
      doc.file = `${doc.name.replace(/\s+/g, '_')}_OfficialScan.pdf`;
      doc.status = 'verified';
      doc.ocr = 'OCR Readability: 99.6% • Authenticity Confirmed';
      Utils.showToast(`OCR Engine analyzed ${doc.name}: 100% Match with Registration data.`, 'success');
      Router.transitionPage('/verification');
    }
  },

  simulateScanAllDocs() {
    this._documents.forEach(d => {
      d.file = `${d.name.replace(/\s+/g, '_')}_Scan.pdf`;
      d.status = 'verified';
      d.ocr = 'AI OCR: 100% Match • No tampering markers';
    });
    Utils.showToast('All statutory credentials scanned and OCR authenticated.', 'success');
    Router.transitionPage('/verification');
  },

  async runLivenessCheck() {
    const btn = document.getElementById('btn-run-liveness');
    const selfie = document.getElementById('selfie-box');
    const overlay = document.getElementById('selfie-overlay');

    btn.disabled = true;
    btn.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div> Analyzing Biometrics...';
    if (selfie) selfie.classList.add('capturing');
    if (overlay) overlay.style.display = 'flex';

    await ApiClient.verifyLiveness();
    if (selfie) selfie.classList.remove('capturing');
    if (overlay) overlay.style.display = 'none';

    Utils.showToast('Point 11: Liveness and ID face match confirmed (98.4% confidence score).', 'success');
    this.setStage(4);
  },

  simulateAdminManualReview() {
    Utils.showModal(`
      <p class="text-body-md text-muted mb-4">
        Simulates the Admin Verification Team portal (Point 14) reviewing uploaded certificates, Bar Council lookup results, and duplicate checks.
      </p>
      <div class="p-4" style="background:var(--color-gray-50);border-radius:var(--radius-md);margin-bottom:var(--space-4)">
        <div><strong>Applicant:</strong> Adv. Rajesh Kumar Sharma</div>
        <div><strong>Bar No:</strong> DL/1234/2010</div>
        <div><strong>Admin Finding:</strong> All documentation authentic and verified without collisions.</div>
      </div>
    `, {
      title: 'Admin Verification Console (Point 14)',
      actions: [
        { text: 'Request More Docs', class: 'btn btn-secondary', onclick: 'Utils.hideModal(); Utils.showToast("Additional documents requested.", "info");' },
        { text: 'Approve Profile', class: 'btn btn-primary', onclick: 'Utils.hideModal(); VerificationPage.setStage(5);' }
      ]
    });
  },

  setStage(stage) {
    this._stage = stage;
    Router.transitionPage('/verification');
  },

  completeAndGoDashboard() {
    const session = AuthManager.getSession() || AuthManager.setSession(AuthManager._pendingUser || AuthManager.getDemoLawyer());
    session.verified = true;
    session.verificationStatus = 'verified';
    session.verificationId = 'LC-VER-2026-9882';
    session.verificationDate = new Date().toISOString();
    AuthManager.setSession(session);

    Utils.showToast('🟢 Advocate Profile Activated with Verified Lawyer Badge!', 'success');
    Router.navigate('/profile');
  }
};
