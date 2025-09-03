<?php

namespace App\Models;

use PDO;

class LocationItem
{
    private PDO $db;

    public $id;
    public $location_id;
    public $designation;
    public $prix;
    public $stock;
    public $disponible;
    public $created_at;
    public $updated_at;

    public function __construct(PDO $pdo)
    {
        $this->db = $pdo;
    }

    public function all(): array
    {
        $stmt = $this->db->query("SELECT * FROM location_items ORDER BY id DESC");
        return $stmt->fetchAll(PDO::FETCH_OBJ);
    }

    public function find(int $id): ?object
    {
        $stmt = $this->db->prepare("SELECT * FROM location_items WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_OBJ) ?: null;
    }

    public function save(): void
    {
        $stmt = $this->db->prepare("
            INSERT INTO location_items
            (location_id, designation, prix, stock, disponible)
            VALUES (:location_id, :designation, :prix, :stock, :disponible)
        ");
        $stmt->execute([
            'location_id' => $this->location_id,
            'designation' => $this->designation,
            'prix'        => $this->prix,
            'stock'       => $this->stock ?? 0,
            'disponible'  => $this->disponible ?? 1,
        ]);
        $this->id = $this->db->lastInsertId();
    }

    public function update(): void
    {
        $stmt = $this->db->prepare("
            UPDATE location_items SET
                location_id = :location_id,
                designation = :designation,
                prix = :prix,
                stock = :stock,
                disponible = :disponible
            WHERE id = :id
        ");
        $stmt->execute([
            'location_id' => $this->location_id,
            'designation' => $this->designation,
            'prix'        => $this->prix,
            'stock'       => $this->stock,
            'disponible'  => $this->disponible,
            'id'          => $this->id,
        ]);
    }

    public function delete(): void
    {
        $stmt = $this->db->prepare("DELETE FROM location_items WHERE id = :id");
        $stmt->execute(['id' => $this->id]);
    }

    public function getAttributes(): array
    {
        $stmt = $this->db->prepare("SELECT name, value FROM location_attributes WHERE item_id = :item_id");
        $stmt->execute(['item_id' => $this->id]);
        return $stmt->fetchAll(PDO::FETCH_KEY_PAIR); // ['taille' => '3m', 'age_requis' => '6+']
    }

    public function setAttribute(string $name, string $value): void
    {
        // Vérifier si l'attribut existe déjà
        $stmt = $this->db->prepare("
        SELECT id FROM location_attributes 
        WHERE item_id = :item_id AND name = :name
    ");
        $stmt->execute(['item_id' => $this->id, 'name' => $name]);
        $attr = $stmt->fetch(PDO::FETCH_OBJ);

        if ($attr) {
            // Update si déjà existant
            $update = $this->db->prepare("
            UPDATE location_attributes SET value = :value 
            WHERE id = :id
        ");
            $update->execute(['value' => $value, 'id' => $attr->id]);
        } else {
            // Insert sinon
            $insert = $this->db->prepare("
            INSERT INTO location_attributes (item_id, name, value)
            VALUES (:item_id, :name, :value)
        ");
            $insert->execute([
                'item_id' => $this->id,
                'name'    => $name,
                'value'   => $value,
            ]);
        }
    }

    public function deleteAttribute(string $name): void
    {
        $stmt = $this->db->prepare("
        DELETE FROM location_attributes 
        WHERE item_id = :item_id AND name = :name
    ");
        $stmt->execute(['item_id' => $this->id, 'name' => $name]);
    }

    public function getPictures(): array
    {
        $pictureModel = new LocationPicture($this->pdo);
        return $pictureModel->getPicturesByItem($this->id);
    }
}
