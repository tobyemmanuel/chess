<?php
$main = new mainClass($db);
$method = $_REQUEST['action'];

if (method_exists($main, $method)) {

    switch ($method) {
        case 'home':
            $process = $main->home();
            break;
        case 'register':
            $username = $_POST['username'] ?? null;
            $passcode = $_POST['passcode'] ?? null;
            $email = $_POST['email'] ?? null;
            $validationResult = validations::registration($username, $passcode, $email);

            if ($validationResult[0]) {
                $process = $main->register($username, $passcode, $email);
            } else {
                $process = ['success' => false, 'message' => $validationResult[1]];
            }
            break;
        case 'login':
            $username = $_POST['username'] ?? null;
            $passcode = $_POST['passcode'] ?? null;

            if ($username !== null && $passcode !== null) {
                $process = $main->login($username, $passcode);
            } else {
                $process = ['success' => false, 'message' => "Wrong username or passcode"];
            }
            break;
        case 'forgotpasscode':
            $username = $_POST['username'] ?? null;
            $process = $main->forgotPasscode($username);
            break;

        case 'logout':
            $process = $main->logout();
            break;
        case 'isloggedin':
            $process = $main->isLoggedIn();
            break;
        default:
            $process = null;
    };

}

return ["success" => false, "message" => "Route not found"];