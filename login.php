<?php
session_start();
// Include the database connection from the backend folder
require_once 'backend/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Ensure variables are handled with null coalescing to avoid warnings
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    // Use parameterized query to prevent SQL injection and check if account is active
    $stmt = $pdo->prepare('SELECT * FROM admin_users WHERE email = :email AND is_active = 1 LIMIT 1');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    // Password comparison using SHA-256 hashing
    if ($user && $user['password_hash'] === hash('sha256', $password)) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_id'] = $user['id']; // optional: store user ID
        // Redirect to dashboard.php on success
        header('Location: dashboard.php');
        exit;
    } else {
        // Redirect to login.php?error=invalid on failure
        header('Location: login.php?error=invalid');
        exit;
    }
}
?>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>SehatVaani Admin Login</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700&amp;family=JetBrains+Mono:wght@400&amp;display=swap" rel="stylesheet"/>
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
                        "secondary-fixed": "#e0f2fe",
                        "on-error-container": "#93000a",
                        "on-error": "#ffffff",
                        "on-secondary-fixed": "#082f49",
                        "primary": "#0ea5e9",
                        "secondary-fixed-dim": "#bae6fd",
                        "on-primary-fixed": "#082f49",
                        "on-tertiary-container": "#fffbff",
                        "on-primary-container": "#f0f9ff",
                        "on-surface-variant": "#3d4943",
                        "on-secondary": "#ffffff",
                        "outline": "#6d7a73",
                        "secondary-container": "#e0f2fe",
                        "error-container": "#ffdad6",
                        "on-secondary-container": "#0c4a6e",
                        "surface-container-low": "#f0f9ff",
                        "on-secondary-fixed-variant": "#075985",
                        "on-tertiary-fixed": "#2a1700",
                        "on-primary": "#ffffff",
                        "tertiary": "#825100",
                        "on-tertiary": "#ffffff",
                        "surface": "#f8f9ff",
                        "on-tertiary-fixed-variant": "#653e00",
                        "on-background": "#0b1c30",
                        "primary-container": "#0284c7",
                        "on-surface": "#0b1c30",
                        "surface-container": "#e5eeff",
                        "outline-variant": "#bccac1",
                        "on-primary-fixed-variant": "#0369a1",
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
    </style>
</head>
<body class="bg-secondary-fixed min-h-screen flex items-center justify-center p-container-padding font-body-md text-on-background">
<!-- Login Container -->
<main class="w-full max-w-md bg-surface-container-lowest border-[0.5px] border-outline-variant rounded-lg p-container-padding shadow-sm flex flex-col gap-stack-lg">
<!-- Header Section -->
<header class="flex flex-col items-center text-center gap-stack-md">
<div class="w-full flex items-center justify-center mb-stack-sm">
<img alt="SehatVaani Logo" class="h-16 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWQldk6JtoE4LIjgZKnXi5tieh7nwkCU3pRJ8zXXLOgMeDepRf2Ea4aeSyE-jHqme1z_KeX0v3FjucVBrrgSahEOAl6DkfhIOi9K5OzU1yPUJHMMt-wRbnV2CPASElg4QAmCVyFxOhC8-yqxqHijOJptDp0PgWE2_1JsGS_beRCyXlE4C2-prbkeVxbV3ypUqFWssWKp2922rpnx48I669LM6O8WtI-0r_pBXqE5ZI-VhSMBhTy4QPDBFQVNa6Ka6SibhS-a4f09yd"/>
</div>
<p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Admin Console</p>
</header>

<!-- Error Display -->
<?php if (isset($_GET['error']) && $_GET['error'] === 'invalid'): ?>
    <div class="bg-error-container text-on-error-container p-3 rounded text-center text-body-md font-bold">
        Invalid email or password.
    </div>
<?php endif; ?>

<!-- Form Section -->
<form action="login.php" class="flex flex-col gap-gutter" method="POST">
<div class="flex flex-col gap-stack-sm">
<label class="font-body-md text-body-md font-bold text-on-surface" for="email">Email</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style="font-size: 20px;">mail</span>
<input class="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border-[0.5px] border-outline-variant rounded focus:outline-none focus:border-primary focus:border-[1px] transition-colors text-body-md font-body-md text-on-surface" id="email" name="email" placeholder="Enter your email" required="" type="email"/>
</div>
</div>
<div class="flex flex-col gap-stack-sm">
<div class="flex justify-between items-center">
<label class="font-body-md text-body-md font-bold text-on-surface" for="password">Password</label>
<a class="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors" href="#">Forgot password?</a>
</div>
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style="font-size: 20px;">lock</span>
<input class="w-full pl-10 pr-10 py-2 bg-surface-container-lowest border-[0.5px] border-outline-variant rounded focus:outline-none focus:border-primary focus:border-[1px] transition-colors text-body-md font-body-md text-on-surface" id="password" name="password" placeholder="Enter your password" required="" type="password"/>
<button aria-label="Toggle password visibility" class="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors" type="button" onclick="const p = document.getElementById('password'); const icon = this.querySelector('span'); if (p.type === 'password') { p.type = 'text'; icon.textContent = 'visibility'; } else { p.type = 'password'; icon.textContent = 'visibility_off'; }">
<span class="material-symbols-outlined" style="font-size: 20px;">visibility_off</span>
</button>
</div>
</div>
<div class="flex items-center gap-2 mt-stack-sm">
<input class="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-surface-container-lowest" id="remember" name="remember" type="checkbox"/>
<label class="font-body-md text-body-md text-on-surface-variant" for="remember">Remember me</label>
</div>
<button class="mt-stack-md w-full py-2 bg-primary text-on-primary rounded-lg font-title-sm text-title-sm hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2" type="submit">
                Sign In
                <span class="material-symbols-outlined" style="font-size: 20px;">arrow_forward</span>
</button>
</form>
<!-- Footer Section -->
<footer class="mt-stack-sm pt-gutter border-t-[0.5px] border-outline-variant text-center">
<p class="font-label-sm text-label-sm text-on-surface-variant flex items-center justify-center gap-1">
<span class="material-symbols-outlined" style="font-size: 16px;">verified_user</span>
                Secure Medical Grade Authentication
            </p>
</footer>
</main>
</body>
</html>
