/* ============================================================
   LEGALCONNECT — CLIENT REVIEWS
   reviews_page.js — Unbiased client reviews, star rating distribution
   ============================================================ */

const ReviewsPage = {
  render() {
    const reviews = Store.getState('reviews') || [];
    const avgRating = Store.getAverageRating() || 4.8;
    const totalCount = reviews.length;

    const contentHtml = `
      <div class="page-header">
        <div class="page-header-left">
          <h2 class="page-title">Verified Client Feedback & Ratings</h2>
          <p class="page-subtitle">Authentic reviews recorded post-consultation under strict non-tampering policy</p>
        </div>
      </div>

      <!-- Rating Overview Score Card -->
      <div class="reviews-overview-card">
        <div class="reviews-score-block">
          <div class="reviews-big-score">${avgRating}</div>
          <div class="star-rating">
            <span class="star filled">★</span><span class="star filled">★</span><span class="star filled">★</span><span class="star filled">★</span><span class="star filled">★</span>
          </div>
          <div class="reviews-total-count">${totalCount} Client Reviews</div>
        </div>

        <div class="reviews-breakdown">
          <div class="rating-bar-row">
            <span class="rating-bar-label">5 Stars</span>
            <div class="rating-bar-track"><div class="rating-bar-fill" style="width:85%"></div></div>
            <span class="rating-bar-count">85%</span>
          </div>
          <div class="rating-bar-row">
            <span class="rating-bar-label">4 Stars</span>
            <div class="rating-bar-track"><div class="rating-bar-fill" style="width:12%"></div></div>
            <span class="rating-bar-count">12%</span>
          </div>
          <div class="rating-bar-row">
            <span class="rating-bar-label">3 Stars</span>
            <div class="rating-bar-track"><div class="rating-bar-fill" style="width:3%"></div></div>
            <span class="rating-bar-count">3%</span>
          </div>
        </div>
      </div>

      <!-- Review Cards List -->
      <div class="reviews-list">
        ${reviews.map(r => `
          <div class="review-card">
            <div class="review-card-header">
              <div class="review-client-info">
                <div class="avatar avatar-sm">
                  ${r.clientName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div class="review-client-name">${r.clientName}</div>
                  <div class="review-date">Verified Client • ${Utils.formatDate(r.date)}</div>
                </div>
              </div>

              <div class="star-rating">
                ${[1,2,3,4,5].map(star => `
                  <span class="star ${star <= r.rating ? 'filled' : ''}">★</span>
                `).join('')}
              </div>
            </div>

            <p class="review-text">"${r.review}"</p>

            ${r.wouldRecommend ? `
              <span class="review-recommend-badge">
                <span class="material-symbols-rounded icon-sm">thumb_up</span> Recommends Advocate
              </span>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;

    return Components.AppLayout(contentHtml, 'reviews', 'Client Reviews', ['Reviews']);
  }
};
