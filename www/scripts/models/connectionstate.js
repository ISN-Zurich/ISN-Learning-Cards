//	var connectionState = window.navigator.onLine ? "online" : "offline";
//
//	window.addEventListener("offline", function() {
//		connectionState = "offline";
//	}, false);
//	window.addEventListener("online", function() {
//		connectionState = "online";
//	}, false);
//
//
//function isOffline() {
//	return connectionState == "offline";
//}

function ConnectionState() {

	var self = this;
	self.state = window.navigator.onLine;

	console.log("connection state: " + window.navigator.onLine);
	
	

	window.addEventListener("offline", function() {
		self.setState(false);
	}, true);
	window.addEventListener("online", function() {
		self.setState(true);
	}, true);
}

// ConnectionState.prototype.getState = function() {return this.state;};
// returns true or false!
ConnectionState.prototype.isOffline = function() {
	return !this.state;
};

ConnectionState.prototype.setState = function(state) {
	console.log("connection state changed");
	self.state = state;
	console.log("get change state event - new state: " + self.state);
	if (self.state) {
		$(document).trigger("switchtoonline");
	}
};
