<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Models\Location;
use App\Models\LocationItem;
use PDO;

class LocationController extends Controller
{
    private Location $locationModel;
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->locationModel = new Location($pdo);
    }

    public function show(string $slug)
    {
        $location = $this->locationModel->getFullLocationBySlug($slug);

        if (!$location) {
            http_response_code(404);
            $this->render("/404", ["message" => "Catégorie introuvable"]);
            return;
        }

        foreach ($location['items'] as &$itemData) {
            $itemData = LocationItem::fromArray($this->pdo, $itemData);
        }
        unset($itemData);

        $data = [
            "title" => "Location – " . $location['name'],
            "location" => $location,
        ];

        $this->render("/locationCatalog", $data);
    }

    /**
     * Affiche toutes les catégories
     */
    public function index()
    {
        $locations = $this->locationModel->all();

        $data = [
            "title" => "Nos locations",
            "locations" => $locations,
        ];

        $this->render("/location", $data);
    }
}