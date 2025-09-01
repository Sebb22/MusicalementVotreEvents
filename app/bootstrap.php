<?php
// Debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

use App\Core\Router;
use App\Models\User;

// --- Chargement de la config ---
$config = require_once __DIR__ . '/../config/database.php';
$db_host = $config['host'];
$db_name = $config['dbname'];
$db_user = $config['user'];
$db_pass = $config['password'];

// --- Connexion PDO ---
try {
    $pdo = new PDO(
        "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4",
        $db_user,
        $db_pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    die("Erreur de connexion à la BDD : " . $e->getMessage());
}

// --- Autoloading ---
spl_autoload_register(function ($class) {
    $class = str_replace('App\\', '', $class);
    $class = str_replace('\\', '/', $class);

    $paths = [__DIR__ . "/$class.php"];
    foreach ($paths as $path) {
        if (file_exists($path)) {
            require_once $path;
            return;
        }
    }
});

// --- Démarrage de session ---
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// --- Fonction pour sécuriser le dashboard ---
function requireAdmin()
{
    if (empty($_SESSION['user']) || !($_SESSION['user']['is_admin'] ?? false)) {
        header('Location: /login');
        exit;
    }
}

// --- Instanciation des modèles ---
$userModel = new User($pdo);

// --- Instanciation des controllers ---
use App\Controllers\HomeController;
use App\Controllers\LocationPageController;
use App\Controllers\DashboardController;
use App\Controllers\LoginController;

$homeController = new HomeController();
$locationPageController = new LocationPageController();
$dashboardController = new DashboardController($pdo);
$loginController = new LoginController($userModel);

// --- Instanciation du router ---
$router = new Router();

// --- Inclusion des routes depuis le fichier web.php ---
require_once __DIR__ . '/routes/web.php';

// --- Dispatcher la route actuelle ---
$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
