<?php

// ---------------------
// Routes publiques
// ---------------------

$router->get('/', [$homeController, 'index']);
$router->get('/location', [$locationController, 'index']);
$router->get('/location/{slug}', [$locationController, 'show']);

// ---------------------
// Login / Logout
// ---------------------

$router->get('/login', [$loginController, 'showLoginForm']);
$router->post('/login', [$loginController, 'login']);
$router->get('/logout', [$loginController, 'logout']);

// ---------------------
// Dashboard sécurisé
// ---------------------

// Dashboard principal
$router->get('/dashboard', function () use ($dashboardController) {
    requireAdmin();
    $dashboardController->index();
});

// Ajouter un item
$router->post('/dashboard/add', function () use ($dashboardController) {
    requireAdmin();
    $dashboardController->addItem();
});

// Mettre à jour un item
$router->post('/dashboard/edit', function () use ($dashboardController) {
    requireAdmin();
    $dashboardController->updateItem();
});

$router->post('/dashboard/delete', function () use ($dashboardController) {
    requireAdmin();
    $dashboardController->deleteItem();
});

$router->post('/dashboard/delete-multiple', function () use ($dashboardController) {
    requireAdmin();
    $dashboardController->deleteMultipleItems();
});

// Upload d'une image pour une catégorie
$router->post('/dashboard/uploadImage', function () use ($dashboardController) {
    requireAdmin();
    $categoryId = $_GET['category'] ?? null;
    if ($categoryId) {
        $dashboardController->uploadCategoryImage((int) $categoryId);
    } else {
        $_SESSION['error'] = "Catégorie non spécifiée.";
        header("Location: /dashboard");
        exit;
    }
});

// Suppression d'une image
$router->post('/dashboard/deleteImage', function () use ($dashboardController) {
    requireAdmin();
    $imageId = $_GET['id'] ?? null;
    if ($imageId) {
        $dashboardController->deleteCategoryImage((int) $imageId);
    } else {
        $_SESSION['error'] = "Image non spécifiée.";
        header("Location: /dashboard");
        exit;
    }
});