<?php
// api/reminders.php
header('Content-Type: application/json');
require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sql = "SELECT * FROM reminders WHERE is_read = FALSE ORDER BY reminder_time ASC";
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
        
        $sql = "INSERT INTO reminders (message, reminder_time) VALUES ('$msg', '$time')";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success", "message" => "Reminder set"]);
        } else {
            echo json_encode(["status" => "error", "message" => $conn->error]);
        }
    }
}
$conn->close();
?>
