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

$request_method = $_SERVER['REQUEST_METHOD'];

logging("request method: '" . $request_method . "'");


switch($request_method) {
	case "POST":
	case "PUT":
		//when the user logs out the app sends the data to the server
		logging("post/put request");
		$userId = get_session_user_from_headers();
		if ($userId > 0) {
			logging("has valid user");
			$tracking = file_get_contents("php://input");
			logging(" tracking data" . $tracking);
			$uuid = get_uuid_from_headers();
			setTracking($userId, $uuid, json_decode($tracking, true));
			logging("end of PUT");
		}
		break;
	case "DELETE":
	default:
		logging("request method not supported");
		break;
}



function setTracking($userId, $uuid, $tracking) {
	global $ilDB;

	logging("in tracking");

	logging("count tracking: " . count($tracking));

	for ($i = 0; $i < count($tracking); $i++) {
		$trackingItem = $tracking[$i];
		logging(json_encode($trackingItem));

		$result = $ilDB->query("SELECT id FROM isnlc_tracking WHERE user_id =" . $ilDB->quote($userId, "text"));
		$record = $ilDB->fetchAssoc($result);
		$id = $record['id'];

		//logging("day: " + $statisticItem['day']);
		//logging("id: " + $id);

		if (!$id) {
			$myID = $ilDB->nextID("isnlc_tracking");
			logging("new ID: " . $myID);

			$ilDB->manipulateF("INSERT INTO isnlc_tracking(id, user_id, uuid, timestamp,event_type) VALUES (%s,%s,%s,%s,%s)",
					array("integer", "text", "text", "integer", "text"),
					array ($myID, $userId, $uuid, $trackingItem['timestamp'], $trackingItem['event_type']));

			logging("after insert");
		}
	}

	logging("after inserting");
}


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
				"timestamp" => array(
						'type' => 'integer',
						'length'=> 8
				),
				"event_type" => array(
						'type' => 'text',
						'length'=> 255
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
