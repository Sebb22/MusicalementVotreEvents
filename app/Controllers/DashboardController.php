<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\LocationItem;
use App\Models\CategoryImage;
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

        // Validation des champs obligatoires
        $requiredFields = ['categorie', 'designation', 'prix'];
        foreach ($requiredFields as $field) {
            if (empty($_POST[$field])) {
                $_SESSION['error'] = "Le champ $field est obligatoire.";
                header('Location: /dashboard');
                exit;
            }
        }

        $item = $this->locationItem;
        $item->categorie = $_POST['categorie'];
        $item->designation = $_POST['designation'];
        $item->nb_personnes = $_POST['nb_personnes'] ?? null;
        $item->age_requis = $_POST['age_requis'] ?? null;
        $item->dimensions = $_POST['dimensions'] ?? null;
        $item->prix = $_POST['prix'];

        // Récupérer location_id via le modèle Location
        $location = $this->location->findByNom($item->categorie);
        if (!$location) {
            $_SESSION['error'] = "La catégorie sélectionnée n'existe pas dans Locations.";
            header('Location: /dashboard');
            exit;
        }

        $item->location_id = $location['id'];
        $item->save();

        $_SESSION['success'] = "Catégorie ajoutée avec succès.";
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
            $_SESSION['error'] = "Catégorie introuvable.";
            header('Location: /dashboard');
            exit;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $item->categorie = $_POST['categorie'] ?? $item->categorie;
            $item->designation = $_POST['designation'] ?? $item->designation;
            $item->nb_personnes = $_POST['nb_personnes'] ?? $item->nb_personnes;
            $item->age_requis = $_POST['age_requis'] ?? $item->age_requis;
            $item->dimensions = $_POST['dimensions'] ?? $item->dimensions;
            $item->prix = $_POST['prix'] ?? $item->prix;

            // Vérifier que la catégorie existe toujours via le modèle
            $location = $this->location->findByNom($item->categorie);
            $item->location_id = $location['id'] ?? $item->location_id;

            $item->update();

            $_SESSION['success'] = "Catégorie modifiée avec succès.";
            header('Location: /dashboard');
            exit;
        }

        $this->render('dashboard_edit', ['item' => $item]);
    }

    /**
     * Upload d'une image pour une catégorie
     */
    public function uploadCategoryImage(int $categoryId): void
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
            $imageModel = new CategoryImage($this->pdo);
            $imageModel->addImage($categoryId, $relativePath, true);
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
    public function deleteCategoryImage(int $imageId): void
    {
        requireAdmin();

        $imageModel = new CategoryImage($this->pdo);
        $image = $imageModel->getImageById($imageId);

        if ($image) {
            $filePath = __DIR__ . '/../../public' . $image['image_path'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            $imageModel->deleteImage($imageId);
            $_SESSION['success'] = "Image supprimée.";
        } else {
            $_SESSION['error'] = "Image introuvable.";
        }

        header("Location: /dashboard");
        exit;
    }
}
