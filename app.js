import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

// ── DOM参照キャッシュ ──────────────────────────────────────────
const els = {
  tabCustomers:      document.getElementById('tab-customers'),
  tabPipeline:       document.getElementById('tab-pipeline'),
  viewCustomers:     document.getElementById('view-customers'),
  viewPipeline:      document.getElementById('view-pipeline'),
  paneEmpty:         document.getElementById('pane-empty'),
  paneDetail:        document.getElementById('pane-customer-detail'),
  paneCustomerForm:  document.getElementById('pane-customer-form'),
  paneDealForm:      document.getElementById('pane-deal-form'),
  customerList:      document.getElementById('customer-list'),
  inputSearch:       document.getElementById('input-search'),
  btnNewCustomer:    document.getElementById('btn-new-customer'),
  // 顧客詳細
  detailCompany:     document.getElementById('detail-company'),
  detailContact:     document.getElementById('detail-contact'),
  detailTitle:       document.getElementById('detail-title'),
  detailEmail:       document.getElementById('detail-email'),
  detailPhone:       document.getElementById('detail-phone'),
  detailMemo:        document.getElementById('detail-memo'),
  dealList:          document.getElementById('deal-list'),
  btnEdit:           document.getElementById('btn-edit'),
  btnDelete:         document.getElementById('btn-delete'),
  btnAddDeal:        document.getElementById('btn-add-deal'),
  // 顧客フォーム
  customerFormTitle: document.getElementById('customer-form-title'),
  formCustomer:      document.getElementById('form-customer'),
  inputCompany:      document.getElementById('input-company'),
  inputContact:      document.getElementById('input-contact'),
  inputTitle:        document.getElementById('input-title'),
  inputEmail:        document.getElementById('input-email'),
  inputPhone:        document.getElementById('input-phone'),
  inputMemo:         document.getElementById('input-memo'),
  btnCancelCustomer: document.getElementById('btn-cancel-customer'),
  // 商談フォーム
  dealFormTitle:     document.getElementById('deal-form-title'),
  dealFormCompany:   document.getElementById('deal-form-company'),
  formDeal:          document.getElementById('form-deal'),
  inputDealTitle:    document.getElementById('input-deal-title'),
  inputDealAmount:   document.getElementById('input-deal-amount'),
  inputDealStatus:   document.getElementById('input-deal-status'),
  inputDealMemo:     document.getElementById('input-deal-memo'),
  btnCancelDeal:     document.getElementById('btn-cancel-deal'),
  btnSaveDeal:       document.getElementById('btn-save-deal'),
  btnDeleteDeal:     document.getElementById('btn-delete-deal'),
  // パイプライン
  kanbanLead:        document.getElementById('kanban-lead'),
  kanbanProposal:    document.getElementById('kanban-proposal'),
  kanbanWon:         document.getElementById('kanban-won'),
  countLead:         document.getElementById('count-lead'),
  countProposal:     document.getElementById('count-proposal'),
  countWon:          document.getElementById('count-won'),
}

// ── 状態 ──────────────────────────────────────────────────────
let customers = []
let deals = []
let selectedCustomerId = null
let editingCustomerId = null
let editingDealId = null

const STATUS_ORDER = ['lead', 'proposal', 'won']
const STATUS_LABEL = { lead: '見込み', proposal: '提案', won: '成約' }

// ── Supabase データ取得 ────────────────────────────────────────
async function loadAll() {
  const [{ data: cData, error: cErr }, { data: dData, error: dErr }] = await Promise.all([
    supabase.from('customers').select('*').order('created_at', { ascending: false }),
    supabase.from('deals').select('*, customers(company)').order('created_at', { ascending: true }),
  ])
  if (cErr) throw cErr
  if (dErr) throw dErr
  customers = cData ?? []
  deals = dData ?? []
}

// ── ビュー / ペイン切替 ───────────────────────────────────────
const showView = (name) => {
  els.viewCustomers.classList.toggle('hidden', name !== 'customers')
  els.viewPipeline.classList.toggle('hidden', name !== 'pipeline')
  els.tabCustomers.classList.toggle('bg-orange-50', name === 'customers')
  els.tabCustomers.classList.toggle('text-orange-700', name === 'customers')
  els.tabPipeline.classList.toggle('bg-orange-50', name === 'pipeline')
  els.tabPipeline.classList.toggle('text-orange-700', name === 'pipeline')
  if (name === 'pipeline') renderPipeline()
}

const showPane = (name) => {
  els.paneEmpty.classList.toggle('hidden', name !== 'empty')
  els.paneDetail.classList.toggle('hidden', name !== 'detail')
  els.paneCustomerForm.classList.toggle('hidden', name !== 'customer-form')
  els.paneDealForm.classList.toggle('hidden', name !== 'deal-form')
}

// ── 顧客リスト描画 ────────────────────────────────────────────
const filteredCustomers = (query) => {
  const q = query.trim().toLowerCase()
  if (!q) return customers  // DB側で created_at DESC 順取得済み
  return customers.filter(c =>
    c.company.toLowerCase().includes(q) ||
    c.name.toLowerCase().includes(q) ||
    (c.title || '').toLowerCase().includes(q)
  )
}

const renderCustomerList = () => {
  const list = filteredCustomers(els.inputSearch.value)
  els.customerList.innerHTML = list.map(c => {
    const dealCount = deals.filter(d => d.customer_id === c.id).length
    const isSelected = c.id === selectedCustomerId
    return `
      <div
        class="customer-card ${isSelected ? 'customer-card-selected' : ''} p-3 mb-1 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors"
        data-customer-id="${c.id}">
        <div class="text-sm font-semibold text-gray-900">${escHtml(c.company)}</div>
        <div class="text-xs text-gray-600 mt-0.5">${escHtml(c.name)}${c.title ? ' · ' + escHtml(c.title) : ''}</div>
        <div class="text-xs text-gray-400 mt-1">商談 ${dealCount}件</div>
      </div>`
  }).join('')
}

// ── 顧客詳細描画 ──────────────────────────────────────────────
const renderCustomerDetail = (customerId) => {
  const c = customers.find(x => x.id === customerId)
  if (!c) return

  els.detailCompany.textContent = c.company
  els.detailContact.textContent = c.name
  els.detailTitle.textContent = c.title || '—'
  els.detailEmail.textContent = c.email || '—'
  els.detailEmail.href = c.email ? `mailto:${c.email}` : '#'
  els.detailPhone.textContent = c.phone || '—'
  els.detailMemo.textContent = c.memo || '—'

  renderDealList(customerId)
  showPane('detail')
}

const renderDealList = (customerId) => {
  const customerDeals = deals.filter(d => d.customer_id === customerId)
  if (customerDeals.length === 0) {
    els.dealList.innerHTML = '<p class="text-sm text-gray-400">まだ商談がありません</p>'
    return
  }
  els.dealList.innerHTML = customerDeals.map(d => `
    <div
      class="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
      data-deal-id="${d.id}">
      <div class="flex-1 min-w-0">
        <span class="text-sm font-medium text-gray-900">${escHtml(d.title)}</span>
        ${d.amount ? `<span class="text-xs text-gray-500 ml-2">¥${Number(d.amount).toLocaleString()}</span>` : ''}
      </div>
      <span class="badge-${d.status} text-xs px-2 py-0.5 rounded-full ml-3 shrink-0 font-medium">
        ${STATUS_LABEL[d.status] ?? d.status}
      </span>
    </div>`).join('')
}

// ── パイプライン描画 ──────────────────────────────────────────
const renderPipeline = () => {
  const columns = { lead: [], proposal: [], won: [] }
  deals.forEach(d => columns[d.status]?.push(d))

  els.countLead.textContent = columns.lead.length
  els.countProposal.textContent = columns.proposal.length
  els.countWon.textContent = columns.won.length

  const targets = { lead: els.kanbanLead, proposal: els.kanbanProposal, won: els.kanbanWon }

  STATUS_ORDER.forEach(status => {
    const idx = STATUS_ORDER.indexOf(status)
    targets[status].innerHTML = columns[status].map(d => {
      // select('*, customers(company)') でネストされた会社名を利用
      const company = d.customers?.company ?? '—'
      const canBack = idx > 0
      const canNext = idx < STATUS_ORDER.length - 1
      return `
        <div class="deal-card-${status} bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <div class="cursor-pointer mb-2" data-pipeline-deal-id="${d.id}">
            <div class="text-sm font-medium text-gray-900">${escHtml(d.title)}</div>
            <div class="text-xs text-gray-500 mt-0.5">${escHtml(company)}</div>
            ${d.amount ? `<div class="text-xs text-gray-600 mt-0.5">¥${Number(d.amount).toLocaleString()}</div>` : ''}
          </div>
          <div class="flex justify-end gap-1 mt-2">
            ${canBack ? `<button class="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 transition-colors" data-move-deal-id="${d.id}" data-direction="back">←</button>` : ''}
            ${canNext ? `<button class="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 transition-colors" data-move-deal-id="${d.id}" data-direction="next">→</button>` : ''}
          </div>
        </div>`
    }).join('') || '<p class="text-xs text-gray-400 text-center py-4">なし</p>'
  })
}

// ── 顧客フォーム操作 ──────────────────────────────────────────
const openCustomerForm = (customerId = null) => {
  editingCustomerId = customerId
  els.customerFormTitle.textContent = customerId ? '顧客を編集' : '新規顧客'

  if (customerId) {
    const c = customers.find(x => x.id === customerId)
    if (!c) return
    els.inputCompany.value = c.company
    els.inputContact.value = c.name
    els.inputTitle.value = c.title || ''
    els.inputEmail.value = c.email || ''
    els.inputPhone.value = c.phone || ''
    els.inputMemo.value = c.memo || ''
  } else {
    els.formCustomer.reset()
  }
  showPane('customer-form')
}

const saveCustomer = async () => {
  const company = els.inputCompany.value.trim()
  const name = els.inputContact.value.trim()
  if (!company || !name) return

  const payload = {
    company,
    name,
    title: els.inputTitle.value.trim() || null,
    email: els.inputEmail.value.trim() || null,
    phone: els.inputPhone.value.trim() || null,
    memo:  els.inputMemo.value.trim() || null,
  }

  if (editingCustomerId) {
    const { error } = await supabase.from('customers').update(payload).eq('id', editingCustomerId)
    if (error) { alert('更新に失敗しました: ' + error.message); return }
    selectedCustomerId = editingCustomerId
  } else {
    const { data, error } = await supabase.from('customers').insert(payload).select().single()
    if (error) { alert('保存に失敗しました: ' + error.message); return }
    selectedCustomerId = data.id
  }

  await loadAll()
  renderCustomerList()
  renderCustomerDetail(selectedCustomerId)
}

const deleteCustomer = async (customerId) => {
  const c = customers.find(x => x.id === customerId)
  if (!c) return
  const dealCount = deals.filter(d => d.customer_id === customerId).length
  const msg = dealCount > 0
    ? `「${c.company}」を削除します。紐付く商談 ${dealCount}件も連鎖削除されます。よろしいですか？`
    : `「${c.company}」を削除します。よろしいですか？`
  if (!confirm(msg)) return

  const { error } = await supabase.from('customers').delete().eq('id', customerId)
  if (error) { alert('削除に失敗しました: ' + error.message); return }

  selectedCustomerId = null
  await loadAll()
  renderCustomerList()
  showPane('empty')
}

// ── 商談フォーム操作 ──────────────────────────────────────────
const openDealForm = (customerId, dealId = null) => {
  editingDealId = dealId
  const c = customers.find(x => x.id === customerId)
  els.dealFormTitle.textContent = dealId ? '商談を編集' : '新規商談'
  els.dealFormCompany.textContent = c ? c.company : ''
  els.btnDeleteDeal.classList.toggle('hidden', !dealId)

  if (dealId) {
    const d = deals.find(x => x.id === dealId)
    if (!d) return
    els.inputDealTitle.value = d.title
    els.inputDealAmount.value = d.amount ?? ''
    els.inputDealStatus.value = d.status
    els.inputDealMemo.value = d.memo || ''
  } else {
    els.formDeal.reset()
    els.inputDealStatus.value = 'lead'
  }
  showPane('deal-form')
}

const saveDeal = async () => {
  const title = els.inputDealTitle.value.trim()
  if (!title || !selectedCustomerId) return

  const amount = els.inputDealAmount.value ? parseInt(els.inputDealAmount.value, 10) : null
  const payload = {
    title,
    amount,
    status: els.inputDealStatus.value,
    memo: els.inputDealMemo.value.trim() || null,
  }

  if (editingDealId) {
    const { error } = await supabase.from('deals')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', editingDealId)
    if (error) { alert('更新に失敗しました: ' + error.message); return }
  } else {
    const { error } = await supabase.from('deals')
      .insert({ ...payload, customer_id: selectedCustomerId })
    if (error) { alert('保存に失敗しました: ' + error.message); return }
  }

  await loadAll()
  renderCustomerDetail(selectedCustomerId)
  renderCustomerList()
}

const deleteDeal = async (dealId) => {
  const d = deals.find(x => x.id === dealId)
  if (!d) return
  if (!confirm(`「${d.title}」を削除します。よろしいですか？`)) return

  const { error } = await supabase.from('deals').delete().eq('id', dealId)
  if (error) { alert('削除に失敗しました: ' + error.message); return }

  await loadAll()
  renderCustomerDetail(selectedCustomerId)
  renderCustomerList()
}

// ── ステータス移動（パイプライン） ────────────────────────────
const moveDeal = async (dealId, direction) => {
  const d = deals.find(x => x.id === dealId)
  if (!d) return
  const currentIdx = STATUS_ORDER.indexOf(d.status)
  const nextIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1
  if (nextIdx < 0 || nextIdx >= STATUS_ORDER.length) return

  const { error } = await supabase.from('deals')
    .update({ status: STATUS_ORDER[nextIdx], updated_at: new Date().toISOString() })
    .eq('id', dealId)
  if (error) { alert('更新に失敗しました: ' + error.message); return }

  await loadAll()
  renderPipeline()
}

// ── ユーティリティ ────────────────────────────────────────────
const escHtml = (str) =>
  String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// ── イベント登録 ──────────────────────────────────────────────

els.tabCustomers.addEventListener('click', () => showView('customers'))
els.tabPipeline.addEventListener('click', () => showView('pipeline'))

els.btnNewCustomer.addEventListener('click', () => {
  selectedCustomerId = null
  renderCustomerList()
  openCustomerForm()
})

els.customerList.addEventListener('click', (e) => {
  const card = e.target.closest('[data-customer-id]')
  if (!card) return
  selectedCustomerId = card.dataset.customerId
  renderCustomerList()
  renderCustomerDetail(selectedCustomerId)
})

els.inputSearch.addEventListener('input', renderCustomerList)

els.btnEdit.addEventListener('click', () => openCustomerForm(selectedCustomerId))
els.btnDelete.addEventListener('click', () => deleteCustomer(selectedCustomerId).catch(console.error))
els.btnAddDeal.addEventListener('click', () => openDealForm(selectedCustomerId))

els.dealList.addEventListener('click', (e) => {
  const row = e.target.closest('[data-deal-id]')
  if (!row) return
  openDealForm(selectedCustomerId, row.dataset.dealId)
})

els.btnCancelCustomer.addEventListener('click', () => {
  if (selectedCustomerId) {
    renderCustomerDetail(selectedCustomerId)
  } else {
    showPane('empty')
  }
})
els.formCustomer.addEventListener('submit', (e) => {
  e.preventDefault()
  saveCustomer().catch(console.error)
})

els.btnCancelDeal.addEventListener('click', () => renderCustomerDetail(selectedCustomerId))
els.formDeal.addEventListener('submit', (e) => {
  e.preventDefault()
  saveDeal().catch(console.error)
})
els.btnDeleteDeal.addEventListener('click', () => deleteDeal(editingDealId).catch(console.error))

document.querySelector('#view-pipeline').addEventListener('click', (e) => {
  const moveBtn = e.target.closest('[data-move-deal-id]')
  if (moveBtn) {
    moveDeal(moveBtn.dataset.moveDealId, moveBtn.dataset.direction).catch(console.error)
    return
  }
  const cardBody = e.target.closest('[data-pipeline-deal-id]')
  if (!cardBody) return
  const deal = deals.find(d => d.id === cardBody.dataset.pipelineDealId)
  if (!deal) return
  selectedCustomerId = deal.customer_id
  showView('customers')
  renderCustomerList()
  openDealForm(selectedCustomerId, deal.id)
})

// ── 初期化 ───────────────────────────────────────────────────
async function init() {
  await loadAll()
  renderCustomerList()
  showView('customers')
  showPane('empty')
}

init().catch(console.error)
