<?php

class request {
    // Sanitize input data
    public static function sanitize($data) {
        // Check if data is an array
        if (is_array($data)) {
            // Loop through each element of the array and sanitize recursively
            foreach ($data as $key => $value) {
                $data[$key] = self::sanitize($value);
            }
        } else {
            // If data is not an array, sanitize it
            $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
        }
        return $data;
    }

    // Get sanitized request data ($_GET, $_POST, or $_REQUEST)
    public static function getRequestData() {
        $requestData = [];
        // Sanitize $_GET, $_POST, and $_REQUEST data
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $requestData = self::sanitize($_GET);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $requestData = self::sanitize($_POST);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'REQUEST') {
            $requestData = self::sanitize($_REQUEST);
        }
        return $requestData;
    }
}
