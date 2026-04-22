<?php
mysqli_report(MYSQLI_REPORT_STRICT | MYSQLI_REPORT_ERROR);

// Test password 'haha'
try {
    $conn = new mysqli('localhost', 'root', 'haha');
    echo "Password 'haha' works!\n";
    
    // Check db
    try {
        $conn->select_db('dashflow_db');
        echo "Database dashflow_db exists!\n";
    } catch (mysqli_sql_exception $e) {
        echo "Database check failed: " . $e->getMessage() . "\n";
    }
} catch (mysqli_sql_exception $e) {
    echo "Password 'haha' failed: " . $e->getMessage() . "\n";
}
