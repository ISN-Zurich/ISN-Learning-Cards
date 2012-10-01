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
 * This class stores the tracking data for the in the header specified user id in the ILIAS database
 */


require_once './common.php';

chdir("../..");

require_once ('restservice/include/inc.header.php');

require_once 'Services/User/classes/class.ilObjUser.php';
require_once 'Services/Database/classes/class.ilDB.php';

global $DEBUG, $class_for_logging;

//$DEBUG = 1;
$class_for_logging = "tracking.php";

// creates a new database table for the tracking data if no one exists yet
generateTable();

$request_method = $_SERVER['REQUEST_METHOD'];
logging("request method: '" . $request_method . "'");

switch($request_method) {
	case "POST":
	case "PUT":
		//store the tracking data of the user in the database
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
	case "GET":
	case "DELETE":
	default:
		logging("request method not supported");
		break;
}


/**
 * stores all tracking data that are not yet in the database (of which the timestamp
 * for the specified uuid doesn't exist in the database yet) into the database
 */
function setTracking($userId, $uuid, $tracking) {
	global $ilDB;

	logging("in tracking");

	logging("count tracking: " . count($tracking));

	for ($i = 0; $i < count($tracking); $i++) {
		$trackingItem = $tracking[$i];
		logging(json_encode($trackingItem));

		$result = $ilDB->query("SELECT id FROM isnlc_tracking WHERE user_id =" . $ilDB->quote($userId, "text") . 
				" AND timestamp = " . $ilDB->quote($trackingItem['time_stamp'], "integer") .
				" AND uuid = " . $ilDB->quote($uuid, "text"));
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

/**
 * generates a new tracking table in the ILIAS database if no one exists yet
 */
function generateTable() {
	global $ilDB;

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

}

?>
