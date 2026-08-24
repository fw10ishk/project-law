/* ============================================================
   LEGALCONNECT — SECURE CLIENT CHAT
   chat_page.js — Messaging, document sharing, case notes & threads
   ============================================================ */

const ChatPage = {
  _activeConvId: 'conv_1',

  render() {
    const convs = Store.getState('conversations') || [];
    const activeConv = convs.find(c => c.id === this._activeConvId) || convs[0] || { clientName: 'Rahul Verma', messages: [] };

    const contentHtml = `
      <div class="chat-container">
        <!-- Left: Conversations List -->
        <div class="chat-conversations">
          <div class="chat-conv-header">
            <input type="text" class="chat-search-input" placeholder="Search conversations..." onkeyup="ChatPage.filterConv(event)">
          </div>

          <div class="chat-conv-list">
            ${convs.map(c => `
              <div class="chat-conv-item ${c.id === this._activeConvId ? 'active' : ''}" onclick="ChatPage.selectConv('${c.id}')">
                <div class="avatar avatar-sm">
                  ${c.clientName.split(' ').map(n => n[0]).join('')}
                </div>
                <div class="chat-conv-info">
                  <div class="chat-conv-top">
                    <span class="chat-conv-name">${c.clientName}</span>
                    <span class="chat-conv-time">${Utils.timeAgo(c.lastMessageTime)}</span>
                  </div>
                  <div class="chat-conv-msg">${c.lastMessage}</div>
                </div>
                ${c.unreadCount ? `<span class="badge badge-accent">${c.unreadCount}</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Middle: Chat Messages Area -->
        <div class="chat-main">
          <div class="chat-header">
            <div class="chat-header-user">
              <div class="avatar avatar-sm">
                ${activeConv.clientName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 class="chat-header-name">${activeConv.clientName}</h3>
                <div class="chat-header-status">
                  <span class="status-dot status-dot-online"></span> Active Legal Case Channel
                </div>
              </div>
            </div>

            <div class="chat-header-actions">
              <button class="btn btn-secondary btn-sm" onclick="Router.navigate('/consultation')">
                <span class="material-symbols-rounded">videocam</span> Start Call
              </button>
              <button class="btn-icon" onclick="ChatPage.toggleDocsDrawer()" title="Case Documents">
                <span class="material-symbols-rounded">folder_open</span>
              </button>
            </div>
          </div>

          <!-- Messages Container -->
          <div class="chat-messages" id="chat-messages-container">
            ${(activeConv.messages || []).map(m => `
              <div class="message-group ${m.sender === 'lawyer' ? 'outgoing' : 'incoming'}">
                <div class="message-bubble">
                  ${m.text}
                </div>
                <div class="message-time">${Utils.formatTime(m.time)}</div>
              </div>
            `).join('')}
          </div>

          <!-- Input Bar -->
          <form class="chat-input-area" onsubmit="ChatPage.handleSendMessage(event)">
            <button type="button" class="btn-icon" onclick="ChatPage.handleAttachFile()" title="Attach Document">
              <span class="material-symbols-rounded">attach_file</span>
            </button>
            <input type="text" id="chat-message-input" class="chat-input" placeholder="Type legal advice, response, or directive..." autocomplete="off">
            <button type="submit" class="btn btn-primary btn-pill">
              <span class="material-symbols-rounded">send</span> Send
            </button>
          </form>
        </div>

        <!-- Right: Case Documents Drawer -->
        <div class="chat-doc-drawer" id="chat-doc-drawer">
          <h4 class="card-title mb-4">Case Documents</h4>
          <div class="client-docs-list">
            <div class="client-doc-item">
              <span class="material-symbols-rounded text-accent">picture_as_pdf</span>
              <div class="client-doc-info">
                <div class="client-doc-name">Rental_Agreement.pdf</div>
                <div class="client-doc-size">Uploaded by Client</div>
              </div>
            </div>
            <div class="client-doc-item">
              <span class="material-symbols-rounded text-accent">picture_as_pdf</span>
              <div class="client-doc-info">
                <div class="client-doc-name">Legal_Notice_Draft.pdf</div>
                <div class="client-doc-size">Drafted by Counsel</div>
              </div>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm btn-block mt-4" onclick="ChatPage.handleAttachFile()">
            <span class="material-symbols-rounded">upload</span> Upload to Vault
          </button>
        </div>
      </div>
    `;

    return Components.AppLayout(contentHtml, 'chat', 'Client Legal Messenger', ['Chat']);
  },

  onEnter() {
    this.scrollToBottom();
  },

  scrollToBottom() {
    const el = document.getElementById('chat-messages-container');
    if (el) el.scrollTop = el.scrollHeight;
  },

  selectConv(id) {
    this._activeConvId = id;
    Router.transitionPage('/chat');
  },

  handleSendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('chat-message-input');
    const text = input.value.trim();
    if (!text) return;

    const convs = Store.getState('conversations') || [];
    const conv = convs.find(c => c.id === this._activeConvId);

    if (conv) {
      conv.messages.push({
        id: `m_${Date.now()}`,
        sender: 'lawyer',
        text,
        time: new Date().toISOString()
      });
      conv.lastMessage = text;
      conv.lastMessageTime = new Date().toISOString();
      Store.setState('conversations', convs);
    }

    input.value = '';
    Router.transitionPage('/chat');
  },

  handleAttachFile() {
    Utils.showToast('Document securely uploaded and shared in case vault.', 'success');
  },

  toggleDocsDrawer() {
    const drawer = document.getElementById('chat-doc-drawer');
    if (drawer) drawer.classList.toggle('hidden');
  },

  filterConv(e) {
    // Basic filter simulation
  }
};
