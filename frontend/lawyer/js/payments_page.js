/* ============================================================
   LEGALCONNECT — EARNINGS & PAYMENTS
   payments_page.js — Consultation payments, fee split & transaction ledger
   ============================================================ */

const PaymentsPage = {
  render() {
    const txns = Store.getState('transactions') || [];
    const totalEarned = Store.getTotalEarnings();
    const monthlyEarned = Store.getMonthlyEarnings();
    const weeklyEarned = Store.getWeeklyEarnings();
    const todayEarned = Store.getTodayEarnings();

    const contentHtml = `
      <div class="page-header">
        <div class="page-header-left">
          <h2 class="page-title">Earnings & Settlement Ledger</h2>
          <p class="page-subtitle">Detailed breakdown of consultation fees, platform deductions & payout history</p>
        </div>

        <button class="btn btn-secondary" onclick="Utils.showToast('Generating financial statement CSV export...', 'info')">
          <span class="material-symbols-rounded">download</span> Export Statement
        </button>
      </div>

      <!-- 4 Earnings Stat Cards -->
      <div class="earnings-overview">
        <div class="earnings-card">
          <div class="earnings-card-title">Today's Net Earnings</div>
          <div class="earnings-card-value">${Utils.formatCurrency(todayEarned || 2250)}</div>
          <div class="earnings-card-trend"><span class="material-symbols-rounded icon-sm">trending_up</span> 2 consultations completed</div>
        </div>

        <div class="earnings-card">
          <div class="earnings-card-title">This Week</div>
          <div class="earnings-card-value">${Utils.formatCurrency(weeklyEarned || 14850)}</div>
          <div class="earnings-card-trend"><span class="material-symbols-rounded icon-sm">trending_up</span> +12% vs last week</div>
        </div>

        <div class="earnings-card">
          <div class="earnings-card-title">This Month</div>
          <div class="earnings-card-value">${Utils.formatCurrency(monthlyEarned || 68400)}</div>
          <div class="earnings-card-trend"><span class="material-symbols-rounded icon-sm">trending_up</span> On track for record month</div>
        </div>

        <div class="earnings-card">
          <div class="earnings-card-title">Total Lifetime Earnings</div>
          <div class="earnings-card-value">${Utils.formatCurrency(totalEarned || 248000)}</div>
          <div class="earnings-card-trend"><span class="material-symbols-rounded icon-sm">verified</span> Verified Direct Payouts</div>
        </div>
      </div>

      <!-- Fee Breakdown Example Demonstration Card -->
      <div class="fee-breakdown-card">
        <h4 class="card-title mb-3">Transparent Fee Structure Model</h4>
        <div class="breakdown-row">
          <span>Standard Consultation Fee (Paid by Client)</span>
          <span>₹1,000</span>
        </div>
        <div class="breakdown-row">
          <span>Platform Security & Virtual Room Infrastructure Fee (10%)</span>
          <span style="color:var(--color-error)">- ₹100</span>
        </div>
        <div class="breakdown-row total">
          <span>Direct Advocate Earnings (Automated Bank Transfer)</span>
          <span style="color:var(--color-accent);font-size:18px">₹900 (90%)</span>
        </div>
      </div>

      <!-- Transactions Ledger Table -->
      <div class="transactions-container">
        <div class="transactions-header">
          <h3 class="card-title">Consultation Settlements & Payout History</h3>
          <span class="badge badge-accent">${txns.length} Transactions</span>
        </div>

        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Legal Service</th>
                <th>Date & Time</th>
                <th>Gross Paid</th>
                <th>Platform Fee</th>
                <th>Net Advocate Earning</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${txns.slice(0, 10).map(t => `
                <tr>
                  <td><strong>${t.clientName}</strong></td>
                  <td>${t.service}</td>
                  <td>${Utils.formatDate(t.date)}</td>
                  <td>${Utils.formatCurrency(t.amount)}</td>
                  <td style="color:var(--color-gray-500)">- ${Utils.formatCurrency(t.platformFee)}</td>
                  <td class="txn-amount-positive">${Utils.formatCurrency(t.netEarnings)}</td>
                  <td>
                    <span class="badge ${t.paymentStatus === 'completed' ? 'badge-success' : 'badge-warning'}">
                      ${t.paymentStatus.toUpperCase()}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    return Components.AppLayout(contentHtml, 'payments', 'Earnings & Payments', ['Payments']);
  }
};
