<?php
$SYNC_TIMEOUT = 60;

//read header variable to get userId

$courses = getCourses(0);

$c = array ("courses" => $courses, 
			"syncDateTime" => 0,
			"syncState" => false,
			"syncTimeOut" => $SYNC_TIMEOUT);

header('content-type: application/json');
echo(json_encode($c));

function getCourses($userId) {
	return array( array(
			"id" => "1",
			"title" => "Politics",
			"syncDateTime" => 0,
			"syncState" => false,
			"isLoaded" => false
	), array(
			"id" => "2",
			"title" => "Economics",
			"syncDateTime" => 0,
			"syncState" => false,
			"isLoaded" => false
	));
}



function logging($message) {
	$log_prefix = "courses.php: ";

	error_log($log_prefix . $message, 0);
}
?>
