<?php

namespace App\Models;

use PDO;

class LocationPicture
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Ajouter une image pour un item
     */
    public function addPicture(int $itemId, string $imagePath, bool $isMain = false): bool
    {
        // Si c’est l’image principale, on enlève les autres "main"
        if ($isMain) {
            $stmt = $this->pdo->prepare("UPDATE location_images SET is_main = 0 WHERE item_id = ?");
            $stmt->execute([$itemId]);
        }

        $stmt = $this->pdo->prepare("
            INSERT INTO location_images (item_id, image_path, is_main, created_at)
            VALUES (:item_id, :image_path, :is_main, NOW())
        ");

        return $stmt->execute([
            ':item_id' => $itemId,
            ':image_path' => $imagePath,
            ':is_main' => $isMain ? 1 : 0,
        ]);
    }

    /**
     * Récupérer toutes les images d’un item
     */
    public function getPicturesByItem(int $itemId): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM location_images WHERE item_id = ?");
        $stmt->execute([$itemId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer l’image principale d’un item
     */
    public function getMainPictureByItem(int $itemId): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM location_images WHERE item_id = ? AND is_main = 1 LIMIT 1");
        $stmt->execute([$itemId]);
        $picture = $stmt->fetch(PDO::FETCH_ASSOC);
        return $picture ?: null;
    }

    /**
     * Supprimer une image
     */
    public function deletePicture(int $id): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM location_images WHERE id = ?");
        return $stmt->execute([$id]);
    }

    /**
     * Retourne le chemin du thumbnail pour une image donnée
     */
    public function getThumbnail(string $originalPath, int $width = 400, int $height = 300): string
    {
        $fullPath = $_SERVER['DOCUMENT_ROOT'] . $originalPath;

        if (!file_exists($fullPath)) {
            return '/uploads/default_thumb.png';
        }

        $pathInfo = pathinfo($originalPath);
        $thumbDir = $_SERVER['DOCUMENT_ROOT'] . $pathInfo['dirname'] . '/thumbs/';
        $thumbPath = $thumbDir . $pathInfo['basename'];

        // Créer le dossier thumbs si besoin
        if (!is_dir($thumbDir)) {
            mkdir($thumbDir, 0755, true);
        }

        // Thumbnail déjà existant → on renvoie directement
        if (file_exists($thumbPath)) {
            return '/' . ltrim($pathInfo['dirname'] . '/thumbs/' . $pathInfo['basename'], '/');
        }

        // Sinon → générer le thumbnail
        $imageInfo = getimagesize($fullPath);
        if (!$imageInfo) {
            return '/uploads/default_thumb.png';
        }

        [$srcWidth, $srcHeight] = $imageInfo;
        $srcType = $imageInfo[2];

        switch ($srcType) {
            case IMAGETYPE_JPEG:
                $srcImg = imagecreatefromjpeg($fullPath);
                break;
            case IMAGETYPE_PNG:
                $srcImg = imagecreatefrompng($fullPath);
                break;
            case IMAGETYPE_GIF:
                $srcImg = imagecreatefromgif($fullPath);
                break;
            default:
                return '/uploads/default_thumb.png';
        }

        $thumbImg = imagecreatetruecolor($width, $height);

        // Transparence PNG/GIF
        if ($srcType == IMAGETYPE_PNG || $srcType == IMAGETYPE_GIF) {
            imagecolortransparent($thumbImg, imagecolorallocatealpha($thumbImg, 0, 0, 0, 127));
            imagealphablending($thumbImg, false);
            imagesavealpha($thumbImg, true);
        }

        // Conserver le ratio
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

        // Sauvegarde
        switch ($srcType) {
            case IMAGETYPE_JPEG:
                imagejpeg($thumbImg, $thumbPath, 85);
                break;
            case IMAGETYPE_PNG:
                imagepng($thumbImg, $thumbPath);
                break;
            case IMAGETYPE_GIF:
                imagegif($thumbImg, $thumbPath);
                break;
        }

        imagedestroy($srcImg);
        imagedestroy($thumbImg);

        return '/' . ltrim($pathInfo['dirname'] . '/thumbs/' . $pathInfo['basename'], '/');
    }

    public function updatePicture(int $id, string $imagePath, bool $isMain = false): bool
{
    $stmt = $this->pdo->prepare("
        UPDATE location_pictures
        SET image_path = :image_path, is_main = :is_main, updated_at = NOW()
        WHERE id = :id
    ");

    return $stmt->execute([
        ':image_path' => $imagePath,
        ':is_main' => $isMain ? 1 : 0,
        ':id' => $id,
    ]);
}

}