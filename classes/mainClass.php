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

        return ["success" => true, "message" => "Welcome back!"];
    }

    public function register(string $username, string $passcode, string $email): array
    {

        $stmt = $this->conn->prepare("SELECT id FROM players WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->rowCount() > 0) {
            return ["success" => false, "message" => "Username already exists."];
        }

        $stmt = $this->conn->prepare("SELECT id FROM players WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->rowCount() > 0) {
            return ["success" => false, "message" => "Email already exists."];
        }

        $passcode = password_hash($passcode, PASSWORD_DEFAULT);
        $user_id = $this->gen_uuid();
        $stmt = $this->conn->prepare("INSERT INTO players (user_id, username, passcode, email) VALUES (?, ?, ?, ?)");
        $stmt->execute([$user_id, $username, $passcode, $email]);
        return ($stmt->rowCount() > 0) ? ["success" => true, "message" => "Player created"] : ["success" => false, "message" => "Cannot create player"];
    }

    public function login(string $username, string $passcode): array
    {
        $stmt = $this->conn->prepare("SELECT * FROM players WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($passcode, $user['passcode'])) {
            // session_set_cookie_params([
                // 'lifetime' => 1800,
                //     'httponly' => true,
                //     'secure' => true
            // ]);
            // session_start();
            $_SESSION['user_id'] = $user['user_id'];
            $avatar =  (!is_null($user['avatar'])) ? 'http://localhost:8001/uploads/'.$user['avatar'] : NULL;
            return ["success" => true, "message" => "Logged in successfully.", "data" => ["email" => $user['email'], "username" => $user['username'], "avatar" => $avatar]];
        }
        return ["success" => false, "message" => "Wrong username or password."];
    }

    public function isLoggedIn(): array
    {
        // session_start();
        if (isset($_SESSION['user_id'])) {
            $user_id = $_SESSION['user_id'];
            $stmt = $this->conn->prepare("SELECT * FROM players WHERE user_id = ?");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user) {
                $avatar =  (!is_null($user['avatar'])) ? 'http://localhost:8001/uploads/'.$user['avatar'] : NULL;
                return ["success" => true, "message" => "Logged in.", "data" => ["email" => $user['email'], "username" => $user['username'], "avatar" => $avatar]];
            }
        }
        ;

        return ["success" => false, "message" => "Not Logged In."];
    }

    public function forgotPasscode($username): array
    {
        $stmt = $this->conn->prepare("SELECT * FROM players WHERE username = ? OR email = ?");
        $stmt->execute([$username, $username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            $passcode = rand(1000, 9999);
            $passcodeHash = password_hash($passcode, PASSWORD_DEFAULT);
            $sendMail = new emailClass();
            $sendMail = $sendMail->forgotPasswordMail($user['email'], $user['username'], $passcode);

            if ($sendMail[0] == true) {
                $stmt = $this->conn->prepare("UPDATE players SET passcode = ? WHERE id = ?");
                $stmt->execute([$passcodeHash, $user['id']]);
                return ["success" => true, "message" => "Passcode reset email sent"];
            } else {
                return ["success" => false, "message" => "Passcode reset unsuccessful. Try again later"];
            }
        }
        return ["success" => false, "message" => "Account does not exist."];
    }

    public function logout(): array
    {
        // session_start();
        session_unset();
        session_destroy();
        return ["success" => true, "message" => "Logged out successfully."];
    }

    public function gen_uuid(): string
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