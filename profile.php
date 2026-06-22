<?php
// profile.php — Comprehensive User Profile Page
require_once 'backend/check_role.php';
hasAccess(['Super Admin', 'Admin']);

$user_id = intval($_GET['id'] ?? 0);
if ($user_id <= 0) {
    header("Location: dashboard.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>SehatVaani - User Profile</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    <script>
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              colors: {
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
              borderRadius: { DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" },
              spacing: { base: "8px", gutter: "16px", "stack-md": "12px", "stack-sm": "4px", "container-padding": "24px", "stack-lg": "24px" },
              fontFamily: { "body-md": ["Hanken Grotesk"], "data-mono": ["JetBrains Mono"], "label-sm": ["Hanken Grotesk"], "body-lg": ["Hanken Grotesk"], "display-lg": ["Hanken Grotesk"], "headline-md": ["Hanken Grotesk"], "title-sm": ["Hanken Grotesk"] },
              fontSize: {
                "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
                "data-mono": ["13px", { lineHeight: "18px", fontWeight: "400" }],
                "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
                "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
                "display-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
                "headline-md": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }],
                "title-sm": ["18px", { lineHeight: "24px", fontWeight: "600" }]
              }
            }
          }
        }
    </script>
    <style>
        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-weight: normal; font-style: normal; font-size: 24px; line-height: 1;
            letter-spacing: normal; text-transform: none; display: inline-block;
            white-space: nowrap; word-wrap: normal; direction: ltr;
            -webkit-font-feature-settings: 'liga'; -webkit-font-smoothing: antialiased;
        }
        .section-card { transition: all 0.2s ease; }
        .section-card:hover { box-shadow: 0 2px 12px rgba(14,165,233,0.06); }
        .collapse-content { max-height: 0; overflow: hidden; transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1); }
        .collapse-content.open { max-height: 5000px; }
        .chevron-icon { transition: transform 0.3s ease; }
        .chevron-icon.rotated { transform: rotate(180deg); }
        .progress-bar-fill { transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
        .field-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(188,202,193,0.25); }
        .field-row:last-child { border-bottom: none; }
        .field-row span { font-size: 14px; line-height: 20px; }
        .stat-shimmer {
            background: linear-gradient(90deg, transparent 25%, rgba(14,165,233,0.08) 50%, transparent 75%);
            background-size: 200% 100%; animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        .modal-backdrop { transition: opacity 0.2s ease; }
        .modal-panel { transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease; }
    </style>
</head>
<body class="bg-secondary-fixed min-h-screen flex flex-col dark:bg-inverse-surface font-body-md text-on-background">
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
            <a class="text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low p-3 rounded-lg flex items-center gap-3 hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all" href="staff.php">
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

    <!-- Main Content -->
    <main class="flex-1 min-w-0 overflow-y-auto p-container-padding flex flex-col gap-stack-lg" id="main-content">

        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 text-on-surface-variant font-body-md text-body-md">
            <a href="dashboard.php" class="hover:text-primary transition-colors">Dashboard</a>
            <span class="material-symbols-outlined text-[16px]">chevron_right</span>
            <span class="text-on-surface font-semibold" id="breadcrumb-name">User Profile</span>
        </div>

        <!-- Loading State -->
        <div id="loading-state" class="flex-1 flex items-center justify-center">
            <div class="text-center text-on-surface-variant">
                <span class="material-symbols-outlined text-[48px] mb-4 block animate-spin">hourglass_empty</span>
                <p class="font-body-lg text-body-lg">Loading user profile...</p>
            </div>
        </div>

        <!-- Profile Content (hidden until loaded) -->
        <div id="profile-content" class="flex flex-col gap-4 hidden">

            <!-- ==================== HEADER CARD ==================== -->
            <div class="section-card bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-6 fade-in">
                <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div class="flex items-center gap-4">
                        <div id="avatar" class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-fixed-dim text-white flex items-center justify-center font-display-lg text-[28px] font-bold shadow-lg">
                            --
                        </div>
                        <div class="flex flex-col gap-1">
                            <h1 class="font-headline-md text-headline-md text-on-surface" id="header-name">—</h1>
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="font-data-mono text-data-mono text-on-surface-variant" id="header-phone">—</span>
                                <span class="text-outline">•</span>
                                <span class="font-data-mono text-data-mono text-on-surface-variant" id="header-id">—</span>
                            </div>
                            <div class="flex flex-wrap gap-2 mt-1" id="header-badges"></div>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button onclick="openEditPersonal()" class="bg-primary text-on-primary font-label-sm text-label-sm px-4 py-2 rounded-lg hover:bg-primary-container transition-colors flex items-center gap-1.5 shadow-sm">
                            <span class="material-symbols-outlined text-[16px]">edit</span> Edit Profile
                        </button>
                        <button onclick="handleAction('export')" class="bg-surface border border-outline-variant text-on-surface-variant font-label-sm text-label-sm px-4 py-2 rounded-lg hover:bg-surface-container transition-colors flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-[16px]">download</span> Export
                        </button>
                        <button id="block-btn" onclick="handleBlockToggle()" class="bg-surface border border-outline-variant text-on-surface-variant font-label-sm text-label-sm px-4 py-2 rounded-lg hover:bg-surface-container transition-colors flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-[16px]">block</span> <span id="block-btn-text">Block</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- ==================== SECTION 1: PERSONAL DETAILS ==================== -->
            <div class="section-card bg-surface-container-lowest border border-outline-variant/50 rounded-xl overflow-hidden fade-in">
                <button onclick="toggleSection('personal')" class="w-full p-5 flex justify-between items-center hover:bg-surface-container-low/50 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center"><span class="material-symbols-outlined text-[20px]">person</span></div>
                        <h2 class="font-title-sm text-title-sm text-on-surface">Personal Details</h2>
                    </div>
                    <span class="material-symbols-outlined chevron-icon text-on-surface-variant" id="chevron-personal">expand_more</span>
                </button>
                <div class="collapse-content open" id="section-personal">
                    <div class="px-5 pb-5">
                        <div id="personal-fields" class="grid grid-cols-1 md:grid-cols-2 gap-x-8"></div>
                    </div>
                </div>
            </div>

            <!-- ==================== SECTION 2: MEDICAL INFO ==================== -->
            <div class="section-card bg-surface-container-lowest border border-outline-variant/50 rounded-xl overflow-hidden fade-in">
                <button onclick="toggleSection('medical')" class="w-full p-5 flex justify-between items-center hover:bg-surface-container-low/50 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center"><span class="material-symbols-outlined text-[20px]">medical_information</span></div>
                        <h2 class="font-title-sm text-title-sm text-on-surface">Medical Information</h2>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="event.stopPropagation(); openEditMedical()" class="text-primary hover:text-primary-container font-label-sm text-label-sm px-3 py-1 rounded-lg hover:bg-primary-fixed/30 transition-colors">Edit</button>
                        <span class="material-symbols-outlined chevron-icon text-on-surface-variant" id="chevron-medical">expand_more</span>
                    </div>
                </button>
                <div class="collapse-content open" id="section-medical">
                    <div class="px-5 pb-5">
                        <div id="medical-fields" class="grid grid-cols-1 md:grid-cols-2 gap-x-8"></div>
                    </div>
                </div>
            </div>

            <!-- ==================== SECTION 3: EMERGENCY CONTACTS ==================== -->
            <div class="section-card bg-surface-container-lowest border border-outline-variant/50 rounded-xl overflow-hidden fade-in">
                <button onclick="toggleSection('emergency')" class="w-full p-5 flex justify-between items-center hover:bg-surface-container-low/50 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center"><span class="material-symbols-outlined text-[20px]">emergency</span></div>
                        <h2 class="font-title-sm text-title-sm text-on-surface">Emergency Contacts</h2>
                        <span class="bg-orange-100 text-orange-700 font-label-sm text-label-sm px-2 py-0.5 rounded-full" id="ec-count">0</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="event.stopPropagation(); openAddContact()" class="text-primary hover:text-primary-container font-label-sm text-label-sm px-3 py-1 rounded-lg hover:bg-primary-fixed/30 transition-colors flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">add</span> Add</button>
                        <span class="material-symbols-outlined chevron-icon text-on-surface-variant" id="chevron-emergency">expand_more</span>
                    </div>
                </button>
                <div class="collapse-content open" id="section-emergency">
                    <div class="px-5 pb-5" id="emergency-list"></div>
                </div>
            </div>

            <!-- ==================== SECTION 4: FAMILY MEMBERS ==================== -->
            <div class="section-card bg-surface-container-lowest border border-outline-variant/50 rounded-xl overflow-hidden fade-in">
                <button onclick="toggleSection('family')" class="w-full p-5 flex justify-between items-center hover:bg-surface-container-low/50 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center"><span class="material-symbols-outlined text-[20px]">family_restroom</span></div>
                        <h2 class="font-title-sm text-title-sm text-on-surface">Family Members</h2>
                        <span class="bg-violet-100 text-violet-700 font-label-sm text-label-sm px-2 py-0.5 rounded-full" id="fm-count">0</span>
                    </div>
                    <span class="material-symbols-outlined chevron-icon text-on-surface-variant" id="chevron-family">expand_more</span>
                </button>
                <div class="collapse-content open" id="section-family">
                    <div class="px-5 pb-5" id="family-list"></div>
                </div>
            </div>

            <!-- ==================== SECTION 5: SUBSCRIPTION & BILLING ==================== -->
            <div class="section-card bg-surface-container-lowest border border-outline-variant/50 rounded-xl overflow-hidden fade-in">
                <button onclick="toggleSection('subscription')" class="w-full p-5 flex justify-between items-center hover:bg-surface-container-low/50 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center"><span class="material-symbols-outlined text-[20px]">card_membership</span></div>
                        <h2 class="font-title-sm text-title-sm text-on-surface">Subscription & Billing</h2>
                    </div>
                    <span class="material-symbols-outlined chevron-icon text-on-surface-variant" id="chevron-subscription">expand_more</span>
                </button>
                <div class="collapse-content open" id="section-subscription">
                    <div class="px-5 pb-5">
                        <div id="sub-details" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 mb-4"></div>
                        <div class="border-t border-outline-variant/30 pt-4">
                            <h3 class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">Recent Payments</h3>
                            <div id="payments-list"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ==================== SECTION 6: USAGE STATISTICS ==================== -->
            <div class="section-card bg-surface-container-lowest border border-outline-variant/50 rounded-xl overflow-hidden fade-in">
                <button onclick="toggleSection('usage')" class="w-full p-5 flex justify-between items-center hover:bg-surface-container-low/50 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center"><span class="material-symbols-outlined text-[20px]">bar_chart</span></div>
                        <h2 class="font-title-sm text-title-sm text-on-surface">Usage Statistics</h2>
                    </div>
                    <span class="material-symbols-outlined chevron-icon text-on-surface-variant" id="chevron-usage">expand_more</span>
                </button>
                <div class="collapse-content open" id="section-usage">
                    <div class="px-5 pb-5" id="usage-content"></div>
                </div>
            </div>

            <!-- ==================== SECTION 7: MEDICAL REPORTS ==================== -->
            <div class="section-card bg-surface-container-lowest border border-outline-variant/50 rounded-xl overflow-hidden fade-in">
                <button onclick="toggleSection('reports')" class="w-full p-5 flex justify-between items-center hover:bg-surface-container-low/50 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center"><span class="material-symbols-outlined text-[20px]">summarize</span></div>
                        <h2 class="font-title-sm text-title-sm text-on-surface">Medical Reports</h2>
                        <span class="bg-amber-100 text-amber-700 font-label-sm text-label-sm px-2 py-0.5 rounded-full" id="rpt-count">0</span>
                    </div>
                    <span class="material-symbols-outlined chevron-icon text-on-surface-variant" id="chevron-reports">expand_more</span>
                </button>
                <div class="collapse-content open" id="section-reports">
                    <div class="px-5 pb-5" id="reports-list"></div>
                </div>
            </div>

            <!-- ==================== SECTION 8: ADMIN NOTES ==================== -->
            <div class="section-card bg-surface-container-lowest border border-outline-variant/50 rounded-xl overflow-hidden fade-in">
                <button onclick="toggleSection('notes')" class="w-full p-5 flex justify-between items-center hover:bg-surface-container-low/50 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center"><span class="material-symbols-outlined text-[20px]">sticky_note_2</span></div>
                        <h2 class="font-title-sm text-title-sm text-on-surface">Admin Notes</h2>
                        <span class="bg-indigo-100 text-indigo-700 font-label-sm text-label-sm px-2 py-0.5 rounded-full" id="notes-count">0</span>
                    </div>
                    <span class="material-symbols-outlined chevron-icon text-on-surface-variant" id="chevron-notes">expand_more</span>
                </button>
                <div class="collapse-content open" id="section-notes">
                    <div class="px-5 pb-5">
                        <!-- Add note form -->
                        <div class="flex gap-2 mb-4">
                            <input type="text" id="new-note-input" class="flex-1 px-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" placeholder="Add an internal note..." />
                            <button onclick="addNote()" class="bg-primary text-on-primary font-label-sm text-label-sm px-4 py-2 rounded-lg hover:bg-primary-container transition-colors flex items-center gap-1 shrink-0">
                                <span class="material-symbols-outlined text-[16px]">add</span> Add
                            </button>
                        </div>
                        <div id="notes-list"></div>
                    </div>
                </div>
            </div>

            <!-- ==================== SECTION 9: DANGER ZONE ==================== -->
            <div class="section-card bg-surface-container-lowest border border-red-200 rounded-xl overflow-hidden fade-in">
                <button onclick="toggleSection('danger')" class="w-full p-5 flex justify-between items-center hover:bg-red-50/50 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center"><span class="material-symbols-outlined text-[20px]">warning</span></div>
                        <h2 class="font-title-sm text-title-sm text-red-700">Danger Zone</h2>
                    </div>
                    <span class="material-symbols-outlined chevron-icon text-red-400" id="chevron-danger">expand_more</span>
                </button>
                <div class="collapse-content" id="section-danger">
                    <div class="px-5 pb-5">
                        <p class="text-body-md text-on-surface-variant mb-4">These actions are permanent and cannot be easily undone. Proceed with caution.</p>
                        <div class="flex flex-col gap-3">
                            <div class="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/30">
                                <div>
                                    <p class="font-semibold text-on-surface">Delete User Account</p>
                                    <p class="text-body-md text-on-surface-variant text-[13px]">Permanently delete this user and all associated data</p>
                                </div>
                                <button onclick="confirmDeleteUser()" class="bg-error text-on-error font-label-sm text-label-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">Delete Account</button>
                            </div>
                            <div class="flex items-center justify-between p-4 border border-outline-variant/50 rounded-lg">
                                <div>
                                    <p class="font-semibold text-on-surface">Reset API Usage</p>
                                    <p class="text-body-md text-on-surface-variant text-[13px]">Reset API call counter to 0 for this user</p>
                                </div>
                                <button onclick="handleAction('reset_api')" class="bg-surface border border-outline-variant text-on-surface-variant font-label-sm text-label-sm px-4 py-2 rounded-lg hover:bg-surface-container transition-colors">Reset API</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>

<!-- ==================== MODALS ==================== -->

<!-- Edit Personal Modal -->
<div id="modal-edit-personal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/50 backdrop-blur-sm modal-backdrop">
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-lg shadow-2xl modal-panel scale-95 opacity-0 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-outline-variant/50 bg-surface-container-low sticky top-0 z-10">
            <h3 class="font-headline-md text-headline-md text-on-surface">Edit Personal Details</h3>
            <button onclick="closeModal('modal-edit-personal')" class="text-on-surface-variant hover:text-on-surface bg-surface hover:bg-surface-container rounded-full p-2 transition-colors"><span class="material-symbols-outlined text-[20px]">close</span></button>
        </div>
        <form onsubmit="submitEditPersonal(event)" class="p-6 flex flex-col gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1">
                    <label class="font-label-sm text-label-sm text-on-surface-variant">Full Name *</label>
                    <input type="text" id="edit-name" required class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"/>
                </div>
                <div class="flex flex-col gap-1">
                    <label class="font-label-sm text-label-sm text-on-surface-variant">Phone *</label>
                    <input type="text" id="edit-phone" required class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"/>
                </div>
                <div class="flex flex-col gap-1">
                    <label class="font-label-sm text-label-sm text-on-surface-variant">Date of Birth</label>
                    <input type="date" id="edit-dob" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"/>
                </div>
                <div class="flex flex-col gap-1">
                    <label class="font-label-sm text-label-sm text-on-surface-variant">Gender</label>
                    <select id="edit-gender" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary">
                        <option value="">—</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                    </select>
                </div>
                <div class="flex flex-col gap-1">
                    <label class="font-label-sm text-label-sm text-on-surface-variant">Height (cm)</label>
                    <input type="number" id="edit-height" step="0.01" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"/>
                </div>
                <div class="flex flex-col gap-1">
                    <label class="font-label-sm text-label-sm text-on-surface-variant">Weight (kg)</label>
                    <input type="number" id="edit-weight" step="0.01" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"/>
                </div>
            </div>
            <div class="flex flex-col gap-1">
                <label class="font-label-sm text-label-sm text-on-surface-variant">Medical Conditions</label>
                <textarea id="edit-medical-conditions" rows="2" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary resize-y"></textarea>
            </div>
            <div class="flex justify-end gap-3 mt-2 border-t border-outline-variant/30 pt-4">
                <button type="button" onclick="closeModal('modal-edit-personal')" class="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-6 py-2.5 rounded-lg hover:bg-secondary-fixed-dim transition-colors">Cancel</button>
                <button type="submit" class="bg-primary text-on-primary font-label-sm text-label-sm px-6 py-2.5 rounded-lg hover:bg-primary-container transition-colors font-semibold shadow-sm">Save Changes</button>
            </div>
        </form>
    </div>
</div>

<!-- Edit Medical Modal -->
<div id="modal-edit-medical" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/50 backdrop-blur-sm modal-backdrop">
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-lg shadow-2xl modal-panel scale-95 opacity-0 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-outline-variant/50 bg-surface-container-low sticky top-0 z-10">
            <h3 class="font-headline-md text-headline-md text-on-surface">Edit Medical Information</h3>
            <button onclick="closeModal('modal-edit-medical')" class="text-on-surface-variant hover:text-on-surface bg-surface hover:bg-surface-container rounded-full p-2 transition-colors"><span class="material-symbols-outlined text-[20px]">close</span></button>
        </div>
        <form onsubmit="submitEditMedical(event)" class="p-6 flex flex-col gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Allergies</label><textarea id="med-allergies" rows="2" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary resize-y"></textarea></div>
                <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Chronic Conditions</label><textarea id="med-chronic" rows="2" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary resize-y"></textarea></div>
                <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Current Medications</label><textarea id="med-medications" rows="2" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary resize-y"></textarea></div>
                <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Surgery History</label><textarea id="med-surgery" rows="2" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary resize-y"></textarea></div>
                <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Family Medical History</label><textarea id="med-family-history" rows="2" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary resize-y"></textarea></div>
                <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Smoking Status</label><select id="med-smoking" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"><option value="">—</option><option>Never</option><option>Former</option><option>Current</option></select></div>
                <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Alcohol Consumption</label><select id="med-alcohol" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"><option value="">—</option><option>None</option><option>Moderate</option><option>Heavy</option></select></div>
                <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Vaccination Status</label><select id="med-vaccination" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"><option value="">—</option><option>Complete</option><option>Incomplete</option><option>Unknown</option></select></div>
                <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Last Checkup Date</label><input type="date" id="med-checkup-date" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"/></div>
                <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Regular Doctor Name</label><input type="text" id="med-doctor-name" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"/></div>
                <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Regular Doctor Phone</label><input type="text" id="med-doctor-phone" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"/></div>
                <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Insurance Provider</label><input type="text" id="med-insurance" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"/></div>
                <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Policy Number</label><input type="text" id="med-policy" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"/></div>
                <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Insurance Valid Till</label><input type="date" id="med-insurance-till" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"/></div>
            </div>
            <div class="flex justify-end gap-3 mt-2 border-t border-outline-variant/30 pt-4">
                <button type="button" onclick="closeModal('modal-edit-medical')" class="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-6 py-2.5 rounded-lg hover:bg-secondary-fixed-dim transition-colors">Cancel</button>
                <button type="submit" class="bg-primary text-on-primary font-label-sm text-label-sm px-6 py-2.5 rounded-lg hover:bg-primary-container transition-colors font-semibold shadow-sm">Save Changes</button>
            </div>
        </form>
    </div>
</div>

<!-- Add/Edit Emergency Contact Modal -->
<div id="modal-contact" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/50 backdrop-blur-sm modal-backdrop">
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-md shadow-2xl modal-panel scale-95 opacity-0">
        <div class="flex justify-between items-center p-6 border-b border-outline-variant/50 bg-surface-container-low">
            <h3 class="font-headline-md text-headline-md text-on-surface" id="contact-modal-title">Add Emergency Contact</h3>
            <button onclick="closeModal('modal-contact')" class="text-on-surface-variant hover:text-on-surface bg-surface hover:bg-surface-container rounded-full p-2 transition-colors"><span class="material-symbols-outlined text-[20px]">close</span></button>
        </div>
        <form onsubmit="submitContact(event)" class="p-6 flex flex-col gap-4">
            <input type="hidden" id="contact-id"/>
            <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Name *</label><input type="text" id="contact-name" required class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"/></div>
            <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Relationship</label><select id="contact-rel" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"><option>Spouse</option><option>Parent</option><option>Sibling</option><option>Child</option><option>Friend</option><option selected>Other</option></select></div>
            <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Phone *</label><input type="text" id="contact-phone" required class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"/></div>
            <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Email</label><input type="email" id="contact-email" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"/></div>
            <div class="flex flex-col gap-1"><label class="font-label-sm text-label-sm text-on-surface-variant">Address</label><textarea id="contact-addr" rows="2" class="px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary resize-y"></textarea></div>
            <div class="flex justify-end gap-3 mt-2 border-t border-outline-variant/30 pt-4">
                <button type="button" onclick="closeModal('modal-contact')" class="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-6 py-2.5 rounded-lg hover:bg-secondary-fixed-dim transition-colors">Cancel</button>
                <button type="submit" class="bg-primary text-on-primary font-label-sm text-label-sm px-6 py-2.5 rounded-lg hover:bg-primary-container transition-colors font-semibold shadow-sm">Save</button>
            </div>
        </form>
    </div>
</div>

<!-- Confirm Delete Modal -->
<div id="modal-confirm-delete" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/50 backdrop-blur-sm modal-backdrop">
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-sm shadow-2xl modal-panel scale-95 opacity-0 p-6 flex flex-col gap-4">
        <div class="flex items-center gap-3 text-error">
            <span class="material-symbols-outlined text-[32px]">warning</span>
            <h3 class="font-title-sm text-title-sm text-on-surface font-semibold">Delete User Account</h3>
        </div>
        <p class="text-body-md text-on-surface-variant">This will <strong class="text-error">permanently delete</strong> <span id="delete-user-name" class="font-bold text-on-surface"></span> and all their data (reports, payments, subscriptions, etc.). This cannot be undone.</p>
        <div class="flex flex-col gap-2">
            <label class="font-label-sm text-label-sm text-on-surface-variant">Type <strong>DELETE</strong> to confirm:</label>
            <input type="text" id="delete-confirm-input" class="px-3 py-2 bg-surface border border-red-300 rounded-lg font-body-md text-on-surface focus:outline-none focus:border-error" placeholder="DELETE"/>
        </div>
        <div class="flex justify-end gap-3">
            <button onclick="closeModal('modal-confirm-delete')" class="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-5 py-2 rounded-lg hover:bg-secondary-fixed-dim transition-colors">Cancel</button>
            <button onclick="executeDeleteUser()" class="bg-error text-on-error font-label-sm text-label-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity font-semibold">Delete Permanently</button>
        </div>
    </div>
</div>

<!-- Toast Container -->
<div id="toast-container" class="fixed bottom-5 right-5 z-[60] flex flex-col gap-2 pointer-events-none"></div>

<script>
const USER_ID = <?php echo json_encode($user_id); ?>;
const API_KEY = 'sehat_live_2026_secure_key';
const API_BASE = 'api';

let profileData = {};

// ===================== UTILITIES =====================
function esc(text) {
    if (text === null || text === undefined || text === '') return '<span class="text-outline italic">—</span>';
    const d = document.createElement('div'); d.textContent = String(text); return d.innerHTML;
}
function escPlain(text) { return text === null || text === undefined ? '' : String(text); }

function fmtDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}
function fmtCurrency(amt) {
    const n = parseFloat(amt);
    return isNaN(n) ? '₹0.00' : '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function calcAge(dob) {
    if (!dob) return '—';
    const d = new Date(dob);
    if (isNaN(d.getTime())) return '—';
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    if (today.getMonth() < d.getMonth() || (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())) age--;
    return age + ' yrs';
}
function calcBMI(h, w) {
    const height = parseFloat(h);
    const weight = parseFloat(w);
    if (!height || !weight || height <= 0) return '—';
    const bmi = weight / ((height / 100) ** 2);
    const label = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
    const color = bmi < 18.5 ? 'text-amber-600' : bmi < 25 ? 'text-green-600' : bmi < 30 ? 'text-amber-600' : 'text-red-600';
    return `<span class="${color} font-semibold">${bmi.toFixed(1)}</span> <span class="text-on-surface-variant text-[12px]">(${label})</span>`;
}

function showToast(msg, type = 'success') {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    const bg = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-primary';
    const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';
    t.className = `px-4 py-3 rounded-lg shadow-lg text-white font-semibold transition-all duration-300 transform translate-y-10 opacity-0 pointer-events-auto flex items-center gap-2 ${bg}`;
    t.innerHTML = `<span class="material-symbols-outlined text-[20px]">${icon}</span><span>${esc(msg)}</span>`;
    c.appendChild(t);
    setTimeout(() => t.classList.remove('translate-y-10', 'opacity-0'), 10);
    setTimeout(() => { t.classList.add('translate-y-10', 'opacity-0'); setTimeout(() => t.remove(), 300); }, 3500);
}

// ===================== SECTIONS TOGGLE =====================
function toggleSection(name) {
    const content = document.getElementById('section-' + name);
    const chevron = document.getElementById('chevron-' + name);
    content.classList.toggle('open');
    chevron.classList.toggle('rotated');
}

// ===================== MODALS =====================
function openModal(id) {
    const m = document.getElementById(id);
    m.classList.remove('hidden');
    setTimeout(() => { const p = m.querySelector('.modal-panel'); if (p) { p.classList.remove('scale-95', 'opacity-0'); p.classList.add('scale-100', 'opacity-100'); } }, 10);
}
function closeModal(id) {
    const m = document.getElementById(id);
    const p = m.querySelector('.modal-panel');
    if (p) { p.classList.add('scale-95', 'opacity-0'); p.classList.remove('scale-100', 'opacity-100'); }
    setTimeout(() => m.classList.add('hidden'), 200);
}
// Close on backdrop click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        e.target.classList.add('hidden');
    }
});

// ===================== DATA LOADING =====================
async function loadProfile() {
    try {
        const res = await fetch(`${API_BASE}/get_user_profile.php?api_key=${API_KEY}&user_id=${USER_ID}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.status !== 'success') throw new Error(json.message || 'API error');

        profileData = json;
        renderAll();

        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('profile-content').classList.remove('hidden');
    } catch (err) {
        document.getElementById('loading-state').innerHTML = `
            <div class="text-center text-error">
                <span class="material-symbols-outlined text-[48px] mb-4 block">error</span>
                <p class="font-body-lg text-body-lg">Failed to load profile: ${esc(err.message)}</p>
                <a href="dashboard.php" class="mt-4 inline-block text-primary hover:underline">← Back to Dashboard</a>
            </div>`;
    }
}

function renderAll() {
    const u = profileData.user;
    const sub = profileData.subscription;
    const med = profileData.medical_info;

    // Breadcrumb
    document.getElementById('breadcrumb-name').textContent = u.name || 'User Profile';

    // Header
    document.getElementById('avatar').textContent = (u.name || 'NA').substring(0, 2).toUpperCase();
    document.getElementById('header-name').textContent = u.name || '—';
    document.getElementById('header-phone').textContent = u.phone || '—';
    document.getElementById('header-id').textContent = 'ID #' + u.id;

    // Badges
    const isBlocked = Number(u.is_blocked) === 1;
    const statusBadge = isBlocked
        ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800"><span class="w-1.5 h-1.5 mr-1 bg-red-600 rounded-full"></span>Blocked</span>'
        : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800"><span class="w-1.5 h-1.5 mr-1 bg-green-600 rounded-full"></span>Active</span>';

    let planBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-700">Free</span>';
    if (sub && sub.plan_name) {
        const isPro = sub.plan_code && sub.plan_code.toUpperCase().includes('PRO');
        planBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isPro ? 'bg-violet-100 text-violet-800' : 'bg-blue-100 text-blue-800'}">${esc(sub.plan_name)}</span>`;
    }

    document.getElementById('header-badges').innerHTML = statusBadge + planBadge;

    // Block button text
    document.getElementById('block-btn-text').textContent = isBlocked ? 'Unblock' : 'Block';

    renderPersonal();
    renderMedical();
    renderEmergency();
    renderFamily();
    renderSubscription();
    renderUsage();
    renderReports();
    renderNotes();
}

// ===================== PERSONAL DETAILS =====================
function renderPersonal() {
    const u = profileData.user;
    const fields = [
        ['Full Name', esc(u.name)],
        ['Phone', esc(u.phone)],
        ['Date of Birth', fmtDate(u.dob)],
        ['Age', calcAge(u.dob)],
        ['Gender', esc(u.gender)],
        ['Height', u.height ? esc(u.height) + ' cm' : '—'],
        ['Weight', u.weight ? esc(u.weight) + ' kg' : '—'],
        ['BMI', calcBMI(u.height, u.weight)],
        ['Medical Conditions', u.medical_conditions ? `<span class="text-red-600 font-semibold">${esc(u.medical_conditions)}</span>` : '—'],
        ['Member Since', fmtDate(u.created_at)],
        ['API Calls', `<span class="font-data-mono">${u.api_calls || 0} / ${u.api_quota || '∞'}</span>`],
        ['User ID', `<span class="font-data-mono">#${u.id}</span>`],
    ];
    document.getElementById('personal-fields').innerHTML = fields.map(([label, value]) =>
        `<div class="field-row"><span class="text-on-surface-variant text-body-md">${label}</span><span class="font-semibold text-body-md text-right">${value}</span></div>`
    ).join('');
}

// ===================== MEDICAL INFO =====================
function renderMedical() {
    const m = profileData.medical_info;
    const fields = m ? [
        ['Allergies', m.allergies ? `<span class="text-red-600 font-semibold">${esc(m.allergies)}</span>` : '—'],
        ['Chronic Conditions', esc(m.chronic_conditions)],
        ['Current Medications', esc(m.current_medications)],
        ['Surgery History', esc(m.surgery_history)],
        ['Family History', esc(m.family_medical_history)],
        ['Smoking', esc(m.smoking_status)],
        ['Alcohol', esc(m.alcohol_consumption)],
        ['Vaccination', esc(m.vaccination_status)],
        ['Last Checkup', fmtDate(m.last_checkup_date)],
        ['Doctor', esc(m.regular_doctor_name)],
        ['Doctor Phone', esc(m.regular_doctor_phone)],
        ['Insurance', esc(m.insurance_provider)],
        ['Policy #', m.insurance_policy_number ? `<span class="font-data-mono">${esc(m.insurance_policy_number)}</span>` : '—'],
        ['Insurance Valid Till', fmtDate(m.insurance_valid_till)],
    ] : [['No Data', '<span class="text-on-surface-variant italic">No medical information recorded. Click Edit to add.</span>']];

    document.getElementById('medical-fields').innerHTML = fields.map(([label, value]) =>
        `<div class="field-row"><span class="text-on-surface-variant text-body-md">${label}</span><span class="font-semibold text-body-md text-right max-w-[60%]">${value}</span></div>`
    ).join('');
}

// ===================== EMERGENCY CONTACTS =====================
function renderEmergency() {
    const ecs = profileData.emergency_contacts || [];
    document.getElementById('ec-count').textContent = ecs.length;
    if (ecs.length === 0) {
        document.getElementById('emergency-list').innerHTML = '<p class="text-on-surface-variant italic text-center py-4">No emergency contacts added yet.</p>';
        return;
    }
    document.getElementById('emergency-list').innerHTML = ecs.map(c => `
        <div class="flex items-center justify-between p-3 rounded-lg border border-outline-variant/40 mb-2 hover:bg-surface-container-low/30 transition-colors">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-[14px]">${(c.contact_name || '?').substring(0, 2).toUpperCase()}</div>
                <div>
                    <p class="font-semibold text-[14px]">${esc(c.contact_name)}</p>
                    <p class="text-on-surface-variant text-[13px]">${esc(c.relationship)} • ${esc(c.phone)}</p>
                </div>
            </div>
            <div class="flex gap-1">
                <button onclick="openEditContact(${c.id})" class="text-primary hover:bg-primary-fixed/30 p-1.5 rounded-lg transition-colors"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                <button onclick="deleteContact(${c.id})" class="text-error hover:bg-error-container/30 p-1.5 rounded-lg transition-colors"><span class="material-symbols-outlined text-[18px]">delete</span></button>
            </div>
        </div>
    `).join('');
}

// ===================== FAMILY MEMBERS =====================
function renderFamily() {
    const fms = profileData.family_members || [];
    document.getElementById('fm-count').textContent = fms.length;
    if (fms.length === 0) {
        document.getElementById('family-list').innerHTML = '<p class="text-on-surface-variant italic text-center py-4">No family members added.</p>';
        return;
    }
    document.getElementById('family-list').innerHTML = fms.map(f => `
        <div class="flex items-center justify-between p-3 rounded-lg border border-outline-variant/40 mb-2 hover:bg-surface-container-low/30 transition-colors">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-[14px]">${(f.name || '?').substring(0, 2).toUpperCase()}</div>
                <div>
                    <p class="font-semibold text-[14px]">${esc(f.name)}</p>
                    <p class="text-on-surface-variant text-[13px]">${esc(f.gender)} • ${calcAge(f.date_of_birth)} • Blood: ${esc(f.blood_group || '—')}</p>
                </div>
            </div>
            <span class="font-label-sm text-label-sm text-on-surface-variant">${f.is_primary ? '👑 Primary' : ''}</span>
        </div>
    `).join('');
}

// ===================== SUBSCRIPTION & BILLING =====================
function renderSubscription() {
    const sub = profileData.subscription;
    const plans = profileData.plans || [];

    if (!sub) {
        document.getElementById('sub-details').innerHTML = '<div class="col-span-2 text-center py-4 text-on-surface-variant italic">No subscription record found.</div>';
        document.getElementById('payments-list').innerHTML = '';
        return;
    }

    // Days remaining
    let daysRemaining = '—';
    let daysColor = 'text-on-surface';
    if (sub.expiry_date) {
        const exp = new Date(sub.expiry_date);
        const now = new Date();
        const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
        daysRemaining = diff > 0 ? diff + ' days' : 'Expired';
        daysColor = diff > 30 ? 'text-green-600' : diff > 7 ? 'text-amber-600' : 'text-red-600';
    }

    const subStatus = sub.status || 'free';
    const subStatusBadge = subStatus.toUpperCase() === 'ACTIVE'
        ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800">Active</span>'
        : subStatus.toUpperCase() === 'PENDING'
            ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Pending</span>'
            : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-800">${esc(subStatus)}</span>`;

    const fields = [
        ['Current Plan', esc(sub.plan_name || 'Free')],
        ['Plan Price', sub.price ? fmtCurrency(sub.price) : '₹0.00'],
        ['Status', subStatusBadge],
        ['Days Remaining', `<span class="${daysColor} font-semibold">${daysRemaining}</span>`],
        ['Start Date', fmtDate(sub.start_date)],
        ['Expiry Date', fmtDate(sub.expiry_date)],
        ['Auto Renewal', Number(sub.auto_renew) === 1 ? '<span class="text-green-600 font-semibold">Yes</span>' : '<span class="text-on-surface-variant">No</span>'],
        ['Total Spent', `<span class="text-emerald-700 font-semibold">${fmtCurrency(profileData.total_spent)}</span>`],
    ];

    document.getElementById('sub-details').innerHTML = fields.map(([label, value]) =>
        `<div class="field-row"><span class="text-on-surface-variant text-body-md">${label}</span><span class="font-semibold text-body-md text-right">${value}</span></div>`
    ).join('');

    // Payments
    const payments = profileData.payments || [];
    if (payments.length === 0) {
        document.getElementById('payments-list').innerHTML = '<p class="text-on-surface-variant italic text-center py-2">No payments found.</p>';
    } else {
        document.getElementById('payments-list').innerHTML = payments.map(p => {
            const statusClass = (p.status || '').toLowerCase() === 'captured' || (p.status || '').toLowerCase() === 'success' || (p.status || '').toLowerCase() === 'completed'
                ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-800';
            return `<div class="flex items-center justify-between py-2 border-b border-outline-variant/20 last:border-0">
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-[18px] text-emerald-600">receipt_long</span>
                    <div>
                        <span class="font-semibold text-body-md">${fmtCurrency(p.amount)}</span>
                        <span class="text-on-surface-variant text-[13px] ml-2">${fmtDate(p.payment_date)}</span>
                    </div>
                </div>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-bold ${statusClass}">${esc(p.status)}</span>
            </div>`;
        }).join('');
    }
}

// ===================== USAGE STATISTICS =====================
function renderUsage() {
    const usage = profileData.usage;
    const sub = profileData.subscription;

    const reportsUsed = usage ? (parseInt(usage.reports_used) || 0) : 0;
    const chatsUsed = usage ? (parseInt(usage.chats_used) || 0) : 0;
    const reportsLimit = sub ? (parseInt(sub.reports_limit) || 0) : 5;
    const chatsLimit = sub ? (parseInt(sub.chat_limit) || 0) : 5;
    const famCount = profileData.family_member_count || 0;
    const famLimit = sub ? (parseInt(sub.family_members_limit) || 1) : 1;

    function bar(used, limit, label, icon) {
        const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
        const color = pct < 60 ? 'bg-green-500' : pct < 80 ? 'bg-amber-500' : 'bg-red-500';
        const textColor = pct < 60 ? 'text-green-700' : pct < 80 ? 'text-amber-700' : 'text-red-700';
        return `<div class="mb-4">
            <div class="flex justify-between items-center mb-1.5">
                <span class="text-on-surface-variant text-body-md flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px]">${icon}</span>${label}</span>
                <span class="${textColor} font-semibold text-body-md">${used} / ${limit > 0 ? limit : '∞'}</span>
            </div>
            <div class="h-2 bg-outline-variant/30 rounded-full overflow-hidden">
                <div class="h-full ${color} rounded-full progress-bar-fill" style="width: ${pct}%"></div>
            </div>
        </div>`;
    }

    document.getElementById('usage-content').innerHTML =
        bar(reportsUsed, reportsLimit, 'Reports Submitted', 'summarize') +
        bar(chatsUsed, chatsLimit, 'Medical Chats', 'smart_toy') +
        bar(famCount, famLimit, 'Family Members', 'family_restroom') +
        `<p class="text-on-surface-variant text-[13px] mt-2">Usage period: ${usage ? esc(usage.current_period || usage.month) : 'Current month'}</p>`;
}

// ===================== MEDICAL REPORTS =====================
function renderReports() {
    const reports = profileData.reports || [];
    document.getElementById('rpt-count').textContent = profileData.total_reports || reports.length;

    if (reports.length === 0) {
        document.getElementById('reports-list').innerHTML = '<p class="text-on-surface-variant italic text-center py-4">No medical reports submitted.</p>';
        return;
    }

    document.getElementById('reports-list').innerHTML = reports.map(r => {
        const riskColors = { high: 'bg-red-100 text-red-800', medium: 'bg-amber-100 text-amber-800', low: 'bg-green-100 text-green-800' };
        const riskClass = riskColors[(r.risk_level || '').toLowerCase()] || 'bg-zinc-100 text-zinc-800';
        return `<div class="flex items-center justify-between py-2.5 border-b border-outline-variant/20 last:border-0">
            <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[18px] text-amber-600">description</span>
                <div>
                    <p class="font-semibold text-body-md">${esc(r.patient_name || 'Report')}</p>
                    <p class="text-on-surface-variant text-[13px]">${esc(r.report_type)} • ${fmtDate(r.created_at)}</p>
                </div>
            </div>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-bold ${riskClass}">${esc(r.risk_level || 'N/A')}</span>
        </div>`;
    }).join('');
}

// ===================== ADMIN NOTES =====================
function renderNotes() {
    const notes = profileData.admin_notes || [];
    document.getElementById('notes-count').textContent = notes.length;

    if (notes.length === 0) {
        document.getElementById('notes-list').innerHTML = '<p class="text-on-surface-variant italic text-center py-2">No admin notes yet.</p>';
        return;
    }

    document.getElementById('notes-list').innerHTML = notes.map(n => `
        <div class="flex items-start justify-between p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 mb-2">
            <div class="flex-1">
                <p class="text-body-md text-on-surface">${esc(n.note_text)}</p>
                <p class="text-[12px] text-on-surface-variant mt-1">By ${esc(n.admin_email || 'Admin')} • ${fmtDate(n.created_at)}</p>
            </div>
            <button onclick="deleteNote(${n.id})" class="text-error hover:bg-error-container/30 p-1 rounded-lg transition-colors shrink-0 ml-2"><span class="material-symbols-outlined text-[16px]">delete</span></button>
        </div>
    `).join('');
}

// ===================== EDIT PERSONAL =====================
function openEditPersonal() {
    const u = profileData.user;
    document.getElementById('edit-name').value = escPlain(u.name);
    document.getElementById('edit-phone').value = escPlain(u.phone);
    document.getElementById('edit-dob').value = escPlain(u.dob);
    document.getElementById('edit-gender').value = escPlain(u.gender);
    document.getElementById('edit-height').value = u.height || '';
    document.getElementById('edit-weight').value = u.weight || '';
    document.getElementById('edit-medical-conditions').value = escPlain(u.medical_conditions);
    openModal('modal-edit-personal');
}

async function submitEditPersonal(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('user_id', USER_ID);
    fd.append('section', 'personal');
    fd.append('name', document.getElementById('edit-name').value);
    fd.append('phone', document.getElementById('edit-phone').value);
    fd.append('dob', document.getElementById('edit-dob').value);
    fd.append('gender', document.getElementById('edit-gender').value);
    fd.append('height', document.getElementById('edit-height').value);
    fd.append('weight', document.getElementById('edit-weight').value);
    fd.append('medical_conditions', document.getElementById('edit-medical-conditions').value);

    try {
        const res = await fetch(`${API_BASE}/update_user_profile.php`, { method: 'POST', body: fd });
        const json = await res.json();
        if (json.status === 'success') {
            showToast(json.message);
            closeModal('modal-edit-personal');
            loadProfile();
        } else { showToast(json.message, 'error'); }
    } catch (err) { showToast('Network error', 'error'); }
}

// ===================== EDIT MEDICAL =====================
function openEditMedical() {
    const m = profileData.medical_info || {};
    document.getElementById('med-allergies').value = escPlain(m.allergies);
    document.getElementById('med-chronic').value = escPlain(m.chronic_conditions);
    document.getElementById('med-medications').value = escPlain(m.current_medications);
    document.getElementById('med-surgery').value = escPlain(m.surgery_history);
    document.getElementById('med-family-history').value = escPlain(m.family_medical_history);
    document.getElementById('med-smoking').value = escPlain(m.smoking_status);
    document.getElementById('med-alcohol').value = escPlain(m.alcohol_consumption);
    document.getElementById('med-vaccination').value = escPlain(m.vaccination_status);
    document.getElementById('med-checkup-date').value = escPlain(m.last_checkup_date);
    document.getElementById('med-doctor-name').value = escPlain(m.regular_doctor_name);
    document.getElementById('med-doctor-phone').value = escPlain(m.regular_doctor_phone);
    document.getElementById('med-insurance').value = escPlain(m.insurance_provider);
    document.getElementById('med-policy').value = escPlain(m.insurance_policy_number);
    document.getElementById('med-insurance-till').value = escPlain(m.insurance_valid_till);
    openModal('modal-edit-medical');
}

async function submitEditMedical(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('user_id', USER_ID);
    fd.append('section', 'medical');
    fd.append('allergies', document.getElementById('med-allergies').value);
    fd.append('chronic_conditions', document.getElementById('med-chronic').value);
    fd.append('current_medications', document.getElementById('med-medications').value);
    fd.append('surgery_history', document.getElementById('med-surgery').value);
    fd.append('family_medical_history', document.getElementById('med-family-history').value);
    fd.append('smoking_status', document.getElementById('med-smoking').value);
    fd.append('alcohol_consumption', document.getElementById('med-alcohol').value);
    fd.append('vaccination_status', document.getElementById('med-vaccination').value);
    fd.append('last_checkup_date', document.getElementById('med-checkup-date').value);
    fd.append('regular_doctor_name', document.getElementById('med-doctor-name').value);
    fd.append('regular_doctor_phone', document.getElementById('med-doctor-phone').value);
    fd.append('insurance_provider', document.getElementById('med-insurance').value);
    fd.append('insurance_policy_number', document.getElementById('med-policy').value);
    fd.append('insurance_valid_till', document.getElementById('med-insurance-till').value);

    try {
        const res = await fetch(`${API_BASE}/update_user_profile.php`, { method: 'POST', body: fd });
        const json = await res.json();
        if (json.status === 'success') {
            showToast(json.message);
            closeModal('modal-edit-medical');
            loadProfile();
        } else { showToast(json.message, 'error'); }
    } catch (err) { showToast('Network error', 'error'); }
}

// ===================== EMERGENCY CONTACTS CRUD =====================
function openAddContact() {
    document.getElementById('contact-modal-title').textContent = 'Add Emergency Contact';
    document.getElementById('contact-id').value = '';
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-rel').value = 'Other';
    document.getElementById('contact-phone').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-addr').value = '';
    openModal('modal-contact');
}

function openEditContact(id) {
    const c = (profileData.emergency_contacts || []).find(x => x.id == id);
    if (!c) return;
    document.getElementById('contact-modal-title').textContent = 'Edit Emergency Contact';
    document.getElementById('contact-id').value = c.id;
    document.getElementById('contact-name').value = escPlain(c.contact_name);
    document.getElementById('contact-rel').value = escPlain(c.relationship);
    document.getElementById('contact-phone').value = escPlain(c.phone);
    document.getElementById('contact-email').value = escPlain(c.email);
    document.getElementById('contact-addr').value = escPlain(c.address);
    openModal('modal-contact');
}

async function submitContact(e) {
    e.preventDefault();
    const contactId = document.getElementById('contact-id').value;
    const fd = new FormData();
    fd.append('user_id', USER_ID);
    fd.append('action', contactId ? 'update' : 'add');
    if (contactId) fd.append('contact_id', contactId);
    fd.append('contact_name', document.getElementById('contact-name').value);
    fd.append('relationship', document.getElementById('contact-rel').value);
    fd.append('phone', document.getElementById('contact-phone').value);
    fd.append('email', document.getElementById('contact-email').value);
    fd.append('address', document.getElementById('contact-addr').value);

    try {
        const res = await fetch(`${API_BASE}/manage_emergency_contacts.php`, { method: 'POST', body: fd });
        const json = await res.json();
        if (json.status === 'success') {
            showToast(json.message);
            closeModal('modal-contact');
            loadProfile();
        } else { showToast(json.message, 'error'); }
    } catch (err) { showToast('Network error', 'error'); }
}

async function deleteContact(id) {
    if (!confirm('Delete this emergency contact?')) return;
    const fd = new FormData();
    fd.append('user_id', USER_ID);
    fd.append('action', 'delete');
    fd.append('contact_id', id);
    try {
        const res = await fetch(`${API_BASE}/manage_emergency_contacts.php`, { method: 'POST', body: fd });
        const json = await res.json();
        if (json.status === 'success') { showToast('Contact deleted'); loadProfile(); }
        else { showToast(json.message, 'error'); }
    } catch (err) { showToast('Network error', 'error'); }
}

// ===================== ADMIN NOTES =====================
async function addNote() {
    const input = document.getElementById('new-note-input');
    const text = input.value.trim();
    if (!text) { showToast('Please enter a note', 'error'); return; }

    const fd = new FormData();
    fd.append('user_id', USER_ID);
    fd.append('action', 'add');
    fd.append('note_text', text);

    try {
        const res = await fetch(`${API_BASE}/manage_admin_notes.php`, { method: 'POST', body: fd });
        const json = await res.json();
        if (json.status === 'success') {
            showToast('Note added');
            input.value = '';
            loadProfile();
        } else { showToast(json.message, 'error'); }
    } catch (err) { showToast('Network error', 'error'); }
}

async function deleteNote(id) {
    if (!confirm('Delete this note?')) return;
    const fd = new FormData();
    fd.append('user_id', USER_ID);
    fd.append('action', 'delete');
    fd.append('note_id', id);
    try {
        const res = await fetch(`${API_BASE}/manage_admin_notes.php`, { method: 'POST', body: fd });
        const json = await res.json();
        if (json.status === 'success') { showToast('Note deleted'); loadProfile(); }
        else { showToast(json.message, 'error'); }
    } catch (err) { showToast('Network error', 'error'); }
}

// ===================== ADMIN ACTIONS =====================
async function handleAction(action) {
    const fd = new FormData();
    fd.append('user_id', USER_ID);
    fd.append('action', action);

    try {
        const res = await fetch(`${API_BASE}/admin_user_actions.php`, { method: 'POST', body: fd });
        const json = await res.json();
        if (json.status === 'success') {
            if (action === 'export') {
                // Download as JSON file
                const blob = new Blob([JSON.stringify(json.export, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `user_${USER_ID}_export_${new Date().toISOString().slice(0,10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('User data exported');
            } else {
                showToast(json.message);
                loadProfile();
            }
        } else { showToast(json.message, 'error'); }
    } catch (err) { showToast('Network error', 'error'); }
}

function handleBlockToggle() {
    const isBlocked = Number(profileData.user?.is_blocked) === 1;
    const action = isBlocked ? 'unblock' : 'block';
    if (!confirm(`${isBlocked ? 'Unblock' : 'Block'} this user?`)) return;
    handleAction(action);
}

function confirmDeleteUser() {
    document.getElementById('delete-user-name').textContent = profileData.user?.name || 'this user';
    document.getElementById('delete-confirm-input').value = '';
    openModal('modal-confirm-delete');
}

async function executeDeleteUser() {
    if (document.getElementById('delete-confirm-input').value !== 'DELETE') {
        showToast('Please type DELETE to confirm', 'error');
        return;
    }
    closeModal('modal-confirm-delete');
    const fd = new FormData();
    fd.append('user_id', USER_ID);
    fd.append('action', 'delete');
    try {
        const res = await fetch(`${API_BASE}/admin_user_actions.php`, { method: 'POST', body: fd });
        const json = await res.json();
        if (json.status === 'success') {
            showToast(json.message);
            setTimeout(() => { window.location.href = 'dashboard.php'; }, 1500);
        } else { showToast(json.message, 'error'); }
    } catch (err) { showToast('Network error', 'error'); }
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', loadProfile);
</script>
</body>
</html>
