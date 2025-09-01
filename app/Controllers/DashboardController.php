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
}
