<?php
require 'db.php';
/** @var PDO $pdo */

try {
    echo "--- ALL SUBSCRIPTIONS ---\n";
    $subs = $pdo->query("SELECT s.*, u.name as user_name, p.plan_name, p.price FROM subscriptions s LEFT JOIN users u ON s.user_id = u.id LEFT JOIN plans p ON s.current_plan_id = p.id ORDER BY s.id DESC")->fetchAll();
    foreach ($subs as $s) {
        echo "ID: {$s['id']} | User: {$s['user_name']} (ID: {$s['user_id']}) | Plan: {$s['plan_name']} (Price: {$s['price']}) | Start: {$s['start_date']} | End: {$s['expiry_date']} | Status: {$s['status']} | Active: {$s['active']} | Is_Active: {$s['is_active']}\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
