function doNothing() {
}
function openView() {
	$("#" + this.tagID).show();
}
function closeView() {
	$("#" + this.tagID).hide();
}

function doApologize() {
	$("#feedbackBody").empty();
	$("<span/>", {
		text : "Apologize, no data are loaded"
	}).appendTo($("#dataErrorMessage"));
	$("#dataErrorMessage").show();
}

function Controller() {
	var self = this;

	console.log("start controller");

	this.models = {};
	this.views = {};

	this.models.authentication = new ConfigurationModel();
	this.models.course = new CourseModel(this);
	this.models.questionpool = new QuestionPoolModel(this);
	this.models.answers = new AnswerModel();

	console.log("models initialized");
	// this.models['course'].loadData();

	this.views.splashScreen = new SplashScreen(this);
	this.views.login = new LoginView();
	this.views.logout = new LogoutView();
	this.views.coursesList = new CoursesListView(this);
	this.views.questionView = new QuestionView();
	this.views.answerView = new AnswerView();
	this.views.feedbackView = new FeedbackView();
	this.views.settings = new SettingsView();

	console.log('views initialized');

	this.activeView = this.views['splashScreen'];

	function swipeCatcher(event) {
		self.activeView.handleSwipe(event);
	}
	function tapCatcher(event) {
		self.activeView.handleTap(event);
	}

	self.jesteroptions = {
		swipeDistance : 100,
		avoidFlick : true
	};

	var gestureHandler = jester(document, self.jesteroptions).swipe(
			swipeCatcher).tap(tapCatcher);

	console.log('core gestures done');

	console.log('platform' + device.platform);
	if (device.platform == 'iPhone') {

		function pinchCatcher(event) {
			self.activeView.handlePinch(event);
		}
		gestureHandler.pinched(pinchCatcher);
	}
	
	//set correct height of icon button
	window.addEventListener("resize", function() {setButtonHeight();}, false);
	window.addEventListener("orientationchange", function() {setButtonHeight();}, false);

	setButtonHeight();
	
	
	this.activeView.open();
	
	console.log("End of Controller");
} // end of Controller

Controller.prototype.transition = function(viewname) {
	if (this.views[viewname]) {
		this.activeView.close();
		this.activeView = this.views[viewname];
		this.activeView.open();
	}
};

Controller.prototype.transitionToEndpoint = function() {
	console.log('initialize endpoint');
	
	if (this.models['authentication'].isLoggedIn()) {
		console.log("is loggedIn");
		this.transition('coursesList');
	} else {
		console.log("is not loggedIn");
		this.transition('login');
	}
};

Controller.prototype.transitionToLogin = function() {
	this.transition('login');
};

Controller.prototype.transitionToLogout = function() {
	this.transition('logout');
};

Controller.prototype.transitionToCourses = function() {
	this.transition('coursesList');
};

Controller.prototype.transitionToQuestion = function() {
	this.transition('questionView');
};

Controller.prototype.transitionToAnswer = function() {
	this.transition('answerView');
};

Controller.prototype.transitionToFeedback = function() {
	this.transition('feedbackView');
};

Controller.prototype.transitionToSettings = function() {
	this.transition('settings');
};

Controller.prototype.transitionToFeedbackMore = function() {
	this.transition('feedbackMore');
};

Controller.prototype.synchronizeModels = function() {
	this.models["courses"].loadFromServer();
};


function setButtonHeight() {
	console.log("setButtonHeight");
	var windowheight = $(window).height();
	var height;
	if (windowheight > 70) {
		height = windowheight - 70;
	} else {
		height = windowheight;
	}
	$(".iconButton").css("height", height);
};