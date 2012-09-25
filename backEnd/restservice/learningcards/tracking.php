<?php

/**
 * This class loads the questions for the in the path specified course id from ILIAS and
 * returns an json-object with the question list
 */
require_once '../logging/logger.php';
require_once './common.php';

chdir("../..");

require_once ('restservice/include/inc.header.php');

require_once 'Services/User/classes/class.ilObjUser.php';
require_once 'Services/Database/classes/class.ilDB.php';


global $class_for_logging;

$class_for_logging = "tracking.php";

generateTable();

function generateTable() {
	global $ilDB;

	// 	$ilDB->dropTable("isnlc_statistics");

	logging("check if our table is present already");
	if (!in_array("isnlc_tracking",$ilDB->listTables())) {
		logging("create a new table");
		$fields= array(
				"id" => array(
						'type' => 'integer',
						'length'=> 4
				),
				"user_id" => array(
						'type' => 'text',
						'length'=> 255
				),
				"uuid" => array(
						'type' => 'text',
						'length'=> 255
				),
				"view_id" => array(
						'type' => 'text',
						'length'=> 255
				),
				"timeStamp" => array(
						'type' => 'integer',
						'length'=> 4
				),
				"event_type" => array(
						'type' => 'integer',
						'length'=> 8
				)
				
		);

		$ilDB->createTable("isnlc_tracking",$fields);
		$ilDB->addPrimaryKey("isnlc_tracking", array("id"));

		$ilDB->createSequence("isnlc_tracking");

		logging("after creating the table");
	}

	// 	$ilDB->manipulate("DELETE FROM isnlc_statistics WHERE user_id = '12979'");
}




?>
