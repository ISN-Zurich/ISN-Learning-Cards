function ConnectionState() {	

	var self = this;
	self.state = window.navigator.onLine;
	
	function setState() {
		self.state = window.navigator.onLine;
	};
	
	window.addEventListener("offline", setState, false);
	window.addEventListener("online", setState, false);
}

ConnectionState.prototype.getState = function() {return this.state;}; //returns true or false!
ConnectionState.prototype.isOffline = function() {return !this.state;};