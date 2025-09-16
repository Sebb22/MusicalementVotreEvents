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
     * Si $editItemId est fourni, charge les données pour l'édition inline
     */
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
            'locations'  => $locations,
            'editItem'   => $editItem,
            'attributes' => $attributes,
            'images'     => $images
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
    
        // Vérifications de base
        if (empty($_POST['location_id']) || empty($_POST['name']) || empty($_POST['price'])) {
            $_SESSION['error'] = "La catégorie, le nom et le prix sont obligatoires.";
            header('Location: /dashboard');
            exit;
        }
    
        // Création de l’item
        $item = $this->locationItem;
        $item->location_id  = (int) $_POST['location_id'];
        $item->name         = $_POST['name'];
        $item->price        = (float) $_POST['price'];
        $item->stock        = (int) ($_POST['stock'] ?? 0);
        $item->availability = (int) ($_POST['availability'] ?? 1);
        $item->save();
    
        // 🔹 Attributs dynamiques
        if (!empty($_POST['attributes'])) {
            $attrModel = new LocationAttribute($this->pdo);
            foreach ($_POST['attributes'] as $attrName => $attrValue) {
                if ($attrValue !== null && $attrValue !== '') {
                    $attrModel->updateOrCreate($item->id, $attrName, $attrValue);
                }
            }
        }
    
        // 🔹 Upload image (un seul fichier)
        if (!empty($_FILES['image']['tmp_name'])) {
            $uploadDir = __DIR__ . '/../../public/uploads/items/' . $item->id . '/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
    
            $imageModel = new LocationPicture($this->pdo);
            $filename = uniqid() . '_' . basename($_FILES['image']['name']);
            $filePath = $uploadDir . $filename;
            $relativePath = '/uploads/items/' . $item->id . '/' . $filename;
    
            if (move_uploaded_file($_FILES['image']['tmp_name'], $filePath)) {
                $imageModel->addPicture($item->id, $relativePath, true);
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
     * Édite une catégorie (redirige vers index avec l'item à éditer)
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
            $item->name         = $_POST['name'] ?? $item->name;
            $item->price        = $_POST['prix'] ?? $item->price;
            $item->stock        = $_POST['stock'] ?? $item->stock;
            $item->availability = $_POST['availability'] ?? $item->availability;
            $item->update();

            // 🔹 Mise à jour des attributs
            if (!empty($_POST['attributes'])) {
                $attrModel = new LocationAttribute($this->pdo);
                foreach ($_POST['attributes'] as $attrName => $attrValue) {
                    if ($attrValue !== null && $attrValue !== '') {
                        $attrModel->updateOrCreate($id, $attrName, $attrValue);
                    }
                }
            }

            // 🔹 Upload des nouvelles images
            if (!empty($_FILES['images']['tmp_name'])) {
                $uploadDir = __DIR__ . '/../../public/uploads/items/' . $item->id . '/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

                $imageModel = new LocationPicture($this->pdo);
                foreach ($_FILES['images']['tmp_name'] as $key => $tmpName) {
                    $filename = uniqid() . '_' . basename($_FILES['images']['name'][$key]);
                    $filePath = $uploadDir . $filename;
                    $relativePath = '/uploads/items/' . $item->id . '/' . $filename;

                    if (move_uploaded_file($tmpName, $filePath)) {
                        $imageModel->addPicture($item->id, $relativePath, false);
                    }
                }
            }

            $_SESSION['success'] = "Item mis à jour avec succès.";
            header('Location: /dashboard');
            exit;
        }

        // GET => rediriger vers index() avec l’item à éditer
        $this->index($id);
    }
}
