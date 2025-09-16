<?php

namespace App\Models;

use PDO;

class LocationAttribute
{
    private PDO $db;

    public function __construct(PDO $pdo)
    {
        $this->db = $pdo;
    }

    public function allByItem(int $itemId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM location_attributes WHERE item_id = :item_id");
        $stmt->execute(['item_id' => $itemId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByItemAndName(int $itemId, string $name): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM location_attributes WHERE item_id = :item_id AND name = :name");
        $stmt->execute(['item_id' => $itemId, 'name' => $name]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function addAttribute(int $itemId, string $name, string $value): void
    {
        $stmt = $this->db->prepare("INSERT INTO location_attributes (item_id, name, value) VALUES (:item_id, :name, :value)");
        $stmt->execute([
            'item_id' => $itemId,
            'name'    => $name,
            'value'   => $value
        ]);
    }

    public function updateAttribute(int $id, string $value): void
    {
        $stmt = $this->db->prepare("UPDATE location_attributes SET value = :value WHERE id = :id");
        $stmt->execute([
            'value' => $value,
            'id'    => $id
        ]);
    }

    /**
     * 🔹 Crée ou met à jour un attribut
     */
    public function updateOrCreate(int $itemId, string $name, string $value): void
    {
        $existing = $this->getByItemAndName($itemId, $name);

        if ($existing) {
            $this->updateAttribute($existing['id'], $value);
        } else {
            $this->addAttribute($itemId, $name, $value);
        }
    }
    /**
     * Supprime un attribut
     */
    public function delete(): void
    {
        $stmt = $this->db->prepare("DELETE FROM location_attributes WHERE id = :id");
        $stmt->execute(['id' => $this->id]);
    }
}
