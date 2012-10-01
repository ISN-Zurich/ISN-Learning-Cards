<?php
/* 	
 	Copyright (c) 2012 ILIAS open source, Extended GPL, see backend/LICENSE
 	if you don't have a license file, then you can obtain it from the project
	hompage on github <https://github.com/ISN-Zurich/ISN-Learning-Cards>
	
	
	This file is part of Mobler Cards.
	
	Mobler Cards is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Mobler Cards is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with Mobler Cards. If not, see <http://www.gnu.org/licenses/>.
*/


/**
 * This are common functions used by all other classes
 */


/**
 * function for log messages
 * 
 * if the global variable DEBUG is set to 1, the messages are sent to 
 * PHP's system logger, otherwise they are not displayed
 * 
 * the global variable class_for_logging should be set to have a prefix
 * in front of the logging message, depending on of which class the function
 * was called
 */
function logging($message) {
	global $DEBUG, $class_for_logging;

	//if DEBUG is not defined, use 0 (do not display messages)
	if (!$DEBUG) {
		$DEBUG = 0;
	}
	
	$log_prefix = $class_for_logging . ": ";
	
	if ($DEBUG == 1) {
		error_log($log_prefix . $message, 0);
	}
}

/**
 * Reads header variable to get userId
 *
 * @return userId
 */
function get_session_user_from_headers() {
	logging("entered get session user from header");
	
	$myheaders = getallheaders();
	$sessionKey = $myheaders["sessionkey"];

	$userId = getUserIdForSessionKey($sessionKey);
	logging("userid from header: " . $userId);

	if ($userId > 0) {
		global $ilUser;
		$ilUser->setId($userId);
		$ilUser->read();
		if(!$ilUser->getLogin()) {
			//TODO remove all data entries for this user id from our own tables
			$userId = 0;
		}
	}
	return $userId;
}

/**
 * Reads header variable to get uuid
 * 
 * @return uuid
 */
function get_uuid_from_headers() {
	logging("in get uuid from headers");

	$myheaders = getallheaders();
	$uuid = $myheaders["uuid"];

	logging("uuid from header: " . $uuid);

	return $uuid;
}


/**
 * @return the user id for the specified session key
 */
function getUserIdForSessionKey($sessionKey) {
	global $ilDB;

	$userId = 0;

	if ($sessionKey) {
		$result = $ilDB->query("SELECT user_id FROM isnlc_auth_info WHERE session_key = " .$ilDB->quote($sessionKey, "text"));
		$userIdArray = $ilDB->fetchAssoc($result);
		$userId = $userIdArray["user_id"];
		
		logging("user id for session key: " . $userId);
	}
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

?>