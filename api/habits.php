<?php
// api/habits.php
header('Content-Type: application/json');
require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sql = "SELECT * FROM habits ORDER BY created_at DESC";
    $result = $conn->query($sql);
    
    $habits = [];
    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $habits[] = $row;
        }
    }
    echo json_encode(["status" => "success", "data" => $habits]);
} 
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) $data = $_POST;
    
    if (isset($data['title']) && !empty(trim($data['title']))) {
        $title = $conn->real_escape_string(trim($data['title']));
        
        $sql = "INSERT INTO habits (title) VALUES ('$title')";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success", "message" => "Habit created"]);
        } else {
            echo json_encode(["status" => "error", "message" => $conn->error]);
        }
    }
}
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['id']) && isset($data['action'])) {
        $id = (int)$data['id'];
        $action = $data['action'];
        if ($action === 'increment') {
            $sql = "UPDATE habits SET streak = streak + 1 WHERE id = $id";
        } else {
            $sql = "UPDATE habits SET streak = GREATEST(streak - 1, 0) WHERE id = $id";
        }
        if ($conn->query($sql) === TRUE) {
            $res = $conn->query("SELECT streak FROM habits WHERE id = $id");
            $row = $res->fetch_assoc();
            echo json_encode(["status" => "success", "streak" => (int)$row['streak']]);
        } else {
            echo json_encode(["status" => "error", "message" => $conn->error]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "ID and action required"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}
$conn->close();
?>
