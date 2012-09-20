/** ***********************************************************
 * VIEW HELPERS
 */

/**
 * does nothing
 */
function doNothing() {
}

/**
 * opens a view
 */
function openView() {
	$("#" + this.tagID).show();
}

/**
 * closes a view
 */
function closeView() {
	$("#" + this.tagID).hide();
}

/**
 * shows apologize message if not question data is loaded
 */
function doApologize() {
	$("#feedbackBody").empty();
	$("<span/>", {
		text : "Apologize, no data are loaded"
	}).appendTo($("#dataErrorMessage"));
	$("#dataErrorMessage").show();
}

/*******************************************************************************
 * Controller
 */
function Controller() {
	var self = this;

	console.log("start controller");

	$.ajaxSetup({
		cache : false
	});

	this.models = {};
	this.views = {};

	// initialize models
	this.models.connection = new ConnectionState(this);
	this.models.authentication = new ConfigurationModel(this);
	this.models.course = new CourseModel(this);
	this.models.questionpool = new QuestionPoolModel(this);
	this.models.answers = new AnswerModel(this);
	this.models.statistics = new StatisticsModel(this);

	
	this.models.authentication.loadFromServer();
	
	console.log("models initialized");
	
	//initialize user interface language
	this.setupLanguage();

	// initialize views
	this.views.splashScreen = new SplashScreen(this);
	this.views.login = new LoginView(this);
	this.views.logout = new LogoutView();
	this.views.coursesList = new CoursesListView(this);
	this.views.questionView = new QuestionView();
	this.views.answerView = new AnswerView();
	this.views.feedbackView = new FeedbackView();
	this.views.settings = new SettingsView();
	this.views.statisticsView = new StatisticsView();
	this.views.achievements = new AchievementsView();

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

	// if device is an iPhone enable pinching
	console.log('platform' + device.platform);
	if (device.platform == 'iPhone') {

		function pinchCatcher(event) {
			self.activeView.handlePinch(event);
		}
		gestureHandler.pinched(pinchCatcher);
	}

	// set correct height of icon button
	window.addEventListener("resize", function() {
		setButtonHeight();
	}, false);
	window.addEventListener("orientationchange", function() {
		setButtonHeight();
	}, false);

	setButtonHeight();

	this.activeView.open();

	console.log("End of Controller");
} // end of Controller

Controller.prototype.setupLanguage = function() {
	jQuery.i18n.properties({
	    name:'textualStrings', 
	    path:'translations/', 
	    mode:'both',
	    language:this.models.authentication.getLanguage(), 
	    callback: function() {
	    	// initialize the static strings on all views.
	        $("#usernameInput").attr("placeholder", msg_placeholder_username);
	        $("#password").attr("placeholder", msg_placeholder_password);
	        $("#coursesListTitle").text(msg_courses_list_title);
	        $("#settingsTitle").text(msg_settings_title);
	        $("#logoutConfirmationTitle").text(msg_logout_title);
	        $("#statBestDayTitle").text(msg_bestDay_title);
	        $("#statBestScoreTitle").text(msg_bestScore_title);
	        $("#statHandledCardsTitle").text(msg_handledCards_title);
	        $("#statAverageScoreTitle").text(msg_averageScore_title);
	        $("#statProgressTitle").text(msg_progress_title);
	        $("#statsProgressInfo").text(msg_progress_info);
	        $("#statSpeedTitle").text(msg_speed_title);
	        $("#statsSpeedinfo").text(msg_speed_info);
	        $("#achievementsTitle").text(msg_achievements_title);
	        $("#stackHandlerIcon").addClass(msg_achievements_Handler_icon);
	        $("#stackHandlerTitle").text(msg_achievementsHandler_title);
	        $("#stackHandlerExplanation").text(msg_achievementsHandler_explanation);
	        $("#stackHandlerResultText1").text(msg_achievements_text1);
	        $("#stackHandlerResultText2").text(msg_achievements_text2);
	        $("#cardBurnerIcon").addClass(msg_achievements_Burner_icon);
	        $("#cardBurnerTitle").text(msg_achievementsBurner_title);
	        $("#cardBurnerExplanation").text(msg_achievementsBurner_explanation);
	        $("#cardBurnerResultText1").text(msg_achievements_text1);
	        $("#cardBurnerResultText2").text(msg_achievements_text2);
	        $(".cardBody").text(msg_logout_body);
	        
	    }
	})
}

/**
 * closes the current view and opens the specified one
 */
Controller.prototype.transition = function(viewname) {
	if (this.views[viewname]) {
		this.activeView.close();
		this.activeView = this.views[viewname];
		this.activeView.open();
	}
};

/**
 * if user is already login, the course list is shown otherwise the login form
 * is shown
 */
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

/**
 * transition to the specified view
 */
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

Controller.prototype.transitionToStatistics = function() {
	this.transition('statisticsView');
};

Controller.prototype.transitionToAchievements = function() {
	this.transition('achievements');
};

/**
 * sets the current height for icon buttons
 */
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