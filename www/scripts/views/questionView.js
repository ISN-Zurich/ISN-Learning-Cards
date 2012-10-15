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

//View for displaying questions
 
function QuestionView() {
	var self = this;

	self.tagID = 'cardQuestionView';
	

	var returnButton = $('#CourseList_FromQuestion')[0];
	if (returnButton) {
		function cbReturnButtonTap(event) {
			self.clickCourseListButton();
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
	// send an oritentationchange event
	window.addEventListener("orientationchange", setOrientation, false);
	window.addEventListener("resize", setOrientation, false);
	
	
	
}


//pinch leads to the course list
 
QuestionView.prototype.handlePinch = function() {
	controller.transitionToCourses();
};

 //tap leads to the answer view

QuestionView.prototype.handleTap = function() {
//var self = this;
 if (controller.models["answers"].answerScore > -1){
	controller.transitionToFeedback();
} else { 
		controller.transitionToAnswer();
		}
};


//swipe shows a new question updates question body and title
QuestionView.prototype.handleSwipe = function() {
	// ask the model to select the next question
	// update the display for the current view
	console.log("swipe works");
	controller.models['questionpool'].nextQuestion();
	this.showQuestionBody();
	this.showQuestionTitle();
};


//closes the view

QuestionView.prototype.close = closeView;

 //opens the view

QuestionView.prototype.openDiv = openView;

//shows the question body and title

QuestionView.prototype.open = function() {
	this.showQuestionBody();
	this.showQuestionTitle();
	
	if (!controller.models["answers"].hasStarted()) {
		controller.models["answers"].startTimer(controller.models["questionpool"].getId());
	}
	this.openDiv();	
};

//shows the current question text

QuestionView.prototype.showQuestionBody = function() {
	var currentQuestionBody = controller.models["questionpool"]
			.getQuestionBody();
	$("#cardQuestionBody").html(currentQuestionBody);

	$("#ButtonTip").hide();

};

//shows the current question title and the corresponding icon

QuestionView.prototype.showQuestionTitle = function() {
	var currentQuestionType = controller.models["questionpool"]
			.getQuestionType();

	$("#questionIcon").removeClass();
	
	$("#questionIcon").addClass(jQuery.i18n.prop('msg_' + currentQuestionType + '_icon'));
	//$("#cardQuestionTitle").text(jQuery.i18n.prop('msg_' + currentQuestionTitle + '_title'));
};

//click on the course list button leads to course list

QuestionView.prototype.clickCourseListButton = function() {
	controller.models["answers"].resetTimer();
	controller.transitionToCourses();
};
