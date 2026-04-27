<?php
// api/reminders.php
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
    // Fetch only reminders for the logged-in user
    $sql = "SELECT * FROM reminders WHERE user_id = $user_id AND is_read = FALSE ORDER BY reminder_time ASC";
    $result = $conn->query($sql);
    
    $reminders = [];
    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $reminders[] = $row;
        }
    }
    echo json_encode(["status" => "success", "data" => $reminders]);
} 
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) $data = $_POST;
    
    if (isset($data['message']) && isset($data['reminder_time'])) {
        $msg = $conn->real_escape_string(trim($data['message']));
        $time = $conn->real_escape_string(trim($data['reminder_time']));
        
        // Associate reminder with the logged-in user
        $sql = "INSERT INTO reminders (message, reminder_time, user_id) VALUES ('$msg', '$time', $user_id)";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success", "message" => "Reminder set"]);
        } else {
            echo json_encode(["status" => "error", "message" => $conn->error]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Message and time are required"]);
    }
}
else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}
$conn->close();
?>
