/* ============================================================
   LEGALCONNECT — OTP / 2FA & NEW DEVICE SECURITY
   otp_page.js — Server-issued 6-digit verification, expiry,
   attempt limits, new-device confirmation.
   ------------------------------------------------------------
   Demo note: with no SMS/email gateway configured the API
   surfaces the code in its response (dev mode only). The UI
   states this plainly rather than pretending delivery happened.
   ============================================================ */

const OTPPage = {
  _timerInterval: null,

  render() {
    const challenge = AuthManager._pendingOTPChallenge || {};
    return `
      <div class="fullscreen-page">
        <div class="fullscreen-card">
          <div class="otp-container">
            <div class="otp-icon">
              <span class="material-symbols-rounded">phonelink_lock</span>
            </div>

            <h2 class="otp-title">Two-Factor Verification</h2>
            <p class="otp-subtitle">
              Enter the 6-digit code for your registered number <strong>${Utils.escapeHtml(challenge.maskedPhone || '')}</strong> and email <strong>${Utils.escapeHtml(challenge.maskedEmail || '')}</strong>
            </p>

            ${challenge.devCode ? `
              <div class="ai-disclaimer" id="dev-otp-hint">
                <span class="material-symbols-rounded icon-sm">science</span>
                <span><strong>Simulated delivery:</strong> no SMS/email gateway is connected in this environment. Your code is
                <code style="font-weight:700;letter-spacing:2px">${challenge.devCode}</code></span>
              </div>` : ''}

            <div class="otp-inputs" id="otp-boxes" role="group" aria-label="6-digit verification code">
              ${[0,1,2,3,4,5].map(i => `<input type="text" inputmode="numeric" maxlength="1" class="otp-input" data-index="${i}" aria-label="Digit ${i+1}">`).join('')}
            </div>

            <div class="otp-timer">
              Code expires in: <span class="time" id="otp-countdown">05:00</span>
            </div>

            <div class="otp-resend">
              Didn't receive it?
              <button type="button" class="otp-resend-btn" id="btn-resend-otp" onclick="OTPPage.handleResend()">Resend Code</button>
            </div>

            <button id="btn-verify-otp" class="btn btn-primary btn-block btn-lg" onclick="OTPPage.handleVerify()">
              Verify Identity
            </button>
          </div>
        </div>
      </div>
    `;
  },

  onEnter() {
    // Surface dev-mode OTP once per challenge
    if (AuthManager._lastDevOtp && AuthManager._pendingOTPChallenge) {
      AuthManager._pendingOTPChallenge.devCode = AuthManager._lastDevOtp;
    }
    this.setupInputs();
    this.startTimer(5 * 60);
  },

  setupInputs() {
    const inputs = document.querySelectorAll('.otp-input');
    inputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 1);
        if (e.target.value) {
          input.classList.add('filled');
          if (index < inputs.length - 1) inputs[index + 1].focus();
          else if ([...inputs].every(i => i.value)) this.handleVerify();
        } else {
          input.classList.remove('filled');
        }
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) inputs[index - 1].focus();
        if (e.key === 'Enter') this.handleVerify();
      });
      input.addEventListener('paste', (e) => {
        const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
        if (!text) return;
        e.preventDefault();
        text.split('').forEach((ch, i) => { if (inputs[i]) { inputs[i].value = ch; inputs[i].classList.add('filled'); } });
        if (text.length === 6) this.handleVerify();
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
      timer -= 1;
      if (timer < 0) {
        clearInterval(this._timerInterval);
        el.textContent = 'Expired';
      }
    }, 1000);
  },

  async handleVerify() {
    const inputs = document.querySelectorAll('.otp-input');
    let code = '';
    inputs.forEach(i => code += i.value);

    if (code.length < 6) {
      Utils.showToast('Enter the complete 6-digit code.', 'warning');
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
      if (res.requiresDeviceConfirmation) {
        Router.navigate('/device-check');
      } else {
        ApiClient.startReminderEngine();
        Utils.showToast('Identity verified. Welcome back, Advocate!', 'success');
        Router.navigate('/dashboard');
      }
    } else {
      inputs.forEach(i => {
        i.classList.add('error');
        setTimeout(() => i.classList.remove('error'), 600);
      });
      Utils.showToast(res.error || 'Verification failed.', 'error');
      if (res.locked) {
        setTimeout(() => Router.navigate('/login'), 1200);
        return;
      }
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Verify Identity';
      }
    }
  },

  async handleResend() {
    const res = await AuthManager.resendOTP();
    if (res.success) {
      if (res.devOtp && AuthManager._pendingOTPChallenge) {
        AuthManager._pendingOTPChallenge.devCode = res.devOtp;
        AuthManager._lastDevOtp = res.devOtp;
      }
      Utils.showToast('A fresh code was generated.', 'info');
      this.startTimer(5 * 60);
      // Re-render to show simulated-delivery hint with the new code
      setTimeout(() => {
        AuthManager._lastDevOtp = res.devOtp;
        Router.transitionPage('/otp');
      }, 400);
    } else {
      Utils.showToast(res.message || 'Could not resend.', 'error');
    }
  },

  /* --------------------------------------------------------
     NEW DEVICE CONFIRMATION
     -------------------------------------------------------- */
  renderDeviceCheck() {
    const dev = AuthManager.getDeviceInfo();
    const now = new Date();
    return `
      <div class="fullscreen-page">
        <div class="fullscreen-card">
          <div class="device-check">
            <div class="device-check-icon">
              <span class="material-symbols-rounded">devices_other</span>
            </div>

            <h2 class="otp-title">New Device Detected</h2>
            <p class="otp-subtitle">This is the first sign-in from this device. Confirm below so future sign-ins here skip this extra check.</p>

            <div class="device-info-card">
              <div class="device-info-row">
                <span class="material-symbols-rounded">computer</span>
                <span class="device-info-label">Device:</span>
                <span class="device-info-value">${Utils.escapeHtml(dev.deviceType)} (${Utils.escapeHtml(dev.browser)} on ${Utils.escapeHtml(dev.os)})</span>
              </div>
              <div class="device-info-row">
                <span class="material-symbols-rounded">location_on</span>
                <span class="device-info-label">Approx. location:</span>
                <span class="device-info-value">${Utils.escapeHtml(dev.location)}</span>
              </div>
              <div class="device-info-row">
                <span class="material-symbols-rounded">schedule</span>
                <span class="device-info-label">Time:</span>
                <span class="device-info-value">${Utils.formatDateTime(now)}</span>
              </div>
            </div>

            <div class="d-flex justify-center gap-3 mt-6 flex-wrap">
              <button class="btn btn-danger" onclick="OTPPage.handleDenyDevice()">This wasn't me</button>
              <button class="btn btn-primary" onclick="OTPPage.handleApproveDevice()">Yes, this is me</button>
            </div>

            <p class="text-body-sm text-muted mt-4" style="text-align:center">
              Choosing “This wasn't me” immediately terminates all sessions, locks sensitive account actions,
              and alerts the security desk.
            </p>
          </div>
        </div>
      </div>
    `;
  },

  async handleApproveDevice() {
    await AuthManager.confirmThisDevice();
    ApiClient.startReminderEngine();
    Utils.showToast('Device confirmed and added to your trusted devices.', 'success');
    Router.navigate('/dashboard');
  },

  async handleDenyDevice() {
    ApiClient.stopReminderEngine();
    const res = await AuthManager.reportUnrecognizedLogin();
    window.location.hash = '#/login';
    setTimeout(() => Utils.showToast(res.message || 'All sessions terminated for your safety.', 'warning'), 500);
  }
};
