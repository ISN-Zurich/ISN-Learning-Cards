<?php
/* 	THIS COMMENT MUST NOT BE REMOVED
	
 
	Copyright (c) 2012 ETH Zürich, Affero GPL, see backend/ILIAS/AGPL_LICENSE.txt
   	if you don't have a license file, then you can obtain it from the project΄s page 
   	 on github <https://github.com/ISN-Zurich/ISN-Learning-Cards/blob/master/backEnd/ILIAS/LICENSE.txt> 
   
	
	This file is part of Mobler Cards ILIAS Backend.

    Mobler Cards Ilias Backend is free software: you can redistribute this code and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Mobler Cards Ilias Backend  is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with Ilias Backend. If not, see <http://www.gnu.org/licenses/>.
*/


/**
 * This class loads the courses for the in the header specified user id from ILIAS and
 * returns a json-object with the course list 
 *
 * @author Evangelia Mitsopoulou
 * 
 */


//syncTimeOut provides a way for the server to tell the clients how often they are allowed to synchronize
$SYNC_TIMEOUT = 60000;
//NEW
$GLOBALS['WEB_ACCESS_WITHOUT_SESSION'] = (session_id() == "");

require_once './common.php';

chdir("../..");
require_once ('restservice/include/inc.header.php');
require_once 'Services/User/classes/class.ilObjUser.php';//don't need it in featured content

//NEW 
//require_once "./include/inc.header.php";
require_once "./Services/Utilities/classes/class.ilUtil.php";
require_once "./classes/class.ilObject.php";
require_once "./Services/MediaObjects/classes/class.ilObjMediaObject.php";


global $ilUser, $class_for_logging;

global $DEBUG;


$DEBUG = 1;
$class_for_logging = "featuredContentCourse.php";


//$userID = get_session_user_from_headers();// TODO:in featured content there should be a user that will create the featured content
                                          // so we should assign here the exact ID numer i.e. $userID=12980
                                                                                
//$userID=12980;

if ($GLOBALS['WEB_ACCESS_WITHOUT_SESSION']){
	logging("web access without session");
	$_SESSION["AccountId"] = ANONYMOUS_USER_ID;	
	$ilUser->setId(ANONYMOUS_USER_ID);
	$ilUser->read();
	$userID= $ilUser->getId();
};


logging(" my userid is ". $userID);

$return_data = getFeaturedContent($userID);// TODO:in featured content we will pass as argument the userId that we got right above
											// we can create a mew function getCourse($userID) in order to return the specific
											// free course, which would be the featured content
header('content-type: application/json');
echo (json_encode($return_data));


// TODO: write a function  getFeaturedContent($userID)similar with below that
// will return the course that contains the featured content
// **** first brainstorming comments************
// we will not need to pass a userId parameter because unregistered users
// will have access to it. we might need to pass as a parameter the courseId

/**
 * Gets the course list for the specified user
 *
 * @return course list array
 */
function getFeaturedContent($userId) {
	
	logging("enters getFeaturedContent");
	global $ilObjDataCache;

	include_once 'Services/Membership/classes/class.ilParticipants.php';
	require_once 'Modules/Course/classes/class.ilCourseItems.php';
	require_once 'Modules/TestQuestionPool/classes/class.ilObjQuestionPool.php';
	
	//loads all courses in which the current user is a member
	$items = ilParticipants::_getMembershipByType($userId,"qpl"); //we will need somthering similar, that will return a specific course based on its id.
	//see getCourseItemObject from clas.ilObjCourse.php...
	//something like this $featuredCourse= getCourseItemObject();
	logging("items are ".$items);
	
	$featuredCourses = array();
	foreach($items as $key => $obj_id)	{

//		$obj_id =13040;
		//references are needed to get course items (= questionpools, tests, ...)
	$item_references = ilObject::_getAllReferences($obj_id);
// 		$item_references = ilObject::_getAllReferences($obj_id);
	logging("item references are ".$item_references);
		//check if valid questionpool for the course exists
		//$validQuestionPool = false;
// 		if(is_array($item_references) && count($item_references)) {
// 		foreach($item_references as $ref_id) {
				
//	get all course items for a course (= questionpools, tests, ...)
// 	$courseItems = new ilCourseItems($item_references);
// 	$courseItemsList = $courseItems->getAllItems();
	
// 	logging("courseItemList is".$courseItemsList);

// 	foreach($courseItemsList as $courseItem) {
					
// 	the course item has to be of type "qpl" (= questionpool)
// if (strcmp($courseItem["type"], "qpl") == 0) {
// 	logging("course " . $obj_id . " has question pool");

// 	get the question pool
// 	$questionPool = new ilObjQuestionPool($courseItem["ref_id"]);
// 	$questionPool->read();

	//calls isValidQuestionPool in common.php
	//if (isValidQuestionPool($questionPool)) {
	//$validQuestionPool = true;
		//}
	//} //end of strcmp
	//} //end of foreach-courseItem
	//} //end of foreach item_references
	//} //end of if is_array(item_refereces)

		//if the question pool is valid, the course is added to the list
	//if ($validQuestionPool) {
		//$title       = $ilObjDataCache->lookupTitle($obj_id);
		//$description = $ilObjDataCache->lookupDescription($obj_id);
	}
			$title       = $ilObjDataCache->lookupTitle(13040);
			$description = $ilObjDataCache->lookupDescription(13040);

			array_push($featuredCourses,
					array("id"             => 13040,
							"title"        => $title,
							"syncDateTime" => 0,
							"syncState"    => false,
							"isLoaded"     => false,
							"description"  => $description));
			
	
	//} //end of if valid question pool

	//}
	
	//data structure for frontend models
	$featuredCourseList = array("featuredCourses" => $featuredCourses,
			"syncDateTime" => 0,
			"syncState" => false,
			"syncTimeOut" => $SYNC_TIMEOUT);
	
	logging("featured course list is ".json_encode($featuredCourseList));
	return $featuredCourseList;
}

?>
