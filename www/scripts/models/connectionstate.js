/**
 * This model holds the current connection state (online = true, offline = false). 
 * Every time an online or offline event is triggered, it updates its connection state
 */
function ConnectionState() {

	var self = this;
	
	var networkState = navigator.network.connection.type;
	
	if (networkState == Connection.NONE) {
		self.state = false;
	} else {
		self.state = true;
	}

	console.log("connection state: " + self.state);

	window.addEventListener("offline", function() {
		self.setState(false);
	}, true);
	window.addEventListener("online", function() {
		self.setState(true);
	}, true);
}

/**
 * @return true if the connection state is offline, otherwise false
 */
ConnectionState.prototype.isOffline = function() {
	return !this.state;
};

/**
 * sets the state of the connection state
 * if the connection state is set to online, the switchtoonline event is triggered
 */
ConnectionState.prototype.setState = function(state) {
	console.log("connection state changed");
	self.state = state;
	console.log("get change state event - new state: " + self.state);
	if (self.state) {
		$(document).trigger("switchtoonline");
	}
};
