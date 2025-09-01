<?php

namespace App\Models;

use PDO;

class CategoryImage
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function addImage(int $categoryId, string $path, bool $isMain = false): bool
    {
        if ($isMain) {
            // On réinitialise les autres images principales
            $this->pdo->prepare("UPDATE category_images SET is_main = 0 WHERE category_id = ?")
                ->execute([$categoryId]);
        }

        $stmt = $this->pdo->prepare("INSERT INTO category_images (category_id, image_path, is_main) VALUES (?, ?, ?)");
        return $stmt->execute([$categoryId, $path, $isMain ? 1 : 0]);
    }

    public function getImagesByCategory(int $categoryId): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM category_images WHERE category_id = ?");
        $stmt->execute([$categoryId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getMainImage(int $categoryId): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM category_images WHERE category_id = ? AND is_main = 1 LIMIT 1");
        $stmt->execute([$categoryId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function deleteImage(int $id): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM category_images WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function getImageById(int $id): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM category_images WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }
}
