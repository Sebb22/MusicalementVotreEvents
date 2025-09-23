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
        // Buffer pour éviter tout output accidentel (warning, notice, echo)
        ob_start();
        header('Content-Type: application/json');
    
        try {
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new \Exception("Requête invalide.");
            }
    
            // --- Récupérer données
            $locationId = filter_input(INPUT_POST, 'location_id', FILTER_VALIDATE_INT);
            $name = htmlspecialchars(trim($_POST['name'] ?? ''), ENT_QUOTES, 'UTF-8');
            $price = filter_input(INPUT_POST, 'price', FILTER_VALIDATE_FLOAT);
            $stock = filter_input(INPUT_POST, 'stock', FILTER_VALIDATE_INT, ["options" => ["default" => 0, "min_range" => 0]]);
            $availability = filter_input(INPUT_POST, 'availability', FILTER_VALIDATE_INT, ["options" => ["default" => 1]]);
            
            if (!$locationId || !$name || $price === false || $price < 0) {
                throw new \Exception("Champs manquants ou invalides.");
            }
    
            // --- Création ou mise à jour de l'item
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
    
            $id ? $item->update() : $item->save();
    
            // --- Gestion image
            $pictureModel = new LocationPicture($this->pdo);
            if (!empty($_FILES['image']['tmp_name'])) {
                $imagePath = $this->handleImageUpload($_FILES['image']);
                $pictureModel->addPicture($item->id, $imagePath, true);
            }
    
            // Vérifier qu'il y a au moins une image
            $mainImage = $pictureModel->getMainPictureByItem($item->id);
            if (!$mainImage) {
                throw new \Exception("Chaque article doit avoir au moins une image.");
            }
    
            // --- Attributs dynamiques
            $this->handleAttributes($item->id);
    
            // --- Réponse JSON (price en float)
            echo json_encode([
                'success' => true,
                'message' => $id ? "Élément mis à jour avec succès." : "Élément ajouté avec succès.",
                'data' => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'location_id' => $item->location_id,
                    'location_name' => $this->location->all()[$item->location_id - 1]['name'] ?? null,
                    'price' => (float) $item->price, // important pour JSON valide
                    'stock' => $item->stock,
                    'availability' => $item->availability,
                    'main_image' => $mainImage['image_path'],
                ],
            ]);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        }
    
        // Nettoyer le buffer et terminer
        ob_end_flush();
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
                if ($id <= 0) {
                    continue;
                }

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
    
        // Taille max dynamique selon php.ini (upload_max_filesize)
        $maxSize = (int) ini_get('upload_max_filesize') * 1024 * 1024;
    
        // Vérifie les erreurs natives de PHP
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new \Exception("Erreur lors de l’upload (code {$file['error']}).");
        }
    
        // Vérifie le type MIME avec finfo
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
    
        if (!in_array($mimeType, $allowedTypes, true)) {
            throw new \Exception("Format non supporté. Formats autorisés : JPG, PNG, WebP.");
        }
    
        // Vérifie la taille
        if ($file['size'] > $maxSize) {
            throw new \Exception(
                "L’image est trop lourde (" . round($file['size'] / 1024 / 1024, 2) .
                " Mo). Taille maximale autorisée : " . ($maxSize / 1024 / 1024) . " Mo."
            );
        }
    
        // Crée le dossier s’il n’existe pas
        $uploadDir = __DIR__ . '/../../public/uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
    
        // Génère un nom unique
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = uniqid('pizza_', true) . '.' . $ext;
        $filePath = $uploadDir . $fileName;
    
        // Déplace le fichier
        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            throw new \Exception("Impossible de sauvegarder l’image.");
        }
    
        // Retourne le chemin relatif (stocké en BDD)
        return 'uploads/' . $fileName;
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