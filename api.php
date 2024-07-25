<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


require_once 'classes/autoload.php';
request::getRequestData();
session_set_cookie_params([
    'lifetime' => $_ENV['SESSION_LIFETIME'] ?? 1800,
    'samesite' => 'Strict',
    //     'httponly' => true,
    //     'secure' => true
]);

session_start();
$database = new databaseClass();
$db = $database->getConnection();

if(!$db) {
    responseClass::errorResponse('Cannot connect to database');
    exit;
}

$path = $_GET['path'] ?? "";
$process = null;

switch ($path) {
    case 'player':
        authCheck::updateUser($db);
        require "routes/player.php";
        break;
    case 'game':
        authCheck::updateUser($db);
        require "routes/game.php";
        break;
    case 'main':
        require "routes/main.php";
        break;        
    default:
    $process = null;
}

if (!is_null($process)) {
    if($process['success'] == true) {
        responseClass::successResponse($process['message'], $process['data'] ?? null);
    } else {
        responseClass::errorResponse($process['message'], $process['data'] ?? null);
    }
}

responseClass::successResponse('3DChess is up and running');