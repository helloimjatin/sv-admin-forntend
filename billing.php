<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>SehatVaani Billing Management</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700&amp;family=JetBrains+Mono:wght@400&amp;family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
    <script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "surface-container-highest": "#d3e4fe",
                      "primary-fixed": "#bae6fd",
                      "inverse-on-surface": "#eaf1ff",
                      "background": "#f8f9ff",
                      "surface-tint": "#0ea5e9",
                      "surface-dim": "#cbdbf5",
                      "primary-fixed-dim": "#7dd3fc",
                      "secondary": "#50625d",
                      "inverse-primary": "#7dd3fc",
                      "inverse-surface": "#213145",
                      "secondary-fixed": "#d3e7e0",
                      "on-error-container": "#93000a",
                      "on-error": "#ffffff",
                      "on-secondary-fixed": "#0d1f1b",
                      "primary": "#0ea5e9",
                      "secondary-fixed-dim": "#b7cbc4",
                      "on-primary-fixed": "#082f49",
                      "on-tertiary-container": "#fffbff",
                      "on-primary-container": "#f0f9ff",
                      "on-surface-variant": "#3d4943",
                      "on-secondary": "#ffffff",
                      "outline": "#6d7a73",
                      "secondary-container": "#d3e7e0",
                      "error-container": "#ffdad6",
                      "on-secondary-container": "#566863",
                      "surface-container-low": "#eff4ff",
                      "on-secondary-fixed-variant": "#394a45",
                      "on-tertiary-fixed": "#2a1700",
                      "on-primary": "#ffffff",
                      "tertiary": "#825100",
                      "on-tertiary": "#ffffff",
                      "surface": "#f8f9ff",
                      "on-tertiary-fixed-variant": "#653e00",
                      "on-background": "#0b1c30",
                      "primary-container": "#0ea5e9",
                      "on-surface": "#0b1c30",
                      "surface-container": "#e5eeff",
                      "outline-variant": "#bccac1",
                      "on-primary-fixed-variant": "#075985",
                      "tertiary-fixed-dim": "#ffb95f",
                      "surface-variant": "#d3e4fe",
                      "surface-container-lowest": "#ffffff",
                      "surface-container-high": "#dce9ff",
                      "tertiary-container": "#a36700",
                      "error": "#ba1a1a",
                      "surface-bright": "#f8f9ff",
                      "tertiary-fixed": "#ffddb8"
              },
              "borderRadius": {
                      "DEFAULT": "0.25rem",
                      "lg": "0.5rem",
                      "xl": "0.75rem",
                      "full": "9999px"
              },
              "spacing": {
                      "base": "8px",
                      "gutter": "16px",
                      "stack-md": "12px",
                      "stack-sm": "4px",
                      "container-padding": "24px",
                      "stack-lg": "24px"
              },
              "fontFamily": {
                      "body-md": ["Hanken Grotesk"],
                      "data-mono": ["JetBrains Mono"],
                      "label-sm": ["Hanken Grotesk"],
                      "body-lg": ["Hanken Grotesk"],
                      "display-lg": ["Hanken Grotesk"],
                      "headline-md": ["Hanken Grotesk"],
                      "title-sm": ["Hanken Grotesk"]
              },
              "fontSize": {
                      "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                      "data-mono": ["13px", { "lineHeight": "18px", "fontWeight": "400" }],
                      "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }],
                      "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                      "display-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                      "headline-md": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
                      "title-sm": ["18px", { "lineHeight": "24px", "fontWeight": "600" }]
              }
            }
          }
        }
    </script>
    <style>
        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-feature-settings: 'liga';
            -webkit-font-smoothing: antialiased;
        }
        .stat-card {
            position: relative;
            overflow: hidden;
            transition: all 0.2s ease;
        }
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.10);
        }
        .stat-card .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            flex-shrink: 0;
        }
        .stat-shimmer {
            background: linear-gradient(90deg, transparent 25%, rgba(14,165,233,0.08) 50%, transparent 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    </style>
</head>
<body class="bg-secondary-fixed min-h-screen flex flex-col dark:bg-inverse-surface">
    <!-- Container -->
    <div class="flex h-screen bg-background dark:bg-inverse-surface">
        <!-- Sidebar -->
        <aside class="w-64 bg-surface-container-low dark:bg-surface-dim border-r border-outline-variant flex flex-col p-6 overflow-y-auto">
            <div class="flex flex-col gap-base mb-8">
                <img alt="SehatVaani Logo" class="h-10 w-auto object-contain mr-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWQldk6JtoE4LIjgZKnXi5tieh7nwkCU3pRJ8zXXLOgMeDepRf2Ea4aeSyE-jHqme1z_KeX0v3FjucVBrrgSahEOAl6DkfhIOi9K5OzU1yPUJHMMt-wRbnV2CPASElg4QAmCVyFxOhC8-yqxqHijOJptDp0PgWE2_1JsGS_beRCyXlE4C2-prbkeVxbV3ypUqFWssWKp2922rpnx48I669LM6O8WtI-0r_pBXqE5ZI-VhSMBhTy4QPDBFQVNa6Ka6SibhS-a4f09yd"/>
                <span class="text-on-surface-variant font-body-md text-body-md mt-2">Healthcare Management</span>
            </div>
            <a href="new_user.php" class="bg-primary text-on-primary font-label-sm text-label-sm px-4 py-3 rounded-lg w-full mb-6 hover:bg-primary-container transition-colors flex justify-center items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">add</span> New Entry
            </a>
            <nav class="flex flex-col gap-2 flex-1">
                <a class="text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low p-3 rounded-lg flex items-center gap-3 hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all" href="dashboard.php">
                    <span class="material-symbols-outlined" data-icon="dashboard">dashboard</span> Overview
                </a>
                <a class="text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low p-3 rounded-lg flex items-center gap-3 hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all" href="medical_records.php">
                    <span class="material-symbols-outlined" data-icon="clinical_notes">clinical_notes</span> Medical Records
                </a>
                <a class="text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low p-3 rounded-lg flex items-center gap-3 hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all" href="staff.php">
                    <span class="material-symbols-outlined" data-icon="group">group</span> Staff Directory
                </a>
                <a class="bg-primary-fixed dark:bg-primary-container text-on-primary-fixed dark:text-on-primary-container rounded-lg p-3 flex items-center gap-3 Active: scale-[0.98] transition-transform" href="billing.php">
                    <span class="material-symbols-outlined" data-icon="payments">payments</span> Billing
                </a>
                <a class="text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low p-3 rounded-lg flex items-center gap-3 hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all" href="profile.php">
                    <span class="material-symbols-outlined" data-icon="settings">settings</span> Settings
                </a>
            </nav>
            <div class="mt-auto flex flex-col gap-2">
                <a class="text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low p-3 rounded-lg flex items-center gap-3 hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all" href="#">
                    <span class="material-symbols-outlined" data-icon="help">help</span> Help Center
                </a>
                <a class="text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low p-3 rounded-lg flex items-center gap-3 hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all" href="backend/logout.php">
                    <span class="material-symbols-outlined" data-icon="logout">logout</span> Log Out
                </a>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 overflow-y-auto p-container-padding flex flex-col gap-stack-lg">
            <div class="flex justify-between items-center">
                <h1 class="font-display-lg text-display-lg text-on-surface">Billing Overview</h1>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                <!-- Total Revenue -->
                <div class="stat-card bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-container-padding flex items-start gap-3">
                    <div class="stat-icon bg-emerald-100 text-emerald-700"><span class="material-symbols-outlined">currency_rupee</span></div>
                    <div class="flex flex-col gap-stack-sm">
                        <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Total Revenue</span>
                        <span id="stat-total-revenue" class="font-display-lg text-display-lg text-emerald-700 stat-shimmer" style="min-width:48px;min-height:40px;border-radius:6px;">--</span>
                    </div>
                </div>

                <!-- Successful Payments -->
                <div class="stat-card bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-container-padding flex items-start gap-3">
                    <div class="stat-icon bg-green-100 text-green-700"><span class="material-symbols-outlined">check_circle</span></div>
                    <div class="flex flex-col gap-stack-sm">
                        <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Successful Payments</span>
                        <span id="stat-successful-count" class="font-display-lg text-display-lg text-green-700 stat-shimmer" style="min-width:48px;min-height:40px;border-radius:6px;">--</span>
                    </div>
                </div>

                <!-- Pending Settlements -->
                <div class="stat-card bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-container-padding flex items-start gap-3">
                    <div class="stat-icon bg-amber-100 text-amber-700"><span class="material-symbols-outlined">hourglass_empty</span></div>
                    <div class="flex flex-col gap-stack-sm">
                        <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Pending Settlements</span>
                        <span id="stat-pending-count" class="font-display-lg text-display-lg text-amber-700 stat-shimmer" style="min-width:48px;min-height:40px;border-radius:6px;">--</span>
                    </div>
                </div>

                <!-- Failed Payments -->
                <div class="stat-card bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-container-padding flex items-start gap-3">
                    <div class="stat-icon bg-error-container text-on-error-container"><span class="material-symbols-outlined">error</span></div>
                    <div class="flex flex-col gap-stack-sm">
                        <span class="font-label-sm text-label-sm text-error uppercase tracking-wide">Failed Payments</span>
                        <span id="stat-failed-count" class="font-display-lg text-display-lg text-error stat-shimmer" style="min-width:48px;min-height:40px;border-radius:6px;">--</span>
                    </div>
                </div>
            </div>

            <!-- Transaction Ledger Section -->
            <div class="bg-surface-container-lowest border border-outline-variant/50 rounded-lg flex flex-col">
                <div class="p-container-padding border-b border-outline-variant/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-gutter">
                    <h2 class="font-title-sm text-title-sm text-on-surface">Transaction Ledger</h2>
                    <div class="flex flex-col md:flex-row gap-gutter w-full md:w-auto">
                        <div class="relative w-full md:w-64">
                            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                            <input id="search-input" class="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" placeholder="Search transactions..." type="text"/>
                        </div>
                        <button id="search-btn" class="bg-primary text-on-primary font-label-sm text-label-sm px-6 py-2 rounded-lg hover:bg-primary-container transition-colors shrink-0">Search</button>
                    </div>
                </div>
                
                <!-- Filter Tabs -->
                <div class="p-container-padding flex gap-base flex-wrap">
                    <button class="filter-btn bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-4 py-1.5 rounded-full border border-primary-fixed" data-filter="all">All</button>
                    <button class="filter-btn bg-surface text-on-surface-variant font-label-sm text-label-sm px-4 py-1.5 rounded-full border border-outline-variant hover:bg-surface-container transition-colors" data-filter="captured">Captured</button>
                    <button class="filter-btn bg-surface text-on-surface-variant font-label-sm text-label-sm px-4 py-1.5 rounded-full border border-outline-variant hover:bg-surface-container transition-colors" data-filter="pending">Pending</button>
                    <button class="filter-btn bg-surface text-on-surface-variant font-label-sm text-label-sm px-4 py-1.5 rounded-full border border-outline-variant hover:bg-surface-container transition-colors" data-filter="failed">Failed</button>
                </div>

                <!-- Table -->
                <div class="w-full overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-surface-container-low border-y border-outline-variant/50">
                                <th class="p-4 font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">Transaction ID</th>
                                <th class="p-4 font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">Customer</th>
                                <th class="p-4 font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">Amount</th>
                                <th class="p-4 font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">Method</th>
                                <th class="p-4 font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">Status</th>
                                <th class="p-4 font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">Date</th>
                            </tr>
                        </thead>
                        <tbody id="payments-tbody" class="font-body-md text-body-md text-on-surface">
                            <tr>
                                <td colspan="6" class="p-8 text-center text-on-surface-variant">
                                    <span class="material-symbols-outlined text-[32px] mb-2 block animate-spin">hourglass_empty</span>
                                    Loading transactions...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>

    <script>
        const API_URL = '/api/get_payments.php?api_key=sehat_live_2026_secure_key';
        let allPayments = [];
        let currentFilter = 'all';

        // --- Utility Functions ---
        function escapeHtml(text) {
            if (text === null || text === undefined) return '--';
            const div = document.createElement('div');
            div.textContent = String(text);
            return div.innerHTML;
        }

        function formatDate(dateStr) {
            if (!dateStr) return '--';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '--';
            return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        }

        function formatCurrency(amount) {
            const numericAmount = parseFloat(amount);
            if (isNaN(numericAmount)) return '₹0.00';
            return '₹' + numericAmount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        function getStatusBadge(status) {
            const normalized = (status || '').toLowerCase();
            if (normalized === 'captured' || normalized === 'completed' || normalized === 'success') {
                return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    <span class="w-1.5 h-1.5 mr-1 bg-green-600 rounded-full"></span>Captured
                </span>`;
            } else if (normalized === 'pending') {
                return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                    <span class="w-1.5 h-1.5 mr-1 bg-orange-500 rounded-full"></span>Pending
                </span>`;
            } else {
                return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                    <span class="w-1.5 h-1.5 mr-1 bg-red-600 rounded-full"></span>${escapeHtml(status || 'Failed')}
                </span>`;
            }
        }

        // --- Render functions ---
        function renderPayments(payments) {
            const tbody = document.getElementById('payments-tbody');

            if (!payments || payments.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-on-surface-variant">
                    <span class="material-symbols-outlined text-[32px] mb-2 block">payments</span>
                    No transactions found.</td></tr>`;
                return;
            }

            tbody.innerHTML = payments.map(payment => {
                const transId = payment.transaction_id || ('#' + payment.id);
                const customer = payment.customer_name || 'Unknown User';
                const amountStr = formatCurrency(payment.amount);
                const method = payment.payment_method ? payment.payment_method.toUpperCase() : 'N/A';
                const statusBadge = getStatusBadge(payment.status);
                const dateStr = formatDate(payment.payment_date);

                return `<tr class="border-b border-outline-variant/30 hover:bg-surface-container-lowest transition-colors h-12">
                    <td class="p-4 font-data-mono text-data-mono text-primary font-semibold">${escapeHtml(transId)}</td>
                    <td class="p-4 font-semibold">${escapeHtml(customer)}</td>
                    <td class="p-4 font-data-mono">${escapeHtml(amountStr)}</td>
                    <td class="p-4"><span class="inline-flex items-center px-2 py-0.5 rounded bg-surface border border-outline-variant/50 text-[11px] font-bold uppercase text-on-surface-variant">${escapeHtml(method)}</span></td>
                    <td class="p-4">${statusBadge}</td>
                    <td class="p-4 text-on-surface-variant">${dateStr}</td>
                </tr>`;
            }).join('');
        }

        function updateStats(payments) {
            let totalRevenue = 0;
            let successfulCount = 0;
            let pendingCount = 0;
            let failedCount = 0;

            payments.forEach(p => {
                const status = (p.status || '').toLowerCase();
                const amount = parseFloat(p.amount) || 0;
                if (status === 'captured' || status === 'completed' || status === 'success') {
                    totalRevenue += amount;
                    successfulCount++;
                } else if (status === 'pending') {
                    pendingCount++;
                } else if (status === 'failed') {
                    failedCount++;
                }
            });

            const elRevenue = document.getElementById('stat-total-revenue');
            const elSuccessful = document.getElementById('stat-successful-count');
            const elPending = document.getElementById('stat-pending-count');
            const elFailed = document.getElementById('stat-failed-count');

            if (elRevenue) {
                elRevenue.classList.remove('stat-shimmer');
                elRevenue.style.minWidth = '';
                elRevenue.style.minHeight = '';
                elRevenue.textContent = formatCurrency(totalRevenue);
            }
            if (elSuccessful) {
                elSuccessful.classList.remove('stat-shimmer');
                elSuccessful.style.minWidth = '';
                elSuccessful.style.minHeight = '';
                elSuccessful.textContent = successfulCount.toString();
            }
            if (elPending) {
                elPending.classList.remove('stat-shimmer');
                elPending.style.minWidth = '';
                elPending.style.minHeight = '';
                elPending.textContent = pendingCount.toString();
            }
            if (elFailed) {
                elFailed.classList.remove('stat-shimmer');
                elFailed.style.minWidth = '';
                elFailed.style.minHeight = '';
                elFailed.textContent = failedCount.toString();
            }
        }

        // --- Filter logic ---
        function applyFilter(filter, searchTerm) {
            let filtered = allPayments;

            // Filter by status
            if (filter === 'captured') {
                filtered = filtered.filter(p => {
                    const status = (p.status || '').toLowerCase();
                    return status === 'captured' || status === 'completed' || status === 'success';
                });
            } else if (filter === 'pending') {
                filtered = filtered.filter(p => (p.status || '').toLowerCase() === 'pending');
            } else if (filter === 'failed') {
                filtered = filtered.filter(p => (p.status || '').toLowerCase() === 'failed');
            }

            // Filter by search term
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                filtered = filtered.filter(p => {
                    const custName = (p.customer_name || '').toLowerCase();
                    const txId = (p.transaction_id || '').toLowerCase();
                    const dbId = String(p.id || '');
                    return custName.includes(term) || txId.includes(term) || dbId.includes(term);
                });
            }

            renderPayments(filtered);
        }

        function handleLoadError(error) {
            console.error('Failed to load payments:', error);
            
            document.getElementById('payments-tbody').innerHTML = `<tr><td colspan="6" class="p-8 text-center text-error">
                <span class="material-symbols-outlined text-[32px] mb-2 block">error</span>
                Failed to load transactions: ${escapeHtml(error.message)}</td></tr>`;
                
            ['stat-total-revenue', 'stat-successful-count', 'stat-pending-count', 'stat-failed-count'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.classList.remove('stat-shimmer');
                    el.style.minWidth = '';
                    el.style.minHeight = '';
                    el.textContent = '!';
                    el.title = 'Failed to load: ' + error.message;
                }
            });
        }

        // --- Fetch payments from API ---
        async function loadPayments() {
            try {
                const response = await fetch(API_URL);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const json = await response.json();

                if (json.status !== 'success') {
                    throw new Error(json.message || 'API returned an error');
                }

                allPayments = json.data || [];
                updateStats(allPayments);
                applyFilter(currentFilter, document.getElementById('search-input').value);

            } catch (error) {
                handleLoadError(error);
            }
        }

        // --- Event Listeners ---
        document.addEventListener('DOMContentLoaded', () => {
            loadPayments();

            // Filter buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    currentFilter = btn.dataset.filter;
                    // Update active button styles
                    document.querySelectorAll('.filter-btn').forEach(b => {
                        b.className = 'filter-btn bg-surface text-on-surface-variant font-label-sm text-label-sm px-4 py-1.5 rounded-full border border-outline-variant hover:bg-surface-container transition-colors';
                    });
                    btn.className = 'filter-btn bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-4 py-1.5 rounded-full border border-primary-fixed';

                    applyFilter(currentFilter, document.getElementById('search-input').value);
                });
            });

            // Search buttons
            document.getElementById('search-btn').addEventListener('click', () => {
                applyFilter(currentFilter, document.getElementById('search-input').value);
            });
            document.getElementById('search-input').addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    applyFilter(currentFilter, e.target.value);
                }
            });
        });
    </script>
</body>
</html>
