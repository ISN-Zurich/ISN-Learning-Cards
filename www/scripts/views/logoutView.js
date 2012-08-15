function LogoutView() {
    var self = this;
    
    self.tagID = 'logoutConfirmationView';
    
    $('#closeIcon').click(function(){ self.cancel(); } );
    $('#logOut').click(function(){ self.logout(); } );
} 

LogoutView.prototype.handleTap = doNothing;
LogoutView.prototype.handleSwipe = doNothing;

LogoutView.prototype.open = openView;

LogoutView.prototype.close = closeView;

LogoutView.prototype.cancel = function() {
	controller.transitionToSettings();
};

LogoutView.prototype.logout = function() {
	var config = controller.models['authentication'];
	config.logout();
	controller.transitionToLogin();
};