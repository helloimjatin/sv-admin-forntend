<?php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: index.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>SehatVaani - Add New User</title>
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
                      "data-mono": ["jetbrainsMono"],
                      "label-sm": ["Hanken Grotesk"],
                      "body-lg": ["Hanken Grotesk"],
                      "display-lg": ["Hanken Grotesk"],
                      "headline-md": ["Hanken Grotesk"],
                      "title-sm": ["Hanken Grotesk"]
              },
              "fontSize": {
                      "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                      "data-mono": ["13px", {"lineHeight": "18px", "fontWeight": "400"}],
                      "label-sm": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
                      "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                      "display-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                      "headline-md": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                      "title-sm": ["18px", {"lineHeight": "24px", "fontWeight": "600"}]
              }
            },
          },
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
    </style>
</head>
<body class="bg-background text-on-surface font-body-md min-h-screen flex flex-col">
<!-- TopNavBar -->
<header class="bg-surface-container-lowest dark:bg-inverse-surface text-primary dark:text-inverse-primary font-body-md text-body-md docked full-width top-0 sticky z-50 border-b border-outline-variant dark:border-outline flat no shadows flex justify-between items-center w-full px-container-padding h-16">
    <div class="flex items-center gap-gutter">
        <img alt="SehatVaani Logo" class="h-8 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWQldk6JtoE4LIjgZKnXi5tieh7nwkCU3pRJ8zXXLOgMeDepRf2Ea4aeSyE-jHqme1z_KeX0v3FjucVBrrgSahEOAl6DkfhIOi9K5OzU1yPUJHMMt-wRbnV2CPASElg4QAmCVyFxOhC8-yqxqHijOJptDp0PgWE2_1JsGS_beRCyXlE4C2-prbkeVxbV3ypUqFWssWKp2922rpnx48I669LM6O8WtI-0r_pBXqE5ZI-VhSMBhTy4QPDBFQVNa6Ka6SibhS-a4f09yd"/>
        <span class="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-1 rounded-full ml-2">Admin</span>
    </div>
    <nav class="hidden md:flex gap-gutter h-full">
        <a class="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors flex items-center h-full" href="dashboard.php">Dashboard</a>
        <a class="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors flex items-center h-full" href="#">Patients</a>
        <a class="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors flex items-center h-full" href="#">Staff</a>
        <a class="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors flex items-center h-full" href="#">Inventory</a>
    </nav>
    <div class="flex items-center gap-base">
        <a href="backend/logout.php" class="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-4 py-2 rounded-lg hover:bg-secondary-fixed-dim transition-colors inline-block text-center">Sign Out</a>
    </div>
</header>
<div class="flex flex-1 overflow-hidden">
    <!-- SideNavBar (Hidden on Mobile) -->
    <aside class="bg-surface dark:bg-on-background text-primary dark:text-inverse-primary font-label-sm text-label-sm docked left-0 h-screen w-64 border-r border-outline-variant dark:border-outline flat no shadows flex flex-col h-full py-stack-lg px-gutter gap-base hidden md:flex shrink-0">
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
        <div class="flex justify-between items-center mb-4">
            <h1 class="font-display-lg text-display-lg text-on-surface">Add New User</h1>
        </div>
        
        <a href="dashboard.php" style="display: inline-block; margin-bottom: 20px; padding: 8px 16px; background-color: #f1f5f9; color: #334155; text-decoration: none; border-radius: 4px; font-weight: bold; width: fit-content;">&larr; Back to Dashboard</a>

        <div class="bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-container-padding max-w-xl">
            <form method="POST" action="backend/process_user.php" class="flex flex-col gap-gutter">
                <div class="flex flex-col gap-base">
                    <label for="username" class="font-label-sm text-label-sm text-on-surface-variant">Username</label>
                    <input type="text" id="username" name="username" required class="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" placeholder="Enter username">
                </div>
                

                
                <div>
                    <button type="submit" class="bg-primary text-on-primary font-label-sm text-label-sm px-6 py-2.5 rounded-lg hover:bg-primary-container transition-colors font-semibold">Create User</button>
                </div>
            </form>
        </div>
    </main>
</div>
</body>
</html>
