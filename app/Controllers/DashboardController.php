<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Location;
use App\Models\LocationAttribute;
use App\Models\LocationItem;
use App\Models\LocationPicture;
use PDO;

class DashboardController extends Controller
{
    private PDO $pdo;
    private LocationItem $locationItem;
    private Location $location;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->locationItem = new LocationItem($pdo);
        $this->location = new Location($pdo);
    }

    public function index(?int $editItemId = null): void
    {
        requireAdmin();

        $categories = $this->locationItem->allWithPictures();
        $locations = $this->location->all();

        $editItem = null;
        $attributes = [];
        $images = [];

        if ($editItemId) {
            $editItem = $this->locationItem->find($editItemId);
            if ($editItem) {
                $attrModel = new LocationAttribute($this->pdo);
                $attributes = $attrModel->allByItem($editItemId);

                $imgModel = new LocationPicture($this->pdo);
                $images = $imgModel->getPicturesByItem($editItemId);
            }
        }

        $this->render('dashboard', [
            'categories' => $categories,
            'locations' => $locations,
            'editItem' => $editItem,
            'attributes' => $attributes,
            'images' => $images,
        ]);
    }

    private function saveOrUpdateItem(?int $id = null)
    {
        header('Content-Type: application/json');

        try {
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new \Exception("Requête invalide.");
            }

            // --- Récupérer données
            $locationId = filter_input(INPUT_POST, 'location_id', FILTER_VALIDATE_INT);
            $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
            $price = filter_input(INPUT_POST, 'price', FILTER_VALIDATE_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
            $stock = filter_input(INPUT_POST, 'stock', FILTER_VALIDATE_INT, ["options" => ["default" => 0, "min_range" => 0]]);
            $availability = filter_input(INPUT_POST, 'availability', FILTER_VALIDATE_INT, ["options" => ["default" => 1]]);

            if (!$locationId || !$name || $price === false) {
                throw new \Exception("Champs manquants ou invalides.");
            }

            // --- Création ou maj item
            $itemModel = new LocationItem($this->pdo);
            $item = $id ? $itemModel->find($id) : new LocationItem($this->pdo);
            if ($id && !$item) {
                throw new \Exception("Élément introuvable.");
            }

            $item->location_id = $locationId;
            $item->name = $name;
            $item->price = $price;
            $item->stock = $stock;
            $item->availability = $availability;

            if ($id) {
                $item->update();
            } else {
                $item->save();
            }

            // --- Gestion image
            $pictureModel = new LocationPicture($this->pdo);
            if (!empty($_FILES['image']['tmp_name'])) {
                $imagePath = $this->handleImageUpload($_FILES['image']);
                if (!$imagePath) {
                    throw new \Exception("Erreur lors de l’upload de l’image.");
                }

                $pictureModel->addPicture($item->id, $imagePath, true);
            }

            $mainImage = $pictureModel->getMainPictureByItem($item->id);

            // --- Attributs dynamiques
            $this->handleAttributes($item->id);

            // --- Réponse JSON unique
            echo json_encode([
                'success' => true,
                'message' => $id ? "Élément mis à jour avec succès." : "Élément ajouté avec succès.",
                'data' => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'location_id' => $item->location_id,
                    'location_name' => $this->location->all()[$item->location_id - 1]['name'] ?? null,
                    'price' => number_format($item->price, 2, ',', ' '),
                    'stock' => $item->stock,
                    'availability' => $item->availability,
                    'main_image' => $mainImage['image_path'] ?? null,
                ],
            ]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        }

        exit;
    }

    public function addItem()
    {
        $this->saveOrUpdateItem();
    }

    public function updateItem()
    {
        $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
        $this->saveOrUpdateItem($id);
    }

    public function deleteItem()
    {
        header('Content-Type: application/json');
    
        try {
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new \Exception("Requête invalide.");
            }
    
            // Lire le JSON
            $data = json_decode(file_get_contents('php://input'), true);
            $id = isset($data['id']) ? (int) $data['id'] : null;
    
            if (!$id) {
                throw new \Exception("ID invalide.");
            }
    
            $itemModel = new LocationItem($this->pdo);
            $item = $itemModel->find($id);
            if (!$item) {
                throw new \Exception("Élément introuvable.");
            }
    
            $item->delete();
    
            echo json_encode([
                'success' => true,
                'message' => "Élément supprimé avec succès.",
            ]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        }
    
        exit;
    }
    

    public function deleteMultipleItems()
{
    header('Content-Type: application/json');

    try {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            throw new \Exception("Requête invalide.");
        }

        // Lire les données JSON
        $data = json_decode(file_get_contents('php://input'), true);
        $ids = $data['ids'] ?? null;

        if (!$ids || !is_array($ids)) {
            throw new \Exception("Liste d'IDs invalide.");
        }

        $itemModel = new LocationItem($this->pdo);

        foreach ($ids as $id) {
            $id = (int) $id;
            if ($id <= 0) continue;

            $item = $itemModel->find($id);
            if ($item) {
                $item->delete();
            }
        }

        echo json_encode([
            'success' => true,
            'message' => "Éléments supprimés avec succès.",
        ]);
    } catch (\Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage(),
        ]);
    }

    exit;
}


    private function handleImageUpload($file)
    {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $maxSize = 2 * 1024 * 1024;

        if ($file['size'] > $maxSize) {
            return false;
        }

        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);
        if (!in_array($mimeType, $allowedTypes, true)) {
            return false;
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $safeFilename = uniqid('img_', true) . '.' . $ext;

        $uploadDir = __DIR__ . '/../../public/uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $destination = $uploadDir . $safeFilename;
        if (move_uploaded_file($file['tmp_name'], $destination)) {
            return '/uploads/' . $safeFilename;
        }

        return false;
    }

    private function handleAttributes(int $itemId): void
    {
        if (!empty($_POST['attributes']) && is_array($_POST['attributes'])) {
            $attrModel = new LocationAttribute($this->pdo);
            foreach ($_POST['attributes'] as $attrName => $attrValue) {
                $cleanName = preg_replace('/[^a-zA-Z0-9_\-]/', '', $attrName);
                $cleanValue = htmlspecialchars(trim($attrValue), ENT_QUOTES, 'UTF-8');
                if ($cleanValue !== '') {
                    $attrModel->updateOrCreate($itemId, $cleanName, $cleanValue);
                }
            }
        }
    }
}