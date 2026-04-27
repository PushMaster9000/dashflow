<?php
// api/habits.php
session_start();
header('Content-Type: application/json');
require_once 'db_connect.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized. Please login first."]);
    exit;
}

$user_id = (int)$_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Only fetch habits for the logged-in user
    $sql = "SELECT * FROM habits WHERE user_id = $user_id ORDER BY created_at DESC";
    $result = $conn->query($sql);
    
    $habits = [];
    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $habits[] = $row;
        }
    }
    echo json_encode(["status" => "success", "data" => $habits]);
} 
elseif ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['id'])) {
        $id = (int)$data['id'];
        $sql = "DELETE FROM habits WHERE id = $id AND user_id = $user_id";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success", "message" => "Habit deleted"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Delete failed"]);
        }
    }
}
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) $data = $_POST;
    
    if (isset($data['title']) && !empty(trim($data['title']))) {
        $title = $conn->real_escape_string(trim($data['title']));
        
        // Associate habit with the logged-in user
        $sql = "INSERT INTO habits (title, user_id) VALUES ('$title', $user_id)";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success", "message" => "Habit created"]);
        } else {
            echo json_encode(["status" => "error", "message" => $conn->error]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Title is required"]);
    }
}
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['id']) && isset($data['action'])) {
        $id = (int)$data['id'];
        $action = $data['action'];
        
        // Verify ownership before updating
        $check_sql = "SELECT id FROM habits WHERE id = $id AND user_id = $user_id";
        $check_res = $conn->query($check_sql);
        if ($check_res && $check_res->num_rows === 0) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            exit;
        }

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
}
elseif ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['id'])) {
        $id = (int)$data['id'];
        
        // Ensure the habit belongs to the user
        $sql = "DELETE FROM habits WHERE id = $id AND user_id = $user_id";
        if ($conn->query($sql) === TRUE) {
            if ($conn->affected_rows > 0) {
                echo json_encode(["status" => "success", "message" => "Habit deleted"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Habit not found or unauthorized"]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => $conn->error]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "ID required for deletion"]);
    }
}
else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}
$conn->close();
?>
