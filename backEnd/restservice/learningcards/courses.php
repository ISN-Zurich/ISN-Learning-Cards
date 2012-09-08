<?php

/**
 * This class loads the courses for the in the header specified user id from ILIAS and
 * returns an json-object with the course list 
 */

//syncTimeOut provides a way for the server to tell the clients how often they are allowed to synchronize
$SYNC_TIMEOUT = 60;

require_once '../logging/logger.php';
require_once './common.php';

chdir("../..");
require_once ('restservice/include/inc.header.php');
require_once 'Services/User/classes/class.ilObjUser.php';

global $ilUser, $class_for_logging;

$class_for_logging = "courses.php";


$userID = get_userid_from_headers();
logging(" my userid is ". $userID);

$return_data = getCourseList($userID);

header('content-type: application/json');
echo (json_encode($return_data));




/**
 * Gets the course list for the specified user
 *
 * @return course list array
 */
function getCourseList($userId) {
	global $ilObjDataCache;

	include_once 'Services/Membership/classes/class.ilParticipants.php';
	require_once 'Modules/Course/classes/class.ilCourseItems.php';
	require_once 'Modules/TestQuestionPool/classes/class.ilObjQuestionPool.php';

	//loads all courses in which the current user is a member
	$items = ilParticipants::_getMembershipByType($userId, 'crs');

	$courses = array();
	foreach($items as $key => $obj_id)	{

		//references are needed to get course items (= questionpools, tests, ...)
		$item_references = ilObject::_getAllReferences($obj_id);


		//check if valid questionpool for the course exists
		$validQuestionPool = false;
		if(is_array($item_references) && count($item_references)) {
			foreach($item_references as $ref_id) {
				
				//get all course items for a course (= questionpools, tests, ...)
				$courseItems = new ilCourseItems($ref_id);
				$courseItemsList = $courseItems->getAllItems();

				foreach($courseItemsList as $courseItem) {
					
					//the course item has to be of type "qpl" (= questionpool)
					if (strcmp($courseItem["type"], "qpl") == 0) {
						logging("course " . $obj_id . " has question pool");

						//get the question pool
						$questionPool = new ilObjQuestionPool($courseItem["ref_id"]);
						$questionPool->read();
						
						//calls isValidQuestionPool in questions.php
						if (isValidQuestionPool($questionPool)) {
							$validQuestionPool = true;
						}
					}
				}
			}
		}

		//if the question pool is valid, the course is added to the list
		if ($validQuestionPool) {
			$title       = $ilObjDataCache->lookupTitle($obj_id);
			$description = $ilObjDataCache->lookupDescription($obj_id);

			array_push($courses,
					array("id"             => $obj_id,
							"title"        => $title,
							"syncDateTime" => 0,
							"syncState"    => false,
							"isLoaded"     => false,
							"description"  => $description));
		}

	}
	
	//data structure for frontend models
	$courseList = array("courses" => $courses,
			"syncDateTime" => 0,
			"syncState" => false,
			"syncTimeOut" => $SYNC_TIMEOUT);

	return $courseList;

}

?>
