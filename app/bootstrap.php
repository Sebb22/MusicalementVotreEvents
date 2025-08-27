<?php
// Chargement des configs
require_once __DIR__ . '/../config/config.php';

// Chargement automatique des classes (Controllers, Core, Models)
spl_autoload_register(function ($class) {
    $paths = [
        __DIR__ . "/Core/$class.php",
        __DIR__ . "/Controllers/$class.php",
        __DIR__ . "/Models/$class.php",
    ];
    foreach ($paths as $path) {
        if (file_exists($path)) {
            require_once $path;
            return;
        }
    }
});

// Démarrage de session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Instanciation du router
$router = new Router();

// Définition des routes
require_once __DIR__ . '/routes/web.php';
