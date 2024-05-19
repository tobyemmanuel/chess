<?php
$player = new playerClass($db);
$method = $_REQUEST['action'];

if (method_exists($player, $method)) {

    switch ($method) {
        case 'home':
            $process = $player->home();
            break;
        case 'updateprofile':
            $profileUsername = $_POST['profileUsername'] ?? '';
            $currentPasscode = $_POST['currentPasscode'] ?? '';
            $newPasscode = $_POST['newPasscode'] ?? '';
            $file = $_FILES['profileImage'] ?? null;
            $profileEmail = $_POST['profileEmail'] ?? '';

            $process = $player->updateProfile($profileUsername, $currentPasscode, $newPasscode, $profileEmail, $file);

            break;            
        default:
            $process = null;
    };

}

return ["success" => false, "message" => "Route not found"];