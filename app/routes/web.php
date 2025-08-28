<?php
$homeController = new HomeController();
$locationPageController = new LocationPageController();
$router->get('/', [$homeController, 'index']);
$router->get('/location', [$locationPageController,'show']);
$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
