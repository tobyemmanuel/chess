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
            $this->sessions($user['user_id']);
            $avatar = (!is_null($user['avatar'])) ? 'uploads/' . $user['avatar'] : NULL;
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
            // $checkSession = $this->checkSession($user['user_id']);

            if ($user) {
                $avatar = (!is_null($user['avatar'])) ? 'uploads/' . $user['avatar'] : NULL;
                return ["success" => true, "message" => "Logged in.", "data" => ["email" => $user['email'], "username" => $user['username'], "avatar" => $avatar]];
            }
        };

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
                return ["success" => true, "message" => "Passcode reset email sent $passcode"];
            } else {
                return ["success" => false, "message" => "Passcode reset unsuccessful. Try again later $passcode"];
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

    public function sessions($user): bool
    {
        $session_id = hash('md5', rand(1000, 9999) . $user . time());
        $expires_at = date('Y-m-d H:i:s', strtotime('+' . SESSION_LIFETIME . 'minutes'));
        $user_ip = $_SERVER['REMOTE_ADDR'];
        $user_agent = $_SERVER['HTTP_USER_AGENT'];
        $_SESSION['user_id'] = $user;
        $_SESSION['ip'] = $user_ip;
        $_SESSION['user_agent'] = $user_agent;
        $_SESSION['session_id'] = $session_id;
        $_SESSION['expires_at'] = $expires_at;

        // $stmt = $this->conn->prepare("UPDATE player_sessions SET session_status = ? WHERE player_id = ?");
        // $stmt->execute([false, $user]);

        // $stmtSession = $this->conn->prepare("INSERT INTO player_sessions (player_id, session_id, user_ip, user_agent, expires_at, session_status) VALUES (?, ?, ?, ?, ?, ?)");
        // $stmtSession->execute([$user, $session_id, $user_ip, $user_agent, $expires_at, true]);

        return true;
    }

    public function checkSession($user): bool
    {
        $stmt = $this->conn->prepare("SELECT * FROM player_sessions WHERE player_id = ?");
        $stmt->execute([$user]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        $user_ip = $_SERVER['REMOTE_ADDR'];
        $user_agent = $_SERVER['HTTP_USER_AGENT'];

        if (!$user || $user['user_ip'] !== $user_ip || $user['user_agent'] !== $user_agent || time() > strtotime($user['expires_at'])) {

            $stmt = $this->conn->prepare("UPDATE player_sessions SET session_status = ? WHERE player_id = ?");
            $stmt->execute([false, $user]);
            
            session_unset();
            session_destroy();
            return false;
        }

        return true;
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