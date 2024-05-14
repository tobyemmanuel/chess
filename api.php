<?php

require_once 'classes/autoload.php';
request::getRequestData();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$database = new databaseClass();
$db = $database->getConnection();

if(!$db) {
    responseClass::errorResponse($db['message'], $db['data']);
}

$path = $_GET['path'] ?? "";

switch ($path) {
    case 'player':
        $process = ['success' => true, 'message' => 'Player Testing', 'data' => null];
        break;
    case 'game':
        $process = ['success' => true, 'message' => 'Game Testing', 'data' => null];
        break;
    case 'main':
        $process = ['success' => true, 'message' => 'Main Testing', 'data' => null];
        break;        
    default:
    $process = null;
}

if ($process != null) {
    if($process['success'] == true) {
        responseClass::successResponse($process['message'], $process['data']);
    } else {
        responseClass::errorResponse($process['message'], $process['data']);
    }
}

responseClass::successResponse('3DChess is up and running');