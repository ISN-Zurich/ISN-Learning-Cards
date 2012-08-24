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
	
	setTimeout(function() { self.controller.transitionToEndpoint(); }, 8000);
};

SplashScreen.prototype.closeDiv = closeView;

SplashScreen.prototype.close = function() {
     $("#loading").remove();
    if( this.controller.models["authentication"].isLoggedIn() ) {
        this.closeDiv();
    }
};

