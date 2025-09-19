<?php

namespace App\Models;

use PDO;

class Location
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    // Toutes les catégories
    public function all(): array
    {
        $stmt = $this->pdo->query("SELECT id, name, slug FROM locations ORDER BY id ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Une catégorie + ses items
    public function getFullLocationBySlug(string $slug): ?array
    {
        $stmt = $this->pdo->prepare("SELECT id, name, slug FROM locations WHERE slug = :slug LIMIT 1");
        $stmt->execute(['slug' => $slug]);
        $location = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$location) return null;

        $location['items'] = $this->getItems($location['id']);
        return $location;
    }

    // Items d’une catégorie avec images et attributs
    private function getItems(int $locationId): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT id, name, price 
             FROM location_items 
             WHERE location_id = :location_id"
        );
        $stmt->execute(['location_id' => $locationId]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($items as &$item) {
            // Images
            $stmtImg = $this->pdo->prepare(
                "SELECT image_path, is_main 
                 FROM location_images 
                 WHERE item_id = :item_id"
            );
            $stmtImg->execute(['item_id' => $item['id']]);
            $item['images'] = $stmtImg->fetchAll(PDO::FETCH_ASSOC);

            // Attributs
            $stmtAttr = $this->pdo->prepare(
                "SELECT name, value 
                 FROM location_attributes 
                 WHERE item_id = :item_id"
            );
            $stmtAttr->execute(['item_id' => $item['id']]);
            $item['attributes'] = $stmtAttr->fetchAll(PDO::FETCH_ASSOC);
        }

        return $items;
    }

    public function find(int $id): ?object
    {
        $stmt = $this->pdo->prepare("SELECT id, name, slug FROM locations WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) return null;

        return (object) $row;
    }
}
