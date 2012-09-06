<?php

/**
 *
 */

//syncTimeOut provides a way for the server to tell the clients how often they are allowed to synchronize
$SYNC_TIMEOUT = 60;

require_once '../logging/logger.php';

chdir("../..");

require_once ('restservice/include/inc.header.php');
require_once 'Services/User/classes/class.ilObjUser.php';
require_once 'Modules/Course/classes/class.ilCourseItems.php';

global $ilUser, $class_for_logging;

$class_for_logging = "courses.php";

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
	//method $ilUser->checkUserId() seems not to work in the way as expected!

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
    logging("items".json_encode($items));

	$courses = array();
	foreach($items as $key => $obj_id)	{

		//references are needed to get course items (= questionpools, tests, ...)
		$item_references = ilObject::_getAllReferences($obj_id);

		logging("items references".json_encode($item_references));
		
		//check if questionpool for the course exists
		//only if a questionpool exists the course is added to the list
		$hasQuestions = false;
		if(is_array($item_references) && count($item_references)) {
			foreach($item_references as $ref_id) {
				$courseItems = new ilCourseItems($ref_id);
				$courseItemsList = $courseItems->getAllItems();

				logging("Questions: " . json_encode($courseItemsList));
				
				foreach($courseItemsList as $courseItem) {
					if (strcmp($courseItem["type"], "qpl") == 0) {
						$hasQuestions = true;
						logging("course " . $obj_id . " has question pool");
					}
				}

			}
		}
		
		if ($hasQuestions) {

			$title       = $ilObjDataCache->lookupTitle($obj_id);
			$description = $ilObjDataCache->lookupDescription($obj_id);

			array_push($courses,
					array("id"             => $obj_id,
							"title"        => $title,
							"syncDateTime" => 0,
							"syncState"    => false,
							"isLoaded"     => false,
							"description"  => $description));

			//[{"id":"12968","ref_id":"1786","title":"Introduction to NATO","syncDateTime":0,"syncState":false,"isLoaded":false,"description":"Test Question Pool for \\"Lernkarten App\\""}]
		}
	}
	//data structure for front end models
	$courseList = array("courses" => $courses,
			"syncDateTime" => 0,
			"syncState" => false,
			"syncTimeOut" => $SYNC_TIMEOUT);

	return $courseList;

}
?>
