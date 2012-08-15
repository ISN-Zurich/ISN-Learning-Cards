function SplashScreen(controller) {

    var self = this;
    self.controller = controller;
    self.tagID = 'splashScreen';

}

SplashScreen.prototype.handleTap = doNothing;
SplashScreen.prototype.handleSwipe = doNothing;

SplashScreen.prototype.closeDiv = closeView;
SplashScreen.prototype.close = function() {
    if( this.controller.models["authentication"].isLoggedIn() ) {
        this.closeDiv();
    }
    else {
        $("#loading").hide();
    }
};

