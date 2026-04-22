<?php
// api/tasks.php
header('Content-Type: application/json');
require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch all tasks
    $sql = "SELECT * FROM tasks ORDER BY created_at DESC";
    $result = $conn->query($sql);
    
    $tasks = [];
    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $tasks[] = $row;
        }
    }
    echo json_encode(["status" => "success", "data" => $tasks]);
} 
elseif ($method === 'POST') {
    // Add a new task
    // We expect JSON payload for AJAX
    $data = json_decode(file_get_contents('php://input'), true);
    
    // If not JSON, try standard POST
    if (!$data) {
        $data = $_POST;
    }
    
    if (isset($data['title']) && !empty(trim($data['title']))) {
        $title = $conn->real_escape_string(trim($data['title']));
        $priority = isset($data['priority']) ? $conn->real_escape_string($data['priority']) : 'medium';
        $status = 'todo'; // default
        
        $sql = "INSERT INTO tasks (title, priority, status) VALUES ('$title', '$priority', '$status')";
        
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success", "message" => "Task created successfully", "id" => $conn->insert_id]);
        } else {
            echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Title is required"]);
    }
}
else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}

$conn->close();
?>
