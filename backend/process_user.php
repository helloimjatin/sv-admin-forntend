<?php
// backend/process_user.php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: ../index.html');
    exit;
}

require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';

    if ($username !== '') {
        try {
            $stmt = $pdo->prepare('INSERT INTO app_user (username) VALUES (:username)');
            $stmt->execute([
                'username' => $username
            ]);
        } catch (PDOException $e) {
            // Handle duplicate username or database error if needed
        }
    }
}

header('Location: ../dashboard.php');
exit;
?>
