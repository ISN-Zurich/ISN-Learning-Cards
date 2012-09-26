/**
 * View for displaying the logout confimation
 */
function LogoutView() {
    var self = this;
    
    self.tagID = 'logoutConfirmationView';
    
    jester($('#closeIcon')[0]).tap(function(){ self.cancel(); } );
    $('#logOut').click(function(event){ self.logout(); event.stopPropagation(); } );
} 

/**
 * tap, swipe and pinch do nothing
 */
LogoutView.prototype.handleTap = doNothing;
LogoutView.prototype.handleSwipe = doNothing;
LogoutView.prototype.handlePinch = function(){
    controller.transitionToSettings();
};

/**
 * opens the view
 */
LogoutView.prototype.open = openView;

/**
 * closes the view
 */
LogoutView.prototype.close = closeView;

/**
 * click on the cancle button leads to settings
 */
LogoutView.prototype.cancel = function() {
	controller.transitionToSettings();
};

/**
 * click on the logout button logs the user out and
 * shows the login view
 */
LogoutView.prototype.logout = function() {
	var config = controller.models['authentication'];
	config.logout();
	controller.transitionToLogin();
};