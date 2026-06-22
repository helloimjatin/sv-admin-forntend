<?php
/**
 * Migration: Create tables for User Profile feature
 * Run once: php backend/migrate_user_profile.php
 */
require __DIR__ . '/db.php';

$migrations = [

    // 1. User Medical Info
    "CREATE TABLE IF NOT EXISTS user_medical_info (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL UNIQUE,
        allergies TEXT NULL,
        chronic_conditions TEXT NULL,
        current_medications TEXT NULL,
        surgery_history TEXT NULL,
        family_medical_history TEXT NULL,
        smoking_status ENUM('Never','Former','Current') NULL,
        alcohol_consumption ENUM('None','Moderate','Heavy') NULL,
        vaccination_status ENUM('Complete','Incomplete','Unknown') NULL,
        last_checkup_date DATE NULL,
        regular_doctor_name VARCHAR(150) NULL,
        regular_doctor_phone VARCHAR(20) NULL,
        insurance_provider VARCHAR(100) NULL,
        insurance_policy_number VARCHAR(100) NULL,
        insurance_valid_till DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    // 2. Emergency Contacts
    "CREATE TABLE IF NOT EXISTS emergency_contacts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        contact_name VARCHAR(100) NOT NULL,
        relationship ENUM('Spouse','Parent','Sibling','Child','Friend','Other') DEFAULT 'Other',
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(150) NULL,
        address TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_ec_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    // 3. Admin Notes
    "CREATE TABLE IF NOT EXISTS admin_notes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        admin_id INT NOT NULL,
        note_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_an_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
];

echo "=== SehatVaani User Profile Migration ===\n\n";

$success = 0;
$failed = 0;

foreach ($migrations as $i => $sql) {
    // Extract table name for display
    preg_match('/TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)/i', $sql, $m);
    $tableName = $m[1] ?? "migration_$i";

    try {
        $pdo->exec($sql);
        echo "[OK]  Table '$tableName' created (or already exists).\n";
        $success++;
    } catch (PDOException $e) {
        echo "[ERR] Table '$tableName' FAILED: " . $e->getMessage() . "\n";
        $failed++;
    }
}

echo "\n--- Done: $success succeeded, $failed failed ---\n";
