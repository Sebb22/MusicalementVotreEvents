<?php

namespace App\Core;

class Router
{
    private $routes = [];

    public function get($path, $callback)
    {
        $this->routes['GET'][$path] = $callback;
    }

    public function post($path, $callback)
    {
        $this->routes['POST'][$path] = $callback;
    }

    public function dispatch($method, $uri)
    {
        $uri = strtok($uri, '?'); // enlève query string
    
        if (isset($this->routes[$method][$uri])) {
            $callback = $this->routes[$method][$uri];
    
            if (is_array($callback) && count($callback) === 2) {
                call_user_func([$callback[0], $callback[1]]); // appelle correctement l'instance
            } else {
                call_user_func($callback);
            }
        } else {
            http_response_code(404);
            echo "Page non trouvée";
        }
    }
}    
