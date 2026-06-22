<?php
// api/update_user_profile.php
// POST endpoint to update user personal info and medical info
header("Content-Type: application/json");

require_once '../backend/check_role.php';
hasAccess(['Super Admin', 'Admin']);
require '../backend/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit;
}

$user_id = intval($_POST['user_id'] ?? 0);
if ($user_id <= 0) {
    http_response_code(422);
    echo json_encode(["status" => "error", "message" => "user_id is required"]);
    exit;
}

// Check user exists
$check = $pdo->prepare("SELECT id FROM users WHERE id = :id");
$check->execute(['id' => $user_id]);
if (!$check->fetch()) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "User not found"]);
    exit;
}

$section = $_POST['section'] ?? 'personal'; // 'personal' or 'medical'

try {
    if ($section === 'personal') {
        // Update users table
        $fields = [];
        $params = ['id' => $user_id];

        $allowed = ['name', 'phone', 'dob', 'gender', 'height', 'weight', 'medical_conditions'];
        foreach ($allowed as $f) {
            if (isset($_POST[$f])) {
                $fields[] = "$f = :$f";
                $params[$f] = $_POST[$f] === '' ? null : $_POST[$f];
            }
        }

        if (empty($fields)) {
            echo json_encode(["status" => "error", "message" => "No fields to update"]);
            exit;
        }

        $sql = "UPDATE users SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode(["status" => "success", "message" => "Personal details updated successfully"]);

    } elseif ($section === 'medical') {
        // Upsert user_medical_info
        $med_fields = [
            'allergies', 'chronic_conditions', 'current_medications',
            'surgery_history', 'family_medical_history',
            'smoking_status', 'alcohol_consumption', 'vaccination_status',
            'last_checkup_date', 'regular_doctor_name', 'regular_doctor_phone',
            'insurance_provider', 'insurance_policy_number', 'insurance_valid_till'
        ];

        $data = ['user_id' => $user_id];
        foreach ($med_fields as $f) {
            $data[$f] = isset($_POST[$f]) && $_POST[$f] !== '' ? $_POST[$f] : null;
        }

        // Check if record exists
        $exists = $pdo->prepare("SELECT id FROM user_medical_info WHERE user_id = :uid");
        $exists->execute(['uid' => $user_id]);

        if ($exists->fetch()) {
            // Update
            $sets = [];
            $params = ['uid' => $user_id];
            foreach ($med_fields as $f) {
                $sets[] = "$f = :$f";
                $params[$f] = $data[$f];
            }
            $sql = "UPDATE user_medical_info SET " . implode(', ', $sets) . " WHERE user_id = :uid";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        } else {
            // Insert
            $cols = ['user_id'];
            $vals = [':user_id'];
            $params = ['user_id' => $user_id];
            foreach ($med_fields as $f) {
                $cols[] = $f;
                $vals[] = ":$f";
                $params[$f] = $data[$f];
            }
            $sql = "INSERT INTO user_medical_info (" . implode(', ', $cols) . ") VALUES (" . implode(', ', $vals) . ")";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }

        echo json_encode(["status" => "success", "message" => "Medical information updated successfully"]);

    } else {
        echo json_encode(["status" => "error", "message" => "Invalid section"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
