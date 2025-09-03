<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\LocationItem;
use App\Models\LocationPicture;
use App\Models\LocationAttribute;
use App\Models\Location;
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

    /**
     * Affiche le dashboard avec toutes les catégories et locations
     */
    public function index(): void
    {
        requireAdmin();

        $categories = $this->locationItem->all();
        $locations = $this->location->all();

        $this->render('dashboard', [
            'categories' => $categories,
            'locations' => $locations
        ]);
    }

    /**
     * Ajoute une nouvelle catégorie
     */
    public function addItem(): void
    {
        requireAdmin();
    
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: /dashboard');
            exit;
        }
    
        // Validation de base
        if (empty($_POST['location_id']) || empty($_POST['name']) || empty($_POST['prix'])) {
            $_SESSION['error'] = "La catégorie, le nom et le prix sont obligatoires.";
            header('Location: /dashboard');
            exit;
        }
    
        // 1️⃣ Créer le LocationItem
        $item = $this->locationItem;
        $item->location_id  = (int) $_POST['location_id'];
        $item->name         = $_POST['name'];
        $item->price        = (float) $_POST['prix'];
        $item->stock        = (int) ($_POST['stock'] ?? 0);
        $item->availability = (int) ($_POST['availability'] ?? 1);
    
        // Attributs spécifiques selon la catégorie
        $locationAttrsMap = [
            1 => ['nb_personnes', 'age_requis', 'dimensions', 'poids'], // Structures gonflables
            2 => ['menu', 'quantite'],                                   // Restauration
            3 => ['type_jeu', 'nombre_joueurs'],                         // Jeux
            4 => ['mascotte_nom', 'taille', 'age_min']                  // Mascottes
        ];
    
        $item->save(); // insertion pour récupérer l'id
    
        // 2️⃣ Enregistrer les attributs spécifiques et dynamiques
        $attrModel = new LocationAttribute($this->pdo);
    
        if (!empty($_POST['attributes'])) {
            foreach ($_POST['attributes'] as $name => $value) {
                if (is_array($value)) {
                    $attrName  = $value['name'] ?? null;
                    $attrValue = $value['value'] ?? null;
                } else {
                    $attrName  = $name;
                    $attrValue = $value;
                }
    
                if ($attrName && $attrValue !== null) {
                    $attrModel->addAttribute($item->id, $attrName, $attrValue);
                }
            }
        }
    
        // Ajouter automatiquement les champs spécifiques selon location_id s'ils sont présents dans $_POST
        $specificAttrs = $locationAttrsMap[$item->location_id] ?? [];
        foreach ($specificAttrs as $attrName) {
            if (isset($_POST[$attrName]) && $_POST[$attrName] !== '') {
                $attrModel->addAttribute($item->id, $attrName, $_POST[$attrName]);
            }
        }
    
        // 3️⃣ Upload images
        if (!empty($_FILES['images']['tmp_name'])) {
            $uploadDir = __DIR__ . '/../../public/uploads/items/' . $item->id . '/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
    
            $imageModel = new LocationPicture($this->pdo);
            foreach ($_FILES['images']['tmp_name'] as $key => $tmpName) {
                $filename = uniqid() . '_' . basename($_FILES['images']['name'][$key]);
                $filePath = $uploadDir . $filename;
                $relativePath = '/uploads/items/' . $item->id . '/' . $filename;
    
                if (move_uploaded_file($tmpName, $filePath)) {
                    $imageModel->addPicture($item->id, $relativePath, $key === 0 ? 1 : 0);
                }
            }
        }
    
        $_SESSION['success'] = "Item ajouté avec succès.";
        header('Location: /dashboard');
        exit;
    }
    
    

    /**
     * Supprime une catégorie
     */
    public function deleteItem(int $id): void
    {
        requireAdmin();

        $item = $this->locationItem;
        $item->id = $id;
        $item->delete();

        $_SESSION['success'] = "Catégorie supprimée.";
        header('Location: /dashboard');
        exit;
    }

    /**
     * Edite une catégorie
     */
    public function editItem(int $id): void
    {
        requireAdmin();
    
        $item = $this->locationItem->find($id);
        if (!$item) {
            $_SESSION['error'] = "Item introuvable.";
            header('Location: /dashboard');
            exit;
        }
    
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // 🔹 Mise à jour des champs généraux
            $item->name = $_POST['name'] ?? $item->name;
            $item->price = $_POST['price'] ?? $item->price;
            $item->nb_personnes = $_POST['attributes']['nb_personnes'] ?? $item->nb_personnes;
            $item->age_requis = $_POST['attributes']['age_requis'] ?? $item->age_requis;
            $item->dimensions = $_POST['attributes']['dimensions'] ?? $item->dimensions;
            $item->update();
    
            // 🔹 Mise à jour / ajout des attributs
            if (!empty($_POST['attributes'])) {
                $attrModel = new LocationAttribute($this->pdo);
    
                foreach ($_POST['attributes'] as $name => $value) {
                    if (is_array($value)) {
                        $attrName = $value['name'] ?? null;
                        $attrValue = $value['value'] ?? null;
                    } else {
                        $attrName = $name;
                        $attrValue = $value;
                    }
    
                    if ($attrName && $attrValue !== null) {
                        // Si l'attribut existe déjà -> update, sinon -> insert
                        $existing = $attrModel->getByItemAndName($id, $attrName);
                        if ($existing) {
                            $attrModel->updateAttribute($existing['id'], $attrValue);
                        } else {
                            $attrModel->addAttribute($id, $attrName, $attrValue);
                        }
                    }
                }
            }
    
            // 🔹 Upload des nouvelles images
            if (!empty($_FILES['images'])) {
                $uploadDir = __DIR__ . '/../../public/uploads/items/' . $item->id . '/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
    
                $imageModel = new LocationPicture($this->pdo);
                foreach ($_FILES['images']['tmp_name'] as $key => $tmpName) {
                    $filename = uniqid() . '_' . basename($_FILES['images']['name'][$key]);
                    $filePath = $uploadDir . $filename;
                    $relativePath = '/uploads/items/' . $item->id . '/' . $filename;
    
                    if (move_uploaded_file($tmpName, $filePath)) {
                        $imageModel->addPicture($item->id, $relativePath, 0); // nouvelles images non principales
                    }
                }
            }
    
            $_SESSION['success'] = "Item mis à jour avec succès.";
            header('Location: /dashboard');
            exit;
        }
    
        // 🔹 Affichage du formulaire d'édition avec données existantes
        $attributesModel = new LocationAttribute($this->pdo);
        $attributes = $attributesModel->getByItem($id);
    
        $imagesModel = new LocationPicture($this->pdo);
        $images = $imagesModel->getByItem($id);
    
        $this->render('dashboard_edit', [
            'item' => $item,
            'attributes' => $attributes,
            'images' => $images
        ]);
    }
    

    /**
     * Upload d'une image pour une catégorie
     */
    public function uploadLocationImage(int $categoryId): void
    {
        requireAdmin();

        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            $_SESSION['error'] = "Erreur lors de l’upload.";
            header("Location: /dashboard");
            exit;
        }

        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!in_array($_FILES['image']['type'], $allowedTypes)) {
            $_SESSION['error'] = "Type de fichier non autorisé.";
            header("Location: /dashboard");
            exit;
        }

        $uploadDir = __DIR__ . '/../../public/uploads/categories/' . $categoryId . '/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $filename = uniqid() . '_' . basename($_FILES['image']['name']);
        $filePath = $uploadDir . $filename;
        $relativePath = '/uploads/categories/' . $categoryId . '/' . $filename;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $filePath)) {
            $imageModel = new LocationImage($this->pdo);
            $imageModel->addPicture($categoryId, $relativePath, true);
            $_SESSION['success'] = "Image ajoutée avec succès.";
        } else {
            $_SESSION['error'] = "Impossible de sauvegarder l’image.";
        }

        header("Location: /dashboard");
        exit;
    }

    /**
     * Supprime une image de catégorie
     */
    public function deleteLocationImage(int $imageId): void
    {
        requireAdmin();

        $imageModel = new LocationImage($this->pdo);
        $image = $imageModel->getPicturesByItem($imageId);

        if ($image) {
            $filePath = __DIR__ . '/../../public' . $image['image_path'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            $imageModel->deletePicture($imageId);
            $_SESSION['success'] = "Image supprimée.";
        } else {
            $_SESSION['error'] = "Image introuvable.";
        }

        header("Location: /dashboard");
        exit;
    }
}
