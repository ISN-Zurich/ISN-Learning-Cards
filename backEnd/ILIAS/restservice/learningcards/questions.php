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

global $DEBUG;
$DEBUG = 1;

global $class_for_logging;

$class_for_logging = "questions.php";


$userID = get_session_user_from_headers();
logging(" my userid is ". $userID);

if ($userID != 0) {
	$courseID = $_SERVER['PATH_INFO'];
	$courseID = preg_replace("/\//", "", $courseID); //remove leading backslash
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

						foreach ($questionList as $question) {

							//get id
							$questionId = $question["question_id"];
								
							//get the question type
							$type = $question["type_tag"];

							require_once 'Modules/TestQuestionPool/classes/class.' . $type . '.php';

							$assQuestion = new $type();
							$assQuestion->loadFromDb($question["question_id"]);

							
							//get the question 
							$questionText = $question["question_text"];
									
							if (strcmp($type, "assClozeTest") == 0) {
								$questionText = $question["description"];
								logging("questionText for cloze questions".$questionText);
							}
														
							//get answers
							if (strcmp($type, "assNumeric") == 0) {
								//numeric questions have no "getAnswers()" method!
								//only lower and upper limit are returned
								$answerList = array($assQuestion->getLowerLimit(), $assQuestion->getUpperLimit());
								logging("answerList for Numeric Question".json_encode($answerList));
							} else if (strcmp($type, "assOrderingHorizontal") == 0) {
								//horizontal ordering questions have no "getAnswers()" method!
								//they use the OrderText variable to store the answers and the getOrderText function to retrieve them 
								//$answerList = $assQuestion->getOrderText();
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
								else if(strcmp($type, "assClozeTest") == 0) {
									$gaps= $assQuestion->getGaps();
										$clozeText= $assQuestion->getClozeText();
										logging("cloze text for answer view in cloze question is ".$clozeText);
										$pattern="/\[gap\].*?\[\/gap\]/";
										for($gapid =0; $gapid<= count($gaps); $gapid++ ){
											$replacement="<gap identifier=\"gap_".$gapid."\"></gap>";
											$clozeText = preg_replace($pattern,$replacement,$clozeText,1);
										}
										
									
									//$gap1= $gaps[1]["answertext"];
									//$correctGaps= array();
									//  for($i=0; $i<=count($gaps);$i++){
									// 	$correctGaps[$i] =$gaps[$i]["answertext"];
									//  }
										
// 									foreach($gaps as $index =>$gapsChild){
// 										$gapCorrect= $gapsChild["answertext"];
// 									logging ("correct item in gaps array is ".json_encode($gapCorrect));									
// 									}
									
									//logging("correct gaps 1 ".$gap1);
									//logging("correct gaps 1 ".json_encode($gaps));
									//logging("qaps are ".json_encode($correctGaps));
										
// 										$answerList = array(
// 												"clozeText"  => $clozeText,
// 												"correctGaps" => $correctGaps
// 										);
																						
									$answerList = $clozeText;
															
									logging("answerList for close questions".json_encode($answerList));
									
								} else {
								$answerList = $assQuestion->getAnswers();
								logging("answerList for other types of Question".json_encode($answerList));
							}

							//get feedbackF
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
	
	logging("questions are ".json_encode($questions));
}



?>