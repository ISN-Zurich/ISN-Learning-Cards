function LogoutView() {
    var self = this;
    
    self.tagID = 'logout';
    
    $('#closeIcon').click(function(){ self.cancel(); } );
    $('#logOut').click(function(){ self.logout(); } );
} 

SettingsView.prototype.handleTap = doNothing;
SettingsView.prototype.handleSwipe = doNothing;

SettingsView.prototype.open = openView;

SettingsView.prototype.close = closeView;

SettingsView.prototype.cancel = function() {
	controller.transitionToSettings();
};

SettingsView.prototype.logout = function() {
	var config = controller.models['authentication'];
	config.logout();
	controller.transitionToLogin();
};