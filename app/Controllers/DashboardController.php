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
        ob_start();
        header('Content-Type: application/json; charset=utf-8');
    
        try {
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new \Exception("Requête invalide.");
            }
    
            // --- Récupération des données
            $locationId = filter_input(INPUT_POST, 'location_id', FILTER_VALIDATE_INT);
            $name = trim($_POST['name'] ?? '');
            $price = filter_input(INPUT_POST, 'price', FILTER_VALIDATE_FLOAT);
            $stock = filter_input(INPUT_POST, 'stock', FILTER_VALIDATE_INT, [
                "options" => ["default" => 0, "min_range" => 0],
            ]);
            $availability = filter_input(INPUT_POST, 'availability', FILTER_VALIDATE_INT, [
                "options" => ["default" => 1],
            ]);
    
            if (!$locationId || $name === '' || $price === false || $price < 0) {
                throw new \Exception("Champs manquants ou invalides.");
            }
    
            // --- Création ou mise à jour de l'item
            $itemModel = new LocationItem($this->pdo);
            $item = $id ? $itemModel->find($id) : new LocationItem($this->pdo);
    
            if ($id && !$item) {
                throw new \Exception("Élément introuvable.");
            }
    
            // --- Affectation brute des valeurs
            $item->location_id = $locationId;
            $item->name = $name;
            $item->price = $price;
            $item->stock = $stock;
            $item->availability = $availability;
    
            $id ? $item->update() : $item->save();
    
            // --- Gestion image
            $pictureModel = new LocationPicture($this->pdo);
            $transformedImageBase64 = $_POST['image_transformed'] ?? null;
    
            if ($transformedImageBase64) {
                $paths = $this->saveBase64Image($transformedImageBase64);
                $pictureModel->addPicture($item->id, $paths['original'], true);
            } elseif (!empty($_FILES['image']['tmp_name'])) {
                $paths = $this->handleImageUpload($_FILES['image']);
                $pictureModel->addPicture($item->id, $paths['original'], true);
            }
    
            // --- Gestion attributs dynamiques
            $this->handleAttributes($item->id);
    
            // --- Préparer données pour la réponse
            $attrModel = new LocationAttribute($this->pdo);
            $imagesModel = new LocationPicture($this->pdo);
    
            $attributesRaw = $attrModel->allByItem($item->id);
            $attributesKV = [];
            foreach ($attributesRaw as $attr) {
                $attributesKV[$attr['name']] = $attr['value']; // brut
            }
    
            $images = $imagesModel->getPicturesByItem($item->id);
            $mainImage = $imagesModel->getMainPictureByItem($item->id);
    
            // --- Réponse JSON brute
            echo json_encode([
                'success' => true,
                'message' => $id ? "Élément mis à jour avec succès." : "Élément ajouté avec succès.",
                'data' => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'location_id' => $item->location_id,
                    'location_name' => $this->location->all()[$item->location_id - 1]['name'] ?? null,
                    'price' => (float) $item->price,
                    'stock' => $item->stock,
                    'availability' => $item->availability,
                    'main_image' => $mainImage['image_path'] ?? null,
                    'pictures' => $images,
                    'attributes' => $attributesKV,
                ],
            ], JSON_UNESCAPED_UNICODE); // <-- important pour garder les accents et apostrophes
    
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage(),
            ], JSON_UNESCAPED_UNICODE);
        }
    
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

    private function handleImageUpload($file, int $thumbWidth = 400, int $thumbHeight = 300): array
    {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        $maxSize = (int) ini_get('upload_max_filesize') * 1024 * 1024;

        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new \Exception("Erreur lors de l’upload (code {$file['error']}).");
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedTypes, true)) {
            throw new \Exception("Format non supporté. Formats autorisés : JPG, PNG, WebP.");
        }

        if ($file['size'] > $maxSize) {
            throw new \Exception(
                "L’image est trop lourde (" . round($file['size'] / 1024 / 1024, 2) .
                " Mo). Taille maximale : " . ($maxSize / 1024 / 1024) . " Mo."
            );
        }

        $uploadDir = __DIR__ . '/../../public/uploads/';
        $thumbDir = $uploadDir . 'thumbs/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        if (!is_dir($thumbDir)) {
            mkdir($thumbDir, 0755, true);
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = uniqid('item_', true) . '.' . $ext;
        $filePath = $uploadDir . $fileName;
        $thumbPath = $thumbDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            throw new \Exception("Impossible de sauvegarder l’image.");
        }

        // --- Création thumbnail ---
        list($width, $height, $type) = getimagesize($filePath);

        switch ($type) {
            case IMAGETYPE_JPEG: $img = imagecreatefromjpeg($filePath);
                break;
            case IMAGETYPE_PNG: $img = imagecreatefrompng($filePath);
                break;
            case IMAGETYPE_WEBP: $img = imagecreatefromwebp($filePath);
                break;
            default:throw new \Exception('Format image non supporté pour le thumbnail.');
        }

        $ratio = min($thumbWidth / $width, $thumbHeight / $height);
        $newWidth = (int) ($width * $ratio);
        $newHeight = (int) ($height * $ratio);

        $thumb = imagecreatetruecolor($newWidth, $newHeight);

        // Gestion transparence pour PNG/WebP
        if (in_array($type, [IMAGETYPE_PNG, IMAGETYPE_WEBP])) {
            imagealphablending($thumb, false);
            imagesavealpha($thumb, true);
            $transparent = imagecolorallocatealpha($thumb, 0, 0, 0, 127);
            imagefilledrectangle($thumb, 0, 0, $newWidth, $newHeight, $transparent);
        }

        imagecopyresampled($thumb, $img, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        switch ($type) {
            case IMAGETYPE_JPEG: imagejpeg($thumb, $thumbPath, 85);
                break;
            case IMAGETYPE_PNG: imagepng($thumb, $thumbPath, 6);
                break;
            case IMAGETYPE_WEBP: imagewebp($thumb, $thumbPath, 80);
                break;
        }

        imagedestroy($img);
        imagedestroy($thumb);

        return [
            'original' => 'uploads/' . $fileName,
            'thumbnail' => 'uploads/thumbs/' . $fileName,
        ];
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

    private function saveBase64Image(string $base64, string $folder = 'uploads/'): array
    {
        $uploadDir = __DIR__ . '/../../public/' . $folder;
        $thumbDir = $uploadDir . 'thumbs/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        if (!is_dir($thumbDir)) {
            mkdir($thumbDir, 0755, true);
        }

        // --- Extraire les données
        if (preg_match('/^data:image\/(\w+);base64,/', $base64, $type)) {
            $data = substr($base64, strpos($base64, ',') + 1);
            $ext = strtolower($type[1]);
            if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
                throw new \Exception("Format d'image non supporté : $ext");
            }
        } else {
            throw new \Exception("Base64 invalide");
        }

        $data = base64_decode($data);
        if ($data === false) {
            throw new \Exception("Impossible de décoder l'image base64");
        }

        $fileName = uniqid('item_', true) . '.' . $ext;
        $filePath = $uploadDir . $fileName;
        $thumbPath = $thumbDir . $fileName;

        file_put_contents($filePath, $data);

        // --- Générer un thumbnail
        list($width, $height, $type) = getimagesize($filePath);
        $thumbWidth = 400;
        $thumbHeight = 300;
        $ratio = min($thumbWidth / $width, $thumbHeight / $height);
        $newWidth = (int) ($width * $ratio);
        $newHeight = (int) ($height * $ratio);

        // --- Création de l'image selon le type
        switch ($type) {
            case IMAGETYPE_JPEG:
                $img = imagecreatefromjpeg($filePath);
                break;
            case IMAGETYPE_PNG:
                $img = imagecreatefrompng($filePath);
                break;
            case IMAGETYPE_WEBP:
                $img = imagecreatefromwebp($filePath);
                break;
            default:
                throw new \Exception('Format image non supporté pour le thumbnail.');
        }

        $thumb = imagecreatetruecolor($newWidth, $newHeight);

        // Gestion transparence pour PNG/WebP
        if (in_array($type, [IMAGETYPE_PNG, IMAGETYPE_WEBP])) {
            imagealphablending($thumb, false);
            imagesavealpha($thumb, true);
            $transparent = imagecolorallocatealpha($thumb, 0, 0, 0, 127);
            imagefilledrectangle($thumb, 0, 0, $newWidth, $newHeight, $transparent);
        }

        imagecopyresampled($thumb, $img, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        // --- Sauvegarde du thumbnail
        switch ($type) {
            case IMAGETYPE_JPEG:
                imagejpeg($thumb, $thumbPath, 85);
                break;
            case IMAGETYPE_PNG:
                imagepng($thumb, $thumbPath, 6);
                break;
            case IMAGETYPE_WEBP:
                imagewebp($thumb, $thumbPath, 80);
                break;
        }

        imagedestroy($img);
        imagedestroy($thumb);

        return [
            'original' => $folder . $fileName,
            'thumbnail' => $folder . 'thumbs/' . $fileName,
        ];
    }

}