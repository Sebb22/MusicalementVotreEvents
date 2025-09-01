<?php

// Charger la config BDD et récupérer le tableau
$config = require_once __DIR__ . '/config/database.php';

try {
    $pdo = new PDO(
        "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8mb4",
        $config['user'],
        $config['password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    die("Erreur BDD : " . $e->getMessage());
}

// --- Infos admin à créer ---
$username = 'admin';
$password = 'admin'; // CHANGE LE MOT DE PASSE !
$is_admin = 1;

// Hash du mot de passe
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert dans la table users
$stmt = $pdo->prepare("INSERT INTO users (username, password, is_admin) VALUES (:username, :password, :is_admin)");
$stmt->execute([
    'username' => $username,
    'password' => $hashedPassword,
    'is_admin' => $is_admin
]);

echo "Admin créé avec succès ! Username : $username, Password : $password\n";
