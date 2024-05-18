<?php

class validations
{

    public static function registration($username = null, $password = null)
    {
        // Validation logic here
        if (strlen($password) < 4) {
            return [false, "Password must be at least 4 characters"];
        }

        if (strlen($username) < 4) {
            return [false, "Username must be at least 4 characters"];
        }

        return [true, "No errors"];
    }
}