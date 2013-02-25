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



/**@author Isabella Nake
 * @author Evangelia Mitsopoulou
 */

/*jslint vars: true, sloppy: true */


/**
 * @Class QuestionView
 * View for displaying questions
 * @constructor
 * - it sets the tag ID for the settings view
 * - assigns event handler when taping on various elements of the question view
 *   such as title, body, done button
 * - bind 2 events, that are related with the loading of statistics and
 *   the calculation of all the statistics metrics. We want to prevent the loading of
 *   statistics view in this case, and we load the question text
 * - it resizes the button's height when it detects orientation change
 * @param {String} controller
*/
function QuestionView(controller) {
	var self = this;
	self.controller = controller;
	self.tagID = 'cardQuestionView';
	var featuredContent_id = FEATURED_CONTENT_ID;
	var returnButton = $('#CourseList_FromQuestion')[0];
	if (returnButton) {
		function cbReturnButtonTap(event,featuredContent_id) {
			self.clickCourseListButton(featuredContent_id);
			event.stopPropagation();
		}

		jester(returnButton).tap(cbReturnButtonTap);
	}

	// center the question body to the middle of the screen
	function setOrientation() {
		$(".cardBody").css('height', window.innerHeight - 70);
		$(".cardBody").css('width', window.innerWidth - 100);

	}
	setOrientation();
	// when orientation changes, set the new width and height
	// resize event should be caught, too, because not all devices
	// send an orientationchange event
	window.addEventListener("orientationchange", setOrientation, false);
	window.addEventListener("resize", setOrientation, false);
	

	var prevent=false;
	jester($('#ButtonAnswer')[0]).tap(function(e) {
		moblerlog("enter button answer in question view");
		//e.preventDefault();
		e.stopPropagation();
		self.handleTap(featuredContent_id);
	});
	
	jester($('#cardQuestionBody')[0]).tap(function(e) {
		//e.preventDefault();
		e.stopPropagation();
		self.handleTap(featuredContent_id);
	});
	
	jester($('#cardQuestionHeader')[0]).tap(function(e) {
		//e.preventDefault();
		e.stopPropagation();
		self.handleTap(e);
	});
	


	jester($('#cardQuestionView')[0]).pinchend(function() {
		self.handlePinch();
	});
	
	jester($('#cardQuestionView')[0]).pinched(function() {
		self.handlePinch();
	});
	
	jester($('#cardQuestionView')[0]).pinch(function() {
		self.handlePinch();
	});
	
	/**It is triggered after statistics are loaded locally from the server. This can happen during the 
	 * authentication or if we had clicked on the statistics icon and moved to the questions.
	 * @event loadstatisticsfromserver
	 * @param: a callback function that displays the question text and preventing the display of the statistics view
	 */	
	$(document).bind("loadstatisticsfromserver", function() {
    	if ((self.tagID === self.controller.activeView.tagID) && (self.controller.models['authentication'].configuration.loginState === "loggedIn"))
    	{
    		moblerlog("enters load statistics from server is done in question view");
    		self.showQuestionBody();
    	}
    	
	  });
	
	 /**It is triggered when the calculation of all the statistics metrics is done
	 * @event allstatisticcalculationsdone
	 * @param: a callback function that displays the answer body and preventing the display of the statistics view
	 */
	$(document).bind("allstatisticcalculationsdone", function() { 
    	moblerlog("enters in calculations done in question view1 ");
    	    
    	if ((self.tagID === self.controller.activeView.tagID) && (self.controller.models['authentication'].configuration.loginState === "loggedIn"))
    	{
    		moblerlog("enters in calculations done in question view 2 ");
    		self.showQuestionBody();
    	}
    });	
	}


/**pinch leads to the course list
 * @prototype
 * @function handlePinch
 **/ 
QuestionView.prototype.handlePinch = function() {
moblerlog("pinch works");
	controller.transitionToCourses();
};


/**tap leads to the answer view
 * @prototype
 * @function handleTap
 **/
QuestionView.prototype.handleTap = function(featuredContent_id) {
	if (controller.models["answers"].answerScore > -1){
		moblerlog("tap question view to feedback");
		controller.transitionToFeedback(featuredContent_id);
	} else { 
		moblerlog("tap question view to answer");
		moblerlog("featured id is "+featuredContent_id);
		controller.transitionToAnswer(featuredContent_id);
	}
};


/**swipe shows a new question updates question body and title
 * @prototype
 * @function handleSwipe
 **/
QuestionView.prototype.handleSwipe = function() {
	// ask the model to select the next question
	// update the display for the current view
	moblerlog("swipe works");
	controller.models['questionpool'].nextQuestion();
	this.open();
	
};


/**closes the view
 * @prototype
 * @function close
 **/
QuestionView.prototype.close = closeView;


/**opens the view
 * @prototype
 * @function openDiv
 **/
QuestionView.prototype.openDiv = openView;

/**shows the question body and title
 * @prototype
 * @function open
 **/
QuestionView.prototype.open = function(featuredContent_id) {
	this.showQuestionTitle();
	this.showQuestionBody(featuredContent_id);
//	if (!controller.models["answers"].hasStarted()) {
//		if(featuredContent_id){
//			controller.models["answers"].startTimer(featuredContent_id);	
//		}else{
//		controller.models["answers"].startTimer(controller.models["questionpool"].getId());}
//	}
	this.openDiv();	
};

/**shows the current question text
 * @prototype
 * @function showQuestionBody
 **/
QuestionView.prototype.showQuestionBody = function() {
	moblerlog("enter question view exclusive content");
	var currentQuestionBody = controller.models["questionpool"]
			.getQuestionBody();
	moblerlog("current question body"+currentQuestionBody);
	$("#questionText").html(currentQuestionBody);
	$("#ButtonTip").hide();

};


/**shows the current question title and the corresponding icon
 * @prototype
 * @function showQuestionTitle
 **/
QuestionView.prototype.showQuestionTitle = function() {
	var currentQuestionType = controller.models["questionpool"]
			.getQuestionType();

	$("#questionIcon").removeClass();
	
	$("#questionIcon").addClass(jQuery.i18n.prop('msg_' + currentQuestionType + '_icon'));
	
};

/**click on the course list button leads to course list
 * @prototype
 * @function clickCourseListButton
 **/
QuestionView.prototype.clickCourseListButton = function(featuredContent_id) {
	controller.models["answers"].resetTimer();
	if (featuredContent_id){
		controller.transitionToLanding();
	}else{
	controller.transitionToCourses();
	}
};


/**
* handles dynamically any change that should take place on the layout
* when the orientation changes.
* @prototype
* @function changeOrientation
**/ 
QuestionView.prototype.changeOrientation = function(o,w,h){
	
};
