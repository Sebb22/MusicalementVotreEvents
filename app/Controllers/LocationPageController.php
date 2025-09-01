<?php

namespace App\Controllers;

use App\Core\Controller;

class LocationPageController extends Controller
{
    public function show()
    {
        // Tu peux passer des données à la vue si nécessaire
        $data = [
            "title" => "DJ & Événementiel — Location"
        ];

        // Appelle la méthode render de Controller pour charger la vue
        $this->render("/location", $data);
    }
}
