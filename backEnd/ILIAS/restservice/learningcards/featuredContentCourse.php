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

//to get the anonymous user id
require_once 'Services/Utilities/classes/class.ilUtil.php';
require_once 'classes/class.ilObject.php';
require_once 'Services/MediaObjects/classes/class.ilObjMediaObject.php';

//to get the available question pools for the specific anonymous user id
require_once 'Modules/TestQuestionPool/classes/class.ilObjQuestionPool.php';

global $ilUser,$class_for_logging;

global $DEBUG;

$DEBUG = 1;
$class_for_logging = "featuredContentCourse.php";

// get the anonymous user id
if ($GLOBALS['WEB_ACCESS_WITHOUT_SESSION']){
	logging("web access without session");
	$_SESSION["AccountId"] = ANONYMOUS_USER_ID;	
	$ilUser->setId(ANONYMOUS_USER_ID);
	$ilUser->read();
	$userID= $ilUser->getId();
};
logging("anonymous user id is ".$userID);

$return_data = getFeaturedContent($userID);	
header('content-type: application/json');
echo (json_encode($return_data));



/**
 * Gets the featured course for the anonymous user. 
 *
 * @return course list array
 * @param $userID, the id of the anonymous user
 */
function getFeaturedContent($userID) {

	global $ilObjDataCache, $ilUser, $tree;

	$featuredCourses = array();
	$questions=array();
	
	//get the available questionpools for the anonymous user
	$items = ilObjQuestionPool::_getAvailableQuestionpools();
	logging(" public questionpools for anonymous user are ".json_encode($items));
	
	//get the root of the public repository
	$ref_id= $tree->getRootId();
	logging("repository root id  is " . $ref_id);
	
	//get those question pools that are children of the root object.
	$childrenItems = $tree->getChilds($ref_id);
	logging("children of root repository are ".json_encode($childrenItems));
	$featContentId = 0;
	
	// get the first correct (1. one among the availables for the anonymous user and 2. valid) 
	// questionpool from the ones under the root object
	foreach ($childrenItems as $child => $Value1){
		logging("child is".json_encode($Value1));
		$childRef_id=$Value1["ref_id"];
		logging("ref id for this child is ".$childRef_id);
		if ($items[$childRef_id]) { // 1. if the specific child of the top level of the repository is also in the list
									// of the available questionpools of the anonymous user
			$questionPool = new ilObjQuestionPool($childRef_id);
			$questionPool->read();
			logging("questions for the featured course are: ".$questionPool);
			if (isValidQuestionPool($questionPool)){ //2. check if the specific questionpool is valid
				$featContentId = $childRef_id;
				logging("featured content id is ".$featContentId);
				break;
			}
		}
	}
	
	// get the list of questions of the featured content course
	if( $featContentId > 0 ) {
		$featContentTitle = $items[$featContentId]["title"];
		logging("featured content is: " . $featContentId. "title =" . json_encode($featContentTitle));
		
		$questionList = $questionPool->getQuestionList();
		logging("Question list: " . json_encode($questionList));
		$questions= getQuestionList($questionList);	
	}
	else {
		logging("OH NO! WE HAVE NO FEATURED CONTENT!");
	}

	$description = $ilObjDataCache->lookupDescription($featContentId);

	// add featured content course info (such as title, description, syncDate etc.) and questions into the same  array structure 
	array_push($featuredCourses,array(
	"id"   => $featContentId,
	"title"        => $featContentTitle,
	"syncDateTime" => 0,
	"syncState"    => false,
	"isLoaded"     => false,
	"description"  => $description,
	"questions"    => $questions
	));
			
	//data structure for frontend models
	//add 
	$featuredCourseList = array("featuredCourses" => $featuredCourses,
			"syncDateTime" => 0,
			"syncState" => false,
			"syncTimeOut" => $SYNC_TIMEOUT);
	
	logging("featured course list is ".json_encode($featuredCourseList));
	return $featuredCourseList;
}

?>
