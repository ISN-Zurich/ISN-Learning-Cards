
/**	THIS COMMENT MUST NOT BE REMOVED




Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file 
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0  or see LICENSE.txt

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.	

 */

/** @author Isabella Nake
 * @author Evangelia Mitsopoulou
 */


/*jslint vars: true, sloppy: true */

/**
 * @class Controller
 * It facilitates the communication between views and models.It handles the display of the views.
 * @constructor 
 * it creates the controller, it initializes the  models, views and user interface language 
 * it specifies a timer of 3ms until the application reaches its starting point,
 * it handles general swipe and tap gestures that are applicable in each view of the application, 
 * it handles the change of height of specific buttons according to orientation change, 
 * it handles the transition to statistics view by listening to the event that is fired when all statistics calculations are done
 */

function Controller() {
	var self = this;
	moblerlog("start controller");
	var startTime= new Date().getTime();

	$.ajaxSetup({
		cache : false
	});

	this.models = {};
	this.views = {};

	// initialize models

	this.models.authentication = new ConfigurationModel(this);
	this.models.course = new CourseModel(this);
	this.models.questionpool = new QuestionPoolModel(this);
	this.models.answers = new AnswerModel(this);
	this.models.statistics = new StatisticsModel(this);
	this.models.tracking = new TrackingModel(this);

	// add synchronization triggers at the end of the model initialization just to be careful 
	this.models.connection = new ConnectionState(this);

	this.models.authentication.loadFromServer();

	moblerlog("models initialized");

	//initialize user interface language
	this.setupLanguage();

	moblerlog('languages are set up');

	// initialize views
	this.views.splashScreen = new SplashScreen(this);
	this.views.login = new LoginView(this);
	this.views.logout = new LogoutView();
	this.views.coursesList = new CoursesListView(this);
	this.views.questionView = new QuestionView();
	this.views.answerView = new AnswerView();
	this.views.feedbackView = new FeedbackView();
	this.views.settings = new SettingsView();
	this.views.statisticsView = new StatisticsView(this);
	this.views.achievements = new AchievementsView(this);
	this.views.about = new AboutView();

	moblerlog('views initialized');

	this.activeView = this.views.splashScreen;

	/**
	 * A handler that is executed when a swipe gesture is detected on the active view
	 * @function swipeCatcher
	 * @param  swipe event that is captured by jester
	 */	

	function swipeCatcher(event) {
		self.activeView.handleSwipe(event);
	}

	/**
	 * A handler that is executed when a tap gesture is detected on the active view
	 * @function tapCatcher
	 * @param  tap event that is captured by jester
	 */	

	function tapCatcher(event) {
		self.activeView.handleTap(event);
	}


	//define jester options that affect the way gestures are recognized
	self.jesteroptions = {
			swipeDistance : 100,
			avoidFlick : true
	};

	//implementation of basic jester syntax in order to recognize swipe and tap events

	var gestureHandler = jester(window, self.jesteroptions).swipe(
			swipeCatcher).tap(tapCatcher);


	moblerlog('core gestures done');

	// if device is an iPhone enable pinching
	moblerlog('platform' + device.platform);
	if (device.platform === 'iPhone') {


		gestureHandler.pinched(function pinchCatcher(event) {
			self.activeView.handlePinch(event);
		});
	}

	// set correct height of icon button
	window.addEventListener("resize", setButtonHeight, false);
	window.addEventListener("orientationchange", setButtonHeight, false);

	setButtonHeight();

	/**
	 * It is triggered in Statistics Model when calculations are done in all statistics sub models.  
	 * @event allstatisticcalculationsdone
	 * @param: a callback function that executes the transition to statistics view when the event is listened.
	 * */
	
	$(document).bind("allstatisticcalculationsdone", function() {
		self.transition('statisticsView');
	});

		
	// check if 3000 ms have passed
	// if not we wait until 3000 ms have passed
	// then we do the transition to the login view
	// the remaining waiting time is 3000 - deltatime

	var currentTime = new Date().getTime();
	var deltaTime= currentTime - startTime;
	if (deltaTime < 3000) {
		setTimeout(function() { self.transitionToEndpoint(); }, 3000 - deltaTime);
	}
	else {
		self.transitionToEndpoint();
	}


	moblerlog("End of Controller");
} // end of Controller


/**
 * Initial Interface logic localization. Sets the correct strings depending on the language that is specified in the configuration model.
 * Make use of i18n jQuery plugin and apply its syntax for localization. 
 * @prototype setupLanguage 
 * */
 

Controller.prototype.setupLanguage = function() {
	jQuery.i18n.properties({
		name:'textualStrings', 
		path:'translations/', 
		mode:'both',
		language:this.models.authentication.getLanguage(), 
		callback: function() { // initialize the static strings on all views
			$("#usernameInput").attr("placeholder", msg_placeholder_username);
			$("#password").attr("placeholder", msg_placeholder_password);
			$("#coursesListTitle").text(msg_courses_list_title);
			$("#settingsTitle").text(msg_settings_title);
			$("#logoutConfirmationTitle").text(msg_logout_title);
			$("#statBestDayTitle").text(msg_bestDay_title);
			$("#statBestScoreTitle").text(msg_bestScore_title);
			$("#statsBestScoreInfo").text(msg_bestScore_info);
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
			$("#starterStackHandler").text(msg_achievements_text1);
			$("#doneStackHandler").text(msg_achievements_text2);
			$("#cardBurnerIcon").addClass(msg_achievements_Burner_icon);
			$("#cardBurnerTitle").text(msg_achievementsBurner_title);
			$("#cardBurnerExplanation").text(msg_achievementsBurner_explanation);
			$("#starterCardBurner").text(msg_achievements_text1);
			$("#doneCardBurner").text(msg_achievements_text2);
			$("#aboutTitle").text(msg_about_title);
			$(".cardBody").text(msg_logout_body);
			$("#nameLabelSet").text(jQuery.i18n.prop('msg_fullname'));
			$("#usernameLabelSet").text(jQuery.i18n.prop('msg_username'));
			$("#emailLabelSet").text(jQuery.i18n.prop('msg_email'));
			$("#languageLabelSet").text(jQuery.i18n.prop('msg_language'));
			$("#copyright").text(jQuery.i18n.prop('msg_copyright'));
			$("#openSource").text(jQuery.i18n.prop('msg_openSource'));
			$("#license").text(jQuery.i18n.prop('msg_license'));
			$("#cardQuestionTitle").text(jQuery.i18n.prop('msg_question_title'));


		}
	});
};



/**
 * Closes the current view and opens the specified one
 * @prototype
 * @function transition 
 * @param {String} viewname, the name of the specified target view
 **/


Controller.prototype.transition = function(viewname) {
	moblerlog("transition start" );
	// Check if the current active view exists and either if it is different from the targeted view or if it is the login view
	if (this.views[viewname] && ( viewname === "login" || this.activeView.tagID !== this.views[viewname].tagID)){
		moblerlog("transition: yes we can!");
		this.activeView.close();
		this.activeView = this.views[viewname];
		this.activeView.open();
	}
};


/**
 * It  navigates to the first view that is shown after the the constructor has been initialized and has reached its end point.
 * If a user is already logged in, the course list is shown otherwise the login form is shown.
 * @prototype
 * @function transitionToEndpoint 
 **/

Controller.prototype.transitionToEndpoint = function() {
	moblerlog('initialize endpoint');
	if (this.models['authentication'].isLoggedIn()) {
		moblerlog("is loggedIn");
		this.transition('coursesList');
	} else {
		moblerlog("transitionToEndpoint: is not loggedIn");
		this.transition('login');
	}
};



/**
 * Transition to login view.
 * @prototype
 * @function transitionToLogin 
 **/

Controller.prototype.transitionToLogin = function() {
	this.transition('login');
};

/**
 * Transition to logout view
 * @prototype
 * @function transitionToLogout 
 **/

Controller.prototype.transitionToLogout = function() {
	this.transitionToAuthArea('logout');
};


/**
 * Helper function that handles the transition to the specified targeted view by firstly checking if the user is logged in. 
 * If the user is not logged in the transition reaches the login view
 * @prototype
 * @function transitionToAuthArea 
 * @param {String} viewname, the name of the targeted view
 **/

Controller.prototype.transitionToAuthArea = function(viewname) {
	if (this.getLoginState()) {
		this.transition(viewname);
	}
	else {
		this.transition("login");
	}
};

/**
 * Transition to courses list view
 * @prototype
 * @function transitionToCourses 
 **/


Controller.prototype.transitionToCourses = function() {
	this.transitionToAuthArea('coursesList');
};

/**
 * Transition to question view
 * @prototype
 * @function transitionToQuestion 
 **/


Controller.prototype.transitionToQuestion = function() {
	this.transitionToAuthArea('questionView');
};

/**
 * Transition to answer view
 * @prototype
 * @function transitionToAnswer 
 **/

Controller.prototype.transitionToAnswer = function() {
	this.transitionToAuthArea('answerView');
};

/**
 * Transition to feedback view
 * @prototype
 * @function transitionToFeedback 
 **/

Controller.prototype.transitionToFeedback = function() {
	this.transitionToAuthArea('feedbackView');
};

/**
 * Transition to settings view
 * @prototype
 * @function transitionToSettings 
 **/

Controller.prototype.transitionToSettings = function() {
	this.transitionToAuthArea('settings');
};

/**
 * Transition to feedback more view, which is the view that contains any extra tips about the feedback.
 * @prototype
 * @function transitionToFeedbackMore 
 **/

Controller.prototype.transitionToFeedbackMore = function() {
	this.transitionToAuthArea('feedbackMore');
};

/**
 * Transition to statistics view. The user can reach the statistics view in two ways: 1) either by clicking the statistics icon on the course list view or  2) from the achievements view.
 * @prototype
 * @function transitionToStatistics 
 **/

Controller.prototype.transitionToStatistics = function(courseID) {
	if (this.getLoginState()) {
		//The transition to statistics view is done by clicking the statistics icon in the course list view. In this case a courseID is assigned for the clicked option.
		moblerlog("enters get logic state in controller");
		if (courseID && courseID > 0) {
			moblerlog ("enters course id in controller");
			this.models['statistics'].setCurrentCourseId(courseID);
		}
		else {
			// when the achievements get closed we won't pass the course id
			// in order to avoid that the statistics are recalculated. Which makes no sense,
			// because the statistics model has already all the data in place.
			this.transition("statisticsView");
		}
	}
	else {
		this.transition("login");
	}
};

/**
 * Transition to achievements view
 * @prototype
 * @function transitionToAchievements 
 **/

Controller.prototype.transitionToAchievements = function() {
	this.transitionToAuthArea('achievements');
};

/**
 * Transition to about view
 * @prototype
 * @function transitionToAbout 
 **/

Controller.prototype.transitionToAbout = function() {
	this.transitionToAuthArea('about');
};

/**
 * @prototype
 * @function getLoginState
 * @return {boolean} true if the user is logged in (he has an authentication key stored in the local storage) and false if not.
 **/

Controller.prototype.getLoginState = function() {
	return this.models["authentication"].isLoggedIn();
};


/**
 * @prototype
 * @function getConfigVariable
 * @param {String} varname, the name of the 
 * @return {String} It returns the name of the added property of the configuration object. 
 **/

Controller.prototype.getConfigVariable = function(varname) {
	return this.models["authentication"].configuration[varname];
};

/**
 * It adds a property in the local storage for the configuration object and assigns a value to it.
 * @prototype
 * @function setConfigVariable
 * @param {String} varname, {Boolean, String} varvalue
 **/

Controller.prototype.setConfigVariable = function(varname, varvalue) {
	if ( !this.models["authentication"].configuration ) {
		this.models["authentication"].configuration = {};
	}
	this.models["authentication"].configuration[varname] = varvalue;
	this.models["authentication"].storeData();
};


/**
 * Sets the current height for the icon buttons.
 * Expands the height of the "done" buttons to reach the height of the main content area of the active view
 * @prototype
 * @function setButtonHeight
 **/

function setButtonHeight() {
	moblerlog("setButtonHeight");
	var height, windowheight = $(window).height();
	
	//The main content area has a top margin of 55px. 
	//The icon button can be extended below the title area if the window height is bigger than 61px (safe value, a bit bigger than 55). 
	//In this case the button's height will be the difference between the height of the window and the 61 px.  
	if (windowheight > 61) { 
		height = windowheight - 61;
	} else {
		height = windowheight;
	}
	$(".iconButton").css("height", height + "px");
	$(".iconButton").css("line-height", height + "px");
}