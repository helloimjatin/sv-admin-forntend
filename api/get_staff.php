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
    // Select admin details (excluding passwords)
    $query = "SELECT id, name, email, role, last_login, created_at 
              FROM admin_users 
              ORDER BY created_at DESC";

    $stmt = $pdo->query($query);
    $staff = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "count" => count($staff),
        "data" => $staff
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error"]);
}