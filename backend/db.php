<?php
$host = "localhost";
$dbname = "sehat06c_sehatvaani_db";
$username = "root"; // 'root' is the default username for local servers
$password = "";     // The password is intentionally left blank for local servers

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);


} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>