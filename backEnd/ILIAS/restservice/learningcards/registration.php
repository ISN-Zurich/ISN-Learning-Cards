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
 * This class registers a device for a certain application and returns a client key (= app key)
 * The client key (= app key) is also stored in the ILIAS database
 * 
 * @author Isabella Nake
 * @author Evangelia Mitsopoulou
 */


require_once './common.php';
chdir("../..");
require_once ('restservice/include/inc.header.php');

$class_for_logging = "registration.php";

//create client key (= app key)
$clientkey = get_appkey_from_headers();
logging("got headers");

//return client key
$response = json_encode(array("ClientKey" => $clientkey));
logging ("registration response: " . $response);
echo($response);

/**
 * Reads header variable to get app id and uuid
 * and generates an client key (= app key)
 *
 * @return client key (= app key)
 */
function get_appkey_from_headers() {
	$myheaders = getallheaders();
	$appID = $myheaders["AppID"];
	$deviceID = $myheaders["UUID"];

	logging("app id from header: " .$appID);
	logging("device id from header: " .$deviceID);

	return generateAppKey($appID,$deviceID);
}

/** 
 * @return the client key (= app key) for the specified
 * app id and uuid
 */
function generateAppKey($appId, $uuid){

	global $ilDB;
	
	// creates a new database table for the registration if no one exists yet
	logging(" check if our table is present already ");
	if (!in_array("isnlc_reg_info",$ilDB->listTables())) {
		logging("create a new table");
		//create table that will store the app keys and any such info in the database
		//ONLY CREATE IF THE TABLE DOES NOT EXIST

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
	}

	//if for the specified app id and uuid an client key (= app key) already exists, use this one instead of creating a new one
	$result = $ilDB->query("SELECT client_key FROM isnlc_reg_info WHERE uuid = " .$ilDB->quote($uuid, "text") . " AND app_id =" .$ilDB->quote($appId, "text"));
	$fetch = $ilDB->fetchAssoc($result);
	logging("fetch: " . json_encode($fetch));
	$appKey = $fetch["client_key"];

	//if no client key (= app key) exists yet, generate a new one
	if ($appKey == null) {

		$randomSeed = rand();
		$appKey = md5($uuid . $appId . $randomSeed);
		//store the new client key (= app key) in the database
		$affected_rows= $ilDB->manipulateF("INSERT INTO isnlc_reg_info (app_id, uuid, client_key) VALUES ".
				" (%s,%s,%s)",
				array("text", "text", "text"),
				array($appId, $uuid, $appKey));

		logging("return appkey " . $appKey );
	}

	//return the client key (= app key)
	return $appKey;
};

?>