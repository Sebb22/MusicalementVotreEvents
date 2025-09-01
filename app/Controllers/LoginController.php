<?php

namespace App\Controllers;

use App\Models\User;
use App\Core\Controller;


class LoginController extends Controller
{
    private User $userModel;

    public function __construct(User $userModel)
    {
        $this->userModel = $userModel;
    }

    // Affiche le formulaire de login
    public function showLoginForm()
    {
         // Appelle la méthode render de Controller pour charger la vue
         $this->render("/login");
    }

    // Traitement du login
    public function login()
    {
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';

        $user = $this->userModel->findByUsername($username);

        if ($user && $this->userModel->verifyPassword($user, $password)) {
            // Créer la session
            $_SESSION['user'] = [
                'id' => $user->id,
                'username' => $user->username,
                'is_admin' => (bool)$user->is_admin
            ];

            header('Location: /dashboard');
            exit;
        } else {
            $error = "Nom d'utilisateur ou mot de passe incorrect.";
            require_once __DIR__ . '/../Views/login.php';
        }
    }

    // Déconnexion
    public function logout()
    {
        session_destroy();
        header('Location: /login');
        exit;
    }
}
