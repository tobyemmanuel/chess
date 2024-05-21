<?php
$game = new gameClass($db);
$method = $_REQUEST['action'];

if (method_exists($game, $method)) {

    switch ($method) {
        case 'start':
            $process = $game->start();
            break;
        default:
            $process = null;
    }
    ;

}

return ["success" => false, "message" => "Route not found"];