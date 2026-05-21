(() => {
  // ── DOM参照キャッシュ ──────────────────────────────────────────
  const els = {
    tabCustomers: document.getElementById('tab-customers'),
    tabPipeline: document.getElementById('tab-pipeline'),
    viewCustomers: document.getElementById('view-customers'),
    viewPipeline: document.getElementById('view-pipeline'),
    paneEmpty: document.getElementById('pane-empty'),
    paneDetail: document.getElementById('pane-customer-detail'),
    paneCustomerForm: document.getElementById('pane-customer-form'),
    paneDealForm: document.getElementById('pane-deal-form'),
    customerList: document.getElementById('customer-list'),
    inputSearch: document.getElementById('input-search'),
    btnNewCustomer: document.getElementById('btn-new-customer'),
    // 顧客詳細
    detailCompany: document.getElementById('detail-company'),
    detailContact: document.getElementById('detail-contact'),
    detailTitle: document.getElementById('detail-title'),
    detailEmail: document.getElementById('detail-email'),
    detailPhone: document.getElementById('detail-phone'),
    detailMemo: document.getElementById('detail-memo'),
    dealList: document.getElementById('deal-list'),
    btnEdit: document.getElementById('btn-edit'),
    btnDelete: document.getElementById('btn-delete'),
    btnAddDeal: document.getElementById('btn-add-deal'),
    // 顧客フォーム
    customerFormTitle: document.getElementById('customer-form-title'),
    formCustomer: document.getElementById('form-customer'),
    inputCompany: document.getElementById('input-company'),
    inputContact: document.getElementById('input-contact'),
    inputTitle: document.getElementById('input-title'),
    inputEmail: document.getElementById('input-email'),
    inputPhone: document.getElementById('input-phone'),
    inputMemo: document.getElementById('input-memo'),
    btnCancelCustomer: document.getElementById('btn-cancel-customer'),
    // 商談フォーム
    dealFormTitle: document.getElementById('deal-form-title'),
    dealFormCompany: document.getElementById('deal-form-company'),
    formDeal: document.getElementById('form-deal'),
    inputDealTitle: document.getElementById('input-deal-title'),
    inputDealAmount: document.getElementById('input-deal-amount'),
    inputDealStatus: document.getElementById('input-deal-status'),
    inputDealMemo: document.getElementById('input-deal-memo'),
    btnCancelDeal: document.getElementById('btn-cancel-deal'),
    btnSaveDeal: document.getElementById('btn-save-deal'),
    btnDeleteDeal: document.getElementById('btn-delete-deal'),
    // パイプライン
    kanbanLead: document.getElementById('kanban-lead'),
    kanbanProposal: document.getElementById('kanban-proposal'),
    kanbanWon: document.getElementById('kanban-won'),
    countLead: document.getElementById('count-lead'),
    countProposal: document.getElementById('count-proposal'),
    countWon: document.getElementById('count-won'),
  };

  // ── 状態 ──────────────────────────────────────────────────────
  let customers = [];
  let deals = [];
  let selectedCustomerId = null;
  let editingCustomerId = null; // null=新規, id文字列=編集中
  let editingDealId = null;     // null=新規, id文字列=編集中

  const STATUS_ORDER = ['lead', 'proposal', 'won'];
  const STATUS_LABEL = { lead: '見込み', proposal: '提案', won: '成約' };

  // ── localStorage ──────────────────────────────────────────────
  const load = () => {
    customers = JSON.parse(localStorage.getItem('crm-customers') ?? '[]');
    deals = JSON.parse(localStorage.getItem('crm-deals') ?? '[]');
  };

  const saveCustomers = () => localStorage.setItem('crm-customers', JSON.stringify(customers));
  const saveDeals = () => localStorage.setItem('crm-deals', JSON.stringify(deals));

  // ── 初期データ（初回のみ） ────────────────────────────────────
  const seedData = () => {
    if (customers.length > 0) return;

    const now = new Date().toISOString();
    const c1 = String(Date.now() - 3000);
    const c2 = String(Date.now() - 2000);
    const c3 = String(Date.now() - 1000);

    customers = [
      { id: c1, company: '株式会社フューチャーテック', contact: '鈴木 一郎', title: '代表取締役', email: 'suzuki@futuretech.example', phone: '03-1234-5678', memo: '展示会で名刺交換。DX推進に興味あり。', createdAt: now },
      { id: c2, company: 'グローバルソリューションズ合同会社', contact: '田中 花子', title: '営業部長', email: 'tanaka@globalsol.example', phone: '06-9876-5432', memo: '紹介経由。来月デモ希望。', createdAt: now },
      { id: c3, company: '有限会社ネクストステージ', contact: '伊藤 健太', title: 'IT担当', email: 'ito@nextstage.example', phone: '', memo: '', createdAt: now },
    ];

    deals = [
      { id: String(Date.now() + 1), customerId: c1, title: 'クラウド移行支援', amount: 2500000, status: 'proposal', memo: '見積もり送付済み', createdAt: now, updatedAt: now },
      { id: String(Date.now() + 2), customerId: c1, title: 'セキュリティ診断サービス', amount: 800000, status: 'lead', memo: '', createdAt: now, updatedAt: now },
      { id: String(Date.now() + 3), customerId: c2, title: 'ERPシステム導入', amount: 5000000, status: 'won', memo: '成約。来月キックオフ。', createdAt: now, updatedAt: now },
      { id: String(Date.now() + 4), customerId: c2, title: '保守運用契約', amount: 1200000, status: 'proposal', memo: '継続利用の提案中', createdAt: now, updatedAt: now },
      { id: String(Date.now() + 5), customerId: c3, title: 'ネットワーク構築', amount: 600000, status: 'lead', memo: '要件ヒアリング待ち', createdAt: now, updatedAt: now },
    ];

    saveCustomers();
    saveDeals();
  };

  // ── ビュー / ペイン切替 ───────────────────────────────────────
  const showView = (name) => {
    els.viewCustomers.classList.toggle('hidden', name !== 'customers');
    els.viewPipeline.classList.toggle('hidden', name !== 'pipeline');
    els.tabCustomers.classList.toggle('bg-orange-50', name === 'customers');
    els.tabCustomers.classList.toggle('text-orange-700', name === 'customers');
    els.tabPipeline.classList.toggle('bg-orange-50', name === 'pipeline');
    els.tabPipeline.classList.toggle('text-orange-700', name === 'pipeline');
    if (name === 'pipeline') renderPipeline();
  };

  const showPane = (name) => {
    els.paneEmpty.classList.toggle('hidden', name !== 'empty');
    els.paneDetail.classList.toggle('hidden', name !== 'detail');
    els.paneCustomerForm.classList.toggle('hidden', name !== 'customer-form');
    els.paneDealForm.classList.toggle('hidden', name !== 'deal-form');
  };

  // ── 顧客リスト描画 ────────────────────────────────────────────
  const filteredCustomers = (query) => {
    const q = query.trim().toLowerCase();
    const sorted = [...customers].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (!q) return sorted;
    return sorted.filter(c =>
      c.company.toLowerCase().includes(q) ||
      c.contact.toLowerCase().includes(q) ||
      (c.title || '').toLowerCase().includes(q)
    );
  };

  const renderCustomerList = () => {
    const query = els.inputSearch.value;
    const list = filteredCustomers(query);
    els.customerList.innerHTML = list.map(c => {
      const dealCount = deals.filter(d => d.customerId === c.id).length;
      const isSelected = c.id === selectedCustomerId;
      return `
        <div
          class="customer-card ${isSelected ? 'customer-card-selected' : ''} p-3 mb-1 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors"
          data-customer-id="${c.id}">
          <div class="text-sm font-semibold text-gray-900">${escHtml(c.company)}</div>
          <div class="text-xs text-gray-600 mt-0.5">${escHtml(c.contact)}${c.title ? ' · ' + escHtml(c.title) : ''}</div>
          <div class="text-xs text-gray-400 mt-1">商談 ${dealCount}件</div>
        </div>`;
    }).join('');
  };

  // ── 顧客詳細描画 ──────────────────────────────────────────────
  const renderCustomerDetail = (customerId) => {
    const c = customers.find(x => x.id === customerId);
    if (!c) return;

    els.detailCompany.textContent = c.company;
    els.detailContact.textContent = c.contact;
    els.detailTitle.textContent = c.title || '—';
    els.detailEmail.textContent = c.email || '—';
    els.detailEmail.href = c.email ? `mailto:${c.email}` : '#';
    els.detailPhone.textContent = c.phone || '—';
    els.detailMemo.textContent = c.memo || '—';

    renderDealList(customerId);
    showPane('detail');
  };

  const renderDealList = (customerId) => {
    const customerDeals = deals.filter(d => d.customerId === customerId);
    if (customerDeals.length === 0) {
      els.dealList.innerHTML = '<p class="text-sm text-gray-400">まだ商談がありません</p>';
      return;
    }
    els.dealList.innerHTML = customerDeals.map(d => `
      <div
        class="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        data-deal-id="${d.id}">
        <div class="flex-1 min-w-0">
          <span class="text-sm font-medium text-gray-900">${escHtml(d.title)}</span>
          ${d.amount ? `<span class="text-xs text-gray-500 ml-2">¥${d.amount.toLocaleString()}</span>` : ''}
        </div>
        <span class="badge-${d.status} text-xs px-2 py-0.5 rounded-full ml-3 shrink-0 font-medium">
          ${STATUS_LABEL[d.status]}
        </span>
      </div>`).join('');
  };

  // ── パイプライン描画 ──────────────────────────────────────────
  const renderPipeline = () => {
    const columns = { lead: [], proposal: [], won: [] };
    deals.forEach(d => columns[d.status]?.push(d));

    els.countLead.textContent = columns.lead.length;
    els.countProposal.textContent = columns.proposal.length;
    els.countWon.textContent = columns.won.length;

    const targets = {
      lead: els.kanbanLead,
      proposal: els.kanbanProposal,
      won: els.kanbanWon,
    };

    STATUS_ORDER.forEach(status => {
      const idx = STATUS_ORDER.indexOf(status);
      targets[status].innerHTML = columns[status].map(d => {
        const c = customers.find(x => x.id === d.customerId);
        const canBack = idx > 0;
        const canNext = idx < STATUS_ORDER.length - 1;
        return `
          <div class="deal-card-${status} bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div class="cursor-pointer mb-2" data-pipeline-deal-id="${d.id}">
              <div class="text-sm font-medium text-gray-900">${escHtml(d.title)}</div>
              <div class="text-xs text-gray-500 mt-0.5">${c ? escHtml(c.company) : '—'}</div>
              ${d.amount ? `<div class="text-xs text-gray-600 mt-0.5">¥${d.amount.toLocaleString()}</div>` : ''}
            </div>
            <div class="flex justify-end gap-1 mt-2">
              ${canBack ? `<button class="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 transition-colors" data-move-deal-id="${d.id}" data-direction="back">←</button>` : ''}
              ${canNext ? `<button class="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 transition-colors" data-move-deal-id="${d.id}" data-direction="next">→</button>` : ''}
            </div>
          </div>`;
      }).join('') || '<p class="text-xs text-gray-400 text-center py-4">なし</p>';
    });
  };

  // ── 顧客フォーム操作 ──────────────────────────────────────────
  const openCustomerForm = (customerId = null) => {
    editingCustomerId = customerId;
    els.customerFormTitle.textContent = customerId ? '顧客を編集' : '新規顧客';

    if (customerId) {
      const c = customers.find(x => x.id === customerId);
      if (!c) return;
      els.inputCompany.value = c.company;
      els.inputContact.value = c.contact;
      els.inputTitle.value = c.title || '';
      els.inputEmail.value = c.email || '';
      els.inputPhone.value = c.phone || '';
      els.inputMemo.value = c.memo || '';
    } else {
      els.formCustomer.reset();
    }
    showPane('customer-form');
  };

  const saveCustomer = () => {
    const company = els.inputCompany.value.trim();
    const contact = els.inputContact.value.trim();
    if (!company || !contact) return;

    const now = new Date().toISOString();
    if (editingCustomerId) {
      const idx = customers.findIndex(c => c.id === editingCustomerId);
      if (idx < 0) return;
      customers[idx] = {
        ...customers[idx],
        company, contact,
        title: els.inputTitle.value.trim(),
        email: els.inputEmail.value.trim(),
        phone: els.inputPhone.value.trim(),
        memo: els.inputMemo.value.trim(),
      };
      selectedCustomerId = editingCustomerId;
    } else {
      const newCustomer = {
        id: String(Date.now()),
        company, contact,
        title: els.inputTitle.value.trim(),
        email: els.inputEmail.value.trim(),
        phone: els.inputPhone.value.trim(),
        memo: els.inputMemo.value.trim(),
        createdAt: now,
      };
      customers.push(newCustomer);
      selectedCustomerId = newCustomer.id;
    }

    saveCustomers();
    renderCustomerList();
    renderCustomerDetail(selectedCustomerId);
  };

  const deleteCustomer = (customerId) => {
    const c = customers.find(x => x.id === customerId);
    if (!c) return;
    const dealCount = deals.filter(d => d.customerId === customerId).length;
    const msg = dealCount > 0
      ? `「${c.company}」を削除します。紐付く商談 ${dealCount}件も連鎖削除されます。よろしいですか？`
      : `「${c.company}」を削除します。よろしいですか？`;

    if (!confirm(msg)) return;

    customers = customers.filter(x => x.id !== customerId);
    deals = deals.filter(d => d.customerId !== customerId);
    saveCustomers();
    saveDeals();
    selectedCustomerId = null;
    renderCustomerList();
    showPane('empty');
  };

  // ── 商談フォーム操作 ──────────────────────────────────────────
  const openDealForm = (customerId, dealId = null) => {
    editingDealId = dealId;
    const c = customers.find(x => x.id === customerId);
    els.dealFormTitle.textContent = dealId ? '商談を編集' : '新規商談';
    els.dealFormCompany.textContent = c ? c.company : '';
    els.btnDeleteDeal.classList.toggle('hidden', !dealId);

    if (dealId) {
      const d = deals.find(x => x.id === dealId);
      if (!d) return;
      els.inputDealTitle.value = d.title;
      els.inputDealAmount.value = d.amount ?? '';
      els.inputDealStatus.value = d.status;
      els.inputDealMemo.value = d.memo || '';
    } else {
      els.formDeal.reset();
      els.inputDealStatus.value = 'lead';
    }
    showPane('deal-form');
  };

  const saveDeal = () => {
    const title = els.inputDealTitle.value.trim();
    if (!title || !selectedCustomerId) return;

    const now = new Date().toISOString();
    const amount = els.inputDealAmount.value ? parseInt(els.inputDealAmount.value, 10) : null;

    if (editingDealId) {
      const idx = deals.findIndex(d => d.id === editingDealId);
      if (idx < 0) return;
      deals[idx] = {
        ...deals[idx],
        title,
        amount,
        status: els.inputDealStatus.value,
        memo: els.inputDealMemo.value.trim(),
        updatedAt: now,
      };
    } else {
      deals.push({
        id: String(Date.now()),
        customerId: selectedCustomerId,
        title,
        amount,
        status: els.inputDealStatus.value,
        memo: els.inputDealMemo.value.trim(),
        createdAt: now,
        updatedAt: now,
      });
    }

    saveDeals();
    renderCustomerDetail(selectedCustomerId);
    renderCustomerList();
  };

  const deleteDeal = (dealId) => {
    const d = deals.find(x => x.id === dealId);
    if (!d) return;
    if (!confirm(`「${d.title}」を削除します。よろしいですか？`)) return;
    deals = deals.filter(x => x.id !== dealId);
    saveDeals();
    renderCustomerDetail(selectedCustomerId);
    renderCustomerList();
  };

  // ── ステータス移動（パイプライン） ────────────────────────────
  const moveDeal = (dealId, direction) => {
    const idx = deals.findIndex(d => d.id === dealId);
    if (idx < 0) return;
    const currentIdx = STATUS_ORDER.indexOf(deals[idx].status);
    const nextIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
    if (nextIdx < 0 || nextIdx >= STATUS_ORDER.length) return;
    deals[idx] = { ...deals[idx], status: STATUS_ORDER[nextIdx], updatedAt: new Date().toISOString() };
    saveDeals();
    renderPipeline();
  };

  // ── ユーティリティ ────────────────────────────────────────────
  const escHtml = (str) =>
    String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // ── イベント登録（デリゲーション中心） ───────────────────────

  // タブ切替
  els.tabCustomers.addEventListener('click', () => showView('customers'));
  els.tabPipeline.addEventListener('click', () => showView('pipeline'));

  // 新規顧客
  els.btnNewCustomer.addEventListener('click', () => {
    selectedCustomerId = null;
    renderCustomerList();
    openCustomerForm();
  });

  // 顧客リストのカードクリック（デリゲーション）
  els.customerList.addEventListener('click', (e) => {
    const card = e.target.closest('[data-customer-id]');
    if (!card) return;
    selectedCustomerId = card.dataset.customerId;
    renderCustomerList();
    renderCustomerDetail(selectedCustomerId);
  });

  // 検索
  els.inputSearch.addEventListener('input', renderCustomerList);

  // 顧客詳細: 編集・削除・商談追加
  els.btnEdit.addEventListener('click', () => openCustomerForm(selectedCustomerId));
  els.btnDelete.addEventListener('click', () => deleteCustomer(selectedCustomerId));
  els.btnAddDeal.addEventListener('click', () => openDealForm(selectedCustomerId));

  // 商談行クリック（デリゲーション）
  els.dealList.addEventListener('click', (e) => {
    const row = e.target.closest('[data-deal-id]');
    if (!row) return;
    openDealForm(selectedCustomerId, row.dataset.dealId);
  });

  // 顧客フォーム: キャンセル・保存
  els.btnCancelCustomer.addEventListener('click', () => {
    if (selectedCustomerId) {
      renderCustomerDetail(selectedCustomerId);
    } else {
      showPane('empty');
    }
  });
  els.formCustomer.addEventListener('submit', (e) => {
    e.preventDefault();
    saveCustomer();
  });

  // 商談フォーム: キャンセル・保存・削除
  els.btnCancelDeal.addEventListener('click', () => renderCustomerDetail(selectedCustomerId));
  els.formDeal.addEventListener('submit', (e) => {
    e.preventDefault();
    saveDeal();
  });
  els.btnDeleteDeal.addEventListener('click', () => {
    deleteDeal(editingDealId);
  });

  // パイプライン: カード本体クリック → 顧客ビュー+商談フォーム
  const pipelineArea = document.querySelector('#view-pipeline');
  pipelineArea.addEventListener('click', (e) => {
    // ステータス移動ボタン
    const moveBtn = e.target.closest('[data-move-deal-id]');
    if (moveBtn) {
      moveDeal(moveBtn.dataset.moveDealId, moveBtn.dataset.direction);
      return;
    }
    // カード本体（商談フォーム遷移）
    const cardBody = e.target.closest('[data-pipeline-deal-id]');
    if (!cardBody) return;
    const deal = deals.find(d => d.id === cardBody.dataset.pipelineDealId);
    if (!deal) return;
    selectedCustomerId = deal.customerId;
    showView('customers');
    renderCustomerList();
    openDealForm(selectedCustomerId, deal.id);
  });

  // ── 初期化 ───────────────────────────────────────────────────
  load();
  seedData();
  renderCustomerList();
  showView('customers');
  showPane('empty');

})();
