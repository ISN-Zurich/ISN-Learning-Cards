function doNothing() {}
function openView() {
	$("#" + this.tagID).show();
}
function closeView() {
	$("#" + this.tagID).hide();
}

function Controller() {
	this.models = {
		authentication : new ConfigurationModel(),
		course : new CourseModel(),
		questionpool : new QuestionPoolModel()

	};

	this.models['course'].loadData();

	this.views = {
		splashScreen : new SplashScreen(),
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

	console.log("End of Controller");
} // end of Controller

Controller.prototype.transition = function(viewname) {
	this.activeView.close();
	this.activeView = this.views[viewname];
	this.activeView.open();

};

Controller.prototype.transitionToLogin = function ( ) { this.transition('login'); };

Controller.prototype.transitionToLogout = function ( ) { this.transition('logout'); };


Controller.prototype.transitionToCourses =  function () { this.transition('coursesList');};  


Controller.prototype.transitionToQuestion = function () { this.transition('questionView');};  


Controller.prototype.transitionToAnswer = function () {this.transition('answerView');}; 
      
Controller.prototype.transitionToFeedback = function () {this.transition('feedbackView');};  

Controller.prototype.transitionToSettings = function ( ) {this.transition('settings');};

Controller.prototype.transitionToFeedbackMore = function ( ) {this.transition('feedbackMore');};


function swipeCatcher() { this.activeView.handleSwipe();};

function tapCatcher() { this.activeView.handleTap();};



var jesteroptions = { swipeDistance: 100, 
			  flickDistance: 100, 
			  flickTime: 250 };

jester (document, jesteroptions)
    .swipe(swipeCatcher)
	.tap(tapCatcher);



