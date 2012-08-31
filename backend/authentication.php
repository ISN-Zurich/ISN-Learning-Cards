<?php

$filename = $_SERVER['PATH_INFO'];
logging($filename);

$auth = file_get_contents('./authentication/' . $filename);
echo($auth);

function logging($message) {
	$log_prefix = "authentication.php: ";
	
	error_log($log_prefix . $message, 0);
}
?>
