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
 * This class stores/reads the statistics for the in the header specified user id in/out of the ILIAS database
 * @author Isabella Nake
 * @author Evangelia Mitsopoulou
 */


require_once './common.php';

chdir("../..");

require_once ('restservice/include/inc.header.php');

require_once 'Services/User/classes/class.ilObjUser.php';
require_once 'Services/Database/classes/class.ilDB.php';

global $ilUser, $class_for_logging;

$class_for_logging = "statistics.php";

// creates a new database table for the statistics if no one exists yet
generateTable();

$request_method = $_SERVER['REQUEST_METHOD'];
logging("request method: '" . $request_method . "'");

switch($request_method) {
	case "POST":
	case "PUT":
		//store the statistics of the user in the database and return how many items
		//for this user are stored in the database
		logging("post/put request");
		$userId = get_session_user_from_headers();
		if ($userId > 0) {
			logging("has valid user");
			$statistics = file_get_contents("php://input");
// 			logging(" statistics data" . $statistics);
			$uuid = get_uuid_from_headers();
			$number_of_items = setStatistics($userId, $uuid, json_decode($statistics, true));
			logging("end of PUT");
			echo($number_of_items);
		}
		break;
	case "GET":
		//return the statistics for the user
		logging("get request");
		$userId = get_session_user_from_headers();
		if ($userId > 0) {
			logging("has valid user");
			$response = json_encode(getStatistics($userId));
// 			logging("GET response: " . $response);
			logging("Get response size: " . strlen($response));
			echo($response);
		}
		break;
	case "DELETE":
	default:
		logging("request method not supported");
		break;
}

/**
 * stores all statistics that are not yet in the database (of which the timestamp
 * doesn't exist in the database yet) into the database
 * 
 * @return the number of statistics items of this user that are stored in the database
 */
function setStatistics($userId, $uuid, $statistics) {
	global $ilDB;

	logging("in set statistics");

	logging("count statistics: " . count($statistics));

	// for each item check if it is already in the database
	for ($i = 0; $i < count($statistics); $i++) {
		$statisticItem = $statistics[$i];
// 		logging(json_encode($statisticItem));

		//get the id of the item with the current timestamp
		$result = $ilDB->query("SELECT id FROM isnlc_statistics WHERE user_id =" . $ilDB->quote($userId, "text") .
				" AND day = " . $ilDB->quote($statisticItem['day'], "integer"));
		$record = $ilDB->fetchAssoc($result);
		$id = $record['id'];

// 		logging("day: " + $statisticItem['day']);
// 		logging("id: " + $id);
		
		// if the id doesn't exist yet, the item has to be inserted in the database
		if (!$id) {
			$myID = $ilDB->nextID("isnlc_statistics");
// 			logging("new ID: " . $myID);

			$ilDB->manipulateF("INSERT INTO isnlc_statistics(id, user_id, uuid, course_id, question_id, day, score, duration) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
					array("integer", "text", "text", "text", "text", "integer", "float", "integer"),
					array ($myID, $userId, $uuid, $statisticItem['course_id'], $statisticItem['question_id'],
							$statisticItem['day'], $statisticItem['score'], $statisticItem['duration']));

// 			logging("after insert");
		}
	}

	logging("after inserting");
	
	// get the number of statistic items for the user
	$result = $ilDB->query("SELECT count(id) as number FROM isnlc_statistics WHERE user_id =" . $ilDB->quote($userId, "text"));
	$record = $ilDB->fetchAssoc($result);
	$number_of_items = $record['number'];
	
	logging("number of items: " . $number_of_items);
	return $number_of_items;
	
}

/**
 * @return all statistics for the user that are stored in the database
 */
function getStatistics($userId) {
	global $ilDB;

	logging("in get statistics");

	$statistics = array();
	$result = $ilDB->query("SELECT * FROM isnlc_statistics WHERE user_id = " . $ilDB->quote($userId, "text"));
	while ($record = $ilDB->fetchAssoc($result)){
// 		logging(json_encode($record));
		array_push($statistics, array(
				"course_id" => $record['course_id'],
				"question_id" => $record['question_id'],
				"day" => $record['day'],
				"score" => $record['score'],
				"duration" => $record['duration']));
	}

	logging ("after selecting");

	return $statistics;
}

/**
 * generates a new statistics table in the ILIAS database if no one exists yet
 */
function generateTable() {
	global $ilDB;

	logging("check if our table is present already");
	if (!in_array("isnlc_statistics",$ilDB->listTables())) {
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
				"course_id" => array(
						'type' => 'text',
						'length'=> 255
				),
				"question_id" => array(
						'type' => 'text',
						'length'=> 255
				),
				"day" => array(
						'type' => 'integer',
						'length'=> 8
				),
				"score" => array(
						'type' => 'float'
				),
				"duration" => array(
						'type' => 'integer',
						'length'=> 4
				)
		);

		$ilDB->createTable("isnlc_statistics",$fields);
		$ilDB->addPrimaryKey("isnlc_statistics", array("id"));

		$ilDB->createSequence("isnlc_statistics");

		logging("after creating the table");
	}	
}

?>