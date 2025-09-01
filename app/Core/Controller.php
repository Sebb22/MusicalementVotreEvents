<?php

namespace App\Core;
class Controller {
    protected function render($view, $data = []) {
        extract($data);
        require __DIR__ . '/../Views/includes/header.php';
        require __DIR__ . '/../Views/' . $view . '.php';
        require __DIR__ . '/../Views/includes/footer.php';
    }
}
