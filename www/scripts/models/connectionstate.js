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
 ** @class ConnectionState
 *  This model holds the current connection state (online = true, offline =
 * false). Every time an online or offline event is triggered, it updates its
 * connection state
 * @constructor 
 * It gets the connection state by using the connection.type property of phone gap/corodva documentation.
 * It  shows the device's cellular and wifi connection information.
 * Two event listeners are added that detect the offline and online event respectivey. And the goOffline and
 * goOnline handlers are executed respectively.
 *  @param {String} controller 
 */
function ConnectionState(controller) {

	var self = this;
	self.controller = controller;

	var networkState = navigator.connection.type;

	if (networkState == Connection.NONE) {
		self.state = false;
	} else {
		self.state = true;
	}

	moblerlog("connection state: " + self.state);

	window.addEventListener("offline", self.goOffline, true);
	window.addEventListener("online", self.goOnline, true);
}



/**
 * @prototype
 * @function isOffline
 * @return {Boolean} true if the connection state is offline, otherwise false
 */
ConnectionState.prototype.isOffline = function() {
	return !this.state;
};

/**
 * When online connection is detected any locally stored pending logout information is sent to the server.
 * Addittionally, any pending courses and questions information are loaded from the server.
 * Any pending statistics and tracking data are sent to the server as well. 
 * When online connection state is detected the error messages about the lost of connectivity are hiden
 * The switchtoonline event is triggered
 * @prototype
 * @function goOnline
 */
ConnectionState.prototype.goOnline = function() {
	moblerlog("**online**");
	this.state = true;
	
	 /** 
	  * It it triggered when the connection state is online 
	  * Additionally for statistics purposes we trigger the tracking event in order
	  * to track the connectivity behavior
	 * @event trackingEventDetected
	 * @event online
	 * **/
	$(document).trigger("trackingEventDetected","online");

	// if a pending logout exists, send the logout to the server
	sessionKey = localStorage.getItem("pendingLogout");
	if (sessionKey) {
		localStorage.removeItem("pendingLogout");
		this.controller.models["authentication"].sendLogoutToServer(sessionKey);
	}

	//hide no connection error message in login view
	
	 /** 
	  * It is triggered when an online connection is detected and consequently
	  * the error message is hided
	 * @event errormessagehide
	 * **/
	$(document).trigger("errormessagehide");
	
    moblerlog('check synchronization - course list');
	// if a pending course list exist, load the course list from the server
	var pendingCourseList = localStorage.getItem("pendingCourseList");
	if (pendingCourseList) {
		this.controller.models["course"].loadFromServer();
	}
    
    moblerlog('check synchronization - question pools');
	// if a pending question pool exist, load the question pool from the server
    if ( this.controller && this.controller.models && this.controller.models["course"] && this.controller.models["course"].courseList) {
         moblerlog( 'got models ');
        var courseList = this.controller.models["course"].courseList;
        if (courseList) {
            moblerlog( 'interate course list ' );
            for ( var c in courseList) {
                moblerlog( 'check course ' + c );
                
                var pendingQuestionPools = localStorage.getItem("pendingQuestionPool_" + courseList[c].id);
                if (pendingQuestionPools) {
                    moblerlog('check synchronization - question pool missing for course ' + c);
                    this.controller.models["questionpool"].loadFromServer(courseList[c].id);
                }
            }
        }
    }

    var statisticsModel = this.controller.models["statistics"];
    
    moblerlog('check synchronization - statistics');
	// if pending statistics exist, send them to the server
	var pendingStatistics = localStorage.getItem("pendingStatistics");
	if (pendingStatistics) {
		statisticsModel.sendToServer();
	}
	// if statistics data wasn't sent to the server for more than 24 hours
	// send the data to the server
	if (this.controller && this.controller.models && this.controller.models["statistics"]) {
		if (!statisticsModel.lastSendToServer || statisticsModel.lastSendToServer < ((new Date()).getTime() - 24*60*60*1000)) {
			moblerlog("statistics need to be synchronized in connection state model");
			statisticsModel.sendToServer();
		}
	}
	
	var trackingModel = this.controller.models["tracking"];
    
    moblerlog('check synchronization - tracking');
	// if pending statistics exist, send them to the server
	var pendingTracking = localStorage.getItem("pendingTracking");
	if (pendingTracking) {
		trackingModel.sendToServer();
	}
	// if tracking data wasn't sent to the server for more than 24 hours
	// send the data to the server
	if ( this.controller && this.controller.models && this.controller.models["tracking"]) {
		if (!trackingModel.lastSendToServer || trackingModel.lastSendToServer < ((new Date()).getTime() - 24*60*60*1000)) {
			trackingModel.sendToServer();
		}
	}
    moblerlog('check synchronization DONE');

};


/**
 * When an internet connectivity is lost then show the error message
 * @prototype
 * @function goOffline
 */ 
ConnectionState.prototype.goOffline = function() {
	moblerlog("**offline**");
	this.state = false;
	$(document).trigger("trackingEventDetected","offline");
	// show no connection error message in login view
	this.controller.views["login"].showErrorMessage(jQuery.i18n.prop('msg_network_message'));
};
