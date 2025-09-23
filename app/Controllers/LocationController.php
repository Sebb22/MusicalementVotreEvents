<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Models\Location;
use PDO;

// <-- on ajoute PDO

class LocationController extends Controller
{
    private Location $locationModel;
    private PDO $pdo; // ← ajouter cette ligne

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo; // ← stocke PDO
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

        // Transformer les items en objets LocationItem
        foreach ($location['items'] as &$itemData) {
            $itemObj = new \App\Models\LocationItem($this->pdo); // ← maintenant ça fonctionne
            $itemObj->id = $itemData['id'];
            $itemObj->name = $itemData['name'];
            $itemObj->price = $itemData['price'];
            $itemObj->attributes = $itemData['attributes'] ?? [];
            $itemObj->images = $itemData['images'] ?? [];
            $itemData = $itemObj;
        }
        unset($itemData);

        $data = [
            "title" => "Location – " . $location['name'],
            "location" => $location,
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
            "locations" => $locations,
        ];

        $this->render("/location", $data);
    }
}