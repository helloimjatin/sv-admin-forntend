<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require '../backend/db.php';
require_once '../backend/check_role.php';
hasAccess(['Super Admin']);

$master_api_key = "sehat_live_2026_secure_key";
if (($_GET['api_key'] ?? '') !== $master_api_key) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

try {
    // admin_users confirmed columns: id, email, is_active, role_id
    // 'name' and 'last_login' do not exist — using email as display name
    $query = "SELECT au.id,
                     au.email AS name,
                     au.email,
                     COALESCE(ar.name, 'No Role') AS role,
                     NULL AS last_login
              FROM admin_users au
              LEFT JOIN admin_roles ar ON au.role_id = ar.id
              ORDER BY au.id DESC";

    $stmt = $pdo->query($query);
    $staff = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "count"  => count($staff),
        "data"   => $staff
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}