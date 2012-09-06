<?php

require_once '../logging/logger.php';

chdir("../..");

require_once ('restservice/include/inc.header.php');

require_once 'Services/User/classes/class.ilObjUser.php';
require_once 'Modules/Course/classes/class.ilCourseItems.php';
require_once 'Modules/TestQuestionPool/classes/class.ilObjQuestionPool.php';
require_once 'Modules/TestQuestionPool/classes/class.assQuestion.php';

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
						foreach ($questionList as $question) {

							//get the question, filter all html-tags and line breaks


							//$questionText = preg_replace("/<..[a-zA-Z]*>/", "",$question["question_text"]);
							//$questionText = preg_replace("/\\r\\n/", "",$questionText);
							//$questionText = preg_replace("/\"/", "'", $questionText);

							$questionText = $question["question_text"];

							
							//get the question type
							$type = $question["type_tag"];
						
								
							require_once 'Modules/TestQuestionPool/classes/class.' . $type . '.php';
								
							$assQuestion = new $type();
							$assQuestion->loadFromDb($question["question_id"]);
							//$assQuestion->setId($question["question_id"]);
								
							//get solutions
							//$assQuestion->loadFromDb($question["question_id"]); //loads only the suggested solutions
							if (strcmp($type, "assNumeric") == 0) {
								$answerList = array();
								array_push($answerList, $assQuestion->getLowerLimit());
								array_push($answerList, $assQuestion->getUpperLimit());
							} else {
								$answerList = $assQuestion->getAnswers();
							}
								

							//get feedback
							$feedbackCorrect = $assQuestion->getFeedbackGeneric(1);
							$feedbackError = $assQuestion->getFeedbackGeneric(0);
							
							
							array_push($questions, array(
									"type" => $type,
									"question" => $questionText,
									"answer" => "",
									"correctFeedback" => $feedbackCorrect,
									"errorFeedback" => $feedbackError));
						}
					}
				}
			}

		}
	}

	return array(
			"courseID" => $courseId,
			"questions" => $questions);
}

?>