<?php

// Load the autoload.php file relative to the current file's directory
require_once 'vendor/autoload.php'; // Adjust the path as needed

// Load environment variables from the .env file
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

define('DB_HOST', $_ENV['DB_HOST']);
define('DB_NAME', $_ENV['DB_NAME']);
define('DB_USER', $_ENV['DB_USER']);
define('DB_PASS', $_ENV['DB_PASS']);
define('MAIL_HOST', $_ENV['MAIL_HOST']);
define('MAIL_FROM', $_ENV['MAIL_FROM']);
define('MAIL_PORT', $_ENV['MAIL_PORT']);
define('MAIL_USER', $_ENV['MAIL_USER']);
define('MAIL_PASS', $_ENV['MAIL_PASS']);
define('MAIL_NAME', $_ENV['MAIL_NAME']);
