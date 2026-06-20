<?php
// api/add_staff.php
header("Content-Type: application/json");

require '../backend/db.php';
require_once '../backend/check_role.php';

// Only Super Admins may create new staff accounts
// NOTE: must match the exact string stored in $_SESSION['admin_role']
//       which comes from admin_roles.name — confirmed as 'Super Admin'
hasAccess(['Super Admin']);

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed. Use POST."]);
    exit;
}

// --- 1. Collect and sanitise inputs ---
$name     = trim($_POST['name']     ?? '');
$username = trim($_POST['username'] ?? '');
$email    = trim($_POST['email']    ?? '');
$password = trim($_POST['password'] ?? '');
$role_id  = intval($_POST['role_id'] ?? 0);

// --- 2. Basic validation ---
$errors = [];

if ($name === '') {
    $errors[] = "Name is required.";
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "A valid email address is required.";
}
if (strlen($password) < 6) {
    $errors[] = "Password must be at least 6 characters.";
}
if ($role_id <= 0) {
    $errors[] = "A valid role_id is required.";
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(["status" => "error", "message" => implode(" ", $errors)]);
    exit;
}

// --- 3. Hash the password using SHA-256 (consistent with login.php) ---
$password_hash = hash('sha256', $password);

// --- 4. Insert into admin_users ---
// Confirmed columns: id, email, password_hash, is_active, role_id
// NOTE: If you have added a 'name' column to admin_users, include it below.
//       Right now the table has no 'name' column — email is used as the identifier.
try {
    // Check for duplicate email first
    $check = $pdo->prepare("SELECT id FROM admin_users WHERE email = :email LIMIT 1");
    $check->execute(['email' => $email]);

    if ($check->fetch()) {
        http_response_code(409); // 409 Conflict
        echo json_encode(["status" => "error", "message" => "A staff account with this email already exists."]);
        exit;
    }

    // Insert the new staff member into the database
    $stmt = $pdo->prepare('INSERT INTO admin_users (name, username, email, password_hash, role_id, is_active) VALUES (:name, :username, :email, :password_hash, :role_id, 1)');

    $stmt->execute([
        'name'          => $name,
        'username'      => $username,
        'email'         => $email,
        'password_hash' => hash('sha256', $password),
        'role_id'       => $role_id
    ]);

    $new_id = $pdo->lastInsertId();

    http_response_code(201); // 201 Created
    echo json_encode([
        "status" => "success",
        "message" => "Staff member created successfully.",
        "data" => [
            "id" => $new_id,
            "email" => $email,
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
