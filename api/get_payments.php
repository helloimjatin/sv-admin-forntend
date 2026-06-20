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
    // Join payments and users to get the name alongside the payment details
    $query = "SELECT p.id, p.razorpay_payment_id as transaction_id, u.name as customer_name, p.amount, p.payment_method, p.status, p.payment_date 
              FROM payments p 
              LEFT JOIN users u ON p.user_id = u.id 
              ORDER BY p.payment_date DESC";

    $stmt = $pdo->query($query);
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "count" => count($payments),
        "data" => $payments
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error"]);
}