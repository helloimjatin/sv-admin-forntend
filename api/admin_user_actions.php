<?php
// api/admin_user_actions.php
// POST endpoint for admin actions: block, unblock, delete, export, reset_api
header("Content-Type: application/json");

require_once '../backend/check_role.php';
hasAccess(['Super Admin', 'Admin']);
require '../backend/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit;
}

$action = $_POST['action'] ?? '';
$user_id = intval($_POST['user_id'] ?? 0);

if ($user_id <= 0) {
    http_response_code(422);
    echo json_encode(["status" => "error", "message" => "user_id is required"]);
    exit;
}

// Verify user exists
$check = $pdo->prepare("SELECT id, name FROM users WHERE id = :id");
$check->execute(['id' => $user_id]);
$user = $check->fetch();
if (!$user) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "User not found"]);
    exit;
}

try {
    switch ($action) {

        case 'block':
            $pdo->prepare("UPDATE users SET is_blocked = 1 WHERE id = :id")->execute(['id' => $user_id]);
            echo json_encode(["status" => "success", "message" => "User blocked successfully"]);
            break;

        case 'unblock':
            $pdo->prepare("UPDATE users SET is_blocked = 0 WHERE id = :id")->execute(['id' => $user_id]);
            echo json_encode(["status" => "success", "message" => "User unblocked successfully"]);
            break;

        case 'reset_api':
            $pdo->prepare("UPDATE users SET api_calls = 0 WHERE id = :id")->execute(['id' => $user_id]);
            echo json_encode(["status" => "success", "message" => "API calls reset to 0"]);
            break;

        case 'delete':
            // Only Super Admin can delete
            if ($_SESSION['admin_role'] !== 'Super Admin') {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Only Super Admin can delete users"]);
                exit;
            }

            // Delete in order (foreign keys cascade, but be explicit)
            $tables = ['admin_notes', 'emergency_contacts', 'user_medical_info', 'usage_tracking',
                       'payments', 'reports', 'subscriptions', 'family_members',
                       'reminders', 'user_notifications', 'feedbacks'];
            foreach ($tables as $t) {
                try {
                    $pdo->prepare("DELETE FROM `$t` WHERE user_id = :uid")->execute(['uid' => $user_id]);
                } catch (PDOException $e) {
                    // Table might not have user_id column — skip
                }
            }
            // Finally delete the user
            $pdo->prepare("DELETE FROM users WHERE id = :id")->execute(['id' => $user_id]);
            echo json_encode(["status" => "success", "message" => "User '{$user['name']}' and all associated data deleted permanently"]);
            break;

        case 'export':
            // GDPR-style export — collect all user data
            $export = ['user' => $user];

            $tables_to_export = [
                'subscriptions' => "SELECT * FROM subscriptions WHERE user_id = :uid",
                'payments' => "SELECT * FROM payments WHERE user_id = :uid ORDER BY payment_date DESC",
                'reports' => "SELECT * FROM reports WHERE user_id = :uid ORDER BY created_at DESC",
                'family_members' => "SELECT * FROM family_members WHERE user_id = :uid",
                'emergency_contacts' => "SELECT * FROM emergency_contacts WHERE user_id = :uid",
                'user_medical_info' => "SELECT * FROM user_medical_info WHERE user_id = :uid",
                'usage_tracking' => "SELECT * FROM usage_tracking WHERE user_id = :uid",
                'reminders' => "SELECT * FROM reminders WHERE user_id = :uid",
                'user_notifications' => "SELECT * FROM user_notifications WHERE user_id = :uid ORDER BY created_at DESC LIMIT 100",
                'admin_notes' => "SELECT * FROM admin_notes WHERE user_id = :uid ORDER BY created_at DESC"
            ];

            foreach ($tables_to_export as $key => $sql) {
                try {
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute(['uid' => $user_id]);
                    $export[$key] = $stmt->fetchAll();
                } catch (PDOException $e) {
                    $export[$key] = [];
                }
            }

            echo json_encode([
                "status" => "success",
                "message" => "User data exported",
                "export" => $export,
                "exported_at" => date('Y-m-d H:i:s')
            ]);
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Invalid action. Use: block, unblock, delete, export, reset_api"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
