<?php
// api/cancel_subscription.php
header("Content-Type: application/json");

require_once '../backend/check_role.php';
hasAccess(['Super Admin', 'Admin']);

require '../backend/db.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed. Use POST."]);
    exit;
}

$subscription_id = intval($_POST['subscription_id'] ?? 0);

if ($subscription_id <= 0) {
    http_response_code(422);
    echo json_encode(["status" => "error", "message" => "Invalid subscription_id."]);
    exit;
}

try {
    // 1. Verify subscription exists
    $sub_stmt = $pdo->prepare("SELECT user_id FROM subscriptions WHERE id = :id");
    $sub_stmt->execute(['id' => $subscription_id]);
    $sub = $sub_stmt->fetch();
    if (!$sub) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Subscription not found."]);
        exit;
    }

    // 2. Cancel subscription (set status to CANCELLED, active to 0, is_active to 0)
    $update_sub = $pdo->prepare("
        UPDATE subscriptions 
        SET status = 'CANCELLED', 
            active = 0, 
            is_active = 0, 
            updated_at = NOW(),
            expiry_date = NOW()
        WHERE id = :id
    ");
    $update_sub->execute(['id' => $subscription_id]);

    // 3. Update corresponding user's status to free
    $update_user = $pdo->prepare("UPDATE users SET subscription_status = 'free' WHERE id = :user_id");
    $update_user->execute(['user_id' => $sub['user_id']]);

    echo json_encode([
        "status" => "success",
        "message" => "Subscription has been cancelled successfully."
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
