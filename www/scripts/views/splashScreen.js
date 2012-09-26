function SplashScreen(controller) {

    var self = this;
    self.controller = controller;
    self.tagID = 'splashScreen';

}

SplashScreen.prototype.handlePinch = doNothing;
SplashScreen.prototype.handleTap = doNothing;
SplashScreen.prototype.handleSwipe = doNothing;

SplashScreen.prototype.open = function() {
	var self = this;
	
	self.controller.transitionToEndpoint();
	
//	setTimeout(function() { self.controller.transitionToEndpoint(); }, 1000);
};

SplashScreen.prototype.closeDiv = closeView;

SplashScreen.prototype.close = function() {
     $("#loading").remove();
    if( this.controller.models["authentication"].isLoggedIn() ) {
        this.closeDiv();
    }
};

SplashScreen.prototype.showNoConnectionMessage = function() {
	$("#loginForm").text("Sorry, you need to be online to connect to your LMS");
}

