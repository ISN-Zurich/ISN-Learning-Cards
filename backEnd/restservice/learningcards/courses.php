<?php

/**
 * 
 */

//syncTimeOut provides a way for the server to tell the clients how often they are allowed to synchronize
$SYNC_TIMEOUT = 60;

chdir("../..");

require_once ('restservice/include/inc.header.php');

require_once 'Services/User/classes/class.ilObjUser.php';

global $ilUser;

$userID = get_userid_from_headers();
logging(" my userid is ". $userID);

$return_data = getCourseList($userID);

header('content-type: application/json');
echo (json_encode($return_data));



/**
 * Reads header variable to get userId
 * 
 * @return userId
 */
function get_userid_from_headers() {
	$myheaders = getallheaders();
	$userId = $myheaders["userid"];

	if (!($userId > 0)) {
		$userId = "12979"; //for debugging
	}

	logging("userid from header: " . $userId);

	global $ilUser;
	$ilUser->setId($userId);
	$ilUser->read();
	//FIXME: test if users exists

	return $userId;
}


/**
 * Gets the course list for the specified user
 *
 * @return course list array
 */
function getCourseList($userId) {
	global $ilObjDataCache;

	include_once 'Services/Membership/classes/class.ilParticipants.php';

	//loads all courses in which the current user is a member
	$items = ilParticipants::_getMembershipByType($userId, 'crs');

	$courses = array();
	foreach($items as $key => $obj_id)	{
		$title       = $ilObjDataCache->lookupTitle($obj_id);
		$description = $ilObjDataCache->lookupDescription($obj_id);

		//FIXME: check if questionpool for the course exists
		//only if a questionpool exists the course is added to the list
		array_push($courses,
				array("id"             => $obj_id,
						"title"        => $title,
						"syncDateTime" => 0,
						"syncState"    => false,
						"isLoaded"     => false,
						"description"  => $description));

	}

	//data structure for front end models
	$courseList = array("courses" => $courses,
			"syncDateTime" => 0,
			"syncState" => false,
			"syncTimeOut" => $SYNC_TIMEOUT);

	return $courseList;
}


function logging($message) {
	$log_prefix = "courses.php: ";

	error_log($log_prefix . $message, 0);
}
?>
