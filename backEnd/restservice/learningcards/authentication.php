<?php

chdir("../..");

require_once ('restservice/include/inc.header.php');

require_once 'Services/User/classes/class.ilObjUser.php';

global $ilUser;

$ilUser->setId("12979");
$ilUser->read();

$authenticationData = array(
		
		"appId" => "",
		"appAuthenticationKey" => "",
		"userAuthenticationKey" => "",
		"urlToLMS" => "",
		"learnerInformation" => array(
				"userId" => $ilUser->getId(),
				"userName" =>  $ilUser->getLogin(),
				"displayName" => $ilUser->getFullName(),
				"emailAddress" => $ilUser->getEmail()
		                            ),
		"loginState" => "loggedOut",
		"globalSynchronizationState" => false
						);

logging(" sending authentication info");

echo(json_encode($authenticationData));



//echo($ilUser->getUserIdByLogin("isabella"));

//$filename = $_SERVER['PATH_INFO'];
//logging($filename);

//$auth = file_get_contents('./authentication/' . $filename);
//echo($auth);

function logging($message) {
	$log_prefix = "authentication.php: ";
	
	error_log($log_prefix . $message, 0);
}

?>
