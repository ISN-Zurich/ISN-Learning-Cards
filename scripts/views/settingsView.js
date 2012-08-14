function SettingsView() {
    var self = this;
    
    self.tagID = 'settingsView';
    
    $('#closeSettingsIcon').click(function(){ self.closeSettings(); } );
    $('#logOutSettings').click(function(){ self.logout(); } );
} 

SettingsView.prototype.handleTap = doNothing;
SettingsView.prototype.handleSwipe = doNothing;

SettingsView.prototype.open = function() {
	loadData();
	openView();
};
SettingsView.prototype.close = closeView;

SettingsView.prototype.closeSettings = function() {
	controller.transitionToCoursesList();
};

SettingsView.prototype.logout = function() {
	controller.transitionToLogout();
};

SettingsView.prototype.loadData = function() {
	
	var config = conotroller.models['authentication'];
	
	$("settingsData").empty();
	$("<li/>", {
	  text: config.getDisplayName()
	}).appendTo("#settingsData");
	$("<li/>", {
		  text: config.getUserName
		}).appendTo("#settingsData");
	$("<li/>", {
		  text: config.getEmailAddress()
		}).appendTo("#settingsData");
};
