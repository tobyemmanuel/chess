<?php

class playerClass
{

    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function home()
    {

        return ["success" => true, "message" => "Welcome here!"];
    }

    public function updateProfile(string $username, string $passcode, string $newpasscode, string $email, $avatar): array
    {
        $user_id = validations::checkLogin();
        if($user_id[0] == false){
            return ["success" => false, "message" => "User not logged in"]; 
        }
        $user_id = $user_id[1];
        $stmt = $this->conn->prepare("SELECT * FROM players WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($stmt->rowCount() == 0) {
            return ["success" => false, "message" => "Account not found."];
        }

        $failed = [];
        $success = [];
        $upload_avatar = $user['avatar'];

        // Handle avatar upload
        if (!empty($avatar['name'])) {
            $upload_avatar = $this->profileImageUpload($avatar, $user['id']);
            if ($upload_avatar[0] == false) {
                $failed[] = $upload_avatar[1];
            } else {
                $success[] = "Image uploaded";
                $upload_avatar = $upload_avatar[1];
            }
        }

        // Handle passcode change
        $passcodeHash = $user['passcode'];
        if (!empty($passcode) && !empty($newpasscode)) {
            $checkPass = $this->passcodeCheck($passcode, $user['passcode'], $newpasscode);
            if ($checkPass[0] == false) {
                $failed[] = $checkPass[1];
            } else {
                $passcodeHash = password_hash($newpasscode, PASSWORD_DEFAULT);
                $success[] = "Passcode changed";
            }
        }

        // Handle email update
        if (!empty($email) && $email !== $user['email']) {
            $stmt = $this->conn->prepare("SELECT id FROM players WHERE email = ? AND user_id != ?");
            $stmt->execute([$email, $user_id]);
            if ($stmt->rowCount() > 0) {
                $failed[] = "Email already in use";
            } else {
                $success[] = "Email updated";
            }
        } else {
            $email = $user['email'];
        }

        // Handle username update
        if (!empty($username) && $username !== $user['username']) {
            $stmt = $this->conn->prepare("SELECT id FROM players WHERE username = ? AND user_id != ?");
            $stmt->execute([$username, $user_id]);
            if ($stmt->rowCount() > 0) {
                $failed[] = "Username already in use";
            } else {
                $success[] = "Username updated";
            }
        } else {
            $username = $user['username'];
        }

        // Update the database
        $stmt = $this->conn->prepare("UPDATE players SET username = ?, email = ?, avatar = ?, passcode = ? WHERE user_id = ?");
        $stmt->execute([$username, $email, $upload_avatar, $passcodeHash, $user_id]);
        $successMsg = count($success) > 0 ? implode(", ", $success) : '';
        $failedMsg = count($failed) > 0 ? implode(", ", $failed) : '';

        if (count($failed) > 0) {
            return ["success" => false, "message" => trim($successMsg . ' ' . $failedMsg)];
        }

        return ["success" => true, "message" => $successMsg];
    }

    public function updateGameSettings($camera_angle, $brightness, $difficulty, $chessPieceType, $boardColor)
    {
        $user_id = validations::checkLogin();
        if($user_id[0] == false){
            return ["success" => false, "message" => "User not logged in"]; 
        }
        $user_id = $user_id[1];
        $valid_settings = validations::settings($camera_angle, $brightness, $difficulty, $chessPieceType, $boardColor);

        if($valid_settings[0] == false){
            return ["success" => false, "message" => $valid_settings[1]]; 
        }

        $stmt = $this->conn->prepare("SELECT id FROM player_preferences WHERE user_id = ?");
        $stmt->execute([$user_id]);
        if ($stmt->rowCount() > 0) {
            $stmt = $this->conn->prepare("UPDATE player_preferences SET brightness = ?, cameraAngle = ?, boardColour = ?, chesspieceType = ?, difficulty = ? WHERE user_id = ?");
            $stmt->execute([$brightness, $camera_angle, $boardColor, $chessPieceType, $difficulty, $user_id]);
        }else{
            $stmt = $this->conn->prepare("INSERT INTO player_preferences (user_id, brightness, cameraAngle, boardColour, chesspieceType, difficulty) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([ $user_id, $brightness, $camera_angle, $boardColor, $chessPieceType, $difficulty]);
        }

        return ["success" => true, "message" => "Setting updated"];
    }

    public function fetchGameSettings()
    {
        $user_id = validations::checkLogin();
        if($user_id[0] == false){
            return ["success" => false, "message" => "User not logged in"]; 
        }
        $user_id = $user_id[1];


        $stmt = $this->conn->prepare("SELECT brightness, cameraAngle, boardColour, chesspieceType, difficulty FROM player_preferences WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $user_settings = null;
        if ($stmt->rowCount() > 0) {
            $user_settings = $stmt->fetch(PDO::FETCH_ASSOC);
        }
        return ["success" => true, "message" => "Setting fetched", "data" => $user_settings];
    }

    public function profileImageUpload($file, $user_id)
    {
        $targetDirectory = "uploads/";
        $targetFile = $targetDirectory . basename($file["name"]);
        $imageType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
        $uniqueFileName = 'pl_' . hash('md5', $user_id) . '.' . $imageType;
        $targetFile = $targetDirectory . $uniqueFileName;

        if (!in_array($imageType, array("jpg", "jpeg", "png", "gif"))) {
            return [false, "Unsupported image"];
        }

        if (move_uploaded_file($file["tmp_name"], $targetFile)) {
            return [true, $uniqueFileName];
        }
        return [false, "Upload failed"];
    }

    public function passcodeCheck($oldpasscodeinput, $oldpasscode, $newpasscode)
    {
        if (password_verify($oldpasscodeinput, $oldpasscode)) {
            if ($newpasscode < 4) {
                return [false, "Passcode too short, minimum of four characters required"];
            }
            return [true, password_hash($newpasscode, PASSWORD_DEFAULT)];
        }
        return [false, "passcode mismatch"];
    }

}