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
    // Fetch reports and join with the users table to see who manages the account
    $query = "SELECT r.id, r.patient_name, r.report_type, r.risk_level, r.created_at, u.name as account_holder 
              FROM reports r 
              LEFT JOIN users u ON r.user_id = u.id 
              ORDER BY r.created_at DESC";

    $stmt = $pdo->query($query);
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "count" => count($records),
        "data" => $records
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error"]);
}