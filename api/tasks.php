<?php
// api/tasks.php
session_start();
header('Content-Type: application/json');
require_once 'db_connect.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$user_id = (int)$_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch only tasks for the logged-in user
    $sql = "SELECT * FROM tasks WHERE user_id = $user_id ORDER BY created_at DESC";
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
    // Add a new task for the current user
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        $data = $_POST;
    }
    
    if (isset($data['title']) && !empty(trim($data['title']))) {
        $title = $conn->real_escape_string(trim($data['title']));
        $priority = isset($data['priority']) ? $conn->real_escape_string($data['priority']) : 'medium';
        $status = 'todo'; // default
        
        $sql = "INSERT INTO tasks (title, priority, status, user_id) VALUES ('$title', '$priority', '$status', $user_id)";
        
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
