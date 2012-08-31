function SettingsView() {
    var self = this;
    
    self.tagID = 'settingsView';
    
    jester($('#closeSettingsIcon')[0]).tap(function(){ self.closeSettings(); } );
//    jester($('#logOutSettings')[0]).tap(function(){ self.logout(); } );
    $('#logOutSettings').click(function() {
    	self.logout();
    });
    
    $(document).bind("authenticationready", function(e, courseID) {
		console.log("authentication ready called " + courseID);
		self.loadData();
	});
} 

SettingsView.prototype.handlePinch = doNothing;
SettingsView.prototype.handleTap = doNothing;
SettingsView.prototype.handleSwipe = doNothing;
SettingsView.prototype.openDiv = openView;
SettingsView.prototype.open = function() {
	this.loadData();
	this.openDiv();
	
	controller.models['authentication'].loadFromServer();
	
};
SettingsView.prototype.close = closeView;

SettingsView.prototype.closeSettings = function() {
	controller.transitionToCourses();
};

SettingsView.prototype.logout = function() {
	controller.transitionToLogout();
};

SettingsView.prototype.loadData = function() {
	
	var config = controller.models['authentication'];
	
	$("#settingsData").empty();
	$("<li/>", {
	  text: config.getDisplayName()
	}).appendTo("#settingsData");
	$("<li/>", {
		  text: config.getUserName()
		}).appendTo("#settingsData");
	$("<li/>", {
		  text: config.getEmailAddress()
		}).appendTo("#settingsData");
};
