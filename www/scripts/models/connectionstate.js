/**
 * This model holds the current connection state (online = true, offline =
 * false). Every time an online or offline event is triggered, it updates its
 * connection state
 */
function ConnectionState(controller) {

	var self = this;
	self.controller = controller;

	var networkState = navigator.network.connection.type;

	if (networkState == Connection.NONE) {
		self.state = false;
	} else {
		self.state = true;
	}

	console.log("connection state: " + self.state);

	window.addEventListener("offline", self.goOffline, true);
	window.addEventListener("online", self.goOnline, true);
}

/**
 * @return true if the connection state is offline, otherwise false
 */
ConnectionState.prototype.isOffline = function() {
	return !this.state;
};

/**
 * sets the state of the connection state to true (online) the switchtoonline
 * event is triggered
 */
ConnectionState.prototype.goOnline = function() {
	console.log("**online**");
	this.state = true;

	// trigger event
	$(document).trigger("switchtoonline");
	$(document).trigger("trackingEventDetected","online");

	// if a pending logout exists, send the logout to the server
	sessionKey = localStorage.getItem("pendingLogout");
	if (sessionKey) {
		localStorage.removeItem("pendingLogout");
		this.controller.models["authentication"].sendLogoutToServer(sessionKey);
	}

	//hide no connection error message in login view
	
	$(document).trigger("errormessagehide");
	
	//this.controller.views["login"].hideErrorMessage();
	
	
    console.log('check synchronization - course list');
	// if a pending course list exist, load the course list from the server
	var pendingCourseList = localStorage.getItem("pendingCourseList");
	if (pendingCourseList) {
		this.controller.models["course"].loadFromServer();
	}
    
    console.log('check synchronization - question pools');
	// if a pending question pool exist, load the question pool from the server
    if ( this.controller && this.controller.models && this.controller.models["course"] && this.controller.models["course"].courseList) {
         console.log( 'got models ' );
        var courseList = this.controller.models["course"].courseList;
        if (courseList) {
            console.log( 'interate course list ' );
            for ( var c in courseList) {
                console.log( 'check course ' + c );
                
                var pendingQuestionPools = localStorage
                .getItem("pendingQuestionPool_" + courseList[c].id);
                if (pendingQuestionPools) {
                    console.log('check synchronization - question pool missing for course ' + c);
                    this.controller.models["questionpool"]
                    .loadFromServer(courseList[c].id);
                }
            }
        }
    }

    var statisticsModel = this.controller.models["statistics"];
    
    console.log('check synchronization - statistics');
	// if pending statistics exist, send them to the server
	var pendingStatistics = localStorage.getItem("pendingStatistics");
	if (pendingStatistics) {
		statisticsModel.sendToServer();
	}
	// if statistics data wasn't sent to the server for more than 24 hours
	// send the data to the server
	if ( this.controller && this.controller.models && this.controller.models["statistics"]) {
		if (!statisticsModel.lastSendToServer || statisticsModel.lastSendToServer < ((new Date()).getTime() - 24*60*60*1000)) {
			statisticsModel.sendToServer();
		}
	}
    
	
var trackingModel = this.controller.models["tracking"];
    
    console.log('check synchronization - tracking');
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
    console.log('check synchronization DONE');

};

/**
 * sets the state of the connection state to false (offline)
 */
ConnectionState.prototype.goOffline = function() {
	console.log("**offline**");
	this.state = false;
	$(document).trigger("trackingEventDetected","offline");
	// show no connection error message in login view
	this.controller.views["login"]
			.showErrorMessage(jQuery.i18n.prop('msg_network_message'));
};
