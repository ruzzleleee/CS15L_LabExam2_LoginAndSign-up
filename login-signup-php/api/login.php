<?php
declare(strict_types=1);

require __DIR__ . '/../includes/bootstrap.php';
require_post_with_csrf();

$username = strtolower(trim((string)($_POST['username'] ?? '')));
$password = (string)($_POST['password'] ?? '');

if ($username === '' || $password === '') {
    json_response(['ok' => false, 'field' => 'login-username', 'message' => 'Please fill in both fields.'], 422);
}

// Basic brute-force throttle: 5 failed attempts, then wait 60 seconds.
$now = time();
if (($_SESSION['fails'] ?? 0) >= 5 && $now - ($_SESSION['last_fail'] ?? 0) < 60) {
    json_response(['ok' => false, 'field' => null, 'message' => 'Too many attempts. Please wait a minute.'], 429);
}

$stmt = db()->prepare('SELECT id, name, password_hash FROM users WHERE username = :u OR email = :u');
$stmt->execute([':u' => $username]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    $_SESSION['fails'] = ($_SESSION['fails'] ?? 0) + 1;
    $_SESSION['last_fail'] = $now;
    json_response(['ok' => false, 'field' => 'login-password', 'message' => 'Name of use or watchword is incorrect.'], 401);
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int)$user['id'];
$_SESSION['user_name'] = $user['name'];
$_SESSION['fails'] = 0;

json_response(['ok' => true]);
