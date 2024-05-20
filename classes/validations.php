<?php

class validations
{

    public static function registration($username = null, $password = null, $email = null)
    {
        // Validation logic here
        if (strlen($password) < 4) {
            return [false, "Password must be at least 4 characters"];
        }

        if (strlen($username) < 4) {
            return [false, "Username must be at least 4 characters"];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return [false, "Invalid email address"];
        }

        return [true, "No errors"];
    }

    public static function email($email = null)
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return [false, "Invalid email address"];
        }

        return [true, "No errors"];
    }

    public static function settings($camera_angle = null, $brightness = null, $difficulty = null, $chessPieceType = null, $boardColor = null)
    {
        // Validation logic here
        if (!is_numeric($camera_angle) || $camera_angle < 0 || $camera_angle > 90) {
            return [false, "Invalid camera angle"];
        }

        if (!is_numeric($brightness) || $brightness < 40 || $brightness > 90) {
            return [false, "Invalid camera angle"];
        }

        if (!in_array($difficulty, array('easy', 'medium', 'hard'))) {
            return [false, "Invalid difficulty set"];
        }

        if (!in_array($chessPieceType, array('set1'))) {
            return [false, "Invalid chess piece type set"];
        }

        if (!in_array($boardColor, array('set1'))) {
            return [false, "Invalid board color set"];
        }

        return [true, "No errors"];
    }

    public static function checkLogin(){
        if(isset($_SESSION['user_id'])) {
            return [true, $_SESSION['user_id']];
        };
        return [false];
    }

}