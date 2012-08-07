function Connectionstate() {	

	var self = this;
	self.state = window.navigator.onLine;
	
	function setState() {
		self.state = window.navigator.onLine;
	};
	
	window.addEventListener("offline", setState, false);
	window.addEventListener("online", setState, false);
}

Connectionstate.prototype.getState = function() {return this.state;};