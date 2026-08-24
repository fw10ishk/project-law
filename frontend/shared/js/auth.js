/* ============================================================
   LEGALCONNECT — AUTHENTICATION MANAGER
   auth.js — Login, logout, session, OTP, 2FA, device check
   ============================================================ */

const AuthManager = {
  SESSION_KEY: 'lc_session',
  ATTEMPTS_KEY: 'lc_login_attempts',
  DEVICES_KEY: 'lc_trusted_devices',
  ACTIVITY_KEY: 'lc_login_activity',
  MAX_ATTEMPTS: 5,
  LOCK_DURATION: 15 * 60 * 1000, // 15 minutes
  OTP_EXPIRY: 5 * 60 * 1000, // 5 minutes
  _pendingOTP: null,
  _otpExpiry: null,
  _otpAttempts: 0,

  /* --------------------------------------------------------
     SESSION MANAGEMENT
     -------------------------------------------------------- */
  checkSession() {
    const session = this.getSession();
    if (!session) return null;
    
    // Check session expiry (24 hours)
    if (Date.now() - session.loginTime > 24 * 60 * 60 * 1000) {
      this.clearSession();
      return null;
    }
    
    return session;
  },

  getSession() {
    try {
      const data = localStorage.getItem(this.SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setSession(userData) {
    const session = {
      ...userData,
      loginTime: Date.now(),
      deviceId: this.getDeviceId(),
      sessionId: Utils.generateId('sess')
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    this.logActivity('login', 'Login successful');
    return session;
  },

  clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
  },

  isLoggedIn() {
    return this.checkSession() !== null;
  },

  /* --------------------------------------------------------
     LOGIN
     -------------------------------------------------------- */
  async login(emailOrPhone, password, rememberMe = false) {
    // Check if account is locked
    if (this.isAccountLocked()) {
      const remaining = this.getLockRemainingTime();
      return {
        success: false,
        error: `Account temporarily locked. Try again in ${Math.ceil(remaining / 60000)} minutes.`
      };
    }

    // Simulate API delay
    await this.simulateDelay(800);

    // Get stored lawyer data from Store
    const lawyers = Store ? Store.getState('registeredLawyers') || [] : [];
    const storedLawyer = lawyers.find(l => l.email === emailOrPhone || l.phone === emailOrPhone);

    // Demo account check
    const isDemoLogin = (emailOrPhone === 'demo@legalconnect.in' && password === 'Demo@1234') ||
                        (emailOrPhone === '9876543210' && password === 'Demo@1234');

    if (!isDemoLogin && !storedLawyer) {
      this.trackFailedAttempt();
      return { success: false, error: 'Account not found. Please check your credentials.' };
    }

    if (storedLawyer && storedLawyer.password !== password) {
      this.trackFailedAttempt();
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Reset failed attempts on success
    this.resetAttempts();

    // Check if new device
    const isNew = this.isNewDevice();

    // Generate OTP for 2FA
    this._pendingOTP = this.generateOTP();
    this._otpExpiry = Date.now() + this.OTP_EXPIRY;
    this._otpAttempts = 0;
    this._pendingUser = storedLawyer || this.getDemoLawyer();
    this._rememberMe = rememberMe;

    console.log('[LegalConnect] OTP for verification:', this._pendingOTP);

    return {
      success: true,
      requires2FA: true,
      isNewDevice: isNew,
      maskedPhone: this.maskPhone(this._pendingUser.phone || '9876543210'),
      maskedEmail: this.maskEmail(this._pendingUser.email || 'demo@legalconnect.in')
    };
  },

  /* --------------------------------------------------------
     OTP VERIFICATION
     -------------------------------------------------------- */
  async verifyOTP(code) {
    await this.simulateDelay(500);

    if (Date.now() > this._otpExpiry) {
      return { success: false, error: 'OTP has expired. Please request a new one.' };
    }

    this._otpAttempts++;

    if (this._otpAttempts > 5) {
      return { success: false, error: 'Too many failed attempts. Please request a new OTP.' };
    }

    // Accept any 6-digit OTP or the generated one (for demo purposes)
    if (code === this._pendingOTP || code === '123456') {
      const session = this.setSession(this._pendingUser);
      
      if (!this._rememberMe) {
        // Session expires when browser closes (handled by sessionStorage fallback)
      }

      this.addTrustedDevice();
      
      return { success: true, session };
    }

    return { 
      success: false, 
      error: 'Incorrect OTP. Please try again.',
      attemptsRemaining: 5 - this._otpAttempts
    };
  },

  async resendOTP() {
    await this.simulateDelay(1000);
    this._pendingOTP = this.generateOTP();
    this._otpExpiry = Date.now() + this.OTP_EXPIRY;
    this._otpAttempts = 0;
    console.log('[LegalConnect] New OTP:', this._pendingOTP);
    return { success: true, message: 'OTP sent successfully.' };
  },

  generateOTP() {
    return String(Math.floor(100000 + Math.random() * 900000));
  },

  /* --------------------------------------------------------
     REGISTRATION
     -------------------------------------------------------- */
  async register(data) {
    await this.simulateDelay(1200);

    // Check for duplicate email/phone
    const lawyers = Store ? Store.getState('registeredLawyers') || [] : [];
    if (lawyers.some(l => l.email === data.email)) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    if (lawyers.some(l => l.phone === data.phone)) {
      return { success: false, error: 'An account with this phone number already exists.' };
    }

    // Create new lawyer record
    const lawyer = {
      id: Utils.generateId('law'),
      ...data,
      verified: false,
      verificationStatus: 'pending',
      createdAt: new Date().toISOString(),
      profileComplete: false
    };

    lawyers.push(lawyer);
    if (Store) Store.setState('registeredLawyers', lawyers);

    return { success: true, lawyer };
  },

  /* --------------------------------------------------------
     FORGOT PASSWORD
     -------------------------------------------------------- */
  async forgotPassword(email) {
    await this.simulateDelay(800);
    
    if (!Utils.validateEmail(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // Always return success for demo (don't reveal if email exists)
    return { 
      success: true, 
      message: 'If an account exists with this email, you will receive a password reset link.' 
    };
  },

  /* --------------------------------------------------------
     DEVICE MANAGEMENT
     -------------------------------------------------------- */
  getDeviceId() {
    let deviceId = localStorage.getItem('lc_device_id');
    if (!deviceId) {
      deviceId = Utils.generateId('dev');
      localStorage.setItem('lc_device_id', deviceId);
    }
    return deviceId;
  },

  getDeviceInfo() {
    const ua = navigator.userAgent;
    let deviceType = 'Desktop';
    let browser = 'Unknown';

    if (/mobile/i.test(ua)) deviceType = 'Mobile';
    else if (/tablet/i.test(ua)) deviceType = 'Tablet';

    if (/chrome/i.test(ua)) browser = 'Chrome';
    else if (/firefox/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua)) browser = 'Safari';
    else if (/edge/i.test(ua)) browser = 'Edge';

    return {
      deviceId: this.getDeviceId(),
      deviceType,
      browser,
      os: navigator.platform || 'Unknown',
      timestamp: new Date().toISOString(),
      location: 'India' // Simplified
    };
  },

  isNewDevice() {
    const devices = this.getTrustedDevices();
    return !devices.some(d => d.deviceId === this.getDeviceId());
  },

  addTrustedDevice() {
    const devices = this.getTrustedDevices();
    const deviceInfo = this.getDeviceInfo();
    
    if (!devices.some(d => d.deviceId === deviceInfo.deviceId)) {
      devices.push(deviceInfo);
      localStorage.setItem(this.DEVICES_KEY, JSON.stringify(devices));
    }
  },

  getTrustedDevices() {
    try {
      return JSON.parse(localStorage.getItem(this.DEVICES_KEY) || '[]');
    } catch {
      return [];
    }
  },

  removeTrustedDevice(deviceId) {
    const devices = this.getTrustedDevices().filter(d => d.deviceId !== deviceId);
    localStorage.setItem(this.DEVICES_KEY, JSON.stringify(devices));
  },

  /* --------------------------------------------------------
     LOGIN ATTEMPTS & ACCOUNT LOCKING
     -------------------------------------------------------- */
  trackFailedAttempt() {
    const attempts = this.getAttempts();
    attempts.push(Date.now());
    localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(attempts));
    this.logActivity('login_failed', 'Failed login attempt');

    if (attempts.length >= this.MAX_ATTEMPTS) {
      this.logActivity('account_locked', 'Account temporarily locked due to multiple failed attempts');
    }
  },

  getAttempts() {
    try {
      const data = JSON.parse(localStorage.getItem(this.ATTEMPTS_KEY) || '[]');
      // Only count recent attempts (within lock duration)
      return data.filter(t => Date.now() - t < this.LOCK_DURATION);
    } catch {
      return [];
    }
  },

  resetAttempts() {
    localStorage.removeItem(this.ATTEMPTS_KEY);
  },

  isAccountLocked() {
    return this.getAttempts().length >= this.MAX_ATTEMPTS;
  },

  getLockRemainingTime() {
    const attempts = this.getAttempts();
    if (attempts.length < this.MAX_ATTEMPTS) return 0;
    const oldestAttempt = Math.min(...attempts);
    return this.LOCK_DURATION - (Date.now() - oldestAttempt);
  },

  /* --------------------------------------------------------
     LOGIN ACTIVITY LOG
     -------------------------------------------------------- */
  logActivity(type, description) {
    const activity = this.getLoginActivity();
    activity.unshift({
      id: Utils.generateId('act'),
      type,
      description,
      device: this.getDeviceInfo(),
      timestamp: new Date().toISOString()
    });
    // Keep only last 50 entries
    localStorage.setItem(this.ACTIVITY_KEY, JSON.stringify(activity.slice(0, 50)));
  },

  getLoginActivity() {
    try {
      return JSON.parse(localStorage.getItem(this.ACTIVITY_KEY) || '[]');
    } catch {
      return [];
    }
  },

  /* --------------------------------------------------------
     ACTIVE SESSIONS
     -------------------------------------------------------- */
  getActiveSessions() {
    const session = this.getSession();
    if (!session) return [];
    return [{
      id: session.sessionId,
      device: this.getDeviceInfo(),
      loginTime: session.loginTime,
      lastActive: Date.now(),
      current: true
    }];
  },

  terminateSession(sessionId) {
    const session = this.getSession();
    if (session && session.sessionId === sessionId) {
      this.logout();
    }
  },

  /* --------------------------------------------------------
     LOGOUT
     -------------------------------------------------------- */
  logout() {
    this.logActivity('logout', 'User logged out');
    this.clearSession();
    this._pendingOTP = null;
    this._pendingUser = null;
    window.location.hash = '#/login';
  },

  /* --------------------------------------------------------
     HELPERS
     -------------------------------------------------------- */
  maskPhone(phone) {
    if (!phone || phone.length < 4) return '****';
    return '****' + phone.slice(-4);
  },

  maskEmail(email) {
    if (!email) return '****';
    const [user, domain] = email.split('@');
    if (!domain) return '****';
    return user.charAt(0) + '***' + user.charAt(user.length - 1) + '@' + domain;
  },

  getDemoLawyer() {
    return {
      id: 'law_demo_001',
      fullName: 'Adv. Rajesh Kumar Sharma',
      professionalName: 'Adv. R.K. Sharma',
      email: 'demo@legalconnect.in',
      phone: '9876543210',
      gender: 'Male',
      dob: '1985-03-15',
      city: 'New Delhi',
      state: 'Delhi',
      barCouncil: 'DL/1234/2010',
      stateBarCouncil: 'Bar Council of Delhi',
      enrollmentYear: '2010',
      qualification: 'LLB, LLM',
      university: 'Delhi University',
      yearsOfPractice: 14,
      practiceType: 'Independent',
      primarySpecialization: 'Criminal Law',
      additionalSpecializations: ['Civil Law', 'Cyber Law', 'Constitutional Law'],
      courts: ['Supreme Court', 'High Court', 'District Court'],
      languages: ['English', 'Hindi'],
      verified: true,
      verificationStatus: 'verified',
      verificationId: 'VER_2024_001',
      verificationDate: '2024-01-15',
      rating: 4.8,
      totalReviews: 127,
      profilePhoto: null,
      bio: 'A seasoned criminal law practitioner with over 14 years of experience in handling complex criminal, civil, and cyber law matters. Successfully represented clients in the Supreme Court and various High Courts across India.',
      address: '42, Connaught Place, Central Delhi',
      password: 'Demo@1234'
    };
  },

  simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};
