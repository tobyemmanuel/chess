<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


require_once 'classes/autoload.php';
request::getRequestData();

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
        $process = ['success' => true, 'message' => 'Player Testing', 'data' => null];
        break;
    case 'game':
        $process = ['success' => true, 'message' => 'Game Testing', 'data' => null];
        break;
    case 'main':
        require "routes/main.php";
        break;        
    default:
    $process = null;
}

if ($process != null) {
    if($process['success'] == true) {
        responseClass::successResponse($process['message'], $process['data'] ?? null);
    } else {
        responseClass::errorResponse($process['message'], $process['data'] ?? null);
    }
}

responseClass::successResponse('3DChess is up and running');