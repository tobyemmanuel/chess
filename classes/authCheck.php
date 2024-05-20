<?php
class authCheck {

    public static function updateUser($db) {
        $user_id = validations::checkLogin();
        if($user_id[0] == false){
            return ["success" => false, "message" => "User not logged in"]; 
        }
        $user_id = $user_id[1];
        $stmt = $db->prepare("UPDATE players SET last_seen = ? WHERE user_id = ?");
        $stmt->execute([date('Y-m-d H:i:s'), $user_id]);

    }
}
