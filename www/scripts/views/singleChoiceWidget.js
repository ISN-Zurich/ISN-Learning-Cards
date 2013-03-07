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
 * @Class MultipleChoiceWidget
 * The Single choice widget has two views, an answer and a feedback view.
 * The answer view contains a list with possible solutions and the selected answer by the user is highlighted.
 * The feedback view contains the list with the possible solutions highlighted by both the correct answer and learner's ticked answer.
 * Sometimes when available, the feedback view provides extra feedback information, both for correct and wrong feedback.
 * @constructor
 * - it gets the selected answers of the users and assign them to a variable
 * - it activates either answer or feedback view based on the passed value of
 *   the parameter of the constructor (interactive)
 * - it initializes the flag that keeps track when wrong data structure are received from the server
 *   and an appropriate message is displayed to the user. 
 * @param {Boolean} interactive
*/
function SingleChoiceWidget(interactive) {
	var self = this;
    self.interactive = interactive;
    // a flag tracking when questions with no data are loaded 
    // and an error message is displayed on the screen
    self.didApologize = false;
        
    moblerlog('check for previous answers');
    // a list  with the currently  selected answers
	self.tickedAnswers = controller.models["answers"].getAnswers();
    
	moblerlog('ok');

	// Check the boolean value of interactive. This is set through the answer and
	// feedback view.
	if (self.interactive) {
		// when answer view is active, then interactive variable is set to true.
		self.showAnswer(); // displays the answer body of the single choice
							// widget
	} else {
		// when feedback view is active, then interactive is set to false.
		// displays the feedback body of the single choice widget
		self.showFeedback(); 
	}
}

/**
 * doNothing
 * @prototype
 * @function cleanup
 **/ 
SingleChoiceWidget.prototype.cleanup = doNothing;


/**
 * Creation of answer body for single choice questions. It contains a list with
 * the possible solutions which have been firstly mixed in a random order.
 * Only one of them can be ticked each time.
 * @prototype
 * @function showAnswer
 **/ 
SingleChoiceWidget.prototype.showAnswer = function() {
	var questionpoolModel = controller.models['questionpool'];

	// Check if there is a question pool and if there are answers for a specific
	// question in order to display the answer body
	if (questionpoolModel.questionList
			&& questionpoolModel.getAnswer()[0].answertext) {

		var self = this;
        
		// returns an array containing the possible answers
		var answers = questionpoolModel.getAnswer();

		var mixedAnswers;
		if (!questionpoolModel.currAnswersMixed()) {
			questionpoolModel.mixAnswers();
		}			
		mixedAnswers = questionpoolModel.getMixedAnswersArray();

		$("#cardAnswerBody").empty();

		var ul = $("<ul/>", {
		}).appendTo("#cardAnswerBody");

		for ( var c = 0; c < mixedAnswers.length; c++) {
			// when an answer item is clicked a highlighted background color is
			// applied to it via "ticked" class
			var li = $(
					"<li/>",
					{
						"id" : "answer" + mixedAnswers[c],
						"class" : (self.tickedAnswers.indexOf(mixedAnswers[c]) != -1 ? " gradientSelected" : "gradient2") //"answerLi" + 
					}).appendTo(ul);
			// handler when taping on an item on the answer list
			jester(li[0]).tap(function() {
				self.clickSingleAnswerItem($(this));
			});
			
			var rightDiv = $("<div/>", {
				"class" : "right"
			}).appendTo(li);
				
			var separator = $("<div/>", {
				"id":"separator"+ mixedAnswers[c],
				"class" : " radial lineContainer separatorContainerCourses marginSeparatorTop"
			}).appendTo(rightDiv);
			
			div = $("<div/>", {
				//"class" : "courseListIcon right gradient2"
				 "id": "iconContainer"+ mixedAnswers[c],
				"class" : "courseListIconFeedback lineContainer"
			}).appendTo(rightDiv);
			
			
			// displays the text value for each answer item on the single choice
			// list
			var div = $("<div/>", {
				"class" : "text",
				text : answers[mixedAnswers[c]].answertext
			}).appendTo(li);
		}
		
		var lastli = $("<li/>", {
		}).appendTo(ul);
	
	var shadoweddiv = $("<div/>", {
		"id": "shadowedSingleAnswerLi",
		"class" : "gradient1 shadowedLi"
	}).appendTo(lastli);
		
//	//add some space, so that to enable scrolling in landscape mode
	var marginli = $("<li/>", {
		"class":"spacerMargin"
	}).appendTo(ul);

	
	} else {
		// if there are no data for a question or there is no questionpool then
		// display the error message
		this.didApologize = true;
		doApologize();
	}
};



/**
 * Creation of feedback body for single choice questions. It contains the list
 * with the possible solutions highlighted by both the correct answer and
 * learner's ticked answer
 * @prototype
 * @function showFeedback
 **/ 
SingleChoiceWidget.prototype.showFeedback = function() {
	
	moblerlog("enter feedback view after switching from question view");
	
	$("#feedbackBody").empty();
	$("#feedbackTip").empty();
	
	var self=this;
	var questionpoolModel = controller.models['questionpool'];
	var answers = questionpoolModel.getAnswer();
	var mixedAnswers = questionpoolModel.getMixedAnswersArray();


	//var clone = $("#cardAnswerBody ul").clone(); // clone the answerbody,
	//clone.appendTo("#feedbackBody");

	var ul = $("<ul/>", {
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
			"class" : "radialCourses lineContainer separatorContainerCourses marginSeparatorTop"
		}).appendTo(rightDiv);
		
			
		div = $("<div/>", {
			//"class" : "courseListIcon right gradient2"
			 "id": "iconContainer"+ mixedAnswers[c],
			"class" : "courseListIconFeedback lineContainer background"
		}).appendTo(rightDiv);
		
		span = $("<div/>", {
			"id":"courseListIcon"+ mixedAnswers[c],
			"class" : (questionpoolModel.getScore(parseInt($(li).attr('id').substring(6))) > 0 ?  "right green icon-checkmark" : ($(li).hasClass("gradientSelected"))?"right red icon-App-Icons glowRed" :"")
		}).appendTo(div);
		
			//41 replaced icon-checkmark
		//icon-App-Icons replaced icon-cross
		// displays the text value for each answer item on the single choice
		// list
		var div = $("<div/>", {
			"class" : "text",
			text : answers[mixedAnswers[c]].answertext
		}).appendTo(li);
	}
	
	var lastli = $("<li/>", {
	}).appendTo(ul);

	var shadoweddiv = $("<div/>", {
		"id": "shadowedSigleFeedbackLi",
		"class" : "gradient1 shadowedLi"
	}).appendTo(lastli);

	var marginLi= $("<li/>", {
		"class": "spacerMargin"
	}).appendTo(ul);
	
	var questionpoolModel = controller.models["questionpool"];

};

/**
 * Handling behavior when click on the an item of the single answers list
 * @prototype
 * @function clickSingleAnswerItem
 **/
SingleChoiceWidget.prototype.clickSingleAnswerItem = function(clickedElement) {
	// to check if any other element is ticked and untick it
	clickedElement.parent().find("li").removeClass("gradientSelected");
	// add a background color to the clicked element
	clickedElement.addClass("gradientSelected");
};

/**
 * Storing the ticked answer in an array
 * @prototype
 * @function storeAnswers
 **/ 
SingleChoiceWidget.prototype.storeAnswers = function() {
	var answers = new Array();

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
SingleChoiceWidget.prototype.setCorrectAnswerTickHeight = function() {
	$("#feedbackBody ul li").each(function() {
		height = $(this).height();
		$(this).find(".correctAnswer").height(height);
		$(this).find(".correctAnswer").css("line-height", height + "px");
	});
};


/**
* handles dynamically any change that should take place on the layout
* when the orientation changes.
* @prototype
* @function changeOrientation
**/ 
SingleChoiceWidget.prototype.changeOrientation = doNothing;
moblerlog("end of single choice widget");