/* ============================================================
   LEGALCONNECT — LAWYER REGISTRATION WIZARD
   register_page.js — Points 6 & 7: Basic Personal & Professional Information
   ============================================================ */

const RegisterPage = {
  _step: 1,
  _data: {
    fullName: 'Adv. Rajesh Kumar Sharma',
    professionalName: 'Adv. R.K. Sharma',
    dob: '1986-04-12',
    gender: 'Male',
    phone: '9876543210',
    email: 'advocate.rajesh@legalconnect.in',
    address: 'Chamber 402, Lawyers Chambers Block',
    city: 'New Delhi',
    state: 'Delhi',
    barCouncil: 'DL/1234/2010',
    stateBarCouncil: 'Bar Council of Delhi',
    enrollmentDate: '2010-09-15',
    enrollmentYear: 2010,
    qualification: 'LLB (Hons), LLM',
    university: 'Faculty of Law, University of Delhi',
    yearsOfPractice: 14,
    practiceType: 'Independent Advocate & Litigation Counsel',
    primarySpecialization: 'Criminal Law',
    additionalSpecializations: ['Civil Law', 'Cyber Law', 'Corporate Litigation'],
    courts: ['Supreme Court of India', 'High Court of Delhi', 'District & Sessions Courts'],
    languages: ['English', 'Hindi', 'Punjabi']
  },

  render() {
    return `
      <div class="fullscreen-page">
        <div class="fullscreen-card fullscreen-card-wide">
          <div class="register-container">
            <div class="register-header">
              <div class="login-logo mb-2">
                <div class="login-logo-icon">
                  <span class="material-symbols-rounded">gavel</span>
                </div>
                <div class="login-logo-text">LegalConnect</div>
              </div>
              <h2 class="register-title">Advocate Registration</h2>
              <p class="register-subtitle">Point 6 & 7: Personal & Professional Accreditation Data</p>
            </div>

            <!-- Stepper Progress -->
            <div class="register-stepper">
              <div class="register-step ${this._step >= 1 ? 'active' : ''} ${this._step > 1 ? 'completed' : ''}">
                <div class="register-step-circle">${this._step > 1 ? '✓' : '1'}</div>
                <div class="register-step-label">Basic Personal Information</div>
              </div>
              <div class="register-step-line"></div>
              <div class="register-step ${this._step >= 2 ? 'active' : ''} ${this._step > 2 ? 'completed' : ''}">
                <div class="register-step-circle">${this._step > 2 ? '✓' : '2'}</div>
                <div class="register-step-label">Professional Credentials</div>
              </div>
            </div>

            <!-- Verification Notice Banner -->
            <div class="doc-comparison-banner">
              <span class="material-symbols-rounded">verified_user</span>
              <span><strong>Official Document Match Notice:</strong> The legal name, enrollment number and dates entered here will be compared directly with Bar Council certificates and Government ID proof.</span>
            </div>

            <!-- Form Container -->
            <form id="register-form" onsubmit="RegisterPage.handleSubmit(event)">
              ${this._step === 1 ? this.renderStep1() : this.renderStep2()}

              <div class="register-nav">
                ${this._step > 1 ? `
                  <button type="button" class="btn btn-secondary" onclick="RegisterPage.prevStep()">
                    <span class="material-symbols-rounded">arrow_back</span> Previous Step
                  </button>
                ` : `
                  <button type="button" class="btn btn-ghost" onclick="Router.navigate('/login')">
                    Existing Advocate? Login
                  </button>
                `}

                <button type="submit" class="btn btn-primary btn-lg">
                  ${this._step === 1 ? 'Next: Professional Information →' : 'Submit & Start Document Verification →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  /* Step 1: Basic Personal Information (Point 6) */
  renderStep1() {
    return `
      <div class="form-grid">
        <div class="photo-upload">
          <div class="photo-preview" onclick="document.getElementById('profile-photo-input').click()" title="Upload Profile Photograph">
            <span class="material-symbols-rounded">add_a_photo</span>
            <span style="font-size:11px;color:var(--color-gray-500);margin-top:2px">Upload Photo</span>
          </div>
          <input type="file" id="profile-photo-input" accept="image/*" style="display:none" onchange="RegisterPage.handlePhotoUpload(event)">
          <span class="photo-label">Advocate Profile Photograph</span>
        </div>

        <div class="form-group">
          <label class="form-label">Full Legal Name <span class="required">*</span></label>
          <input type="text" id="reg-fullname" class="form-input" placeholder="As per official documents" value="${this._data.fullName || ''}" required>
          <span class="form-hint">Must match official Bar Council Enrollment Certificate</span>
        </div>

        <div class="form-group">
          <label class="form-label">Professional Display Name</label>
          <input type="text" id="reg-profname" class="form-input" placeholder="e.g. Adv. R.K. Sharma" value="${this._data.professionalName || ''}">
        </div>

        <div class="form-group">
          <label class="form-label">Date of Birth <span class="required">*</span></label>
          <input type="date" id="reg-dob" class="form-input" value="${this._data.dob || ''}" required>
        </div>

        <div class="form-group">
          <label class="form-label">Gender <span class="required">*</span></label>
          <select id="reg-gender" class="form-select" required>
            <option value="Male" ${this._data.gender === 'Male' ? 'selected' : ''}>Male</option>
            <option value="Female" ${this._data.gender === 'Female' ? 'selected' : ''}>Female</option>
            <option value="Other" ${this._data.gender === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Mobile Number <span class="required">*</span></label>
          <input type="tel" id="reg-phone" class="form-input" placeholder="10-digit registered number" value="${this._data.phone || ''}" required>
        </div>

        <div class="form-group">
          <label class="form-label">Email Address <span class="required">*</span></label>
          <input type="email" id="reg-email" class="form-input" placeholder="advocate@example.com" value="${this._data.email || ''}" required>
        </div>

        <div class="form-group form-grid-full">
          <label class="form-label">Current Chamber / Office Address <span class="required">*</span></label>
          <input type="text" id="reg-address" class="form-input" placeholder="Chamber No, Court Complex / Office Address" value="${this._data.address || ''}" required>
        </div>

        <div class="form-group">
          <label class="form-label">City <span class="required">*</span></label>
          <input type="text" id="reg-city" class="form-input" placeholder="e.g. New Delhi" value="${this._data.city || ''}" required>
        </div>

        <div class="form-group">
          <label class="form-label">State <span class="required">*</span></label>
          <select id="reg-state" class="form-select" required>
            <option value="Delhi" ${this._data.state === 'Delhi' ? 'selected' : ''}>Delhi</option>
            <option value="Maharashtra" ${this._data.state === 'Maharashtra' ? 'selected' : ''}>Maharashtra</option>
            <option value="Karnataka" ${this._data.state === 'Karnataka' ? 'selected' : ''}>Karnataka</option>
            <option value="Uttar Pradesh" ${this._data.state === 'Uttar Pradesh' ? 'selected' : ''}>Uttar Pradesh</option>
            <option value="Tamil Nadu" ${this._data.state === 'Tamil Nadu' ? 'selected' : ''}>Tamil Nadu</option>
            <option value="Telangana" ${this._data.state === 'Telangana' ? 'selected' : ''}>Telangana</option>
            <option value="Gujarat" ${this._data.state === 'Gujarat' ? 'selected' : ''}>Gujarat</option>
            <option value="West Bengal" ${this._data.state === 'West Bengal' ? 'selected' : ''}>West Bengal</option>
          </select>
        </div>
      </div>
    `;
  },

  /* Step 2: Professional Information (Point 7) */
  renderStep2() {
    const specializationsList = ['Criminal Law', 'Civil Law', 'Cyber Law', 'Corporate Law', 'Family & Matrimonial', 'Constitutional Law', 'Taxation Law', 'Consumer Disputes', 'Arbitration & Mediation'];
    const courtsList = ['Supreme Court of India', 'High Court of Delhi', 'District & Sessions Court', 'NCLT / NCLAT', 'Consumer Disputes Redressal Commission', 'Debt Recovery Tribunal (DRT)'];
    const languagesList = ['English', 'Hindi', 'Telugu', 'Tamil', 'Punjabi', 'Bengali', 'Marathi', 'Gujarati'];

    return `
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Bar Council Registration Number <span class="required">*</span></label>
          <input type="text" id="reg-barcouncil" class="form-input" placeholder="e.g. DL/1234/2010" value="${this._data.barCouncil || ''}" required>
          <span class="form-hint">State Code / Number / Enrollment Year</span>
        </div>

        <div class="form-group">
          <label class="form-label">State Bar Council <span class="required">*</span></label>
          <select id="reg-statebar" class="form-select" required>
            <option value="Bar Council of Delhi" selected>Bar Council of Delhi</option>
            <option value="Bar Council of Maharashtra & Goa">Bar Council of Maharashtra & Goa</option>
            <option value="Bar Council of Karnataka">Bar Council of Karnataka</option>
            <option value="Bar Council of Uttar Pradesh">Bar Council of Uttar Pradesh</option>
            <option value="Bar Council of Tamil Nadu & Puducherry">Bar Council of Tamil Nadu & Puducherry</option>
            <option value="Bar Council of Telangana">Bar Council of Telangana</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Enrollment Date / Year <span class="required">*</span></label>
          <input type="date" id="reg-enrolldate" class="form-input" value="${this._data.enrollmentDate || '2010-09-15'}" required>
        </div>

        <div class="form-group">
          <label class="form-label">Years of Active Practice <span class="required">*</span></label>
          <input type="number" id="reg-experience" class="form-input" min="0" max="60" value="${this._data.yearsOfPractice || 14}" required>
        </div>

        <div class="form-group">
          <label class="form-label">LLB Qualification <span class="required">*</span></label>
          <input type="text" id="reg-qualification" class="form-input" placeholder="e.g. LLB (3 Years) or BA LLB (5 Years)" value="${this._data.qualification || 'LLB (Hons)'}" required>
        </div>

        <div class="form-group">
          <label class="form-label">University / Law College <span class="required">*</span></label>
          <input type="text" id="reg-university" class="form-input" placeholder="e.g. Faculty of Law, Delhi University" value="${this._data.university || 'Faculty of Law, University of Delhi'}" required>
        </div>

        <div class="form-group">
          <label class="form-label">Current Practice Type <span class="required">*</span></label>
          <select id="reg-practicetype" class="form-select" required>
            <option value="Independent Advocate & Litigation Counsel" selected>Independent Advocate & Litigation Counsel</option>
            <option value="Law Firm Partner / Senior Associate">Law Firm Partner / Senior Associate</option>
            <option value="Designated Senior Advocate">Designated Senior Advocate</option>
            <option value="Corporate Legal Consultant">Corporate Legal Consultant</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Primary Legal Specialization <span class="required">*</span></label>
          <select id="reg-primaryspec" class="form-select" required>
            <option value="Criminal Law" ${this._data.primarySpecialization === 'Criminal Law' ? 'selected' : ''}>Criminal Law</option>
            <option value="Civil Law" ${this._data.primarySpecialization === 'Civil Law' ? 'selected' : ''}>Civil Law</option>
            <option value="Cyber Law" ${this._data.primarySpecialization === 'Cyber Law' ? 'selected' : ''}>Cyber Law</option>
            <option value="Corporate Law" ${this._data.primarySpecialization === 'Corporate Law' ? 'selected' : ''}>Corporate Law</option>
            <option value="Family & Matrimonial" ${this._data.primarySpecialization === 'Family & Matrimonial' ? 'selected' : ''}>Family & Matrimonial</option>
            <option value="Constitutional Law" ${this._data.primarySpecialization === 'Constitutional Law' ? 'selected' : ''}>Constitutional Law</option>
          </select>
        </div>

        <!-- Additional Specializations Multi-Select -->
        <div class="form-group form-grid-full">
          <label class="form-label">Additional Specializations (Click to toggle)</label>
          <div class="selectable-chips-group" id="chips-specializations">
            ${specializationsList.map(spec => `
              <span class="selectable-chip ${this._data.additionalSpecializations.includes(spec) ? 'selected' : ''}" onclick="RegisterPage.toggleChip(this, 'specializations')">
                ${spec}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Courts Practiced In -->
        <div class="form-group form-grid-full">
          <label class="form-label">Courts Practiced In <span class="required">*</span> (Click to select)</label>
          <div class="selectable-chips-group" id="chips-courts">
            ${courtsList.map(court => `
              <span class="selectable-chip ${this._data.courts.includes(court) ? 'selected' : ''}" onclick="RegisterPage.toggleChip(this, 'courts')">
                ${court}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Languages Known -->
        <div class="form-group form-grid-full">
          <label class="form-label">Languages Known (Click to select)</label>
          <div class="selectable-chips-group" id="chips-languages">
            ${languagesList.map(lang => `
              <span class="selectable-chip ${this._data.languages.includes(lang) ? 'selected' : ''}" onclick="RegisterPage.toggleChip(this, 'languages')">
                ${lang}
              </span>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  toggleChip(chipEl, group) {
    chipEl.classList.toggle('selected');
    const selectedText = chipEl.textContent.trim();
    if (group === 'specializations') {
      if (this._data.additionalSpecializations.includes(selectedText)) {
        this._data.additionalSpecializations = this._data.additionalSpecializations.filter(s => s !== selectedText);
      } else {
        this._data.additionalSpecializations.push(selectedText);
      }
    } else if (group === 'courts') {
      if (this._data.courts.includes(selectedText)) {
        this._data.courts = this._data.courts.filter(s => s !== selectedText);
      } else {
        this._data.courts.push(selectedText);
      }
    } else if (group === 'languages') {
      if (this._data.languages.includes(selectedText)) {
        this._data.languages = this._data.languages.filter(s => s !== selectedText);
      } else {
        this._data.languages.push(selectedText);
      }
    }
  },

  handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = document.querySelector('.photo-preview');
        if (preview) {
          preview.innerHTML = `<img src="${event.target.result}" alt="Advocate Photo">`;
        }
      };
      reader.readAsDataURL(file);
    }
  },

  handleSubmit(e) {
    e.preventDefault();

    if (this._step === 1) {
      this._data.fullName = document.getElementById('reg-fullname').value;
      this._data.professionalName = document.getElementById('reg-profname').value || `Adv. ${this._data.fullName}`;
      this._data.dob = document.getElementById('reg-dob').value;
      this._data.gender = document.getElementById('reg-gender').value;
      this._data.phone = document.getElementById('reg-phone').value;
      this._data.email = document.getElementById('reg-email').value;
      this._data.address = document.getElementById('reg-address').value;
      this._data.city = document.getElementById('reg-city').value;
      this._data.state = document.getElementById('reg-state').value;

      this._step = 2;
      Router.transitionPage('/register');
    } else {
      this._data.barCouncil = document.getElementById('reg-barcouncil').value;
      this._data.stateBarCouncil = document.getElementById('reg-statebar').value;
      this._data.enrollmentDate = document.getElementById('reg-enrolldate').value;
      this._data.enrollmentYear = new Date(this._data.enrollmentDate).getFullYear() || 2010;
      this._data.qualification = document.getElementById('reg-qualification').value;
      this._data.university = document.getElementById('reg-university').value;
      this._data.yearsOfPractice = parseInt(document.getElementById('reg-experience').value, 10);
      this._data.practiceType = document.getElementById('reg-practicetype').value;
      this._data.primarySpecialization = document.getElementById('reg-primaryspec').value;

      // Update state
      AuthManager._pendingUser = { ...this._data };
      Utils.showToast('Registration Profile Saved. Initializing Bar Council & Credential Verification Pipeline...', 'success');
      this._step = 1;
      Router.navigate('/verification');
    }
  },

  prevStep() {
    this._step = 1;
    Router.transitionPage('/register');
  }
};
