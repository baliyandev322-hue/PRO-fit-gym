/**
 * PROFIT Training Club - Operations Desk Dashboard Script
 * Manages authentication, KPI metrics, tab navigation, search, filters, and status updates.
 */

// Determine API Base URL dynamically
const API_BASE =
  localStorage.getItem('profit_api_url') ||
  (window.PROFIT_CONFIG && window.PROFIT_CONFIG.API_URL) ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api');

// State Container
const state = {
  token: localStorage.getItem('profit_admin_token') || null,
  user: JSON.parse(localStorage.getItem('profit_admin_user') || 'null'),
  activeTab: 'bookings',
  page: 1,
  limit: 15,
  search: '',
  status: '',
  type: '',
  records: [],
  pagination: null,
};

// DOM References
const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const adminLoginForm = document.getElementById('adminLoginForm');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');
const loginErrorMsg = document.getElementById('loginErrorMsg');
const logoutBtn = document.getElementById('logoutBtn');
const adminUserName = document.getElementById('adminUserName');

const metricTotal = document.getElementById('metricTotal');
const metricPending = document.getElementById('metricPending');
const metricConfirmed = document.getElementById('metricConfirmed');
const metricArchived = document.getElementById('metricArchived');
const metricArchivedMeta = document.getElementById('metricArchivedMeta');
const metricMemberships = document.getElementById('metricMemberships');
const metricContacts = document.getElementById('metricContacts');

const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const typeFilter = document.getElementById('typeFilter');
const refreshBtn = document.getElementById('refreshBtn');

const tableHead = document.getElementById('tableHead');
const tableBody = document.getElementById('tableBody');
const emptyState = document.getElementById('emptyState');
const paginationInfo = document.getElementById('paginationInfo');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');

const detailModal = document.getElementById('detailModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalDetailsContent = document.getElementById('modalDetailsContent');
const modalRecordTitle = document.getElementById('modalRecordTitle');
const adminToast = document.getElementById('adminToast');

/* ==========================================================================
   1. UTILITIES: TOAST & FETCH WRAPPER
   ========================================================================== */
function showToast(message, isError = false) {
  if (!adminToast) return;
  adminToast.textContent = message;
  adminToast.className = isError ? 'admin-toast active error' : 'admin-toast active';
  setTimeout(() => {
    adminToast.className = 'admin-toast';
  }, 3500);
}

async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      // Session expired or invalid
      handleLogout('Session expired. Please log in again.');
      throw new Error(data.message || 'Unauthorized');
    }

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

/* ==========================================================================
   2. AUTHENTICATION & SESSION MANAGEMENT
   ========================================================================== */
async function checkAuthSession() {
  if (!state.token) {
    showAuthView();
    return;
  }

  try {
    const data = await apiFetch('/auth/me');
    if (data.success && data.admin) {
      state.user = data.admin;
      localStorage.setItem('profit_admin_user', JSON.stringify(data.admin));
      showDashboardView();
    } else {
      showAuthView();
    }
  } catch (err) {
    // If backend is offline or token invalid, show auth view
    showAuthView();
  }
}

function showAuthView() {
  authSection.classList.remove('hidden');
  dashboardSection.classList.add('hidden');
}

function showDashboardView() {
  authSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');

  if (adminUserName && state.user) {
    adminUserName.textContent = `${state.user.name} (${state.user.role.toUpperCase()})`;
  }

  loadMetrics();
  loadData();
}

function handleLogout(message = 'Logged out successfully.') {
  localStorage.removeItem('profit_admin_token');
  localStorage.removeItem('profit_admin_user');
  state.token = null;
  state.user = null;
  showAuthView();
  showToast(message);
}

if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginErrorMsg.classList.remove('active');

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      loginErrorMsg.textContent = 'Please enter both email and password.';
      loginErrorMsg.classList.add('active');
      return;
    }

    loginSubmitBtn.disabled = true;
    loginSubmitBtn.innerHTML = '<span>Verifying Credentials...</span>';

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      state.token = data.token;
      state.user = data.admin;
      localStorage.setItem('profit_admin_token', data.token);
      localStorage.setItem('profit_admin_user', JSON.stringify(data.admin));

      showToast(`Welcome back, ${data.admin.name}`);
      showDashboardView();
      adminLoginForm.reset();
    } catch (err) {
      loginErrorMsg.textContent = err.message || 'Failed to authenticate.';
      loginErrorMsg.classList.add('active');
    } finally {
      loginSubmitBtn.disabled = false;
      loginSubmitBtn.innerHTML = '<span>Sign In to Roster Desk</span><span class="btn-arrow" aria-hidden="true">→</span>';
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => handleLogout());
}

/* ==========================================================================
   3. KPI METRICS LOADER
   ========================================================================== */
async function loadMetrics() {
  try {
    const res = await apiFetch('/admin/metrics');
    if (!res.success || !res.data) return;

    const b = res.data.bookings || {};
    metricTotal.textContent = b.total || 0;
    metricPending.textContent = b.pending || 0;
    metricConfirmed.textContent = b.confirmed || 0;
    metricArchived.textContent = (b.cancelled || 0) + (b.completed || 0);
    metricArchivedMeta.textContent = `${b.cancelled || 0} Cancelled // ${b.completed || 0} Done`;
    metricMemberships.textContent = (res.data.memberships && res.data.memberships.total) || 0;
    metricContacts.textContent = (res.data.contacts && res.data.contacts.total) || 0;
  } catch (err) {
    console.warn('[Metrics Notice]', err.message);
  }
}

/* ==========================================================================
   4. DATA TABLE RENDERING & ACTIONS
   ========================================================================== */
async function loadData() {
  tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">Loading records...</td></tr>`;
  emptyState.classList.add('hidden');

  let endpoint = '';
  const queryParams = new URLSearchParams({
    page: state.page,
    limit: state.limit,
  });

  if (state.search) queryParams.append('search', state.search);
  if (state.status) queryParams.append('status', state.status);

  if (state.activeTab === 'bookings') {
    if (state.type) queryParams.append('type', state.type);
    endpoint = `/admin/bookings?${queryParams.toString()}`;
  } else if (state.activeTab === 'memberships') {
    endpoint = `/admin/memberships?${queryParams.toString()}`;
  } else if (state.activeTab === 'contacts') {
    endpoint = `/admin/contacts?${queryParams.toString()}`;
  }

  try {
    const res = await apiFetch(endpoint);
    state.records = res.data || [];
    state.pagination = res.pagination || { total: state.records.length, page: 1, limit: state.limit, totalPages: 1 };

    renderTable();
    updatePaginationUI();
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--status-cancelled);">Error loading records: ${err.message}</td></tr>`;
  }
}

function renderTable() {
  if (state.records.length === 0) {
    tableBody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  if (state.activeTab === 'bookings') {
    renderBookingsTable();
  } else if (state.activeTab === 'memberships') {
    renderMembershipsTable();
  } else if (state.activeTab === 'contacts') {
    renderContactsTable();
  }
}

function renderBookingsTable() {
  tableHead.innerHTML = `
    <tr>
      <th>Reference</th>
      <th>Athlete</th>
      <th>Contact</th>
      <th>Discipline / Pass</th>
      <th>Date & Slot</th>
      <th>Status</th>
      <th style="text-align: right;">Action</th>
    </tr>
  `;

  tableBody.innerHTML = state.records
    .map((item) => {
      const isTrial = item.type === 'trial_pass';
      return `
      <tr>
        <td>
          <span class="ref-badge">${item.bookingReference}</span>
          <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 3px;">
            ${new Date(item.createdAt).toLocaleDateString()}
          </div>
        </td>
        <td>
          <strong>${escapeHtml(item.fullName)}</strong>
          <span class="type-pill" style="margin-left: 6px;">${isTrial ? '7-Day Trial' : 'PT Session'}</span>
        </td>
        <td>
          <div>${escapeHtml(item.email)}</div>
          <div style="color: var(--color-text-secondary); font-size: 0.8rem;">${escapeHtml(item.phone)}</div>
        </td>
        <td>
          <div>${escapeHtml(item.program || '7-Day Pass')}</div>
          <div style="color: var(--color-text-muted); font-size: 0.76rem;">Coach: ${escapeHtml(item.trainer || 'Master Coach')}</div>
        </td>
        <td>
          <div><strong>${escapeHtml(item.date)}</strong></div>
          <div style="color: var(--color-text-secondary); font-size: 0.78rem;">${escapeHtml(item.time || '')}</div>
        </td>
        <td>
          <span class="status-badge ${item.status}">${item.status}</span>
        </td>
        <td style="text-align: right;">
          <div class="actions-cell" style="justify-content: flex-end;">
            ${
              item.status === 'Pending'
                ? `<button type="button" class="btn-action-icon btn-confirm-action" onclick="updateBookingStatus('${item._id}', 'Confirmed')" title="Confirm Booking">✓ Confirm</button>`
                : ''
            }
            ${
              item.status !== 'Cancelled'
                ? `<button type="button" class="btn-action-icon btn-cancel-action" onclick="updateBookingStatus('${item._id}', 'Cancelled')" title="Cancel Booking">✕</button>`
                : ''
            }
            <button type="button" class="btn-action-icon" onclick="viewRecordDetails('${item._id}')" title="View Full Info">Inspect</button>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');
}

function renderMembershipsTable() {
  tableHead.innerHTML = `
    <tr>
      <th>Reference</th>
      <th>Member Candidate</th>
      <th>Contact Info</th>
      <th>Selected Tier</th>
      <th>Contact Method</th>
      <th>Status</th>
      <th style="text-align: right;">Action</th>
    </tr>
  `;

  tableBody.innerHTML = state.records
    .map(
      (item) => `
    <tr>
      <td><span class="ref-badge">${item.reference}</span></td>
      <td><strong>${escapeHtml(item.fullName)}</strong></td>
      <td>
        <div>${escapeHtml(item.email)}</div>
        <div style="color: var(--color-text-secondary); font-size: 0.8rem;">${escapeHtml(item.phone)}</div>
      </td>
      <td><span class="type-pill" style="color: var(--color-lime);">${escapeHtml(item.tier)} Tier</span></td>
      <td>${escapeHtml(item.contactPreference || 'WhatsApp')}</td>
      <td><span class="status-badge ${item.status}">${item.status}</span></td>
      <td style="text-align: right;">
        <div class="actions-cell" style="justify-content: flex-end;">
          <button type="button" class="btn-action-icon btn-confirm-action" onclick="updateMembershipStatus('${item._id}', 'Enrolled')">Enroll</button>
          <button type="button" class="btn-action-icon" onclick="viewRecordDetails('${item._id}')">Inspect</button>
        </div>
      </td>
    </tr>
  `
    )
    .join('');
}

function renderContactsTable() {
  tableHead.innerHTML = `
    <tr>
      <th>Reference</th>
      <th>Sender</th>
      <th>Contact Info</th>
      <th>Objective</th>
      <th>Received</th>
      <th>Status</th>
      <th style="text-align: right;">Action</th>
    </tr>
  `;

  tableBody.innerHTML = state.records
    .map(
      (item) => `
    <tr>
      <td><span class="ref-badge">${item.reference}</span></td>
      <td><strong>${escapeHtml(item.fullName)}</strong></td>
      <td>
        <div>${escapeHtml(item.email)}</div>
        <div style="color: var(--color-text-secondary); font-size: 0.8rem;">${escapeHtml(item.phone)}</div>
      </td>
      <td>${escapeHtml(item.objective || 'General')}</td>
      <td>${new Date(item.createdAt).toLocaleDateString()}</td>
      <td><span class="status-badge ${item.status}">${item.status}</span></td>
      <td style="text-align: right;">
        <div class="actions-cell" style="justify-content: flex-end;">
          <button type="button" class="btn-action-icon btn-confirm-action" onclick="updateContactStatus('${item._id}', 'Replied')">Replied</button>
          <button type="button" class="btn-action-icon" onclick="viewRecordDetails('${item._id}')">Inspect</button>
        </div>
      </td>
    </tr>
  `
    )
    .join('');
}

/* ==========================================================================
   5. STATUS MUTATION ACTIONS (Exposed Globally)
   ========================================================================== */
window.updateBookingStatus = async function (id, status) {
  try {
    await apiFetch(`/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    showToast(`Booking marked as ${status}`);
    loadMetrics();
    loadData();
  } catch (err) {
    showToast(err.message, true);
  }
};

window.updateMembershipStatus = async function (id, status) {
  try {
    await apiFetch(`/admin/memberships/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    showToast(`Membership status updated to ${status}`);
    loadMetrics();
    loadData();
  } catch (err) {
    showToast(err.message, true);
  }
};

window.updateContactStatus = async function (id, status) {
  try {
    await apiFetch(`/admin/contacts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    showToast(`Contact status updated to ${status}`);
    loadMetrics();
    loadData();
  } catch (err) {
    showToast(err.message, true);
  }
};

window.viewRecordDetails = function (id) {
  const item = state.records.find((r) => r._id === id);
  if (!item) return;

  modalRecordTitle.textContent =
    item.bookingReference || item.reference || 'RECORD DETAILS';

  let html = '';
  if (state.activeTab === 'bookings') {
    html = `
      <div class="modal-detail-row"><span class="modal-detail-label">Athlete Name</span><span class="modal-detail-val">${escapeHtml(item.fullName)}</span></div>
      <div class="modal-detail-row"><span class="modal-detail-label">Email Address</span><span class="modal-detail-val">${escapeHtml(item.email)}</span></div>
      <div class="modal-detail-row"><span class="modal-detail-label">Phone Number</span><span class="modal-detail-val">${escapeHtml(item.phone)}</span></div>
      <div class="modal-detail-row"><span class="modal-detail-label">Booking Type</span><span class="modal-detail-val">${escapeHtml(item.type)}</span></div>
      <div class="modal-detail-row"><span class="modal-detail-label">Discipline / Program</span><span class="modal-detail-val">${escapeHtml(item.program)}</span></div>
      <div class="modal-detail-row"><span class="modal-detail-label">Assigned Coach</span><span class="modal-detail-val">${escapeHtml(item.trainer)}</span></div>
      <div class="modal-detail-row"><span class="modal-detail-label">Target Date & Slot</span><span class="modal-detail-val">${escapeHtml(item.date)} // ${escapeHtml(item.time || 'General')}</span></div>
      <div class="modal-detail-row"><span class="modal-detail-label">Status</span><span class="modal-detail-val"><span class="status-badge ${item.status}">${item.status}</span></span></div>
      <div class="modal-detail-row"><span class="modal-detail-label">Created At</span><span class="modal-detail-val">${new Date(item.createdAt).toLocaleString()}</span></div>
      
      <div style="margin-top: 1rem;">
        <span class="modal-detail-label">ATHLETE NOTES & INJURY BACKGROUND:</span>
        <div class="modal-notes-box">${escapeHtml(item.notes || 'No specific limitations noted.')}</div>
      </div>
    `;
  } else if (state.activeTab === 'memberships') {
    html = `
      <div class="modal-detail-row"><span class="modal-detail-label">Candidate Name</span><span class="modal-detail-val">${escapeHtml(item.fullName)}</span></div>
      <div class="modal-detail-row"><span class="modal-detail-label">Email</span><span class="modal-detail-val">${escapeHtml(item.email)}</span></div>
      <div class="modal-detail-row"><span class="modal-detail-label">Phone</span><span class="modal-detail-val">${escapeHtml(item.phone)}</span></div>
      <div class="modal-detail-row"><span class="modal-detail-label">Selected Tier</span><span class="modal-detail-val">${escapeHtml(item.tier)}</span></div>
      <div class="modal-detail-row"><span class="modal-detail-label">Preferred Contact</span><span class="modal-detail-val">${escapeHtml(item.contactPreference)}</span></div>
      <div class="modal-detail-row"><span class="modal-detail-label">Status</span><span class="modal-detail-val"><span class="status-badge ${item.status}">${item.status}</span></span></div>
      <div style="margin-top: 1rem;">
        <span class="modal-detail-label">LIFTING GOALS / START DATE:</span>
        <div class="modal-notes-box">${escapeHtml(item.notes || 'None provided.')}</div>
      </div>
    `;
  } else {
    html = `
      <div class="modal-detail-row"><span class="modal-detail-label">Sender</span><span class="modal-detail-val">${escapeHtml(item.fullName)}</span></div>
      <div class="modal-detail-row"><span class="modal-detail-label">Email</span><span class="modal-detail-val">${escapeHtml(item.email)}</span></div>
      <div class="modal-detail-row"><span class="modal-detail-label">Phone</span><span class="modal-detail-val">${escapeHtml(item.phone)}</span></div>
      <div class="modal-detail-row"><span class="modal-detail-label">Objective</span><span class="modal-detail-val">${escapeHtml(item.objective)}</span></div>
      <div class="modal-detail-row"><span class="modal-detail-label">Status</span><span class="modal-detail-val"><span class="status-badge ${item.status}">${item.status}</span></span></div>
      <div style="margin-top: 1rem;">
        <span class="modal-detail-label">MESSAGE DISPATCH:</span>
        <div class="modal-notes-box">${escapeHtml(item.message || 'No message content.')}</div>
      </div>
    `;
  }

  modalDetailsContent.innerHTML = html;
  detailModal.classList.add('active');
};

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => detailModal.classList.remove('active'));
}

if (detailModal) {
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) detailModal.classList.remove('active');
  });
}

/* ==========================================================================
   6. TABS, SEARCH, FILTERS & PAGINATION
   ========================================================================== */
tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.activeTab = btn.getAttribute('data-tab');
    state.page = 1;

    // Toggle typeFilter visibility (only relevant on bookings tab)
    if (typeFilter) {
      typeFilter.style.display = state.activeTab === 'bookings' ? 'inline-block' : 'none';
    }

    loadData();
  });
});

let debounceTimer = null;
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.search = e.target.value.trim();
      state.page = 1;
      loadData();
    }, 350);
  });
}

if (statusFilter) {
  statusFilter.addEventListener('change', (e) => {
    state.status = e.target.value;
    state.page = 1;
    loadData();
  });
}

if (typeFilter) {
  typeFilter.addEventListener('change', (e) => {
    state.type = e.target.value;
    state.page = 1;
    loadData();
  });
}

if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    loadMetrics();
    loadData();
    showToast('Roster data refreshed.');
  });
}

function updatePaginationUI() {
  if (!state.pagination) return;
  const { total, page, totalPages } = state.pagination;
  paginationInfo.textContent = `Showing page ${page} of ${totalPages} (${total} total records)`;
  prevPageBtn.disabled = page <= 1;
  nextPageBtn.disabled = page >= totalPages;
}

if (prevPageBtn) {
  prevPageBtn.addEventListener('click', () => {
    if (state.page > 1) {
      state.page--;
      loadData();
    }
  });
}

if (nextPageBtn) {
  nextPageBtn.addEventListener('click', () => {
    if (state.pagination && state.page < state.pagination.totalPages) {
      state.page++;
      loadData();
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  checkAuthSession();
});
