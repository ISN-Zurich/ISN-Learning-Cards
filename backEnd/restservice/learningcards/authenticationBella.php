<?php

require_once '../logging/logger.php';
require_once './common.php';

chdir("../..");

require_once ('restservice/include/inc.header.php');

require_once 'Services/User/classes/class.ilObjUser.php';
require_once 'Services/Database/classes/class.ilDB.php';

global $ilUser, $class_for_logging;

$class_for_logging = "authentication.php";

$path = $_SERVER['PATH_INFO'];
$path = preg_replace("/\//", "", $path); //remove leading backslash

logging("path: '" . $path . "'");

switch($path) {
	case "login":
		logging("in log in");
		$response = json_encode(authenticate());
		logging("login response: " . $response);
		echo($response);
		break;
	case "logout":
		logout();
		break;
	default:
		$userId = get_session_user_from_headers();

		$authenticationData = array(

				"learnerInformation" => array(
						"userId" => $userId,
						"userName" =>  $ilUser->getLogin(),
						"displayName" => $ilUser->getFullName(),
						"emailAddress" => $ilUser->getEmail()
				),
				//get rid of following 2 lines
				"loginState" => "loggedOut",
				"globalSynchronizationState" => false
		);

		logging("sending authentication info");

		echo(json_encode($authenticationData));
		break;
}

return;

/**
 * authenticates the user and creates a new session key
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
		logging("clientKey: " . $clientKey);
		$passwordHash = $ilUser->getPasswd(); //returns md5-hashed password
		logging("password from ilias: " . $passwordHash);
		$challengeCheck = md5($authData["username"] . strtoupper($passwordHash) . $clientKey);

		logging("hash1: " . $challengeCheck);
		logging("hash2: " . $authData["challenge"]);

		if(strtoupper($authData["challenge"]) == strtoupper($challengeCheck)) {
			logging("password correct");
			$randomSeed = rand();
			$sessionKey = md5($userId .$clientKey . $randomSeed);
			logging("Session Key: " . $sessionKey);
			storeAuthDataInDB($userId, $clientKey, $sessionKey);
			logging("after authentication stored in db");
			
			return array(
					"userAuthenticationKey" => $sessionKey,
					"learnerInformation" => array(
							"userId" => $ilUser->getId(),
							"userName" =>  $ilUser->getLogin(),
							"displayName" => $ilUser->getFullName(),
							"emailAddress" => $ilUser->getEmail()
					));
		}
			
	}
	return array(
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

	$result = $ilDB->query("SELECT client_key FROM isnlc_reg_info WHERE uuid = " .$ilDB->quote($UUID, "text") . " AND app_id =" .$ilDB->quote($APPID, "text"));
	$fetch = $ilDB->fetchAssoc($result);
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
		$ilDB->addPrimaryKey("isnlc_registration_info", array("session_key"));
	}

	$result = $ilDB->manipulateF("INSERT isnlc_auth_info(user_id, client_key, session_key)  VALUES ".
			" (%s,%s,%s)",
			array("text", "text", "text"),
			array($userid, $clientKey, $sessionKey));
	logging("at the end of authentication store in db");
}

/**
 * deletes all information for the specified session from the database
 */
function invalidateSessionKey($sessionkey) {
	global $ilDB;
	$result = $ilDB->manipulate("DELETE FROM isnlc_auth_info WHERE session_key = " .$ilDB->quote($sessionkey, "text"));
}
?>
