/* ============================================================
   LEGALCONNECT — OTP & NEW DEVICE SECURITY CHECK
   otp_page.js — 2FA OTP input, device check, & auth completion
   ============================================================ */

const OTPPage = {
  _timerInterval: null,

  render() {
    const user = AuthManager._pendingUser || AuthManager.getDemoLawyer();
    const maskedPhone = AuthManager.maskPhone(user.phone || '9876543210');
    const maskedEmail = AuthManager.maskEmail(user.email || 'demo@legalconnect.in');

    return `
      <div class="fullscreen-page">
        <div class="fullscreen-card">
          <div class="otp-container">
            <div class="otp-icon">
              <span class="material-symbols-rounded">phonelink_lock</span>
            </div>

            <h2 class="otp-title">Two-Factor Authentication</h2>
            <p class="otp-subtitle">
              Enter the 6-digit verification code sent to registered number <strong>${maskedPhone}</strong> and <strong>${maskedEmail}</strong>
            </p>

            <div class="otp-inputs" id="otp-boxes">
              <input type="text" maxlength="1" class="otp-input" data-index="0" autofocus>
              <input type="text" maxlength="1" class="otp-input" data-index="1">
              <input type="text" maxlength="1" class="otp-input" data-index="2">
              <input type="text" maxlength="1" class="otp-input" data-index="3">
              <input type="text" maxlength="1" class="otp-input" data-index="4">
              <input type="text" maxlength="1" class="otp-input" data-index="5">
            </div>

            <div class="otp-timer">
              Code expires in: <span class="time" id="otp-countdown">04:59</span>
            </div>

            <div class="otp-resend">
              Didn't receive code? 
              <button class="otp-resend-btn" id="btn-resend-otp" onclick="OTPPage.handleResend()">Resend Code</button>
            </div>

            <button id="btn-verify-otp" class="btn btn-primary btn-block btn-lg" onclick="OTPPage.handleVerify()">
              Verify Identity
            </button>

            <div class="otp-hint">
              <strong>Demo Passcode:</strong> <code>123456</code> (or check browser console)
            </div>
          </div>
        </div>
      </div>
    `;
  },

  onEnter() {
    this.setupInputs();
    this.startTimer(5 * 60);
  },

  setupInputs() {
    const inputs = document.querySelectorAll('.otp-input');
    inputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val) {
          input.classList.add('filled');
          if (index < inputs.length - 1) {
            inputs[index + 1].focus();
          } else {
            // Auto submit if all 6 digits entered
            this.handleVerify();
          }
        } else {
          input.classList.remove('filled');
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) {
          inputs[index - 1].focus();
        }
      });
    });

    if (inputs[0]) inputs[0].focus();
  },

  startTimer(duration) {
    clearInterval(this._timerInterval);
    let timer = duration;
    const el = document.getElementById('otp-countdown');
    if (!el) return;

    this._timerInterval = setInterval(() => {
      const minutes = parseInt(timer / 60, 10);
      const seconds = parseInt(timer % 60, 10);
      el.textContent = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

      if (--timer < 0) {
        clearInterval(this._timerInterval);
        el.textContent = 'Expired';
        const resend = document.getElementById('btn-resend-otp');
        if (resend) resend.disabled = false;
      }
    }, 1000);
  },

  async handleVerify() {
    const inputs = document.querySelectorAll('.otp-input');
    let code = '';
    inputs.forEach(i => code += i.value);

    if (code.length < 6) {
      Utils.showToast('Please enter full 6-digit OTP code', 'warning');
      return;
    }

    const btn = document.getElementById('btn-verify-otp');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    }

    const res = await AuthManager.verifyOTP(code);

    if (res.success) {
      clearInterval(this._timerInterval);
      
      // If new device, prompt security check
      if (AuthManager.isNewDevice()) {
        Router.navigate('/device-check');
      } else {
        Utils.showToast('Identity Verified Successfully. Welcome Advocate!', 'success');
        Router.navigate('/dashboard');
      }
    } else {
      inputs.forEach(i => {
        i.classList.add('error');
        setTimeout(() => i.classList.remove('error'), 600);
      });
      Utils.showToast(res.error || 'Invalid OTP code', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Verify Identity';
      }
    }
  },

  async handleResend() {
    const res = await AuthManager.resendOTP();
    Utils.showToast('New 6-digit OTP dispatched to mobile & email.', 'info');
    this.startTimer(5 * 60);
  },

  /* --------------------------------------------------------
     NEW DEVICE CONFIRMATION PAGE
     -------------------------------------------------------- */
  renderDeviceCheck() {
    const dev = AuthManager.getDeviceInfo();
    return `
      <div class="fullscreen-page">
        <div class="fullscreen-card">
          <div class="device-check">
            <div class="device-check-icon">
              <span class="material-symbols-rounded">devices</span>
            </div>

            <h2 class="otp-title">New Device Detected</h2>
            <p class="otp-subtitle">A login was requested from an unfamiliar browser/device. Please confirm your authorization.</p>

            <div class="device-info-card">
              <div class="device-info-row">
                <span class="material-symbols-rounded">computer</span>
                <span class="device-info-label">Device Type:</span>
                <span class="device-info-value">${dev.deviceType} (${dev.browser} on ${dev.os})</span>
              </div>
              <div class="device-info-row">
                <span class="material-symbols-rounded">location_on</span>
                <span class="device-info-label">Location:</span>
                <span class="device-info-value">Approx. ${dev.location} (IP Matched)</span>
              </div>
              <div class="device-info-row">
                <span class="material-symbols-rounded">schedule</span>
                <span class="device-info-label">Login Time:</span>
                <span class="device-info-value">${Utils.formatTime(new Date())}</span>
              </div>
            </div>

            <div class="device-actions">
              <button class="btn btn-secondary" onclick="OTPPage.handleDenyDevice()">
                This wasn't me
              </button>
              <button class="btn btn-primary" onclick="OTPPage.handleApproveDevice()">
                Yes, this is me
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  handleApproveDevice() {
    AuthManager.addTrustedDevice();
    Utils.showToast('A new device has been successfully authorized for your LegalConnect account.', 'success');
    Router.navigate('/dashboard');
  },

  handleDenyDevice() {
    AuthManager.clearSession();
    Utils.showToast('Security Alert triggered: Session terminated. Please update your password immediately.', 'error');
    Router.navigate('/login');
  }
};
