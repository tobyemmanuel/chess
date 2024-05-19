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
}