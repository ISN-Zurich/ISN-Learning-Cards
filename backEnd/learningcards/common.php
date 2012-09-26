<?php

/**
 * Reads header variable to get userId
 *
 * @return userId
 */
function get_userid_from_headers() {
	$myheaders = getallheaders();
	$userId = $myheaders["userid"];

	//if (!($userId > 0)) {
		//$userId = "12979"; //for debugging
	//}

	logging("userid from header: " . $userId);

	global $ilUser;
	$ilUser->setId($userId);
	$ilUser->read();
	//FIXME: test if users exists

	return $userId;
}


/**
 * checks if the question pool is online, contains at least 4 questions and
 * the question have only valid question types
 *
 * @return true if question pool is valid, otherwise false
 */
function isValidQuestionPool($questionpool) {
	//only question pools which contain only questions with the types in this array are loaded
	$VALID_QUESTION_TYPES = array("assMultipleChoice", "assSingleChoice", "assOrderingQuestion", "assNumeric");


	//question pool has to be online
	if($questionpool->getOnline()) {
		$questionList = $questionpool->getQuestionList();
			
		//question pool has to contain at least 4 questions
		if (count($questionList) >= 4) {
			$onlyValidTypes = true;
			foreach ($questionList as $question) {
				$type = $question["type_tag"];

				//check if the type of the question is a valid type
				if (!in_array($type, $VALID_QUESTION_TYPES)) {
					$onlyValidTypes = false;
				}
			}
			$validQuestionPool = $onlyValidTypes;
		}
	}

	return $validQuestionPool;
}
