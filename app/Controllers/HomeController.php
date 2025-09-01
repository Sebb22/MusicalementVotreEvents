<?php
// app/Controllers/HomeController.php
namespace App\Controllers;

use App\Core\Controller;

require_once __DIR__ . '/../Core/Controller.php';

class HomeController extends Controller
{
    public function index()
    {
        // Tu peux passer des données à la vue si nécessaire
        $data = [
            "title" => "DJ & Événementiel — Accueil"
        ];

        // Appelle la méthode render de Controller pour charger la vue
        $this->render("home", $data);
    }
}
