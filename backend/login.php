<?php
// backend/login.php
session_start();
require 'db.php'; // Pulls in the connection from Step 2

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 1. Grab email
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    // 2. Query admin_users JOIN admin_roles to retrieve role name
    $stmt = $pdo->prepare(
        'SELECT u.id, u.email, u.password_hash, u.is_active, r.name AS role_name
         FROM admin_users u
         INNER JOIN admin_roles r ON u.role_id = r.id
         WHERE u.email = :email
         LIMIT 1'
    );
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    // Hash the inputted password so it matches the secure format in your database
    $hashed_password = hash('sha256', $password);

    // 3. Compare the hashed password with the password_hash column
    if ($user && $user['password_hash'] === $hashed_password) {

        // 4. Check if the account is active (1 = active, 0 = inactive)
        if ((int) $user['is_active'] === 0) {
            header('Location: ../login.php?error=blocked');
            exit;
        }

        // 5. Set session variables for authentication and RBAC
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_id'] = $user['id'];
        $_SESSION['admin_role'] = $user['role_name']; // aliased from r.name

        // Redirect to the dashboard upon success
        header('Location: ../dashboard.php');
        exit;
    } else {
        // Redirect back to login upon failure
        header('Location: ../login.php?error=invalid');
        exit;
    }
}
?>