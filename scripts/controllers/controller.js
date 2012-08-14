function doNothing() {}
function openView() {
    $("#"+this.tagID ).show();
}
function closeView() {
    $("#"+this.tagID ).hide();
}



function Controller() {
    this.views = {
     splashView: new SplashView (),
     login: new loginView (), 
     courseList: new coursesView (),
     questionView: new QuestionView (),
     asnwersView: new AnswersView (),
     feedbackView: new FeedbackView (),
     settings: new settingsView (),
           };
           
    this.activeView = this.views[splashView];
    
    // instantiate the models
    
    if ( this.models['authentication'].isLoggedIn() ) {
        this.transition('courseList');
    }
    else {
        this.transition('login');
    } 
} //end of Controller


Controller.prototype.transition = function(viewname) {
    this.activeView.close(); 
    this.activeView= this.views[viewname];
    this.activeView.open();

};

Controller.prototype.transitionToLogin = function ( ) { this.transition('login'); };

Controller.prototype.transitionToCourses =  function () { this.transition('coursesList');};  


//to be done more dynamic 
Controller.prototype.transitionToQuestion = function (courseId) { 

                    
                    this.transition('questionView');



};  





Controller.prototype.transitionToAnswer = function () {this.transition('answerView');};  

Controller.prototype.transitionToFeeedback = function () {this.transition('feedbackView');};  

Controller.prototype.transitionToSettings = function ( ) {this.transition('settings');};


Controller.prototype.swipeCatcher = function () { this.activeView.handleSwipe();};

Controller.prototype.tapCatcher = function () { this.activeView.handleTap();};


var jesteroptions = { swipeDistance: 100, 
			  flickDistance: 100, 
			  flickTime: 250 };

jester (document, jesteroptions)
    .swipe(swipeCatcher)
	.tap(tapCatcher);



