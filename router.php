<?php
// router.php — used by PHP built-in server (php -S)
// Handles routing and static file serving for Railway deployment.

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Define the document root
$docRoot = __DIR__;

// Build the full file path
$filePath = $docRoot . $uri;

// Serve existing static files directly (css, js, images, etc.)
if ($uri !== '/' && file_exists($filePath) && !is_dir($filePath)) {
    // Let PHP built-in server handle it natively
    return false;
}

// If it's a directory, look for index.html or index.php
if (is_dir($filePath)) {
    if (file_exists($filePath . '/index.html')) {
        $uri = rtrim($uri, '/') . '/index.html';
        $filePath = $docRoot . $uri;
    } elseif (file_exists($filePath . '/index.php')) {
        $uri = rtrim($uri, '/') . '/index.php';
        $filePath = $docRoot . $uri;
    }
}

// Route API calls to the correct PHP file
if (preg_match('#^/api/(.+)$#', $uri, $matches)) {
    $apiFile = $docRoot . '/api/' . $matches[1];
    if (file_exists($apiFile)) {
        require $apiFile;
        return;
    }
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'API endpoint not found']);
    return;
}

// Serve .php files
if (file_exists($filePath) && pathinfo($filePath, PATHINFO_EXTENSION) === 'php') {
    require $filePath;
    return;
}

// Default: serve index.html
$indexFile = $docRoot . '/index.html';
if (file_exists($indexFile)) {
    // Set correct content type
    header('Content-Type: text/html; charset=utf-8');
    readfile($indexFile);
    return;
}

http_response_code(404);
echo '404 Not Found';
