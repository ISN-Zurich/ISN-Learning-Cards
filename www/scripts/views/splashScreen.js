/**
 * View for displaying thes splash screen
 */
function SplashScreen(controller) {

    var self = this;
    self.controller = controller;
    self.tagID = 'splashScreen';

}

/**
 * pinch does nothing
 */
SplashScreen.prototype.handlePinch = doNothing;

/**
 * tap does nothing
 */
SplashScreen.prototype.handleTap = doNothing;

/**
 * swipe does nothing
 */
SplashScreen.prototype.handleSwipe = doNothing;

/**
 * leads to the next view
 */
SplashScreen.prototype.open = function() {
	this.controller.transitionToEndpoint();
};

/**
 * closes the view
 */
SplashScreen.prototype.closeDiv = closeView;

/**
 * hides the loading icon
 * closes the view if the user is already logged in
 */
SplashScreen.prototype.close = function() {
     $("#loading").remove();
    if( this.controller.models["authentication"].isLoggedIn() ) {
        this.closeDiv();
    }
};

/**
 * shows the user that he/she has no internet connection
 */
SplashScreen.prototype.showNoConnectionMessage = function() {
	$("#loginForm").text("Sorry, you need to be online to connect to your LMS");
}

