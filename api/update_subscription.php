<?php
// api/update_subscription.php
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
$plan_id = intval($_POST['plan_id'] ?? 0);

if ($subscription_id <= 0 || $plan_id <= 0) {
    http_response_code(422);
    echo json_encode(["status" => "error", "message" => "Invalid inputs. subscription_id and plan_id are required."]);
    exit;
}

try {
    // 1. Verify subscription exists
    $sub_stmt = $pdo->prepare("SELECT user_id, current_plan_id FROM subscriptions WHERE id = :id");
    $sub_stmt->execute(['id' => $subscription_id]);
    $sub = $sub_stmt->fetch();
    if (!$sub) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Subscription not found."]);
        exit;
    }

    // 2. Verify new plan exists
    $plan_stmt = $pdo->prepare("SELECT plan_code, plan_name FROM plans WHERE id = :id");
    $plan_stmt->execute(['id' => $plan_id]);
    $plan = $plan_stmt->fetch();
    if (!$plan) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Plan not found."]);
        exit;
    }

    // 3. Determine interval (Monthly vs Yearly)
    $days = (stripos($plan['plan_code'], 'yearly') !== false) ? 365 : 30;

    // 4. Update subscription
    $update_sub = $pdo->prepare("
        UPDATE subscriptions 
        SET current_plan_id = :plan_id, 
            status = 'ACTIVE', 
            active = 1, 
            is_active = 1, 
            updated_at = NOW(),
            expiry_date = DATE_ADD(NOW(), INTERVAL :days DAY)
        WHERE id = :id
    ");
    $update_sub->execute([
        'plan_id' => $plan_id,
        'days' => $days,
        'id' => $subscription_id
    ]);

    // 5. Update corresponding user's subscription_status
    $plan_code_lower = strtolower($plan['plan_code']);
    $update_user = $pdo->prepare("UPDATE users SET subscription_status = :status WHERE id = :user_id");
    $update_user->execute([
        'status' => $plan_code_lower,
        'user_id' => $sub['user_id']
    ]);

    echo json_encode([
        "status" => "success",
        "message" => "Subscription upgraded/downgraded to " . $plan['plan_name'] . " successfully."
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
