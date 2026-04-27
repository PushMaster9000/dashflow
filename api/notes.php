<?php
// api/notes.php
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
    // Fetch notes for the logged-in user
    $sql = "SELECT * FROM notes WHERE user_id = $user_id ORDER BY updated_at DESC";
    $result = $conn->query($sql);
    
    $notes = [];
    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $notes[] = $row;
        }
    }
    echo json_encode(["status" => "success", "data" => $notes]);
} 
elseif ($method === 'POST') {
    // Add a new note for the current user
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        $data = $_POST;
    }
    
    if (isset($data['title']) && !empty(trim($data['title'])) && isset($data['content'])) {
        $title = $conn->real_escape_string(trim($data['title']));
        $content = $conn->real_escape_string(trim($data['content']));
        
        $sql = "INSERT INTO notes (title, content, user_id) VALUES ('$title', '$content', $user_id)";
        
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success", "message" => "Note saved successfully", "id" => $conn->insert_id]);
        } else {
            echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Title and content are required"]);
    }
}
elseif ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['id'])) {
        $id = (int)$data['id'];
        
        // Ensure the note belongs to the user
        $sql = "DELETE FROM notes WHERE id = $id AND user_id = $user_id";
        if ($conn->query($sql) === TRUE) {
            if ($conn->affected_rows > 0) {
                echo json_encode(["status" => "success", "message" => "Note deleted successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Note not found or unauthorized"]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to delete note"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Note ID required"]);
    }
}
else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}

$conn->close();
?>
