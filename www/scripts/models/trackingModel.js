/**	THIS COMMENT MUST NOT BE REMOVED

Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file 
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0  or see LICENSE.txt

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.	


*/


/** @author Isabella Nake
 * @author Evangelia Mitsopoulou

*/

/*jslint vars: true, sloppy: true */


/**
 * @class Tracking Model, 
 * This model holds the tracking data 
 * @constructor 
 * It initializes some basic properties such as:
 * - a time tracker variable that tracks when was the last time that data were sent to the server
 * -the local database that stores the score after the users have answered a question
 */
function TrackingModel(controller){
	var self = this;
	this.controller = controller;
	this.lastSendToServer;
	this.db = openDatabase('ISNLCDB', '1.0', 'ISN Learning Cards Database',
			100000);
	
	this.tracking = [];
	this.tracking['timeStamp'] = -1;
	this.tracking['eventType'] = -1;
	this.initDB();

	$(document).bind("trackingEventDetected", function(e,type) {
		moblerlog(" tracking event loaded ");
		self.storeTrackData((new Date()).getTime(),type);
	});		
	
}


/**
 * Inserts a new tracking item into the database
 * @prototype
 * @function storeTrackData 
 * @param time, type
 */
TrackingModel.prototype.storeTrackData = function(time, type){
	
	this.db.transaction(function(transaction) {
		transaction
		.executeSql('INSERT INTO tracking(time_stamp,event_type) VALUES(?,?)',
				[ time, type ],function() {
			moblerlog("successfully inserted");
		}, function(tx, e) {
			moblerlog("error! NOT inserted: "+ e.message);
		});
	});

};


/**
 * creates the database table if it doesn't exist yet 
 * @prototype
 * @function initDB  
 */
TrackingModel.prototype.initDB = function() {
	var self = this;
	this.db
			.transaction(function(transaction) {
				transaction
						.executeSql(
								'CREATE TABLE IF NOT EXISTS tracking (time_stamp INTEGER NOT NULL PRIMARY KEY, event_type TEXT);',
								[], function() {
									self.db
									.transaction(function(transaction) {
										transaction
												.executeSql(
														'DROP TABLE trackings',
														[]);});
									
								});
				
			});
};



/**
 * Sends the tracking data to the server 
 * @prototype
 * @function sendToServer   
 */
 
TrackingModel.prototype.sendToServer = function(){
	var self = this;

	var sessionkey = self.controller.models['authentication'].getSessionKey();
	var url = self.controller.models['authentication'].urlToLMS + '/tracking.php';
	moblerlog("url tracking: " + url);
	
	this.db
	.transaction(function(transaction) {
		transaction
				.executeSql('SELECT * FROM tracking', [], function(t,r) {sendTracking(t,r);});
	});

	
	function sendTracking(transaction, results) {
		var tracking = [];
		var i, uuid = "";
		if (localStorage.getItem("pendingTracking")) {
			var pendingTracking= {};
			try {
				pendingTracking = JSON.parse(localStorage.getItem("pendingTracking"));
			} catch (err) {
				moblerlog("error! while loading pending tracking");
			}
			
			sessionkey = pendingTracking.sessionkey;
			uuid = pendingTracking.uuid;
			tracking = pendingTracking.tracking;
		}else {
			moblerlog("results length: " + results.rows.length);
			for ( i = 0; i < results.rows.length; i++) {
				row = results.rows.item(i);
				tracking.push(row);
                moblerlog("sending " + i + ": " + JSON.stringify(row));
			}
			uuid = device.uuid;
		}
		
		moblerlog("count tracking=" + tracking.length);
		var trackingString = JSON.stringify(tracking);
		
		//processData has to be set to false!
		$.ajax({
			url : url,
			type : 'PUT',
			data : trackingString,
			processData: false,
			success : function() {
				moblerlog("tracking data successfully send to the server");
				localStorage.removeItem("pendingTracking");
				self.lastSendToServer = (new Date()).getTime();
			},
			error : function(xhr, e, errorString) {
				moblerlog("Error while sending tracking data to server " + errorString);
				var trackingToStore = {
					sessionkey : sessionkey,
					uuid : device.uuid,
					tracking : tracking
				};
				localStorage.setItem("pendingTracking", JSON.stringify(trackingToStore));
			},
			beforeSend : setHeader
		});

		function setHeader(xhr) {
			xhr.setRequestHeader('sessionkey', sessionkey);
			xhr.setRequestHeader('uuid', device.uuid);
		}
	}	
};