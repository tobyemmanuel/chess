<?php
$player = new playerClass($db);
$method = $_REQUEST['action'] ?? '';

$process = ["success" => false, "message" => "Route not found"];

if (method_exists($player, $method)) {
    switch ($method) {
        case 'updateprofile':
            $profileUsername = $_POST['profileUsername'] ?? '';
            $currentPasscode = $_POST['currentPasscode'] ?? '';
            $newPasscode = $_POST['newPasscode'] ?? '';
            $file = $_FILES['profileImage'] ?? null;
            $profileEmail = $_POST['profileEmail'] ?? '';

            $process = $player->updateProfile($profileUsername, $currentPasscode, $newPasscode, $profileEmail, $file);
            break;

        case 'updategamesettings':

            $camera_angle = $_POST['cameraAngle'] ?? '';
            $brightness = $_POST['brightness'] ?? '';
            $chessPieceType = $_POST['chesspieceType'] ?? '';
            $difficulty = $_POST['difficulty'] ?? '';
            $boardColor = $_POST['boardColor'] ?? '';

            $process = $player->updateGameSettings($camera_angle, $brightness, $difficulty, $chessPieceType, $boardColor);
            break;

        case 'fetchgamesettings':
            $process = $player->fetchGameSettings();
            break;

        default:
            // This case should never be reached if method_exists check passes.
            $process = ["success" => false, "message" => "Invalid action"];
            break;
    }
}
