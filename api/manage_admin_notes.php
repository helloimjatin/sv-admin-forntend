<?php
// api/manage_admin_notes.php
// POST endpoint: action = add | delete
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
$admin_id = intval($_SESSION['admin_id'] ?? 0);

if ($user_id <= 0) {
    http_response_code(422);
    echo json_encode(["status" => "error", "message" => "user_id is required"]);
    exit;
}

try {
    switch ($action) {

        case 'add':
            $note = trim($_POST['note_text'] ?? '');
            if ($note === '') {
                echo json_encode(["status" => "error", "message" => "Note text is required"]);
                exit;
            }

            $stmt = $pdo->prepare("
                INSERT INTO admin_notes (user_id, admin_id, note_text)
                VALUES (:uid, :aid, :note)
            ");
            $stmt->execute([
                'uid' => $user_id,
                'aid' => $admin_id,
                'note' => $note
            ]);

            echo json_encode([
                "status" => "success",
                "message" => "Note added successfully",
                "id" => $pdo->lastInsertId()
            ]);
            break;

        case 'delete':
            $note_id = intval($_POST['note_id'] ?? 0);
            if ($note_id <= 0) {
                echo json_encode(["status" => "error", "message" => "note_id is required"]);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM admin_notes WHERE id = :id AND user_id = :uid");
            $stmt->execute(['id' => $note_id, 'uid' => $user_id]);

            echo json_encode(["status" => "success", "message" => "Note deleted"]);
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Invalid action. Use: add, delete"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
