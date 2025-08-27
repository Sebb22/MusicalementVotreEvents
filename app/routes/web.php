<?php
$homeController = new HomeController();
$router->get('/', [$homeController, 'index']);
$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
