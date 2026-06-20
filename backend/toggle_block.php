<?php
// backend/toggle_block.php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: ../index.html');
    exit;
}

require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
    $action = $_POST['action'] ?? null;
    $redirect = $_POST['redirect_url'] ?? '../dashboard.php';

    if ($userId > 0 && ($action === 'block' || $action === 'unblock')) {
        try {
            if ($action === 'block') {
                $stmt = $pdo->prepare('UPDATE users SET is_blocked = 1 WHERE id = :id');
            } else {
                $stmt = $pdo->prepare('UPDATE users SET is_blocked = 0 WHERE id = :id');
            }
            $stmt->execute(['id' => $userId]);

            if ($stmt->rowCount() > 0) {
                $_SESSION['success'] = 'User ' . ($action === 'block' ? 'blocked' : 'unblocked') . ' successfully.';
            } else {
                $_SESSION['error'] = 'User not found or status unchanged.';
            }
        } catch (PDOException $e) {
            $_SESSION['error'] = 'Database error: ' . $e->getMessage();
        }

        header('Location: ' . $redirect);
        exit;
    } else {
        $_SESSION['error'] = 'Invalid user ID or action.';
        header('Location: ' . $redirect);
        exit;
    }
}

header('Location: ../dashboard.php');
exit;
?>
