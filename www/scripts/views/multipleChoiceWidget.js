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

/*jslint vars: true, sloppy: true */

/**
 * @author Isabella Nake
 * @author Evangelia Mitsopoulou
*/

/**
 * @Class MultipleChoiceWidget
 * The Multiple choice widget has two views, an answer and a feedback view. 
 * The answer view contains a list with possible solutions and is highlighted by the selected answers of users.
 * The feedback view contains the list with the possible solutions highlighted by both the correct answers and learner's ticked answers.
 * Sometimes when available, the feedback view provides extra feedback information, both for correct and wrong feedback.
 * @constructor
 * - it gets the selected answers of the users and assign them to a variable
 * - it activates either answer or feedback view based on the passed value of
 *   the parameter of the constructor (interactive)
 * - it initializes the flag that keeps track when wrong data structure are received from the server
 *   and an appropriate message is displayed to the user. 
 * @param {Boolean} interactive
*/ 
function MultipleChoiceWidget(interactive) {
	var self = this;

	self.tickedAnswers = controller.models["answers"].getAnswers(); // a list with the currently selected answers
	self.interactive = interactive;
		
	// a flag tracking when questions with no data are loaded and an error message is displayed on the screen
	this.didApologize = false;
	//Check the boolean value of interactive. This is set through the answer and feedback view.
	if (self.interactive) { 
		self.showAnswer(); 
		moblerlog("interactive true");
	} else {
		moblerlog("interactive false");
		//displays the feedback body of the multiple choice widget
		self.showFeedback(); 
	}
} // end of constructor


/**
 * doNothing
 * @prototype
 * @function cleanup
 **/ 
MultipleChoiceWidget.prototype.cleanup = doNothing;


/**
 * Creation of answer body for multiple choice questions.
 * It contains a list with the possible solutions which
 * have been firstly mixed in a random order.
 * @prototype
 * @function showAnswer
 **/ 
MultipleChoiceWidget.prototype.showAnswer = function() {
	var questionpoolModel = controller.models['questionpool'];

	$("#cardAnswerBody").empty();

	// Check if there is a question pool and if there are answers for a specific question in order to display the answer body
	if (questionpoolModel.questionList && questionpoolModel.getAnswer()[0].answertext) {
		var self = this;

		var questionpoolModel = controller.models["questionpool"];
		var answers = questionpoolModel.getAnswer(); //returns an array containing the possible answers
		var mixedAnswers;
		//mix answer items in an random order
		if (!questionpoolModel.currAnswersMixed()) {
			questionpoolModel.mixAnswers();
		}			
		mixedAnswers = questionpoolModel.getMixedAnswersArray();
		
		var viewId= $("#cardAnswerView");
		//creation of an unordered list to host the possible answers
		var ul = $("<ul/>", {
			}).appendTo("#cardAnswerBody");

		
		for ( var c = 0; c < mixedAnswers.length; c++) {
			// when an answer item is clicked a highlighted background color is
			// applied to it via "ticked" class
			var li = $(
					"<li/>",
					{
						"id" : "answer" + mixedAnswers[c],
						"class" : (self.tickedAnswers.indexOf(mixedAnswers[c]) != -1 ? " gradientSelected " : "gradient2 "),
					}).appendTo(ul);
			// handler when taping on an item on the answer list
			jester(li[0]).tap(function() {
				self.clickMultipleAnswerItem($(this));
			});
			
			
			var rightDiv = $("<div/>", {
				"class" : "right"
			}).appendTo(li);
				
			var separator = $("<div/>", {
				"id":"separator"+ mixedAnswers[c],
				"class" : " lineContainer separatorContainerCourses radial marginSeparatorTop" 
			}).appendTo(rightDiv);
			
				
			div = $("<div/>", {
				//"class" : "courseListIcon right gradient2"
				 "id": "iconContainer"+ mixedAnswers[c],
				"class" : "courseListIconFeedback lineContainer"
			}).appendTo(rightDiv);
			
			
			
			// displays the text value for each answer item on the single choice
			// list
			var div = $("<div/>", {
				"id" : "title"+ mixedAnswers[c],
				"class" : "text",
				text : answers[mixedAnswers[c]].answertext
			}).appendTo(li);
			
		}
		var lastli = $("<li/>", {
		}).appendTo(ul);
	
	var shadoweddiv = $("<div/>", {
		"id": "shadowedAnswerLi",
		"class" : "gradient1 shadowedLi"
	}).appendTo(lastli);
	
	var marginLi= $("<li/>", {
		"class": ""
	}).appendTo(ul);
	
	
	} else {
		//if there are no data for a question or there is no questionpool then display the error message
		this.didApologize = true; 
		doApologize();
	}
};


/**
 * Creation of feedback body for multiple choice questions. 
 * It contains the list with the possible solutions highlighted by both the correct answers
 * and learner's ticked answers
 * @prototype
 * @function showFeedback
 **/ 
MultipleChoiceWidget.prototype.showFeedback = function() {
	moblerlog("start show feedback in multiple choice");
	
	$("#feedbackBody").empty();
	$("#feedbackTip").empty();
	var self=this;
	var questionpoolModel = controller.models['questionpool'];
	var answers = questionpoolModel.getAnswer();
	var mixedAnswers = questionpoolModel.getMixedAnswersArray();


	// clone the answerbody, 
//	var clone = $("#cardAnswerBody ul").clone(); 
//	clone.appendTo("#feedbackBody"); 
//	
	
	var ul = $("<ul/>", {
		"z-index": " 7"	
	}).appendTo("#feedbackBody");

	for ( var c = 0; c < mixedAnswers.length; c++) {
		// when an answer item is clicked a highlighted background color is
		// applied to it via "ticked" class
		var li = $(
				"<li/>",
				{
					"id" : "answer" + mixedAnswers[c],
					"class" : (self.tickedAnswers.indexOf(mixedAnswers[c]) != -1 ? " gradientSelected" : "gradient2") //"answerLi" + 
				}).appendTo(ul);
		
		var rightDiv = $("<div/>", {
			"class" : "right"
		}).appendTo(li);
			
		var separator = $("<div/>", {
			"id":"separator"+ mixedAnswers[c],
			"class" : "radialCourses lineContainer separatorContainerCourses"
		}).appendTo(rightDiv);
		
			
		div = $("<div/>", {
			//"class" : "courseListIcon right gradient2"
			 "id": "iconContainer"+ mixedAnswers[c],
			"class" : "courseListIconFeedback lineContainer "
		}).appendTo(rightDiv);
		
		span = $("<div/>", {
			"id":"courseListIcon"+ mixedAnswers[c],
			"class" : (questionpoolModel.getScore(parseInt($(li).attr('id').substring(6))) > 0 ?  "right green icon-checkmark background" : ($(li).hasClass("gradientSelected"))?"right red icon-App-Icons  glowRed" :"")
		}).appendTo(div);
		
		var div = $("<div/>", {
			"class" : "text",
			text : answers[mixedAnswers[c]].answertext
		}).appendTo(li);
	}
	
	var lastli = $("<li/>", {
	}).appendTo(ul);

	var shadoweddiv = $("<div/>", {
		"id": "shadowedFeedbackLi",
		"class" : "gradient1 shadowedLi"
	}).appendTo(lastli);

	var marginLi= $("<li/>", {
		"class": "spacerMargin"
	}).appendTo(ul);
	
	moblerlog("enter feedback view after switching from question view");
};


/**
 * Handling behavior when click on the an item of the multiple answers list
 * Adds or removes the blue background color depending on what was the previous state.
 * @prototype
 * @function clickMultipleAnswerItem
 **/ 
MultipleChoiceWidget.prototype.clickMultipleAnswerItem = function(
		clickedElement) {
	// the ticked item is highlighted with a background color or unhighlighted, depending its previous state
	clickedElement.toggleClass("gradientSelected"); 
};


/**
 * Storing the ticked answers in an array
 * @prototype
 * @function storeAnswers
 **/ 
MultipleChoiceWidget.prototype.storeAnswers = function() {
	var answers = new Array();
	var questionpoolModel = controller.models["questionpool"];

	$("#cardAnswerBody li").each(function(index) {
		if ($(this).hasClass("gradientSelected")) {
			var tickedIndex = parseInt($(this).attr('id').substring(6));
			answers.push(tickedIndex);
		}
	});

	controller.models["answers"].setAnswers(answers);
};


/**
 * Sets the height of the list items that contain correct answers
 * @prototype
 * @function setCorrectAnswerTickHeight
 **/ 
MultipleChoiceWidget.prototype.setCorrectAnswerTickHeight = function() {
	$("#feedbackBody ul li").each(function() {
		height = $(this).height();
		$(this).find(".correctAnswer").height(height);
		$(this).find(".correctAnswer").css("line-height", height + "px");
	});
};

moblerlog("end of mulitple choice widget");