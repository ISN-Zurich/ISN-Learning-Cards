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

/** @author Isabella Nake
 * @author Evangelia Mitsopoulou
   
*/

//The Multiple choice widget has two views, an answer and a feedback view.

var MOBLERDEBUG = 0;

function NumericQuestionWidget(interactive) {
	var self = this;

	self.tickedAnswers = controller.models["answers"].getAnswers(); // a list with the typed answer

	self.interactive = interactive;
	this.didApologize = false; // a flag tracking when questions with no data are loaded and an error message is displayed on the screen
	//Check the boolean value of intractive. This is set through the answer and feedback view.
	if (self.interactive) { 
		self.showAnswer(); 
		moblerlog("interactive true");
	} else {
		moblerlog("interactive false");
		self.showFeedback(); //displays the feedback body of the multiple choice widget

	}
} // end of consructor


//**********************************************************METHODS***************************************

NumericQuestionWidget.prototype.cleanup = function() {
    $("#numberInput").blur();
};

//Creation of answer body for numeric questions. It contains a input field.


NumericQuestionWidget.prototype.showAnswer = function() {

	var self = this;
	
	var questionpoolModel = controller.models['questionpool'];
		$("#cardAnswerBody").empty();

		// Check if there is a question pool and if there are answers for a specific question in order to display the answer body
		if (questionpoolModel.questionList && questionpoolModel.getAnswer()) {
		moblerlog("entered numeric answer body");

		var div = $("<div/>", {
			"id": "numberInputContainer",
			"class": "inputBorder"
		}).appendTo("#cardAnswerBody");
		
		var input = $("<input/>", {
			"id" : "numberInput",
			"class" : "loginInput",
			"type" : "number",
			"width" : "200px",
			"value": self.tickedAnswers.length != 0 ? self.tickedAnswers : "",
			"placeholder": "Enter number here"
		}).appendTo(div);
		
		
		$("#numberInput")[0].addEventListener("blur", function() {setButtonHeight();});
//		$("#numberInput")[0].focus();
		
	} else {
		//if there are no data for a question or there is no questionpool then display the error message
		this.didApologize = true;
		doApologize();
	}

};

//Creation of feedback body for numeric questions. It contains one or two input fields, based on the answer results

NumericQuestionWidget.prototype.showFeedback = function() {
	moblerlog("start show feedback in numeric choice");


	$("#feedbackBody").empty();
	$("#feedbackTip").empty();
	
	
	
	var questionpoolModel = controller.models["questionpool"];
	var answerModel = controller.models["answers"];
	var typedAnswer = answerModel.getAnswers();
	var correctAnswer = questionpoolModel.getAnswer()[0];
	var currentFeedbackTitle = answerModel.getAnswerResults();

    //display in an input field with the typed numeric answer of the learner
	var div = $("<div/>", {
		"id": "typedAnswer",
		"class": "inputBorder",
		text: typedAnswer
	}).appendTo("#feedbackBody");
	
	if (currentFeedbackTitle == "Excellent") {
		//if the typed numeric answer is correct, add background color to the above input field
		$("#typedAnswer").addClass("correctAnswer");
		var correctText = questionpoolModel.getCorrectFeedback();
		if (correctText.length > 0) {
			//if extra feedback info is available for the correct answer
			$("#FeedbackMore").show();
			$("#feedbackTip").text(correctText);
		} else {
			//if no extra feedback information is available
			$("#FeedbackMore").hide();
		}
	} else { 
		// if the typed numeric answer is wrong
		moblerlog('handle answer results');
     
		// add the following message 
		$("<div/>", {
			"id" : "numericFeedback",
			"class": "text",
			text : "the correct answer is"
		}).appendTo("#feedbackBody");

		//display below the message in an input field with the correct answer
		$("<div/>", {
			"id" : "correctNumericFeedback",
			"class" : "inputBorder correctAnswer",
			text : correctAnswer
		}).appendTo("#feedbackBody");

		var wrongText = questionpoolModel.getWrongFeedback();
		moblerlog("XX " + wrongText);
		if (wrongText && wrongText.length > 0) {
			// if extra info is available when we have wrong feedback display it
			$("#FeedbackMore").show();
			$("#feedbackTip").text(wrongText);
		} else {
			//if no feedback is available then hide the tip button
			$("#FeedbackMore").hide();
		}

	}

};

//Storing the typed number
NumericQuestionWidget.prototype.storeAnswers = function() {

	var questionpoolModel = controller.models["questionpool"];

	var numericAnswer = $("#numberInput").val();

	controller.models["answers"].setAnswers(numericAnswer);
};

/**
 * this method does nothing for the numeric widget
 */
NumericQuestionWidget.prototype.setCorrectAnswerTickHeight = doNothing;

moblerlog("end of numeric choice widget");
