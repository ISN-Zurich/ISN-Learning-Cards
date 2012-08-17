function LogoutView() {
    var self = this;
    
    self.tagID = 'logoutConfirmationView';
    
    jester($('#closeIcon')[0]).tap(function(){ self.cancel(); } );
    jester($('#logOut')[0]).tap(function(){ self.logout(); } );
} 

LogoutView.prototype.handleTap = doNothing;
LogoutView.prototype.handleSwipe = doNothing;
LogoutView.prototype.handlePinch = doNothing;

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