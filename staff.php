<?php
require_once 'backend/check_role.php';
hasAccess(['Super Admin']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>SehatVaani - Staff Directory</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700&amp;family=JetBrains+Mono:wght@400&amp;family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
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
    </style>
</head>
<body class="bg-secondary-fixed min-h-screen flex flex-col dark:bg-inverse-surface font-body-md text-on-background">
    <!-- Container -->
    <div class="flex h-screen bg-background dark:bg-inverse-surface w-full overflow-hidden">
        <!-- Sidebar -->
        <aside class="w-64 bg-surface-container-low dark:bg-surface-dim border-r border-outline-variant flex flex-col p-6 overflow-y-auto shrink-0">
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
                <a class="bg-primary-fixed dark:bg-primary-container text-on-primary-fixed dark:text-on-primary-container rounded-lg p-3 flex items-center gap-3 Active: scale-[0.98] transition-transform" href="staff.php">
                    <span class="material-symbols-outlined" data-icon="group">group</span> Staff Directory
                </a>
                <a class="text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low p-3 rounded-lg flex items-center gap-3 hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all" href="billing.php">
                    <span class="material-symbols-outlined" data-icon="payments">payments</span> Billing
                </a>
                <a class="text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low p-3 rounded-lg flex items-center gap-3 hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all" href="subscriptions.php">
                    <span class="material-symbols-outlined" data-icon="card_membership">card_membership</span> Subscriptions
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
        <main class="flex-1 min-w-0 overflow-y-auto p-container-padding flex flex-col gap-stack-lg">
            <div class="flex justify-between items-center">
                <h1 class="font-display-lg text-display-lg text-on-surface">Staff Directory</h1>
                <button onclick="openAddStaffModal()" class="bg-primary text-on-primary font-label-sm text-label-sm px-4 py-2.5 rounded-lg hover:bg-primary-container transition-colors flex items-center gap-2 font-semibold shadow-sm active:scale-[0.98]">
                    <span class="material-symbols-outlined text-[18px]">person_add</span> Add New Staff Member
                </button>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                <!-- Total Staff -->
                <div class="stat-card bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-container-padding flex items-start gap-3">
                    <div class="stat-icon bg-primary-fixed text-on-primary-fixed"><span class="material-symbols-outlined">group</span></div>
                    <div class="flex flex-col gap-stack-sm">
                        <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Total Staff</span>
                        <span id="stat-total" class="font-display-lg text-display-lg text-primary stat-shimmer" style="min-width:48px;min-height:40px;border-radius:6px;">--</span>
                    </div>
                </div>

                <!-- Admin Staff -->
                <div class="stat-card bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-container-padding flex items-start gap-3">
                    <div class="stat-icon bg-purple-100 text-purple-700"><span class="material-symbols-outlined">shield_person</span></div>
                    <div class="flex flex-col gap-stack-sm">
                        <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Admins</span>
                        <span id="stat-admins" class="font-display-lg text-display-lg text-purple-700 stat-shimmer" style="min-width:48px;min-height:40px;border-radius:6px;">--</span>
                    </div>
                </div>

                <!-- Moderator Staff -->
                <div class="stat-card bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-container-padding flex items-start gap-3">
                    <div class="stat-icon bg-blue-100 text-blue-700"><span class="material-symbols-outlined">manage_accounts</span></div>
                    <div class="flex flex-col gap-stack-sm">
                        <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Moderators</span>
                        <span id="stat-moderators" class="font-display-lg text-display-lg text-blue-700 stat-shimmer" style="min-width:48px;min-height:40px;border-radius:6px;">--</span>
                    </div>
                </div>

                <!-- Support Staff -->
                <div class="stat-card bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-container-padding flex items-start gap-3">
                    <div class="stat-icon bg-teal-100 text-teal-700"><span class="material-symbols-outlined">support_agent</span></div>
                    <div class="flex flex-col gap-stack-sm">
                        <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Support</span>
                        <span id="stat-support" class="font-display-lg text-display-lg text-teal-700 stat-shimmer" style="min-width:48px;min-height:40px;border-radius:6px;">--</span>
                    </div>
                </div>
            </div>

            <!-- Ledger Section -->
            <div class="bg-surface-container-lowest border border-outline-variant/50 rounded-lg flex flex-col">
                <div class="p-container-padding border-b border-outline-variant/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-gutter">
                    <h2 class="font-title-sm text-title-sm text-on-surface">Administrative Access Controls</h2>
                    <div class="flex flex-col md:flex-row gap-gutter w-full md:w-auto">
                        <div class="relative w-full md:w-64">
                            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                            <input id="search-input" class="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" placeholder="Search staff members..." type="text"/>
                        </div>
                        <button id="search-btn" class="bg-primary text-on-primary font-label-sm text-label-sm px-6 py-2 rounded-lg hover:bg-primary-container transition-colors shrink-0 font-semibold">Search</button>
                    </div>
                </div>

                <!-- Filters -->
                <div class="p-container-padding flex gap-base flex-wrap border-b border-outline-variant/30">
                    <button class="filter-btn bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-4 py-1.5 rounded-full border border-primary-fixed transition-all" data-filter="all">All Roles</button>
                    <button class="filter-btn bg-surface text-on-surface-variant font-label-sm text-label-sm px-4 py-1.5 rounded-full border border-outline-variant hover:bg-surface-container transition-colors" data-filter="admin">Admins</button>
                    <button class="filter-btn bg-surface text-on-surface-variant font-label-sm text-label-sm px-4 py-1.5 rounded-full border border-outline-variant hover:bg-surface-container transition-colors" data-filter="moderator">Moderators</button>
                    <button class="filter-btn bg-surface text-on-surface-variant font-label-sm text-label-sm px-4 py-1.5 rounded-full border border-outline-variant hover:bg-surface-container transition-colors" data-filter="support">Support</button>
                </div>

                <!-- Table -->
                <div class="w-full overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-surface-container-low border-y border-outline-variant/50">
                                <th class="p-4 font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">Name</th>
                                <th class="p-4 font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">Email</th>
                                <th class="p-4 font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">Role</th>
                                <th class="p-4 font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">Last Login</th>
                                <th class="p-4 font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="staff-tbody" class="font-body-md text-body-md text-on-surface">
                            <tr>
                                <td colspan="5" class="p-8 text-center text-on-surface-variant">
                                    <span class="material-symbols-outlined text-[32px] mb-2 block animate-spin">hourglass_empty</span>
                                    Loading staff members...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>

    <!-- Add/Edit Staff Modal -->
    <div id="staff-modal" class="fixed inset-0 z-50 flex items-center justify-center hidden bg-black/50 backdrop-blur-sm transition-opacity duration-300">
        <div class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant rounded-xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden scale-95 transition-transform duration-300">
            <!-- Modal Header -->
            <div class="flex justify-between items-center p-6 border-b border-outline-variant/50 bg-surface-container-low dark:bg-surface-dim">
                <h3 class="font-headline-md text-headline-md text-on-surface" id="modal-title">Add New Staff Member</h3>
                <button onclick="closeStaffModal()" class="text-on-surface-variant hover:text-on-surface bg-surface hover:bg-surface-container rounded-full p-2 transition-colors focus:outline-none">
                    <span class="material-symbols-outlined text-[20px]">close</span>
                </button>
            </div>
            <!-- Modal Body -->
            <form id="staff-form" onsubmit="handleStaffSubmit(event)" class="p-6 flex flex-col gap-4">
                <input type="hidden" id="staff-id" />
                
                <div class="flex flex-col gap-stack-sm">
                    <label for="staff-name" class="font-label-sm text-label-sm text-on-surface-variant font-semibold">Full Name</label>
                    <input type="text" id="staff-name" required class="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Dr. Jane Smith" />
                </div>

                <div class="flex flex-col gap-stack-sm">
                    <label for="staff-username" class="font-label-sm text-label-sm text-on-surface-variant font-semibold">Username</label>
                    <input type="text" id="staff-username" required class="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" placeholder="e.g. dr.janesmith" />
                </div>

                <div class="flex flex-col gap-stack-sm">
                    <label for="staff-email" class="font-label-sm text-label-sm text-on-surface-variant font-semibold">Email Address</label>
                    <input type="email" id="staff-email" required class="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" placeholder="e.g. janesmith@sehatvaani.com" />
                </div>

                <div class="flex flex-col gap-stack-sm">
                    <label for="staff-role" class="font-label-sm text-label-sm text-on-surface-variant font-semibold">Role</label>
                    <select id="staff-role" required class="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors">
                        <option value="2">Admin</option>
                        <option value="4">Moderator</option>
                        <option value="3">Support</option>
                    </select>
                </div>

                <div class="flex flex-col gap-stack-sm" id="password-field-container">
                    <label for="staff-password" class="font-label-sm text-label-sm text-on-surface-variant font-semibold">Password</label>
                    <input type="password" id="staff-password" class="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" placeholder="Enter secure password" />
                </div>
                
                <!-- Modal Footer -->
                <div class="flex justify-end gap-3 mt-4 border-t border-outline-variant/30 pt-4">
                    <button type="button" onclick="closeStaffModal()" class="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-6 py-2.5 rounded-lg hover:bg-secondary-fixed-dim transition-colors">Cancel</button>
                    <button type="submit" class="bg-primary text-on-primary font-label-sm text-label-sm px-6 py-2.5 rounded-lg hover:bg-primary-container transition-colors font-semibold" id="submit-btn">Save Member</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Custom Confirmation Modal -->
    <div id="confirm-modal" class="fixed inset-0 z-50 flex items-center justify-center hidden bg-black/50 backdrop-blur-sm transition-opacity duration-300">
        <div class="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant rounded-xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden scale-95 transition-transform duration-300 p-6 gap-4">
            <div class="flex items-center gap-3 text-error">
                <span class="material-symbols-outlined text-[32px]">warning</span>
                <h3 class="font-title-sm text-title-sm text-on-surface font-semibold">Confirm Deletion</h3>
            </div>
            <p class="text-body-md text-on-surface-variant leading-relaxed">
                Are you sure you want to delete <span id="confirm-staff-name" class="font-bold text-on-surface"></span> from the Staff Directory? This access credential will be permanently deactivated.
            </p>
            <div class="flex justify-end gap-3 mt-2">
                <button onclick="closeConfirmModal()" class="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-5 py-2 rounded-lg hover:bg-secondary-fixed-dim transition-colors">Cancel</button>
                <button id="confirm-delete-btn" class="bg-error text-on-error font-label-sm text-label-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity font-semibold">Delete</button>
            </div>
        </div>
    </div>

    <!-- Toast Notification Container -->
    <div id="toast-container" class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"></div>

    <script>
        const API_URL = 'api/get_staff.php?api_key=sehat_live_2026_secure_key';
        let allStaff = [];
        let currentFilter = 'all';
        let deleteTargetId = null;

        // --- Utility Functions ---
        function getRoleIdByName(roleName) {
            const normalized = (roleName || '').toLowerCase();
            if (normalized === 'admin') return '2';
            if (normalized === 'content manager' || normalized === 'moderator') return '4';
            if (normalized === 'support agent' || normalized === 'support') return '3';
            return '2';
        }

        function escapeHtml(text) {
            if (text === null || text === undefined) return '--';
            const div = document.createElement('div');
            div.textContent = String(text);
            return div.innerHTML;
        }

        function formatLastLogin(dateStr) {
            if (!dateStr || dateStr === '0000-00-00 00:00:00') return 'Never';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return 'Never';
            
            const datePart = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
            const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            return `${datePart} at ${timePart}`;
        }

        function getRoleBadge(role) {
            const normalized = (role || '').toLowerCase();
            if (normalized === 'admin') {
                return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                    <span class="w-1.5 h-1.5 mr-1 bg-purple-600 rounded-full"></span>Admin
                </span>`;
            } else if (normalized === 'moderator' || normalized === 'content manager') {
                return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    <span class="w-1.5 h-1.5 mr-1 bg-blue-600 rounded-full"></span>Moderator
                </span>`;
            } else if (normalized === 'support' || normalized === 'support agent') {
                return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400">
                    <span class="w-1.5 h-1.5 mr-1 bg-teal-600 rounded-full"></span>Support
                </span>`;
            } else {
                return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-variant text-on-surface-variant dark:bg-surface-dim">
                    <span class="w-1.5 h-1.5 mr-1 bg-outline rounded-full"></span>${escapeHtml(role || 'Staff')}
                </span>`;
            }
        }

        // --- Toast System ---
        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `px-4 py-3 rounded-lg shadow-lg text-white font-semibold transition-all duration-300 transform translate-y-10 opacity-0 pointer-events-auto flex items-center gap-2 ${
                type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-primary'
            }`;
            
            const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';
            toast.innerHTML = `
                <span class="material-symbols-outlined text-[20px]">${icon}</span>
                <span>${escapeHtml(message)}</span>
            `;
            
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.remove('translate-y-10', 'opacity-0');
            }, 10);
            
            setTimeout(() => {
                toast.classList.add('translate-y-10', 'opacity-0');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 3000);
        }

        // --- Render Functions ---
        function renderStaff(staffList) {
            const tbody = document.getElementById('staff-tbody');

            if (!staffList || staffList.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-on-surface-variant">
                    <span class="material-symbols-outlined text-[32px] mb-2 block">group_off</span>
                    No staff members found.</td></tr>`;
                return;
            }

            tbody.innerHTML = staffList.map(member => {
                const name = member.name || 'N/A';
                const email = member.email || 'N/A';
                const roleBadge = getRoleBadge(member.role);
                const lastLoginStr = formatLastLogin(member.last_login);

                return `<tr class="border-b border-outline-variant/30 hover:bg-surface-container-lowest transition-colors h-12">
                    <td class="p-4 font-semibold">${escapeHtml(name)}</td>
                    <td class="p-4 font-data-mono text-data-mono text-on-surface-variant">${escapeHtml(email)}</td>
                    <td class="p-4">${roleBadge}</td>
                    <td class="p-4 text-on-surface-variant font-data-mono text-xs">${lastLoginStr}</td>
                    <td class="p-4 text-right">
                        <button onclick="openEditStaffModal(${member.id})" class="text-primary hover:text-primary-container font-label-sm text-label-sm font-semibold transition-colors mr-3 inline-flex items-center gap-1 focus:outline-none">
                            <span class="material-symbols-outlined text-[16px]">edit</span> Edit
                        </button>
                        <button onclick="triggerDeleteStaff(${member.id})" class="text-error hover:opacity-80 font-label-sm text-label-sm font-semibold transition-all inline-flex items-center gap-1 focus:outline-none">
                            <span class="material-symbols-outlined text-[16px]">delete</span> Delete
                        </button>
                    </td>
                </tr>`;
            }).join('');
        }

        function updateStats(staffList) {
            let adminCount = 0;
            let modCount = 0;
            let supportCount = 0;

            staffList.forEach(s => {
                const role = (s.role || '').toLowerCase();
                if (role === 'admin') adminCount++;
                else if (role === 'moderator' || role === 'content manager') modCount++;
                else if (role === 'support' || role === 'support agent') supportCount++;
            });

            const elTotal = document.getElementById('stat-total');
            const elAdmins = document.getElementById('stat-admins');
            const elModerators = document.getElementById('stat-moderators');
            const elSupport = document.getElementById('stat-support');

            if (elTotal) {
                elTotal.classList.remove('stat-shimmer');
                elTotal.style.minWidth = '';
                elTotal.style.minHeight = '';
                elTotal.textContent = staffList.length.toString();
            }
            if (elAdmins) {
                elAdmins.classList.remove('stat-shimmer');
                elAdmins.style.minWidth = '';
                elAdmins.style.minHeight = '';
                elAdmins.textContent = adminCount.toString();
            }
            if (elModerators) {
                elModerators.classList.remove('stat-shimmer');
                elModerators.style.minWidth = '';
                elModerators.style.minHeight = '';
                elModerators.textContent = modCount.toString();
            }
            if (elSupport) {
                elSupport.classList.remove('stat-shimmer');
                elSupport.style.minWidth = '';
                elSupport.style.minHeight = '';
                elSupport.textContent = supportCount.toString();
            }
        }

        // --- Filter Logic ---
        function applyFilter(filter, searchTerm) {
            let filtered = allStaff;

            // Filter by Role
            if (filter === 'admin') {
                filtered = filtered.filter(s => (s.role || '').toLowerCase() === 'admin');
            } else if (filter === 'moderator') {
                filtered = filtered.filter(s => (s.role || '').toLowerCase() === 'content manager' || (s.role || '').toLowerCase() === 'moderator');
            } else if (filter === 'support') {
                filtered = filtered.filter(s => (s.role || '').toLowerCase() === 'support agent' || (s.role || '').toLowerCase() === 'support');
            }

            // Filter by Search Term
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                filtered = filtered.filter(s => {
                    const name = (s.name || '').toLowerCase();
                    const email = (s.email || '').toLowerCase();
                    return name.includes(term) || email.includes(term);
                });
            }

            renderStaff(filtered);
        }

        function handleLoadError(error) {
            console.error('Failed to load staff directory:', error);
            document.getElementById('staff-tbody').innerHTML = `<tr><td colspan="5" class="p-8 text-center text-error">
                <span class="material-symbols-outlined text-[32px] mb-2 block">error</span>
                Failed to load staff members: ${escapeHtml(error.message)}</td></tr>`;
                
            ['stat-total', 'stat-admins', 'stat-moderators', 'stat-support'].forEach(id => {
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

        // --- Fetch Staff API ---
        async function loadStaff() {
            try {
                const response = await fetch(API_URL);

                // Read body first so we can show the real server error message
                const json = await response.json();

                if (!response.ok || json.status !== 'success') {
                    throw new Error(json.message || `HTTP ${response.status}: ${response.statusText}`);
                }

                allStaff = json.data || [];
                updateStats(allStaff);
                applyFilter(currentFilter, document.getElementById('search-input').value);
            } catch (error) {
                handleLoadError(error);
            }
        }

        // --- Modal Control Functions ---
        function openAddStaffModal() {
            document.getElementById('modal-title').textContent = 'Add New Staff Member';
            document.getElementById('staff-id').value = '';
            document.getElementById('staff-name').value = '';
            document.getElementById('staff-email').value = '';
            document.getElementById('staff-role').value = '2';
            document.getElementById('staff-password').value = '';
            document.getElementById('staff-password').required = true;
            document.getElementById('password-field-container').classList.remove('hidden');
            document.getElementById('submit-btn').textContent = 'Create Staff';

            const modal = document.getElementById('staff-modal');
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.querySelector('div').classList.remove('scale-95');
                modal.querySelector('div').classList.add('scale-100');
            }, 10);
        }

        function openEditStaffModal(id) {
            const member = allStaff.find(s => s.id == id);
            if (!member) return;

            document.getElementById('modal-title').textContent = 'Edit Staff Member';
            document.getElementById('staff-id').value = member.id;
            document.getElementById('staff-name').value = member.name || '';
            document.getElementById('staff-email').value = member.email || '';
            document.getElementById('staff-role').value = getRoleIdByName(member.role);
            document.getElementById('staff-password').value = '';
            document.getElementById('staff-password').required = false;
            document.getElementById('password-field-container').classList.add('hidden'); // No password changing in this modal
            document.getElementById('submit-btn').textContent = 'Update Staff';

            const modal = document.getElementById('staff-modal');
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.querySelector('div').classList.remove('scale-95');
                modal.querySelector('div').classList.add('scale-100');
            }, 10);
        }

        function closeStaffModal() {
            const modal = document.getElementById('staff-modal');
            modal.querySelector('div').classList.add('scale-95');
            modal.querySelector('div').classList.remove('scale-100');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 150);
        }

        // --- Submit Logic (Add / Edit) ---
        async function handleStaffSubmit(e) {
            e.preventDefault();

            const id       = document.getElementById('staff-id').value;
            const name     = document.getElementById('staff-name').value;
            const username = document.getElementById('staff-username').value;
            const email    = document.getElementById('staff-email').value;
            const role     = document.getElementById('staff-role').value;
            const password = document.getElementById('staff-password').value;

            if (id) {
                // Edit mode (mock update — wire to an edit API when ready)
                const index = allStaff.findIndex(s => s.id == id);
                if (index !== -1) {
                    allStaff[index].name  = name;
                    allStaff[index].email = email;
                    const roleNames = {
                        '2': 'Admin',
                        '3': 'Support Agent',
                        '4': 'Content Manager'
                    };
                    allStaff[index].role  = roleNames[role] || 'Admin';
                    showToast('Staff member updated successfully.');
                }
                updateStats(allStaff);
                applyFilter(currentFilter, document.getElementById('search-input').value);
                closeStaffModal();
            } else {
                // Add mode — POST to api/add_staff.php
                const formData = new FormData();
                formData.append('name',     name);
                formData.append('username', username);
                formData.append('email',    email);
                formData.append('password', password);
                formData.append('role_id',  role);

                try {
                    const response = await fetch('api/add_staff.php', {
                        method: 'POST',
                        body: formData
                    });
                    const json = await response.json();

                    if (json.status === 'success') {
                        showToast('New staff member added successfully.');
                        closeStaffModal();
                        loadStaff(); // Refresh table from API
                    } else {
                        showToast(json.message || 'Failed to add staff member.', 'error');
                    }
                } catch (err) {
                    showToast('Network error. Please try again.', 'error');
                }
            }
        }

        // --- Delete Logic ---
        function triggerDeleteStaff(id) {
            const member = allStaff.find(s => s.id == id);
            if (!member) return;

            deleteTargetId = id;
            document.getElementById('confirm-staff-name').textContent = member.name;
            
            const modal = document.getElementById('confirm-modal');
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.querySelector('div').classList.remove('scale-95');
                modal.querySelector('div').classList.add('scale-100');
            }, 10);
        }

        function closeConfirmModal() {
            const modal = document.getElementById('confirm-modal');
            modal.querySelector('div').classList.add('scale-95');
            modal.querySelector('div').classList.remove('scale-100');
            setTimeout(() => {
                modal.classList.add('hidden');
                deleteTargetId = null;
            }, 150);
        }

        // --- Event Listeners ---
        document.addEventListener('DOMContentLoaded', () => {
            loadStaff();

            // Filters
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    currentFilter = btn.dataset.filter;
                    document.querySelectorAll('.filter-btn').forEach(b => {
                        b.className = 'filter-btn bg-surface text-on-surface-variant font-label-sm text-label-sm px-4 py-1.5 rounded-full border border-outline-variant hover:bg-surface-container transition-colors';
                    });
                    btn.className = 'filter-btn bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-4 py-1.5 rounded-full border border-primary-fixed';

                    applyFilter(currentFilter, document.getElementById('search-input').value);
                });
            });

            // Search
            document.getElementById('search-btn').addEventListener('click', () => {
                applyFilter(currentFilter, document.getElementById('search-input').value);
            });
            document.getElementById('search-input').addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    applyFilter(currentFilter, e.target.value);
                }
            });

            // Confirm Delete Submit
            document.getElementById('confirm-delete-btn').addEventListener('click', () => {
                if (deleteTargetId !== null) {
                    allStaff = allStaff.filter(s => s.id !== deleteTargetId);
                    showToast('Staff member has been removed.');
                    updateStats(allStaff);
                    applyFilter(currentFilter, document.getElementById('search-input').value);
                    closeConfirmModal();
                }
            });

            // Close modals when clicking outside
            document.getElementById('staff-modal').addEventListener('click', (e) => {
                if (e.target === document.getElementById('staff-modal')) {
                    closeStaffModal();
                }
            });
            document.getElementById('confirm-modal').addEventListener('click', (e) => {
                if (e.target === document.getElementById('confirm-modal')) {
                    closeConfirmModal();
                }
            });
        });
    </script>
</body>
</html>
