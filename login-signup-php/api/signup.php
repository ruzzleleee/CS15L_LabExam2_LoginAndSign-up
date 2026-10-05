<?php
declare(strict_types=1);

require __DIR__ . '/../includes/bootstrap.php';
require_post_with_csrf();

$name     = trim((string)($_POST['name'] ?? ''));
$email    = strtolower(trim((string)($_POST['email'] ?? '')));
$password = (string)($_POST['password'] ?? '');
$confirm  = (string)($_POST['confirm'] ?? '');

if ($name === '' || mb_strlen($name) > 100) {
    json_response(['ok' => false, 'field' => 'signup-name', 'message' => 'Please enter thy full name.'], 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
    json_response(['ok' => false, 'field' => 'signup-email', 'message' => 'Please enter a valid email address.'], 422);
}
if (strlen($password) < 6) {
    json_response(['ok' => false, 'field' => 'signup-password', 'message' => 'The watchword must be at least 6 characters.'], 422);
}
if ($password !== $confirm) {
    json_response(['ok' => false, 'field' => 'signup-confirm', 'message' => 'The watchwords do not match.'], 422);
}

$pdo = db();

$exists = $pdo->prepare('SELECT 1 FROM users WHERE email = :email');
$exists->execute([':email' => $email]);
if ($exists->fetch()) {
    json_response(['ok' => false, 'field' => 'signup-email', 'message' => 'This email address is already registered.'], 409);
}

// The login form asks for a "name of use" (username). Sign-up has no such
// field, so the email address serves as the username.
$insert = $pdo->prepare(
    'INSERT INTO users (name, username, email, password_hash)
     VALUES (:name, :username, :email, :hash)'
);
$insert->execute([
    ':name'     => $name,
    ':username' => $email,
    ':email'    => $email,
    ':hash'     => password_hash($password, PASSWORD_DEFAULT),
]);

json_response(['ok' => true]);
