<?php

require_once './common.php';

chdir("../..");

require_once ('restservice/include/inc.header.php');

require_once 'Services/User/classes/class.ilObjUser.php';
require_once 'Services/Database/classes/class.ilDB.php';

global $ilUser, $class_for_logging;

$class_for_logging = "statistics.php";

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
			$statistics = file_get_contents("php://input");
// 			logging(" statistics data" . $statistics);
			$uuid = get_uuid_from_headers();
			setStatistics($userId, $uuid, json_decode($statistics, true));
			logging("end of PUT");
		}
		break;
	case "GET":
		//when the user logs into the app the data is sychnronized
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

function setStatistics($userId, $uuid, $statistics) {
	global $ilDB;

	logging("in set statistics");

	logging("count statistics: " . count($statistics));

	for ($i = 0; $i < count($statistics); $i++) {
		$statisticItem = $statistics[$i];
// 		logging(json_encode($statisticItem));

		$result = $ilDB->query("SELECT id FROM isnlc_statistics WHERE user_id =" . $ilDB->quote($userId, "text") .
				" AND day = " . $ilDB->quote($statisticItem['day'], "integer"));
		$record = $ilDB->fetchAssoc($result);
		$id = $record['id'];

// 		logging("day: " + $statisticItem['day']);
// 		logging("id: " + $id);
		
		if (!$id) {
			$myID = $ilDB->nextID("isnlc_statistics");
			logging("new ID: " . $myID);

			$ilDB->manipulateF("INSERT INTO isnlc_statistics(id, user_id, uuid, course_id, question_id, day, score, duration) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
					array("integer", "text", "text", "text", "text", "integer", "float", "integer"),
					array ($myID, $userId, $uuid, $statisticItem['course_id'], $statisticItem['question_id'],
							$statisticItem['day'], $statisticItem['score'], $statisticItem['duration']));

// 			logging("after insert");
		}
	}

	logging("after inserting");
}

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

function generateTable() {
	global $ilDB;

	// 	$ilDB->dropTable("isnlc_statistics");

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
	
// 	$ilDB->manipulate("DELETE FROM isnlc_statistics WHERE user_id = '12979'");

	//first active day 5 days ago
// 	$myID = $ilDB->nextID("isnlc_statistics");
// 	$ilDB->manipulateF("INSERT INTO isnlc_statistics(id, user_id, uuid, course_id, question_id, day, score, duration) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
// 			array("integer", "text", "text", "text", "text", "integer", "float", "integer"),
// 			array ($myID, "12979", "3c1875c18a7402de", "12968", "3600",
// 					1348048800000, "1", "10000"));
	
	//last active day 2 days ago
// 	$myID = $ilDB->nextID("isnlc_statistics");
// 	$ilDB->manipulateF("INSERT INTO isnlc_statistics(id, user_id, uuid, course_id, question_id, day, score, duration) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
// 			array("integer", "text", "text", "text", "text", "integer", "float", "integer"),
// 			array ($myID, "12979", "3c1875c18a7402de", "12968", "3600",
// 					1348376400000, "1", "1000"));
	
	//last active day yesterday
// 	$myID = $ilDB->nextID("isnlc_statistics");
// 	$ilDB->manipulateF("INSERT INTO isnlc_statistics(id, user_id, uuid, course_id, question_id, day, score, duration) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
// 			array("integer", "text", "text", "text", "text", "integer", "float", "integer"),
// 			array ($myID, "12979", "3c1875c18a7402de", "12968", "3600",
// 					1348462800000, "1", "2000"));

// 	$result = $ilDB->query("SELECT * FROM isnlc_statistics WHERE user_id = 12979");
// 	while ($record = $ilDB->fetchAssoc($result)){
// 		logging(json_encode($record));
// 	}
	
}

?>