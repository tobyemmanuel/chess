<?php

class responseClass
{

    public static function successResponse($message = null, $data = null)
    {
        echo json_encode(['success' => true, 'message' => $message, 'data' => $data]);
        exit;
    }

    public static function errorResponse($message = null, $data = null)
    {
        echo json_encode(['success' => false, 'message' => $message, 'data' => $data]);
        exit;
    }
}