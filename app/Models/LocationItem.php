<?php

namespace App\Models;

use PDO;

class LocationItem
{
    private PDO $db;

    public $id;
    public $location_id;
    public $name;
    public $price;
    public $stock;
    public $availability;
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

    public function allWithPictures(): array
    {
        $stmt = $this->db->query("
        SELECT li.*, l.name AS location_name
        FROM location_items li
        LEFT JOIN locations l ON li.location_id = l.id
        ORDER BY li.id DESC
    ");
        $items = $stmt->fetchAll(PDO::FETCH_OBJ);

        $pictureModel = new LocationPicture($this->db);

        foreach ($items as $item) {
            // 🔹 Récupérer les images
            $pictures = $pictureModel->getPicturesByItem($item->id) ?? [];
            $item->pictures = $pictures;

            // 🔹 Définir l'image principale
            $item->main_image = null;
            if (!empty($pictures)) {
                $mainPic = null;
                foreach ($pictures as $pic) {
                    if (is_object($pic) && !empty($pic->is_main) && $pic->is_main == 1) {
                        $mainPic = $pic;
                        break;
                    }
                }

                if ($mainPic && isset($mainPic->image_path)) {
                    $item->main_image = $mainPic->image_path;
                } elseif (isset($pictures[0]) && is_object($pictures[0]) && isset($pictures[0]->image_path)) {
                    $item->main_image = $pictures[0]->image_path;
                }
            }

            // 🔹 Attributs
            $this->id = $item->id;
            $item->attributes = $this->getAttributes();
        }

        return $items;
    }

    public function find(int $id): ?self
    {
        $stmt = $this->db->prepare("SELECT * FROM location_items WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            return null;
        }

        // 🔹 Crée une instance de LocationItem
        $item = new self($this->db);

        // Hydrate les propriétés
        foreach ($data as $key => $value) {
            if (property_exists($item, $key)) {
                $item->$key = $value;
            }
        }

        // 🔹 Ajout des images
        $pictureModel = new LocationPicture($this->db);
        $pictures = $pictureModel->getPicturesByItem($item->id) ?? [];
        $item->pictures = $pictures;

        $item->main_image = null;
        if (!empty($pictures)) {
            $mainPic = null;
            foreach ($pictures as $pic) {
                if (is_object($pic) && !empty($pic->is_main) && $pic->is_main == 1) {
                    $mainPic = $pic;
                    break;
                }
            }

            if ($mainPic && isset($mainPic->image_path)) {
                $item->main_image = $mainPic->image_path;
            } elseif (isset($pictures[0]) && is_object($pictures[0]) && isset($pictures[0]->image_path)) {
                $item->main_image = $pictures[0]->image_path;
            }
        }

        // 🔹 Ajout des attributs
        $item->attributes = $item->getAttributes();

        return $item;
    }

    public function save(): void
    {
        $stmt = $this->db->prepare("
            INSERT INTO location_items
            (location_id, name, price, stock, availability)
            VALUES (:location_id, :name, :price, :stock, :availability)
        ");
        $stmt->execute([
            'location_id' => $this->location_id,
            'name' => $this->name,
            'price' => $this->price,
            'stock' => $this->stock ?? 0,
            'availability' => $this->availability ?? 1,
        ]);
        $this->id = $this->db->lastInsertId();
    }

    public function update(): void
    {
        $stmt = $this->db->prepare("
            UPDATE location_items SET
                location_id = :location_id,
                name = :name,
                price = :price,
                stock = :stock,
                availability = :availability
            WHERE id = :id
        ");
        $stmt->execute([
            'location_id' => $this->location_id,
            'name' => $this->name,
            'price' => $this->price,
            'stock' => $this->stock,
            'availability' => $this->availability,
            'id' => $this->id,
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
        return $stmt->fetchAll(PDO::FETCH_KEY_PAIR) ?: [];
    }

    public function setAttribute(string $name, string $value): void
    {
        $stmt = $this->db->prepare("
            SELECT id FROM location_attributes
            WHERE item_id = :item_id AND name = :name
        ");
        $stmt->execute(['item_id' => $this->id, 'name' => $name]);
        $attr = $stmt->fetch(PDO::FETCH_OBJ);

        if ($attr) {
            $update = $this->db->prepare("
                UPDATE location_attributes SET value = :value
                WHERE id = :id
            ");
            $update->execute(['value' => $value, 'id' => $attr->id]);
        } else {
            $insert = $this->db->prepare("
                INSERT INTO location_attributes (item_id, name, value)
                VALUES (:item_id, :name, :value)
            ");
            $insert->execute([
                'item_id' => $this->id,
                'name' => $name,
                'value' => $value,
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
        $pictureModel = new LocationPicture($this->db);
        return $pictureModel->getPicturesByItem($this->id) ?? [];
    }
}