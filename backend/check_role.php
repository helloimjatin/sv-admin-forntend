<?php
// backend/check_role.php
// Reusable RBAC helper — include this at the top of any protected page.

// Start session only if one isn't already active
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Gate access to a page by allowed roles.
 *
 * Usage:
 *   require_once 'backend/check_role.php';
 *   hasAccess(['Super Admin', 'Admin']);
 *
 * @param string[] $allowed_roles Roles permitted to view the page.
 */
function hasAccess(array $allowed_roles): void
{
    // 1. Not logged in at all → send to login page
    if (empty($_SESSION['admin_logged_in'])) {
        header('Location: login.php');
        exit;
    }

    // 2. Logged in but role is not in the allowed list → unauthorized
    if (!isset($_SESSION['admin_role']) || !in_array($_SESSION['admin_role'], $allowed_roles, true)) {
        header('Location: dashboard.php?error=unauthorized');
        exit;
    }
}
?>
