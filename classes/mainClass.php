<?php

class mainClass
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function home()
    {

        return ["success" => false, "message" => "Cannot create player"];
    }

    public function register($username, $passcode)
    {

        $stmt = $this->conn->prepare("SELECT id FROM players WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->rowCount() > 0) {
            return ["success" => false, "message" => "Username already exists."];
        }

        $passcode = password_hash($passcode, PASSWORD_DEFAULT);
        $user_id = $this->gen_uuid();
        $stmt = $this->conn->prepare("INSERT INTO players (user_id, username, passcode) VALUES (?, ?, ?)");
        $stmt->execute([$user_id, $username, $passcode]);
        return ($stmt->rowCount() > 0) ? ["success" => true, "message" => "Player created"] : ["success" => false, "message" => "Cannot create player"];
    }

    public function login($username, $passcode)
    {
        $stmt = $this->conn->prepare("SELECT * FROM players WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($passcode, $user['passcode'])) {

            session_start();

            $_SESSION['user_id'] = $user['user_id'];

            return ["success" => true, "message" => "Logged in successfully.", "data" => ["username" => $user['username']]];
        }
        return ["success" => false, "message" => "Wrong username or password."];
    }

    public function isLoggedIn()
    {
        if(isset($_SESSION['user_id'])) {
            return ["success" => true, "message" => "Logged in."];
        };

        return ["success" => false, "message" => "Not Logged In."];
    }

    public function logout()
    {
        session_start();
        session_unset();
        session_destroy();
    }

    public function gen_uuid()
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff)
        );
    }
}