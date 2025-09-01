<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\CategoriesLocation;
use PDO;

class DashboardController extends Controller
{
    private CategoriesLocation $categoriesLocation;

    public function __construct(PDO $pdo)
    {
        $this->categoriesLocation = new CategoriesLocation($pdo);
    }

    // Affiche la liste des catégories
    public function index(): void
    {
        requireAdmin(); // Vérifie si admin
        $categories = $this->categoriesLocation->all();
        $this->render('dashboard', ['categories' => $categories]);
    }

    // Ajoute un nouvel item
    public function addItem(): void
    {
        requireAdmin();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $item = $this->categoriesLocation;
            $item->categorie = $_POST['categorie'] ?? '';
            $item->designation = $_POST['designation'] ?? '';
            $item->nb_personnes = $_POST['nb_personnes'] ?? null;
            $item->age_requis = $_POST['age_requis'] ?? null;
            $item->dimensions = $_POST['dimensions'] ?? null;
            $item->prix = $_POST['prix'] ?? 0;
            $item->location_id = $_POST['location_id'] ?? 1;
            $item->save();
            
            header('Location: /dashboard');
            exit;
        }
    }

    // Supprime un item
    public function deleteItem(int $id): void
    {
        requireAdmin();
        $item = $this->categoriesLocation;
        $item->id = $id;
        $item->delete();

        header('Location: /dashboard');
        exit;
    }

    // Récupérer un item pour l'édition
    public function editItem(int $id): void
    {
        requireAdmin();
        $item = $this->categoriesLocation->find($id);
        if (!$item) {
            header('Location: /dashboard');
            exit;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $this->categoriesLocation->id = $id;
            $this->categoriesLocation->categorie = $_POST['categorie'] ?? $item->categorie;
            $this->categoriesLocation->designation = $_POST['designation'] ?? $item->designation;
            $this->categoriesLocation->nb_personnes = $_POST['nb_personnes'] ?? $item->nb_personnes;
            $this->categoriesLocation->age_requis = $_POST['age_requis'] ?? $item->age_requis;
            $this->categoriesLocation->dimensions = $_POST['dimensions'] ?? $item->dimensions;
            $this->categoriesLocation->prix = $_POST['prix'] ?? $item->prix;
            $this->categoriesLocation->location_id = $_POST['location_id'] ?? $item->location_id;
            $this->categoriesLocation->update();

            header('Location: /dashboard');
            exit;
        }

        // Affiche le formulaire d’édition
        $this->render('dashboard_edit', ['item' => $item]);
    }

    public function uploadCategoryImage(int $categoryId)
    {
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            $_SESSION['error'] = "Erreur lors de l’upload.";
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
            $imageModel = new \App\Models\CategoryImage($this->pdo);
            $imageModel->addImage($categoryId, $relativePath, true); // par défaut la première = principale
            $_SESSION['success'] = "Image ajoutée avec succès.";
        } else {
            $_SESSION['error'] = "Impossible de sauvegarder l’image.";
        }

        header("Location: /dashboard");
        exit;
    }

    public function deleteCategoryImage(int $imageId)
    {
        $imageModel = new \App\Models\CategoryImage($this->pdo);
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
