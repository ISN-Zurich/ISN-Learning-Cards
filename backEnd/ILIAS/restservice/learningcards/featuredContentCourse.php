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
//require_once 'Services/User/classes/class.ilObjUser.php';//don't need it in featured content

//NEW to get the anonymous user id
//require_once "./include/inc.header.php";
require_once 'Services/Utilities/classes/class.ilUtil.php';
require_once 'classes/class.ilObject.php';
require_once 'Services/MediaObjects/classes/class.ilObjMediaObject.php';

//NEW to get the available question pools for the specific anonymous user id
require_once 'Modules/TestQuestionPool/classes/class.ilObjQuestionPool.php';

//NEW to get the container
require_once 'Services/Container/classes/class.ilContainer.php';
require_once 'Services/ContainerReference/classes/class.ilContainerReference.php';

include_once 'Services/Membership/classes/class.ilParticipants.php';
require_once 'Modules/Course/classes/class.ilCourseItems.php';
require_once 'Modules/TestQuestionPool/classes/class.ilObjQuestionPool.php';

//require_once "/Services/0bject/classes/class.ilObjectListGUI.php";

global $ilUser,$ilContainer, $class_for_logging;

global $DEBUG;


$DEBUG = 1;
$class_for_logging = "featuredContentCourse.php";

if ($GLOBALS['WEB_ACCESS_WITHOUT_SESSION']){
	logging("web access without session");
	$_SESSION["AccountId"] = ANONYMOUS_USER_ID;	
	$ilUser->setId(ANONYMOUS_USER_ID);
	$ilUser->read();
	$userID= $ilUser->getId();
};
logging("anonymous user id is ".$userID);

$return_data = getFeaturedContent($userID);	// we  pass as argument the userId, which we we got from above
											// the function getCourse($userID) will return the specific
											// free course, which would be the featured content
header('content-type: application/json');
echo (json_encode($return_data));



/**
 * Gets the featured course for the anonymous user. 
 *
 * @return course list array
 * @param $userID, the id of the anonymous user
 */
function getFeaturedContent($userID) {

	logging("enters getFeaturedContent");
	global $ilObjDataCache, $ilUser, $tree;

	$featuredCourses = array();
	$questions=array();
	
	$items = ilObjQuestionPool::_getAvailableQuestionpools();
	logging(" public questionpools for anonymous user are ".json_encode($items));
	
	// now we get the root of the public repository
	$ref_id= $tree->getRootId();
	logging("repository root id  is " . $ref_id);
	// now we are interested in those question pools that are children of the root object.
	$childrenItems = $tree->getChilds($ref_id);
	logging("children of root repository are ".json_encode($childrenItems));
	$featContentId = 0;
	
	foreach ($childrenItems as $child => $Value1){
		logging("child is".json_encode($Value1));
		$childRef_id=$Value1["ref_id"];
		logging("ref id for this child is ".$childRef_id);
		//if the one of the top level chidren of repository is also in the list
		//of the available questionpools of the anonymous user
		if ($items[$childRef_id]) {
			$questionPool = new ilObjQuestionPool($childRef_id);
			$questionPool->read();
			logging("questions for the featured course are: ".$questionPool);			
		if (isValidQuestionPool($questionPool)){
				$featContentId = $childRef_id;
				logging("featured content id is ".$featContentId);
				break;
				}
		}
	}

	if( $featContentId > 0 ) {
		$featContentTitle = $items[$featContentId]["title"];
		logging("featured content is: " . $featContentId. "title =" . json_encode($featContentTitle));
		// NOW WE NEED TO GET THE Questions
		//$questions=$questionPoolQuestions;
		$questionList = $questionPool->getQuestionList();
		logging("Question list: " . json_encode($questionList));
			
		foreach ($questionList as $question) {
		
			//get id
			$questionId = $question["question_id"];
		
			//get the question
			$questionText = $question["question_text"];
		
			//get the question type
			$type = $question["type_tag"];
		
		
			require_once 'Modules/TestQuestionPool/classes/class.' . $type . '.php';
		
			$assQuestion = new $type();
			$assQuestion->loadFromDb($question["question_id"]);
		
			//get answers
			if (strcmp($type, "assNumeric") == 0) {
				//numeric questions have no "getAnswers()" method!
				//only lower and upper limit are returned
				$answerList = array($assQuestion->getLowerLimit(), $assQuestion->getUpperLimit());
				logging("answerList for Numeric Question".json_encode($answerList));
			} else if (strcmp($type, "assOrderingHorizontal") == 0) {
				//horizontal ordering questions have no "getAnswers()" method!
				//they use the OrderText variable to store the answers and the getOrderText function to retrieve them
				$answers = $assQuestion->getOrderingElements();
				//$points1 = $assQuestion->calculateReachedPoints();
				$points = $assQuestion->getPoints();
					
				$arr = array();
				foreach ($answers as $order => $answer)
					//foreach ($answers as $order => $answer)
				{
					array_push($arr, array(
					"answertext" => (string) $answer,
					"points"=> $points,
					"order" => (int)$order+1,
					"id" => "-1"
							));
				}
				$answerList = $arr;
				logging("answerList for Horizontal Question".json_encode($answerList));
				 
			}
			else {
				$answerList = $assQuestion->getAnswers();
				logging("answerList for other types of Question".json_encode($answerList));
			}
		
			//get feedback
			$feedbackCorrect = $assQuestion->getFeedbackGeneric(1);
			$feedbackError = $assQuestion->getFeedbackGeneric(0);
		
		
			//add question into the question list
			array_push($questions, array(
			"id" => $questionId,
			"type" => $type,
			"question" => $questionText,
			"answer" => $answerList,
			"correctFeedback" => $feedbackCorrect,
			"errorFeedback" => $feedbackError));
		}
		
	}
	else {
		logging("OH NO! WE HAVE NO FEATURED CONTENT!");
	}

	logging("questions have been loaded");
	$description = $ilObjDataCache->lookupDescription($featContentId);
		
			array_push($featuredCourses,
					array("id"             => $featContentId,
							"title"        => $featContentTitle,
							"syncDateTime" => 0,
							"syncState"    => false,
							"isLoaded"     => false,
							"description"  => $description,
							"questions"    => $questions
							));
			
	
	//data structure for frontend models
	$featuredCourseList = array("featuredCourses" => $featuredCourses,
			"syncDateTime" => 0,
			"syncState" => false,
			"syncTimeOut" => $SYNC_TIMEOUT);
	
	logging("featured course list is ".json_encode($featuredCourseList));
	return $featuredCourseList;
}

?>
