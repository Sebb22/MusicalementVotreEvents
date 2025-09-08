<?php

namespace App\Core;

class Router
{
    private $routes = [];

    public function get($path, $callback)
    {
        $this->routes['GET'][] = ['path' => $path, 'callback' => $callback];
    }

    public function post($path, $callback)
    {
        $this->routes['POST'][] = ['path' => $path, 'callback' => $callback];
    }

    public function dispatch($method, $uri)
    {
        $uri = strtok($uri, '?'); // enlève query string

        if (!isset($this->routes[$method])) {
            http_response_code(404);
            echo "Page non trouvée";
            return;
        }

        foreach ($this->routes[$method] as $route) {
            $pattern = preg_replace('#\{(\w+)\}#', '(?P<$1>[\w\-]+)', $route['path']);
            $pattern = "#^" . $pattern . "$#";

            if (preg_match($pattern, $uri, $matches)) {
                $params = [];
                foreach ($matches as $key => $value) {
                    if (is_string($key)) {
                        $params[$key] = $value;
                    }
                }

                $callback = $route['callback'];

                if (is_array($callback) && count($callback) === 2) {
                    call_user_func_array([$callback[0], $callback[1]], $params);
                } else {
                    call_user_func_array($callback, $params);
                }
                return;
            }
        }

        http_response_code(404);
        echo "Page non trouvée";
    }
}
