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
    public $attributes = [];
    public $images = [];
    public $thumbnail;

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

       /**
     * Hydrate un LocationItem depuis un tableau
     */
    public static function fromArray(PDO $pdo, array $data): self
    {
        $item = new self($pdo);

        $item->id = $data['id'] ?? null;
        $item->location_id = $data['location_id'] ?? null;
        $item->name = $data['name'] ?? '';
        $item->price = $data['price'] ?? 0;
        $item->stock = $data['stock'] ?? 0;
        $item->availability = $data['availability'] ?? 1;
        $item->attributes = $data['attributes'] ?? [];
        $item->images = $data['images'] ?? [];

        // Génération safe du thumbnail
        $item->thumbnail = $item->getThumbnail();

        return $item;
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

    /**
     * Retourne le chemin de l'image principale pour un item
     * ou une image par défaut si aucune n'existe
     */
    public function getMainImage(): string
    {
        $pictureModel = new LocationPicture($this->db);
        $mainPic = $pictureModel->getMainPictureByItem($this->id);

        if ($mainPic && !empty($mainPic['image_path'])) {
            $path = '/' . ltrim($mainPic['image_path'], '/');
            if (file_exists($_SERVER['DOCUMENT_ROOT'] . $path)) {
                return $path;
            }
        }

        // fallback si le fichier n'existe pas
        $default = '/uploads/default.png';
        return file_exists($_SERVER['DOCUMENT_ROOT'] . $default) ? $default : '/uploads/thumbs/default.png';
    }
    
    public function getThumbnail(int $width = 400, int $height = 300): string
    {
        $mainImg = $this->getMainImage();
        $fullPath = $_SERVER['DOCUMENT_ROOT'] . $mainImg;

        $pathInfo = pathinfo($mainImg);
        $thumbDir = $_SERVER['DOCUMENT_ROOT'] . $pathInfo['dirname'] . '/thumbs/';
        $thumbPath = $thumbDir . $pathInfo['basename'];

        if (file_exists($thumbPath)) {
            return '/' . ltrim($pathInfo['dirname'] . '/thumbs/' . $pathInfo['basename'], '/');
        }

        if (!file_exists($fullPath)) {
            return '/uploads/thumbs/default.png';
        }

        if (!is_dir($thumbDir)) {
            mkdir($thumbDir, 0755, true);
        }

        $imageInfo = getimagesize($fullPath);
        if (!$imageInfo) {
            return '/uploads/thumbs/default.png';
        }

        [$srcWidth, $srcHeight, $type] = $imageInfo;

        switch ($type) {
            case IMAGETYPE_JPEG: $srcImg = imagecreatefromjpeg($fullPath); break;
            case IMAGETYPE_PNG:  $srcImg = imagecreatefrompng($fullPath); break;
            case IMAGETYPE_WEBP: $srcImg = imagecreatefromwebp($fullPath); break;
            default: return '/uploads/thumbs/default.png';
        }

        $thumbImg = imagecreatetruecolor($width, $height);

        if (in_array($type, [IMAGETYPE_PNG, IMAGETYPE_WEBP])) {
            imagealphablending($thumbImg, false);
            imagesavealpha($thumbImg, true);
            $transparent = imagecolorallocatealpha($thumbImg, 0, 0, 0, 127);
            imagefilledrectangle($thumbImg, 0, 0, $width, $height, $transparent);
        }

        $srcRatio = $srcWidth / $srcHeight;
        $thumbRatio = $width / $height;

        if ($srcRatio > $thumbRatio) {
            $newHeight = $height;
            $newWidth = intval($height * $srcRatio);
        } else {
            $newWidth = $width;
            $newHeight = intval($width / $srcRatio);
        }

        $x = intval(($width - $newWidth) / 2);
        $y = intval(($height - $newHeight) / 2);

        imagecopyresampled($thumbImg, $srcImg, $x, $y, 0, 0, $newWidth, $newHeight, $srcWidth, $srcHeight);

        switch ($type) {
            case IMAGETYPE_JPEG: imagejpeg($thumbImg, $thumbPath, 85); break;
            case IMAGETYPE_PNG:  imagepng($thumbImg, $thumbPath, 6); break;
            case IMAGETYPE_WEBP: imagewebp($thumbImg, $thumbPath, 80); break;
        }

        imagedestroy($srcImg);
        imagedestroy($thumbImg);

        return '/' . ltrim($pathInfo['dirname'] . '/thumbs/' . $pathInfo['basename'], '/');
    }
}