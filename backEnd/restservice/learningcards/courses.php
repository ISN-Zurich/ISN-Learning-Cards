<?php

chdir("../..");

require_once ('restservice/include/inc.header.php');

require_once 'Services/User/classes/class.ilObjUser.php';

global $ilUser;

$userId = $_SERVER['PATH_INFO'];
$userId = preg_replace("/\//",	"", $userId);

$ilUser->setId($userId);
$ilUser->read();
echo(json_encode($ilUser->_getAllUserData()));

$SYNC_TIMEOUT = 60;

//read header variable to get userId



//$courses = getCourses($userId);

// $c = array ("courses" => $courses, 
// 			"syncDateTime" => 0,
// 			"syncState" => false,
// 			"syncTimeOut" => $SYNC_TIMEOUT);

// header('content-type: application/json');
// echo(json_encode($c));

function getCourses($userId) {
// 	return array( array(
// 			"id" => "1",
// 			"title" => "Politics",
// 			"syncDateTime" => 0,
// 			"syncState" => false,
// 			"isLoaded" => false
// 	), array(
// 			"id" => "2",
// 			"title" => "Economics",
// 			"syncDateTime" => 0,
// 			"syncState" => false,
// 			"isLoaded" => false
// 	));
	
	
	$ilUser->setId($userId);
	$ilUser->read();
	echo($ilUser->_getAllUserData());
}



function logging($message) {
	$log_prefix = "courses.php: ";

	error_log($log_prefix . $message, 0);
}
?>
