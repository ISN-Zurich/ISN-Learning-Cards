<?php

function logging($message) {
	global $class_for_logging;
	
	$log_prefix = $class_for_logging . ": ";

	error_log($log_prefix . $message, 0);
}

?>