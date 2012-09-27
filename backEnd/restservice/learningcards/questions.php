<?php

/**
 * This class loads the questions for the in the path specified course id from ILIAS and
 * returns an json-object with the question list
 */

require_once './common.php';

chdir("../..");

require_once ('restservice/include/inc.header.php');

require_once 'Services/User/classes/class.ilObjUser.php';
require_once 'Modules/Course/classes/class.ilCourseItems.php';
require_once 'Modules/TestQuestionPool/classes/class.ilObjQuestionPool.php';
require_once 'Modules/TestQuestionPool/classes/class.assQuestion.php';

global $class_for_logging;

$class_for_logging = "questions.php";


$userID = get_session_user_from_headers();
logging(" my userid is ". $userID);

if ($userID != 0) {
	$courseID = $_SERVER['PATH_INFO'];
	$courseID = preg_replace("/\//", "", $courseID); //remove leading backslash
	// $courseID = preg_replace("/\.json/",	"", $courseID);
	logging($courseID);

	$return_data = getQuestions($courseID);

	echo(json_encode($return_data));
}

/**
 * Gets the question pool for the specified course
 *
 * @return array with questions
 */
function getQuestions($courseId) {
	//references are needed to get course items (= questionpools, tests, ...)
	$item_references = ilObject::_getAllReferences($courseId);

	$questions = array();

	if(is_array($item_references) && count($item_references)) {
		foreach($item_references as $ref_id) {

			//get all course items for a course (= questionpools, tests, ...)
			$courseItems = new ilCourseItems($ref_id);
			$courseItemsList = $courseItems->getAllItems();

			//			logging("Questions: " . json_encode($courseItemsList));

			foreach($courseItemsList as $courseItem) {

				//the course item has to be of type "qpl" (= questionpool)
				if (strcmp($courseItem["type"], "qpl") == 0) {
					$questionPool = new ilObjQuestionPool($courseItem["ref_id"]);
					$questionPool->read();

					//check if question pool is valid
					if(isValidQuestionPool($questionPool)) {
						$questionList = $questionPool->getQuestionList();
						//						logging("Question list: " . json_encode($questionList));

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
							} else {
								$answerList = $assQuestion->getAnswers();
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
				}
			}

		}
	}

	//data structure for frontend models
	return array(
			"courseID" => $courseId,
			"questions" => $questions);
}



?>