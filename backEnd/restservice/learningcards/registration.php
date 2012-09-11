<?php


require_once '../logging/logger.php';
chdir("../..");
require_once ('restservice/include/inc.header.php');

$class_for_logging = "registration.php";

$clientkey = get_appkey_from_headers();

// set JSON headers

echo(json_encode(array("ClientKey" => $clientkey)));

function get_appkey_from_headers() {
	$myheaders = getallheaders();
	$appID = $myheaders["AppID"];
	$deviceID = $myheaders["UUID"];

	logging("app id from header: " .$appID);
	logging("device id from header: " .$deviceID);
	

	//global $ilUser;
	//$ilUser->setId($userId);
	//$ilUser->read();

	return generateAppKey($appID,$deviceID);
}


//function table creation
//move here the code from below to create the table


function generateAppKey($appId, $uuid){
	
	global $ilDB;
	$randomSeed = rand();
	$appKey = md5($uuid . $appId . $randomSeed);

	$tables=$ilDB->listTables();
	
	
	
	// get list of tables
	// $ilDB->listTables();
	// check if our table is present already
	if (!in_array("isnlc_reg_info",$ilDB->listTables())) {
		//create table that will store the app keys and any such info in the database
		// FIXME: ONLY CREATE IF THE TABLE DOES NOT EXIST
	
		
		$fields= array(
				"app_id" => array(
						'type' => 'text',
						'length'=> 255
				),
				"uuid" => array(
						'type' => 'text',
						'length'=> 255
				),
				"client_key" => array(
						'type' => 'text',
						'length'=> 255
				)
		);

		$ilDB->createTable("isnlc_reg_info",$fields);
		//$ilDB->addPrimaryKey("isnlc_registration_info", array("id"));
	}
	//store the app keys in the database
	$affected_rows= $ilDB->manipulateF("INSERT INTO isnlc_reg_info (app_id, uuid, client_key) VALUES ".
			" (%s,%s,%s)",
			array("text", "text", "text"),
			array($appId, $uuid, $appKey));
	
	return $appKey; //we need the output in json format
	
};





?>