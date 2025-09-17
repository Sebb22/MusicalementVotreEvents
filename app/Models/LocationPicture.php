<?php 

namespace App\Models;

use PDO;

class LocationPicture
{
    private $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    
    public function getPicturesByItem(int $itemId): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM location_images WHERE item_id = :item_id");
        $stmt->execute(['item_id' => $itemId]);
        return $stmt->fetchAll(PDO::FETCH_OBJ); // <-- ici
    }
    

    // Alias pour compatibilité
    public function getByItem(int $itemId): array
    {
        return $this->getPicturesByItem($itemId);
    }
    

    public function addPicture(int $itemId, string $path, bool $isMain = false): bool
    {
        if ($isMain) {
            $this->pdo->prepare("UPDATE location_images SET is_main = 0 WHERE item_id = :item_id")
                      ->execute(['item_id' => $itemId]);
        }

        $stmt = $this->pdo->prepare("
            INSERT INTO location_images (item_id, image_path, is_main)
            VALUES (:item_id, :path, :is_main)
        ");
        return $stmt->execute([
            'item_id' => $itemId,
            'path'    => $path,
            'is_main' => $isMain ? 1 : 0
        ]);
    }

    public function deletePicture(int $pictureId): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM location_images WHERE id = :id");
        return $stmt->execute(['id' => $pictureId]);
    }

    public function setMainPicture(int $pictureId, int $itemId): bool
    {
        $this->pdo->prepare("UPDATE location_images SET is_main = 0 WHERE item_id = :item_id")
                  ->execute(['item_id' => $itemId]);

        $stmt = $this->pdo->prepare("UPDATE location_images SET is_main = 1 WHERE id = :id");
        return $stmt->execute(['id' => $pictureId]);
    }
}
