function SettingsView() {
    var self = this;
    
    self.tagID = 'settingsView';
    
    jester($('#closeSettingsIcon')[0]).tap(function(){ self.closeSettings(); } );
//    jester($('#logOutSettings')[0]).tap(function(){ self.logout(); } );
    $('#logOutSettings').click(function() {
    	self.logout();
    });
    
    $(document).bind("authenticationready", function(e, userID) {
		console.log("authentication ready called " + userID);
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
	console.log("close settings button clicked");
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
	$("<li/>", {  
		  text: jQuery.i18n.prop('msg_' + config.getLanguage() + '_title')
		}).appendTo("#settingsData");
};
