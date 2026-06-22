<?php
// api/get_user_profile.php
// Consolidated GET endpoint — returns all profile data for a single user
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require '../backend/db.php';

$master_api_key = "sehat_live_2026_secure_key";
if (($_GET['api_key'] ?? '') !== $master_api_key) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$user_id = intval($_GET['user_id'] ?? 0);
if ($user_id <= 0) {
    http_response_code(422);
    echo json_encode(["status" => "error", "message" => "user_id is required"]);
    exit;
}

try {
    // 1. Basic user info
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
    $stmt->execute(['id' => $user_id]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "User not found"]);
        exit;
    }

    // 2. Subscription + Plan
    $sub_stmt = $pdo->prepare("
        SELECT s.*, p.plan_name, p.plan_code, p.price, p.duration_days,
               p.reports_limit, p.chat_limit, p.family_members_limit,
               p.analytics_access, p.priority_support
        FROM subscriptions s
        LEFT JOIN plans p ON s.current_plan_id = p.id
        WHERE s.user_id = :uid
        LIMIT 1
    ");
    $sub_stmt->execute(['uid' => $user_id]);
    $subscription = $sub_stmt->fetch() ?: null;

    // 3. Medical info
    $med_stmt = $pdo->prepare("SELECT * FROM user_medical_info WHERE user_id = :uid LIMIT 1");
    $med_stmt->execute(['uid' => $user_id]);
    $medical_info = $med_stmt->fetch() ?: null;

    // 4. Family members
    $fam_stmt = $pdo->prepare("SELECT * FROM family_members WHERE user_id = :uid ORDER BY created_at DESC");
    $fam_stmt->execute(['uid' => $user_id]);
    $family_members = $fam_stmt->fetchAll();

    // 5. Emergency contacts
    $ec_stmt = $pdo->prepare("SELECT * FROM emergency_contacts WHERE user_id = :uid ORDER BY id ASC");
    $ec_stmt->execute(['uid' => $user_id]);
    $emergency_contacts = $ec_stmt->fetchAll();

    // 6. Recent reports (last 10)
    $rep_stmt = $pdo->prepare("
        SELECT id, patient_name, report_type, risk_level, created_at
        FROM reports
        WHERE user_id = :uid
        ORDER BY created_at DESC
        LIMIT 10
    ");
    $rep_stmt->execute(['uid' => $user_id]);
    $reports = $rep_stmt->fetchAll();

    // Total report count
    $rep_count = $pdo->prepare("SELECT COUNT(*) FROM reports WHERE user_id = :uid");
    $rep_count->execute(['uid' => $user_id]);
    $total_reports = intval($rep_count->fetchColumn());

    // 7. Recent payments (last 10)
    $pay_stmt = $pdo->prepare("
        SELECT id, order_id, amount, status, payment_date, payment_method, razorpay_payment_id
        FROM payments
        WHERE user_id = :uid
        ORDER BY payment_date DESC
        LIMIT 10
    ");
    $pay_stmt->execute(['uid' => $user_id]);
    $payments = $pay_stmt->fetchAll();

    // Total spent
    $total_spent_q = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE user_id = :uid AND status IN ('captured','completed','success')");
    $total_spent_q->execute(['uid' => $user_id]);
    $total_spent = floatval($total_spent_q->fetchColumn());

    // 8. Usage tracking (current month)
    $current_month = date('Y-m');
    $usage_stmt = $pdo->prepare("
        SELECT * FROM usage_tracking
        WHERE user_id = :uid AND (current_period = :m OR month = :m)
        LIMIT 1
    ");
    $usage_stmt->execute(['uid' => $user_id, 'm' => $current_month]);
    $usage = $usage_stmt->fetch() ?: null;

    // 9. Admin notes
    $notes_stmt = $pdo->prepare("
        SELECT an.*, au.email AS admin_email
        FROM admin_notes an
        LEFT JOIN admin_users au ON an.admin_id = au.id
        WHERE an.user_id = :uid
        ORDER BY an.created_at DESC
    ");
    $notes_stmt->execute(['uid' => $user_id]);
    $admin_notes = $notes_stmt->fetchAll();

    // 10. All plans (for upgrade dropdown)
    $plans = $pdo->query("SELECT id, plan_code, plan_name, price, duration_days, reports_limit, chat_limit, family_members_limit FROM plans WHERE is_active = 1 ORDER BY price ASC")->fetchAll();

    // 11. Family member count from family_members table
    $fam_count = count($family_members);

    echo json_encode([
        "status" => "success",
        "user" => $user,
        "subscription" => $subscription,
        "medical_info" => $medical_info,
        "family_members" => $family_members,
        "family_member_count" => $fam_count,
        "emergency_contacts" => $emergency_contacts,
        "reports" => $reports,
        "total_reports" => $total_reports,
        "payments" => $payments,
        "total_spent" => $total_spent,
        "usage" => $usage,
        "admin_notes" => $admin_notes,
        "plans" => $plans
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
