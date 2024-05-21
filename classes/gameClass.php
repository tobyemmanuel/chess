<?php

class gameClass
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function start()
    {
        $gameId = $this->gen_uuid();

        return ["success" => true, "message" => "Welcome back!", "data" => ["gameId" => $gameId, "players" => [], "settings" => [], "gameData" => []]];
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