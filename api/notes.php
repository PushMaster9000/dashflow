<?php
// api/notes.php
header('Content-Type: application/json');
require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch all notes
    $sql = "SELECT * FROM notes ORDER BY updated_at DESC";
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
    // Add a new note
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        $data = $_POST;
    }
    
    if (isset($data['title']) && !empty(trim($data['title'])) && isset($data['content'])) {
        $title = $conn->real_escape_string(trim($data['title']));
        $content = $conn->real_escape_string(trim($data['content']));
        
        $sql = "INSERT INTO notes (title, content) VALUES ('$title', '$content')";
        
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
        $sql = "DELETE FROM notes WHERE id = $id";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success", "message" => "Note deleted successfully"]);
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
