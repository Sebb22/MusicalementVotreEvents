<?php
namespace App\Models;

use PDO;

class User {
    private $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function findByUsername($username) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE username = :username LIMIT 1");
        $stmt->execute(['username' => $username]);
        return $stmt->fetch(PDO::FETCH_OBJ);
    }

    public function verifyPassword($user, $password) {
        return password_verify($password, $user->password);
    }
}
