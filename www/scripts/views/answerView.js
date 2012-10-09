/**
 * .0	THIS COMMENT MUST NOT BE REMOVED

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
 * 
 * The answer View displays the possible solutions of a question. 
 * The user can interact with the view by selecting/typing/sorting the possible solutions/answers.
 * The possible solutions can have different formats. This is handled by widgets that are acting as subviews of the Answer View.
 * The answer View is a general template that loades in its main body a different widget based on the type of the question.
*/

function AnswerView() {
	var self = this;

	self.tagID = 'cardAnswerView';

	self.widget = null; 
	

	//Handler when taping on the forward/done grey button on the right of the answer view
	jester($('#doneButton')[0]).tap(function() {
		self.clickDoneButton();
	});
	
	//Handler when taping on the upper right button of the answer view
	jester($('#CourseList_FromAnswer')[0]).tap(function() {
		self.clickCourseListButton();
	});

	//Handler when taping on the title of the answer area of the answer view
	jester($('#cardAnswerTitle')[0]).tap(function() {
		self.clickTitleArea();
		console.log("answer title clicked");
	});
	
	//Handler when taping on the icon of the title area of the answer view
	jester($('#cardAnswerIcon')[0]).tap(function() {
		self.clickTitleArea();
		console.log("answer title clicked");
	});

	// center the answer body to the middle of the screen of the answer view
	function setOrientation() {
		$(".cardBody").css('height', window.innerHeight - 70);
		$(".cardBody").css('width', window.innerWidth - 100);

	}
	
	setOrientation();
	window.addEventListener("orientationchange", setOrientation, false);
	window.addEventListener("resize", setOrientation, false);

} // end of Constructor



//**********************************************************METHODS***************************************

//No action is executed when taping on the Answer View
AnswerView.prototype.handleTap = doNothing;


// Transition to courses when pinching on the answer view. This  is executed only on the iphone.
AnswerView.prototype.handlePinch = function() {
	controller.transitionToCourses();
};

// No action is executed when swiping on the Answer View
AnswerView.prototype.handleSwipe = doNothing;


// Closing of the answer view
AnswerView.prototype.closeDiv = closeView;

//Shows the container div element of the current view 
AnswerView.prototype.openDiv = openView;

// Opening of answer view. The parts of the container div element that are loaded dynamically are explicitilly defined/created here
AnswerView.prototype.open = function() {

	this.showAnswerTitle();
	this.showAnswerBody();
	this.openDiv();

};

AnswerView.prototype.close = function() {
    this.widget.cleanup();
    this.closeDiv();
};


//loads a subview-widget based on the specific question type. It is displayed within the main body area of the answer view
AnswerView.prototype.showAnswerBody = function() {

	$("#dataErrorMessage").empty();
	$("#dataErrorMessage").hide();
	$("#cardAnswerBody").empty();

	var questionpoolModel = controller.models['questionpool'];

	var questionType = questionpoolModel.getQuestionType();
	var interactive = true; // a flag used to distinguish between answer and feedback view. Iteractivity is true because the user can interact (answer questions) with the view on the answer view
	switch (questionType) {
	case 'assSingleChoice':
		this.widget = new SingleChoiceWidget(interactive);
		break;
	case 'assMultipleChoice':
		this.widget = new MultipleChoiceWidget(interactive);
		break;
	case 'assOrderingQuestion':
		this.widget = new TextSortWidget(interactive);
		break;
	case 'assNumeric':
		this.widget = new NumericQuestionWidget(interactive);
		break;
	default:
		break;
	}

};


//Displays the title area of the answer view, containg a title icon  the title text 
AnswerView.prototype.showAnswerTitle = function() {
	var currentAnswerTitle = controller.models["questionpool"]
			.getQuestionType(); 
	//$("#cardAnswerTitle").text(currentAnswerTitle); // display as title of the page the specific question type

	$("#answerIcon").removeClass();
	$("#answerIcon").addClass(jQuery.i18n.prop('msg_' + currentAnswerTitle + '_icon'));
	$("#cardAnswerTitle").text(jQuery.i18n.prop('msg_' +currentAnswerTitle + '_title'));
	

};

// Handling the behavior of the "forward-done" button on the answer view
AnswerView.prototype.clickDoneButton = function() {

	var questionpoolModel = controller.models['questionpool'];
	var answerModel = controller.models['answers'];
	console.log('check apology ' + this.widget.didApologize);
	if (this.widget.didApologize) {
		// if there was a problem with the data, the widget knows
		// in this case we proceed to the next question
		statisticsModel.resetTimer();
		questionpoolModel.nextQuestion();
		controller.transitionToQuestion();
	} else {
		// if there was no error with the data we provide feedback to the
		// learner.
		questionpoolModel.queueCurrentQuestion();
		this.widget.storeAnswers();
		this.widget.calculateAnswerScore();
		answerModel.storeScoreInDB();
		this.widget.storeScore();
		controller.transitionToFeedback();
	}
};

// Transition to list of Courses when click on the upper right button 
AnswerView.prototype.clickCourseListButton = function() {

	controller.transitionToCourses();

};

// Transition back to question view when click on the title area
AnswerView.prototype.clickTitleArea = function() {

	this.widget.storeAnswers(); // When switching back and forth between question view  and answer view the currently selected answers are stored. These answers have not yet been finally answered.
	controller.transitionToQuestion();

};
