<?php

// Routes publiques
$router->get('/', [$homeController, 'index']);
$router->get('/location', [$locationPageController, 'show']);

// Login
$router->get('/login', [$loginController, 'showLoginForm']);
$router->post('/login', [$loginController, 'login']);
$router->get('/logout', [$loginController, 'logout']);

// Dashboard sécurisé
$router->get('/dashboard', function() use ($dashboardController) {
    requireAdmin();
    $dashboardController->index();
});
$router->post('/dashboard/add', function() use ($dashboardController) {
    requireAdmin();
    $dashboardController->addItem();
});
$router->get('/dashboard/delete/{id}', function($id) use ($dashboardController) {
    requireAdmin();
    $dashboardController->deleteItem($id);
});
$router->get('/dashboard/edit/{id}', function($id) use ($dashboardController) {
    requireAdmin();
    $dashboardController->editItem($id);
});
$router->post('/dashboard/edit/{id}', function($id) use ($dashboardController) {
    requireAdmin();
    $dashboardController->editItem($id);
});
