<?php
$main = new mainClass($db);
$method = $_REQUEST['action'];

if (method_exists($main, $method)) {
    if ($method === 'home') {
        // Handle home route
        $process = ['success' => false, 'message' => 'You are not logged in!', 'data' => null];
    } elseif ($method === 'register') {
        
        $username = $_POST['username'] ?? null;
        $passcode = $_POST['passcode'] ?? null;
        $validationResult = validations::registration($username, $passcode);

        if ($validationResult[0]) {
            $process = $main->register($username, $passcode);
        } else {
            $process = ['success' => false, 'message' => $validationResult[1]];
        }

    } elseif ($method === 'login') {
        $username = $_POST['username'] ?? null;
        $passcode = $_POST['passcode'] ?? null;

        if ($username!==null && $passcode!==null) {
            $process = $main->login($username, $passcode);
        } else {
            $process = ['success' => false, 'message' => "Wrong username or passcode"];
        }
    } elseif ($method === 'logout') {
            $main->logout();
    } elseif ($method === 'isloggedin') {
            $main->logout();
    }
}

return ["success" => false, "message" => "Route not found"];