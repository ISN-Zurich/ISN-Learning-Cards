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
 * This class loads the questions for the in the path specified course id from ILIAS and
 * returns a json-object with the question list
 * 
 * @author Isabella Nake
 * @author Evangelia Mitsopoulou
 */


require_once './common.php';

chdir("../..");

require_once ('restservice/include/inc.header.php');

require_once 'Services/User/classes/class.ilObjUser.php';
require_once 'Modules/Course/classes/class.ilCourseItems.php';
require_once 'Modules/TestQuestionPool/classes/class.ilObjQuestionPool.php';
require_once 'Modules/TestQuestionPool/classes/class.assQuestion.php';
require_once 'Modules/TestQuestionPool/classes/class.assClozeTest.php';

require_once 'Services/Component/classes/class.ilPluginAdmin.php';
require_once 'Services/Component/classes/class.ilPlugin.php';


global $DEBUG,$ilPluginAdmin;
$DEBUG = 1;

global $class_for_logging;

$class_for_logging = "questions.php";

logging("is plugin active or not ".$ilPluginAdmin->isActive(IL_COMP_SERVICE, "UIComponent", "uihk", "TLAMoblerCards"));
if ($ilPluginAdmin->isActive(IL_COMP_SERVICE, "UIComponent", "uihk", "TLAMoblerCards")) {

$userID = get_session_user_from_headers();
logging(" my userid is ". $userID);

if ($userID != 0) {
	$courseID = $_SERVER['PATH_INFO'];
	$courseID = preg_replace("/\//", "", $courseID); //remove leading backslash
	logging($courseID);

	$return_data = getQuestions($courseID);

	echo(json_encode($return_data));
	}
} else {
	header("HTTP/1.1 403 Forbidden");
}

/**
 * Gets the question pool for the specified course
 *
 * @return array with questions
 */
function getQuestions($courseId) {
	
	global $assClozeTest;
	//references are needed to get course items (= questionpools, tests, ...)
	$item_references = ilObject::_getAllReferences($courseId);
	//logging("item references".json_encode($item_references));
	$questions = array();

	if(is_array($item_references) && count($item_references)) {
		foreach($item_references as $ref_id) {

			//get all course items for a course (= questionpools, tests, ...)
			$courseItems = new ilCourseItems($ref_id);
			$courseItemsList = $courseItems->getAllItems();

			logging("Questions: " . json_encode($courseItemsList));

			foreach($courseItemsList as $courseItem) {

				//the course item has to be of type "qpl" (= questionpool)
				if (strcmp($courseItem["type"], "qpl") == 0) {
					$questionPool = new ilObjQuestionPool($courseItem["ref_id"]);
					$questionPool->read();

					//check if question pool is valid
					if(isValidQuestionPool($questionPool)) {
						$questionList = $questionPool->getQuestionList();
						logging("Question list: " . json_encode($questionList));
						$questions= getQuestionList($questionList);
					}
				}
			}
		}
	}

	//data structure for frontend models
	return array(
			"courseID" => $courseId,
			"questions" => $questions);
	
	logging("questions are ".json_encode($questions));
}



?>