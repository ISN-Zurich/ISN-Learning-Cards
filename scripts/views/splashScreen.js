function SplashScreen() {

    var self = this;
    
    self.tagID = 'splashScreen';

}

SplashScreen.prototype.handleTap = doNothing;
SplashScreen.prototype.handleSwipe = doNothing;

SplashScreen.prototype.close = closeView;