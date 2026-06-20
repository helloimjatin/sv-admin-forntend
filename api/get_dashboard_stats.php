<?php
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
    $stats = [];

    // User Metrics
    $stats['total_users'] = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $stats['active_users'] = $pdo->query("SELECT COUNT(*) FROM users WHERE is_blocked = 0")->fetchColumn();
    $stats['premium_users'] = $pdo->query("SELECT COUNT(*) FROM users WHERE subscription_status != 'free'")->fetchColumn();
    $stats['free_users'] = $pdo->query("SELECT COUNT(*) FROM users WHERE subscription_status = 'free'")->fetchColumn();
    $stats['today_signups'] = $pdo->query("SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()")->fetchColumn();

    // Activity Metrics
    $stats['today_reports'] = $pdo->query("SELECT COUNT(*) FROM reports WHERE DATE(created_at) = CURDATE()")->fetchColumn();
    $stats['today_ai_chats'] = $pdo->query("SELECT COUNT(*) FROM ai_request_logs WHERE DATE(created_at) = CURDATE()")->fetchColumn();

    // Revenue Metric
    $revenue = $pdo->query("SELECT SUM(amount) FROM payments WHERE status = 'captured' AND DATE(payment_date) = CURDATE()")->fetchColumn();
    $stats['today_revenue'] = $revenue ? "₹" . number_format($revenue, 2) : "₹0.00";

    // Support & Health Metrics
    $stats['pending_issues'] = $pdo->query("SELECT COUNT(*) FROM support_tickets WHERE status IN ('open', 'in_progress')")->fetchColumn();

    $unhealthy_systems = $pdo->query("SELECT COUNT(*) FROM system_health_status WHERE status != 'healthy'")->fetchColumn();
    $stats['system_health'] = $unhealthy_systems > 0 ? "Needs Attention" : "100% Healthy";

    echo json_encode(["status" => "success", "data" => $stats]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error"]);
}