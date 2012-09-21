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

	// if a pending logout exists, send the logout to the server
	sessionKey = localStorage.getItem("pendingLogout");
	if (sessionKey) {
		localStorage.removeItem("pendingLogout");
		this.controller.models["authentication"].sendLogoutToServer(sessionKey);
	}

	//hide no connection error message in login view
	
	$(document).trigger("errormessagehide");
	
	//this.controller.views["login"].hideErrorMessage();
	
	


	// if a pending course list exist, load the course list from the server
	var pendingCourseList = localStorage.getItem("pendingCourseList");
	if (pendingCourseList) {
		this.controller.models["course"].loadFromServer();
	}

	// if a pending question pool exist, load the question pool from the server
	var courseList = this.controller.models["course"].courseList;
	if (courseList) {
		for ( var c in courseList) {
			var pendingQuestionPools = localStorage
					.getItem("pendingQuestionPool_" + courseList[c].id);
			if (pendingQuestionPools) {
				this.controller.models["questionpool"]
						.loadFromServer(courseList[c].id);
			}
		}
	}
	
	// if pending statistics exist, send them to the server
	var pendingStatistics = localStorage.getItem("pendingStatistics");
	if (pendingStatistics) {
		this.controller.models["statistics"].sendToServer();
	}


};

/**
 * sets the state of the connection state to false (offline)
 */
ConnectionState.prototype.goOffline = function() {
	console.log("**offline**");
	this.state = false;

	// show no connection error message in login view
	this.controller.views["login"]
			.showErrorMessage(jQuery.i18n.prop('msg_network_message'));
};
