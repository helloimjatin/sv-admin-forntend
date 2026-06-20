<?php
// backend/reset_api.php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: ../index.html');
    exit;
}

require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = $_POST['user_id'] ?? null;
    $redirectUrl = $_POST['redirect_url'] ?? '../dashboard.php';

    if ($userId) {
        try {
            $stmt = $pdo->prepare('UPDATE app_user SET api_calls = 0 WHERE id = :id');
            $stmt->execute(['id' => $userId]);
        } catch (PDOException $e) {
            // Handle database error if needed
        }
    }
    
    header('Location: ' . $redirectUrl);
    exit;
}

header('Location: ../dashboard.php');
exit;
?>
