<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Models\Location;
use PDO; // <-- on ajoute PDO

class LocationController extends Controller
{
    private Location $locationModel;

    public function __construct(PDO $pdo)
    {
        // On injecte directement le PDO depuis le bootstrap
        $this->locationModel = new Location($pdo);
    }

    /**
     * Affiche une catégorie avec ses items
     * $slug : le slug de la catégorie à afficher
     */
    public function show(string $slug)
    {
        $location = $this->locationModel->getFullLocationBySlug($slug);

        if (!$location) {
            http_response_code(404);
            $this->render("/404", ["message" => "Catégorie introuvable"]);
            return;
        }

        $data = [
            "title" => "Location – " . $location['name'], 
            "location" => $location
        ];

        $this->render("/locationCatalog", $data);
    }

    /**
     * Affiche la page principale avec toutes les catégories
     */
    public function index()
    {
        $locations = $this->locationModel->all();

        $data = [
            "title" => "Nos locations",
            "locations" => $locations
        ];

        $this->render("/location", $data);
    }
}
