<?php
// api/get_subscriptions.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require '../backend/db.php';

$master_api_key = "sehat_live_2026_secure_key";
if (($_GET['api_key'] ?? '') !== $master_api_key) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

try {
    // 1. Calculate Stats
    $active_count = $pdo->query("SELECT COUNT(*) FROM subscriptions WHERE status IN ('ACTIVE', 'PENDING')")->fetchColumn();
    $expired_count = $pdo->query("SELECT COUNT(*) FROM subscriptions WHERE status = 'EXPIRED' OR (expiry_date IS NOT NULL AND expiry_date < NOW())")->fetchColumn();
    $expiring_soon_count = $pdo->query("SELECT COUNT(*) FROM subscriptions WHERE status IN ('ACTIVE', 'PENDING') AND expiry_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)")->fetchColumn();
    
    $revenue_val = $pdo->query("SELECT SUM(amount) FROM payments WHERE status IN ('captured', 'completed', 'success')")->fetchColumn();
    $total_revenue = $revenue_val ? floatval($revenue_val) : 0.0;

    $stats = [
        "active_subs" => intval($active_count),
        "expired_subs" => intval($expired_count),
        "expiring_soon" => intval($expiring_soon_count),
        "total_revenue" => $total_revenue
    ];

    // 2. Fetch Subscription Records
    $query = "SELECT s.id, s.user_id, u.name AS customer_name, u.phone AS customer_email, 
                     p.plan_name AS plan, p.price, s.start_date, s.expiry_date, s.status, s.auto_renew, s.current_plan_id
              FROM subscriptions s
              LEFT JOIN users u ON s.user_id = u.id
              LEFT JOIN plans p ON s.current_plan_id = p.id
              ORDER BY s.id DESC";

    $stmt = $pdo->query($query);
    $subscriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Fetch Plans for Upgrade/Downgrade dropdowns
    $plans = $pdo->query("SELECT id, plan_code, plan_name, price FROM plans ORDER BY price ASC")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "stats" => $stats,
        "subscriptions" => $subscriptions,
        "plans" => $plans
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
