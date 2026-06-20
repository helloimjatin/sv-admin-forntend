<?php
// 1. Set headers so the browser knows this is a JSON API, not a webpage
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// 2. Connect to the database using your existing file
require '../backend/db.php';

// 3. Define your master API Key (You can move this to the database later)
$master_api_key = "sehat_live_2026_secure_key";

// 4. Check if the incoming request provided the correct API key
$provided_key = $_GET['api_key'] ?? '';

if ($provided_key !== $master_api_key) {
    // If the key is missing or wrong, reject the request
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized: Invalid API Key"]);
    exit;
}

// 5. If the key matches, fetch the data safely
try {
    $stmt = $pdo->query('SELECT id, name, phone, dob, gender, subscription_status, is_blocked, created_at FROM users ORDER BY id DESC');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return the data as a clean JSON package
    echo json_encode([
        "status" => "success",
        "count" => count($users),
        "data" => $users
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
}