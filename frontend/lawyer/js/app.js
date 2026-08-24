/* ============================================================
   LEGALCONNECT — MAIN APPLICATION ENTRY POINT
   app.js — SPA Router configuration, route guards & boot sequence
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Central State Store
  Store.init();

  // 2. Register all SPA Routes
  // Splash & Roles
  Router.register('/splash', () => SplashPage.render(), {
    title: 'LegalConnect — AI Legal Assistant',
    onEnter: () => SplashPage.onEnter()
  });

  Router.register('/role-select', () => AuthPage.renderRoleSelect(), {
    title: 'Select Role — LegalConnect'
  });

  // Auth Flow
  Router.register('/login', () => AuthPage.renderLogin(), {
    title: 'Advocate Login — LegalConnect'
  });

  Router.register('/forgot-password', () => AuthPage.renderForgotPassword(), {
    title: 'Password Recovery — LegalConnect'
  });

  Router.register('/otp', () => OTPPage.render(), {
    title: 'Two-Factor Authentication — LegalConnect',
    onEnter: () => OTPPage.onEnter()
  });

  Router.register('/device-check', () => OTPPage.renderDeviceCheck(), {
    title: 'Device Security Check — LegalConnect'
  });

  // Registration & Verification
  Router.register('/register', () => RegisterPage.render(), {
    title: 'Advocate Registration — LegalConnect'
  });

  Router.register('/verification', () => VerificationPage.render(), {
    title: 'Credential Verification — LegalConnect'
  });

  // Main Advocate Portal Pages (Auth Protected)
  Router.register('/dashboard', () => DashboardPage.render(), {
    title: 'Advocate Dashboard — LegalConnect',
    requiresAuth: true
  });

  Router.register('/clients', (params) => ClientsPage.render(params), {
    title: 'Client Consultation Requests — LegalConnect',
    requiresAuth: true
  });

  Router.register('/consultation', () => ConsultationPage.render(), {
    title: 'Virtual Consultation Chamber — LegalConnect',
    requiresAuth: true,
    onEnter: () => ConsultationPage.onEnter(),
    onLeave: () => ConsultationPage.onLeave()
  });

  Router.register('/chat', () => ChatPage.render(), {
    title: 'Client Legal Chat — LegalConnect',
    requiresAuth: true,
    onEnter: () => ChatPage.onEnter()
  });

  Router.register('/cases', (params) => CasesPage.render(params), {
    title: 'Case File Management — LegalConnect',
    requiresAuth: true
  });

  Router.register('/payments', () => PaymentsPage.render(), {
    title: 'Earnings & Settlements — LegalConnect',
    requiresAuth: true
  });

  Router.register('/reviews', () => ReviewsPage.render(), {
    title: 'Client Reviews & Ratings — LegalConnect',
    requiresAuth: true
  });

  Router.register('/profile', () => ProfilePage.render(), {
    title: 'Advocate Portfolio & Bio — LegalConnect',
    requiresAuth: true
  });

  Router.register('/settings', (params) => SettingsPage.render(params), {
    title: 'Settings & Security Center — LegalConnect',
    requiresAuth: true
  });

  // 3. Initialize Router
  Router.init();
});
