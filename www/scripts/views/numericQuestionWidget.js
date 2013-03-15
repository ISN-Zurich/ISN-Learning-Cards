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


/**
 * @Class NumericQuestionWidget
 * The Numeric Question Widget has two views, an answer and a feedback view. 
 * The answer view contains a input field where the user can type a numeric value.
 * The feedback view can vary depending on the correct or wron input of the user, which means
 * that if the typed answer of the user is correct then a green background color is applied to the input field
 * with an excellent acknolwedgement on the top otherwise a second input field is displayed with the correct answer.
 * @constructor
 * - it gets the selected answers of the users and assign them to a variable
 * - it activates either answer or feedback view based on the passed value of
 *   the parameter of the constructor (interactive)
 * - it initializes the flag that keeps track when wrong data structure are received from the server
 *   and an appropriate message is displayed to the user. 
 * @param {Boolean} interactive
*/ 
function NumericQuestionWidget(interactive) {
	var self = this;

	self.tickedAnswers = controller.models["answers"].getAnswers(); // a list with the typed answer

	self.interactive = interactive;
	this.didApologize = false; // a flag tracking when questions with no data are loaded and an error message is displayed on the screen
	//Check the boolean value of interactive. This is set through the answer and feedback view.
	if (self.interactive) { 
		self.showAnswer(); 
		moblerlog("interactive true");
	} else {
		moblerlog("interactive false");
		self.showFeedback(); //displays the feedback body of the multiple choice widget

	}
} // end of constructor


/**
 * It blurs the input field 
 * @prototype
 * @function cleanup
 **/ 
NumericQuestionWidget.prototype.cleanup = function() {
    $("#numberInput").blur();
};


/**
 * Creation of answer body for numeric questions. 
 * It contains a input field.
 * @prototype
 * @function showAnswer
 **/ 
NumericQuestionWidget.prototype.showAnswer = function() {

	var self = this;
	
	var questionpoolModel = controller.models['questionpool'];
		$("#cardAnswerBody").empty();

		// Check if there is a question pool and if there are answers for a specific question in order to display the answer body
		if (questionpoolModel.questionList && questionpoolModel.getAnswer()) {
		moblerlog("entered numeric answer body");

		var ul = $("<ul/>", {
			"id":"numericElements"
			
		}).appendTo("#cardAnswerBody");
		
		var li = $(
				"<li/>",
				{}).appendTo(ul);
		
		var div1 = $("<div/>", {
			"class": "left lineContainer selectItemContainer"
			}).appendTo(li);
		
		var span = $("<span/>", {
			"id": "numberInputDash",
			"class": "dashGrey icon-dash"
			}).appendTo(div1);
		
		var div2 = $("<div/>", {
		"id": "numberInputContainer",
		"class": "inputBorder gradient2"
		}).appendTo(li);
		
		var input = $("<input/>", {
			"id" : "numberInput",
			"class" : "loginInputCloze textShadow",
			"required": "required",
			"width" : "200px",
			"type" : "number",
			"placeholder":"type a number",
			"value": self.tickedAnswers.length != 0 ? self.tickedAnswers : ""
		}).appendTo(div2);
		
		var lastli = $("<li/>", {
		}).appendTo(ul);

		var shadoweddiv = $("<div/>", {
			"id": "shadowedNumericLi",
			"class" : "gradient1 shadowedLi"
		}).appendTo(lastli);
	
		
		$("#numberInput")[0].addEventListener("blur", function() {setButtonHeight();});
		
	} else {
		//if there are no data for a question or there is no questionpool then display the error message
		this.didApologize = true;
		doApologize();
	}

};


/**
 * Creation of feedback body for numeric questions. 
 * It contains one or two input fields, based on the answer results
 * @prototype
 * @function showFeedback
 **/
NumericQuestionWidget.prototype.showFeedback = function() {
	moblerlog("start show feedback in numeric choice");
	$("#feedbackBody").empty();
	$("#feedbackTip").empty();
	var questionpoolModel = controller.models["questionpool"];
	var answerModel = controller.models["answers"];
	var typedAnswer = answerModel.getAnswers();
	moblerlog("typed answer is "+typedAnswer);
	var correctAnswer = questionpoolModel.getAnswer()[0];
	var currentFeedbackTitle = answerModel.getAnswerResults();

    //display in an input field with the typed numeric answer of the learner
	
	if (currentFeedbackTitle == "Excellent") {
		
		var ul = $("<ul/>", {}).appendTo("#feedbackBody");
			var li = $(
					"<li/>",
					{
						"class" : "gradientSelected"  
					}).appendTo(ul);
			
			var rightDiv = $("<div/>", {
				"class" : "right"
			}).appendTo(li);
				
			var separator = $("<div/>", {
				"class" : "radialCourses lineContainer separatorContainerCourses marginSeparatorTop"
			}).appendTo(rightDiv);
			
				
			div = $("<div/>", {
				 "class" : "courseListIconFeedback lineContainer background"
			}).appendTo(rightDiv);
			
			span = $("<div/>", {
				"class" : "right glow2 icon-checkmark" 
			}).appendTo(div);
			
			var div = $("<div/>", {
				"class" : "text",
				text : typedAnswer
			}).appendTo(li);
		
			var lastli = $("<li/>", {
			}).appendTo(ul);

			var shadoweddiv = $("<div/>", {
				"id": "shadowedNumericAnswerLi",
				"class" : "gradient1 shadowedLi"
			}).appendTo(lastli);

		

	} 
		
	else { 
		// if the typed numeric answer is wrong
		moblerlog('handle answer results');
     
		var ul = $("<ul/>", {}).appendTo("#feedbackBody");
		var li = $(
				"<li/>",
				{
					"class" : "gradientSelected"  
				}).appendTo(ul);
		
		
		var rightDiv = $("<div/>", {
			"class" : "right"
		}).appendTo(li);
			
		var separator = $("<div/>", {
			"class" : "radialCourses lineContainer separatorContainerCourses marginSeparatorTop"
		}).appendTo(rightDiv);
		
		divWrong = $("<div/>", {
			 "class" : "courseListIconFeedback lineContainer background"
		}).appendTo(rightDiv);
		
		var div = $("<div/>", {
			//"class" : "text",
			"class":(answerModel.getAnswers() ? "text" : "defaultHeight"),
			text : typedAnswer
		}).appendTo(li);
	
		var li2 = $(
				"<li/>",
				{
					"class" : "gradient2"  
				}).appendTo(ul);
		
		var rightDiv2 = $("<div/>", {
			"class" : "right"
		}).appendTo(li2);
			
		var separator2 = $("<div/>", {
			"class" : "radialCourses lineContainer separatorContainerCourses marginSeparatorTop"
		}).appendTo(rightDiv2);
		
			
		divCorrect = $("<div/>", {
			 "class" : "courseListIconFeedback lineContainer background"
		}).appendTo(rightDiv2);
		
		span2 = $("<span/>", {
			"class" : "right icon-checkmark glowNone" 
		}).appendTo(divCorrect);
		
		var div2 = $("<div/>", {
			"class" : "text",
			text : correctAnswer
		}).appendTo(li2);
		
		var lastli = $("<li/>", {
		}).appendTo(ul);

		var shadoweddiv = $("<div/>", {
			"id": "shadowedNumericFeedbackLi",
			"class" : "gradient1 shadowedLi"
		}).appendTo(lastli);

	
	}

};


/**
 * Storing the typed number
 * @prototype
 * @function storeAnswers
 **/
NumericQuestionWidget.prototype.storeAnswers = function() {

	var questionpoolModel = controller.models["questionpool"];

	var numericAnswer = $("#numberInput").val();

	controller.models["answers"].setAnswers(numericAnswer);
};


/**
 * This method does nothing for the numeric widget
 * @prototype
 * @function setCorrectAnswerTickHeight
 **/ 
NumericQuestionWidget.prototype.setCorrectAnswerTickHeight = doNothing;


moblerlog("end of numeric choice widget");
