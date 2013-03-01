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
 * @Class ClozeQuestionType
 * The ClozeQuestionType  has two views, an answer and a feedback view.
 * The answer view contains a paragraph and some text gaps.
 * The feedback view contains 
 * Sometimes when available, the feedback view provides extra feedback information, both for correct and wrong feedback.
 * @constructor
 * -
 * -
 * @param {Boolean} interactive
*/

function ClozeQuestionType(interactive){
	var self = this;
	self.interactive = interactive;
	self.didApologize = false;

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
} //end of constructor


/**
 * doNothing
 * @prototype
 * @function cleanup
 **/ 
ClozeQuestionType.prototype.cleanup = doNothing;


/**
 * Creation of answer body for cloze type questions. It contains a paragraph 
 * with empty text gaps
 * @prototype
 * @function showAnswer
 **/ 
ClozeQuestionType.prototype.showAnswer = function() {
	
	var questionpoolModel = controller.models['questionpool'];
	// Check if there is a question pool and if there are answers for a specific
	// question in order to display the answer body
	if (questionpoolModel.questionList
			&& questionpoolModel.getAnswer()) {
		moblerlog("entered cloze question answer body");
		var answerBody = controller.models["questionpool"].getAnswer();
		$("#cardAnswerBody").html(answerBody);
		
		// wrap everything into li
		// this is not 100% QTI safe
		
		$("#cardAnswerBody").addClass("gradient2"); //added the gradient to the whole 
		
		$("#cardAnswerBody").wrapAll('<ul class="ulTest"/>');
		$("#cardAnswerBody").contents().wrap('<li class="marginClozeLi"/>'); //the contents returns also the text nodes. the children not
		
			
		// now replace all gap tags in the cardAnswerBody
		$("#cardAnswerBody gap").each(function(i,gap){
			var inputtag = '<input type="text" class=" loginInputCloze textShadow" required="required" width="200px"placeholder="fill in the gap" id="gap_'+ $(gap).attr("identifier") +'"/>' ;
			$(gap).replaceWith(inputtag);	
		}) ;
	
		$("#cardAnswerBody :input").each(function(index,input){
			$(input).parent().removeClass("marginClozeLi");
			
			var wrap = $(this).wrap('<div id="clozeInputContainer'+ $(input).attr("identifier")+'"class="inputBorder"/>');	
			var div1 = $("<div/>", {
				"class": "left lineContainer selectItemContainerCloze"
			});
		var span = $("<span/>", {
			"id": "clozeInputDash",
			"class": "dashGrey icon-dash"
		}).appendTo(div1);
			div1.insertBefore( wrap );
		});
		
//		var lastli = $("<li/>", {
//		}).appendTo(ul);
	
	var shadoweddiv = $("<div/>", {
		"id": "shadowedSingleAnswerLi",
		"class" : "gradient1 shadowedLi"
	});
	
		$("#cardAnswerBody").append(shadoweddiv);
		
	
	}else {
		// if there are no data for a question or there is no questionpool then
		// display the error message
		this.didApologize = true;
		doApologize();	
	}
};


/**
 * Creation of feedback body for cloze type questions. It contains a paragraph 
 * with the filled in text gaps and the appropriate feedback around them.
 * For correctly typed gaps a green tick will be displayed on the right column.
 * For wrongly typed gaps the user will see the list with the alternative correct ones
 * @prototype
 * @function showFeedback
 **/ 
ClozeQuestionType.prototype.showFeedback = function() {
moblerlog("enter feedback view in cloze question");
	
	$("#feedbackBody").empty();
	$("#feedbackTip").empty();
	
	var self=this;
	var questionpoolModel = controller.models['questionpool'];
	
	
	
	
}



/**
 * 
 * @prototype
 * @function storeAnswers
 **/ 
ClozeQuestionType.prototype.storeAnswers = function(){
	
	moblerlog("store answers in cloze question view");
	var questionpoolModel = controller.models["questionpool"];
	var gapAnswers = new Array();
	//to get the answers the user typed in the gaps 
	//and push the gaped answers in the array
	
	$("#cardAnswerBody li :input").each(function(index) {
		moblerlog("collect filled gaps");
		var answer=$(this).val();
		gapAnswers.push(answer);
	});
	moblerlog("gapAnswers is "+gapAnswers);
	controller.models["answers"].setAnswers(gapAnswers);
}

/**
 * Sets the height of the list items that contain correct answers
 * @prototype
 * @function setCorrectAnswerTickHeight
 **/ 
ClozeQuestionType.prototype.setCorrectAnswerTickHeight = function() {
	
};