<?php

namespace App\Models;

use PDO;

class CategoriesLocation
{
    private PDO $db;

    public $id;
    public $categorie;
    public $designation;
    public $nb_personnes;
    public $age_requis;
    public $dimensions;
    public $prix;
    public $location_id;

    public function __construct(PDO $pdo)
    {
        $this->db = $pdo;
    }

    public function all(): array
    {
        $stmt = $this->db->query("SELECT * FROM categories_location ORDER BY id DESC");
        return $stmt->fetchAll(PDO::FETCH_OBJ);
    }

    public function find(int $id): ?object
    {
        $stmt = $this->db->prepare("SELECT * FROM categories_location WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_OBJ) ?: null;
    }

    public function save(): void
    {
        $stmt = $this->db->prepare("
            INSERT INTO categories_location
            (categorie, designation, nb_personnes, age_requis, dimensions, prix, location_id)
            VALUES (:categorie, :designation, :nb_personnes, :age_requis, :dimensions, :prix, :location_id)
        ");
        $stmt->execute([
            'categorie' => $this->categorie,
            'designation' => $this->designation,
            'nb_personnes' => $this->nb_personnes,
            'age_requis' => $this->age_requis,
            'dimensions' => $this->dimensions,
            'prix' => $this->prix,
            'location_id' => $this->location_id
        ]);
        $this->id = $this->db->lastInsertId();
    }

    public function update(): void
    {
        $stmt = $this->db->prepare("
            UPDATE categories_location SET
                categorie = :categorie,
                designation = :designation,
                nb_personnes = :nb_personnes,
                age_requis = :age_requis,
                dimensions = :dimensions,
                prix = :prix,
                location_id = :location_id
            WHERE id = :id
        ");
        $stmt->execute([
            'categorie' => $this->categorie,
            'designation' => $this->designation,
            'nb_personnes' => $this->nb_personnes,
            'age_requis' => $this->age_requis,
            'dimensions' => $this->dimensions,
            'prix' => $this->prix,
            'location_id' => $this->location_id,
            'id' => $this->id
        ]);
    }

    public function delete(): void
    {
        $stmt = $this->db->prepare("DELETE FROM categories_location WHERE id = :id");
        $stmt->execute(['id' => $this->id]);
    }
}
