<?php

require_once '../logging/logger.php';

chdir("../..");

require_once ('restservice/include/inc.header.php');

require_once 'Services/User/classes/class.ilObjUser.php';
require_once 'Modules/Course/classes/class.ilCourseItems.php';
require_once 'Modules/TestQuestionPool/classes/class.ilObjQuestionPool.php';

global $class_for_logging;

$class_for_logging = "questions.php";

$courseID = $_SERVER['PATH_INFO'];

$courseID = preg_replace("/\//", "", $courseID);
// $courseID = preg_replace("/\.json/",	"", $courseID);
logging($courseID);

$return_data = getQuestions($courseID);

echo(json_encode($return_data));

function getQuestions($courseId) {
	$item_references = ilObject::_getAllReferences($courseId);
	
	$questions = array();
	if(is_array($item_references) && count($item_references)) {
		foreach($item_references as $ref_id) {
			$courseItems = new ilCourseItems($ref_id);
			$courseItemsList = $courseItems->getAllItems();
	
			logging("Questions: " . json_encode($courseItemsList));
	
			foreach($courseItemsList as $courseItem) {
				if (strcmp($courseItem["type"], "qpl") == 0) {
					$questionPool = new ilObjQuestionPool($courseItem["ref_id"]);
					$questionPool->read();
					if($questionPool->getOnline()) {
						$questionList = $questionPool->getQuestionList();
						logging("Question list: " . json_encode($questionList));
					}
				}
			}
	
		}
	}
	
	return array(
			"courseID" => $courseId,
			"questions"=> array(
					array(
							"type" => "Numeric Question",
							"question" => "1 - What is the number",
							"answer" => "45",
							"correctFeedback" => "",
							"errorFeedback" => "In order to asnwer this question better you should also take into account the impact of.."

					),
					array(
							"type" => "Numeric Question",
							"question" => "2 - How many times..",
							"answer" => "21",
							"correctFeedback" => "This is the correct feedback of this answer",
							"errorFeedback" => ""

					)
			)
	);
}

?>