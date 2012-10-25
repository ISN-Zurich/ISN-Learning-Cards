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
 * This class is responsible for the authentication (login and logout) of the user and
 * returns general information about the user 
 * 
 * @author Isabella Nake
 * @author Evangelia Mitsopoulou
 */


require_once './common.php';

chdir("../..");

require_once ('restservice/include/inc.header.php');

require_once 'Services/User/classes/class.ilObjUser.php';
require_once 'Services/Database/classes/class.ilDB.php';

global $ilUser, $class_for_logging;

global $DEBUG;
$DEBUG = 1;

$class_for_logging = "authentication.php";

//global $ilDB;

//$ilDB->manipulate("DELETE FROM isnlc_reg_info WHERE uuid = '3c1875c18a7402de'");

$class_for_logging = "authentication.php";

$request_method = $_SERVER['REQUEST_METHOD'];
logging("request method: '" . $request_method . "'");

switch($request_method) {
	case "PUT":
	case "POST":
		logging("in log in");
		//authenticates the user and returns the session key for the
		//in the header specified user
		$response = json_encode(authenticate());
		logging("login response: " . $response);
		echo($response);
		break;
	case "DELETE":
		//deletes the session key for the in the header specified user
		logout();
		break;
	case "GET":
		//returns general information about the in the header specified user
		$userId = get_session_user_from_headers();

		if ($userId > 0) {
			//data structure for frontend models
			$authenticationData = array(
					"learnerInformation" => array(
							"userId" => $userId,
							"userName" =>  $ilUser->getLogin(),
							"displayName" => $ilUser->getFullName(),
							"emailAddress" => $ilUser->getEmail(),
							"language" => $ilUser->getLanguage()
					),
					//get rid of following 2 lines
					"loginState" => "loggedOut",
					"globalSynchronizationState" => false
			);

			logging("sending authentication info");

			echo(json_encode($authenticationData));
		}
		break;
	default:
		break;
}


/**
 * authenticates the user and creates a new session key
 * 
 * @return the session key for the user
 */
function authenticate() {

	logging("in authenticate");

	$authData = get_auth_data_from_headers();

	logging("after get from headers " .$authData["username"]);

	global $ilUser;

	logging("1");
	//get user id for username
	$userId = $ilUser->getUserIdByLogin($authData["username"]);

	if ($userId > 0) {
		logging("2 " . $userId);
		//set the user id for the current user
		$ilUser->setId($userId);
		logging("3");
		//read all user data and store it in ilUser object
		$ilUser->read();

		logging("read user data");

		$clientKey = getClientKeyForUUID($authData["uuid"], $authData["appid"]);
		
		logging("CLIENT KEY " . $clientKey);
		
		//check if user has a valid client key
		if ($clientKey && strlen($clientKey) > 0) {
			logging("clientKey: " . $clientKey);
			$passwordHash = $ilUser->getPasswd(); //returns md5-hashed password
			logging("password from ilias: " . $passwordHash);
			$challengeCheck = md5($authData["username"] . strtoupper($passwordHash) . $clientKey);
	
			logging("hash1: " . $challengeCheck);
			logging("hash2: " . $authData["challenge"]);
	
			//check if both challenges are the same (case insensitive)
			if (strtoupper($authData["challenge"]) == strtoupper($challengeCheck)) {
				logging("password correct");
				//generate a new session key and store it in the database
				$randomSeed = rand();
				$sessionKey = md5($userId . $clientKey . $randomSeed);
				logging("Session Key: " . $sessionKey);
				storeAuthDataInDB($userId, $clientKey, $sessionKey);
				logging("after authentication stored in db");
	
				//data structure for frontend models
				return array(
						"userAuthenticationKey" => $sessionKey,
						"learnerInformation" => array(
								"userId" => $ilUser->getId(),
								"userName" =>  $ilUser->getLogin(),
								"displayName" => $ilUser->getFullName(),
								"emailAddress" => $ilUser->getEmail(),
								"language" => $ilUser->getLanguage()
						));
			}
		} else {
			return array("message" => "invalid client key");
		}
			
	}
	return array(
			"message" => "wrong user data",
			"userAuthenticationKey" => "",
			"learnerInformation" => array(
					"userId" => 0
			));

}

/**
 * invalidates the session key of the user
 */
function logout() {
	$sessionKey = get_session_user_from_headers();
	logging("session key before invalidation: " . $sessionKey);
	invalidateSessionKey($sessionKey);
}

/**
 * reads authentication data from the header
 */
function get_auth_data_from_headers() {
	$myheaders = getallheaders();
	$uuid = $myheaders["uuid"];
	logging("uuid is " . $uuid);
	$appid = $myheaders["appid"];
	$authdata = explode(":", $myheaders["authdata"]);

	return array("uuid" => $uuid,
			"appid" => $appid,
			"username" => $authdata[0],
			"challenge" => $authdata[1]);
}

/**
 * @return the client key for the specified uuid
 */
function getClientKeyForUUID($UUID, $APPID) {
	global $ilDB;

	logging("uuid is " . $UUID);

	//shows all entries of the registratoin dataabase
//	$testresult = $ilDB->query("SELECT * FROM isnlc_reg_info");
//	while ($record = $ilDB->fetchAssoc($testresult))
//	{
//		logging("***" . json_encode($record));
//	}

	$result = $ilDB->query("SELECT client_key FROM isnlc_reg_info WHERE uuid = " .$ilDB->quote($UUID, "text") . " AND app_id =" .$ilDB->quote($APPID, "text"));
	$fetch = $ilDB->fetchAssoc($result);
	logging("fetch: " . json_encode($fetch));
	$clientKey = $fetch["client_key"];
	logging("client key: " . $clientKey);
	return $clientKey;
}


/**
 * writes the specified authentication data in the database
 */
function storeAuthDataInDB($userid, $clientKey, $sessionKey) {
	global $ilDB;

	logging("enter store auth in db " .$userid ."**" . $clientKey . "**" .$sessionKey);

	// get list of tables
	// check if our table is present already
	if (!in_array("isnlc_auth_info",$ilDB->listTables())) {

		logging("create new auth info table");

		$fields= array(
				"user_id" => array(
						'type' => 'text',
						'length'=> 255
				),
				"client_key" => array(
						'type' => 'text',
						'length'=> 255
				),
				"session_key" => array(
						'type' => 'text',
						'length'=> 255
				)
		);

		$ilDB->createTable("isnlc_auth_info",$fields);
	}

	$old_session_key_result = $ilDB->query("SELECT session_key FROM isnlc_auth_info WHERE user_id = " .$ilDB->quote($userid, "text") . "AND client_key = " .$ilDB->quote($clientKey, "text"));
	$old_session_key =  $ilDB->fetchAssoc($old_session_key_result);

	//if an old sessionkey for the user exists already, overwrite the old one with the new one
	//if no sessionkey exists, insert the new one
	if ($old_session_key) {
		$ilDB->manipulate("UPDATE isnlc_auth_info SET session_key = " . $ilDB->quote($sessionKey, "text") . " WHERE user_id = " .$ilDB->quote($userid, "text") . "AND client_key = " .$ilDB->quote($clientKey, "text"));
	} else {
		$ilDB->manipulateF("INSERT isnlc_auth_info(user_id, client_key, session_key)  VALUES ".
				" (%s,%s,%s)",
				array("text", "text", "text"),
				array($userid, $clientKey, $sessionKey));
	}
	logging("at the end of authentication store in db");
}

/**
 * deletes all information for the specified session from the database
 */
function invalidateSessionKey($sessionkey) {
	logging("entered invalidate session key");
	global $ilDB;
	$result = $ilDB->manipulate("DELETE FROM isnlc_auth_info WHERE session_key = " .$ilDB->quote($sessionkey, "text"));
	logging("end of invalidate session key");
}
?>
