<?php
// api/manage_emergency_contacts.php
// POST endpoint: action = add | update | delete
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

try {
    switch ($action) {

        case 'add':
            // Check max 5 contacts
            $count = $pdo->prepare("SELECT COUNT(*) FROM emergency_contacts WHERE user_id = :uid");
            $count->execute(['uid' => $user_id]);
            if (intval($count->fetchColumn()) >= 5) {
                echo json_encode(["status" => "error", "message" => "Maximum 5 emergency contacts allowed"]);
                exit;
            }

            $name = trim($_POST['contact_name'] ?? '');
            $phone = trim($_POST['phone'] ?? '');
            if ($name === '' || $phone === '') {
                echo json_encode(["status" => "error", "message" => "Name and phone are required"]);
                exit;
            }

            $stmt = $pdo->prepare("
                INSERT INTO emergency_contacts (user_id, contact_name, relationship, phone, email, address)
                VALUES (:uid, :name, :rel, :phone, :email, :addr)
            ");
            $stmt->execute([
                'uid' => $user_id,
                'name' => $name,
                'rel' => $_POST['relationship'] ?? 'Other',
                'phone' => $phone,
                'email' => $_POST['email'] ?? null,
                'addr' => $_POST['address'] ?? null
            ]);

            echo json_encode(["status" => "success", "message" => "Emergency contact added", "id" => $pdo->lastInsertId()]);
            break;

        case 'update':
            $contact_id = intval($_POST['contact_id'] ?? 0);
            if ($contact_id <= 0) {
                echo json_encode(["status" => "error", "message" => "contact_id is required"]);
                exit;
            }

            $stmt = $pdo->prepare("
                UPDATE emergency_contacts
                SET contact_name = :name, relationship = :rel, phone = :phone, email = :email, address = :addr
                WHERE id = :id AND user_id = :uid
            ");
            $stmt->execute([
                'name' => trim($_POST['contact_name'] ?? ''),
                'rel' => $_POST['relationship'] ?? 'Other',
                'phone' => trim($_POST['phone'] ?? ''),
                'email' => $_POST['email'] ?? null,
                'addr' => $_POST['address'] ?? null,
                'id' => $contact_id,
                'uid' => $user_id
            ]);

            echo json_encode(["status" => "success", "message" => "Emergency contact updated"]);
            break;

        case 'delete':
            $contact_id = intval($_POST['contact_id'] ?? 0);
            if ($contact_id <= 0) {
                echo json_encode(["status" => "error", "message" => "contact_id is required"]);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM emergency_contacts WHERE id = :id AND user_id = :uid");
            $stmt->execute(['id' => $contact_id, 'uid' => $user_id]);

            echo json_encode(["status" => "success", "message" => "Emergency contact deleted"]);
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Invalid action. Use: add, update, delete"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
