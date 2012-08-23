function doNothing() {}
function openView() {
	$("#" + this.tagID).show();
}
function closeView() {
	$("#" + this.tagID).hide();
}


function doApologize(){
	$("#numberInputContainer").hide();
	$("#correctNumericFeedback").hide();
	$("#feedbackBody").empty();
	$("<span/>", {
	text : "Apologize, no data are loaded"
	}).appendTo($("#dataErrorMessage"));
	
}




function Controller() {
    var self = this;

	this.models = {
		authentication : new ConfigurationModel(),
		course : new CourseModel(),
		questionpool : new QuestionPoolModel(),
	    answers: new AnswerModel()   
	};
    
	// this.models['course'].loadData();
    
	this.views = {
		splashScreen : new SplashScreen(this),
		login : new LoginView(),
		logout : new LogoutView(),
		coursesList : new CoursesListView(this),
		questionView : new QuestionView(),
		answerView : new AnswerView(),
		feedbackView : new FeedbackView(),
		settings : new SettingsView()
	};
    
	this.activeView = this.views['splashScreen'];
    
	if (this.models['authentication'].isLoggedIn()) {
		console.log("is loggedIn");
		this.transition('coursesList');
	} else {
		console.log("is not loggedIn");
		this.transition('login');
	}
    
    function swipeCatcher(event) { self.activeView.handleSwipe(event);}
    function tapCatcher(event) { self.activeView.handleTap(event);}
    
    self.jesteroptions = { swipeDistance: 100,
        avoidFlick: true };
    
    var gestureHandler = jester(document, self.jesteroptions)
    .swipe(swipeCatcher)
	.tap(tapCatcher);
    
    console.log( 'platform'+ device.platform);
    if ( device.platform == 'iPhone' ) {
        
        function pinchCatcher(event) { self.activeView.handlePinch(event); }
        gestureHandler.pinched(pinchCatcher);
    }
    
	console.log("End of Controller");
} // end of Controller

Controller.prototype.transition = function(viewname) {
	if ( this.views[viewname] ) {
		this.activeView.close();
		this.activeView = this.views[viewname];
		this.activeView.open();
	}
};

Controller.prototype.transitionToLogin = function ( ) { this.transition('login'); };

Controller.prototype.transitionToLogout = function ( ) { this.transition('logout'); };


Controller.prototype.transitionToCourses =  function () { this.transition('coursesList');};


Controller.prototype.transitionToQuestion = function () { this.transition('questionView');};


Controller.prototype.transitionToAnswer = function () {this.transition('answerView');};

Controller.prototype.transitionToFeedback = function () {this.transition('feedbackView');};

Controller.prototype.transitionToSettings = function ( ) {this.transition('settings');};

Controller.prototype.transitionToFeedbackMore = function ( ) {this.transition('feedbackMore');};





