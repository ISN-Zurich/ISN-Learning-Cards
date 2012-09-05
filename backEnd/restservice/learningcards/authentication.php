<?php

require_once '../logging/logger.php';

chdir("../..");

require_once ('restservice/include/inc.header.php');

require_once 'Services/User/classes/class.ilObjUser.php';

global $ilUser, $class_for_logging;

$class_for_logging = "authentication.php";;

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

logging("sending authentication info");

echo(json_encode($authenticationData));



//echo($ilUser->getUserIdByLogin("isabella"));

//$filename = $_SERVER['PATH_INFO'];
//logging($filename);

//$auth = file_get_contents('./authentication/' . $filename);
//echo($auth);


?>
