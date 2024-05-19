<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once "../config.inc.php";

// require 'vendor/autoload.php';
class emailClass
{

    public function sendEmail($to, $subject, $body) {
        $mail = new PHPMailer(true);
    
        try {
            // Server settings
            $mail->isSMTP();                                          
            $mail->Host       = MAIL_HOST ?? 'smtp.example.com';        
            $mail->SMTPAuth   = true;                                   
            $mail->Username   = MAIL_USER ?? 'your_username@example.com';
            $mail->Password   = MAIL_PASS?? 'your_password';             
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         
            $mail->Port       = MAIL_PORT ?? 587; 
    
            $mail->setFrom(MAIL_FROM, MAIL_NAME);
            $mail->addAddress($to);                                 
    
            $mail->isHTML(true);                              
            $mail->Subject = $subject;
            $mail->Body    = $body;
            $mail->AltBody = strip_tags($body);          
    
            $mail->send();
            return ['success' => true, 'message' => 'Email has been sent'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => "Email could not be sent. Mailer Error: {$mail->ErrorInfo}"];
        }
    }
    public function forgotPasswordMail($email, $username, $passcode)
    {
        $subject = "Passcode reset successful";
        $body = "Your passcode has changed. You can now login with ".$passcode;
        $sendMail = $this->sendEmail($email, $subject, $body);
        if($sendMail){
            return [true, "Sent"];
        }
        return [false, "Not Sent"];
    }
}