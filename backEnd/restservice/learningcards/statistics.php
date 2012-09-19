<?php

require_once '../logging/logger.php';
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
	case "PUT":
		logging("post/put request");
		$userId = get_session_user_from_headers();
		if ($userId > 0) {
			logging("has valid user");
			$statistics = get_statistics_from_headers();
			setStatistics($userId, $statistics);
			logging("end of PUT");
		}
		break;
	case "GET":
	logging("get request");
		$userId = get_session_user_from_headers();
		if ($userId > 0) {
			logging("has valid user");
			$response = json_encode(getStatistics($userId));
			logging("GET response: " . $response);
			echo($response);
		}
		break;
	case "POST":
	case "DELETE":
	default:
		logging("request method not supported");
		break;
}

/**
 * reads statistics data from the header
 */
function get_statistics_from_headers() {
	logging("in get statistics from headers");


	$myheaders = getallheaders();
	$statistics = $myheaders["statistics"];
	logging(json_decode($statistics, true));
	
	return json_decode($statistics, true);
}

/**
 * reads last id on client database from the header
 */
function get_last_id_from_headers() {
	logging("in get last id from headers");

	$myheaders = getallheaders();
	$lastId = $myheaders["last_id"];
	
	logging("last id from client db: " . $lastId);

	return $lastId;
}

function setStatistics($userId, $statistics) {
	global $ilDB;

	logging("in set statistics");

	$result = $ilDB->query("SELECT max(id) as last_id FROM isnlc_statistics");
	$record = $ilDB->fetchAssoc($result);
	$lastId = $record['last_id'];

	if (!$lastId) {
		$lastId = -1;
	}
	
	logging("last id from server db: " . $lastId);
	logging("count statistics: " . count($statistics));
	
	for ($i = ($lastId + 1); $i < count($statistics); $i++) {
		$statisticItem = $statistics[$i];
		
		logging(json_encode($statisticItem));
		$ilDB->manipulateF("INSERT INTO isnlc_statistics(user_id, id, course_id, question_id, day, score, duration) VALUES (%s,%s,%s,%s,%s,%s,%s)",
				array("text", "integer", "text", "text", "timestamp", "float", "integer"),
				array($userId, $statisticItem['id'], $statisticItem['course_id'], $statisticItem['question_id'],
						date('Y-m-d H:i:s', $statisticItem['day']/1000), $statisticItem['score'], $statisticItem['duration']));
	}

	logging("after inserting");
}

function getStatistics($userId) {
	global $ilDB;

	logging("in get statistics");

	$statistics = array();
	$result = $ilDB->query("SELECT * FROM isnlc_statistics WHERE user_id = " . $ilDB->quote($userId, "text"));
	while ($record = $ilDB->fetchAssoc($result)){
		logging(json_encode($record));
		 array_push($statistics, array(
				"id" => $record['id'],
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
	
	//$ilDB->dropTable("isnlc_statistics");

	logging("check if our table is present already");
	if (!in_array("isnlc_statistics",$ilDB->listTables())) {
		logging("create a new table");
		$fields= array(
				"user_id" => array(
						'type' => 'text',
						'length'=> 255
				),
				"id" => array(
						'type' => 'integer',
						'length'=> 4
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
						'type' => 'timestamp'
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
		$ilDB->addPrimaryKey("isnlc_statistics", array("user_id", "id"));

		logging("after creating the table");
	}
}

?>