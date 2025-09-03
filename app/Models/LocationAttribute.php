<?php

namespace App\Models;

use PDO;

class LocationAttribute
{
    private PDO $db;

    public $id;
    public $item_id;
    public $name;
    public $value;

    public function __construct(PDO $pdo)
    {
        $this->db = $pdo;
    }

    public function allByItem(int $itemId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM location_attributes WHERE item_id = :item_id");
        $stmt->execute(['item_id' => $itemId]);
        return $stmt->fetchAll(PDO::FETCH_OBJ);
    }

    public function save(): void
    {
        $stmt = $this->db->prepare("
            INSERT INTO location_attributes (item_id, name, value)
            VALUES (:item_id, :name, :value)
        ");
        $stmt->execute([
            'item_id' => $this->item_id,
            'name'    => $this->name,
            'value'   => $this->value,
        ]);
        $this->id = $this->db->lastInsertId();
    }

    public function delete(): void
    {
        $stmt = $this->db->prepare("DELETE FROM location_attributes WHERE id = :id");
        $stmt->execute(['id' => $this->id]);
    }
}
