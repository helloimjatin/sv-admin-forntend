<?php
// backend/mark_paid.php
session_start();

// 1. Session security check: ensure admin is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: ../index.html');
    exit;
}

// 2. Require database connection
require 'db.php';

// 3. Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $transactionId = $_POST['transaction_id'] ?? null;

    if ($transactionId) {
        try {
            // 4. Validate if transaction exists in database
            $checkStmt = $pdo->prepare("SELECT id FROM transactions WHERE id = :id LIMIT 1");
            $checkStmt->execute(['id' => $transactionId]);
            $transaction = $checkStmt->fetch();

            if ($transaction) {
                // 5. Only UPDATE if transaction found
                $updateStmt = $pdo->prepare("UPDATE transactions SET status = 'Paid' WHERE id = :id");
                $updateStmt->execute(['id' => $transactionId]);

                // 6. Store success feedback message in $_SESSION variables
                $_SESSION['success'] = "Transaction #$transactionId has been successfully marked as Paid.";
            } else {
                // 7. Store error feedback message if transaction does not exist
                $_SESSION['error'] = "Error: Transaction #$transactionId not found.";
            }
        } catch (PDOException $e) {
            // 8. Catch and log PDOException errors for debugging
            error_log("PDOException in mark_paid.php: " . $e->getMessage());
            $_SESSION['error'] = "An error occurred while updating the transaction status.";
        }
    } else {
        // 9. Store error feedback if transaction ID is missing
        $_SESSION['error'] = "Error: Invalid or missing transaction ID.";
    }
}

// 10. Redirect back to billing.php
header('Location: ../billing.php');
exit;
?>
