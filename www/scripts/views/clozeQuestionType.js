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
		$("#cardAnswerBody").contents().wrap('<li class=""/>'); //the contents returns also the text nodes. the children not
		
		// now replace all gap tags in the cardAnswerBody
		$("#cardAnswerBody gap").each(function(i,gap){
			var inputtag = '<input type="text" class=" loginInput textShadow" required="required" width="200px" id="gap_'+ $(gap).attr("identifier") +'"/>' ;
			$(gap).replaceWith(inputtag);	
		}) ;
	
		$("#cardAnswerBody :input").each(function(index,input){
		$(this).wrap('<div id="clozeInputContainer'+ $(input).attr("identifier")+'"class="inputBorder"/>');
			
		});
		
	
	$("#cardAnswerBody li").each(function(index,li){
		moblerlog("index is "+index);
		var inputResults= $(this).find('input').length;
		//var inputResults= $('#cardAnswerBody li:has(:input)');
		moblerlog("inputResults are "+inputResults);
		if ($(this).find('input').length){
			moblerlog("entered for "+index+ "time");
		var div1 = $("<div/>", {
			"class": "left lineContainer selectItemContainer"
		}).prependTo($(this));
		moblerlog("before insert dash final");

		var span = $("<span/>", {
			"id": "clozeInputDash",
			"class": "dashGrey icon-dash"
		}).appendTo(div1);
		moblerlog("after insert dash final");
		}
	});
		
		
			
	}else {
		// if there are no data for a question or there is no questionpool then
		// display the error message
		this.didApologize = true;
		doApologize();
		
	}
	//identify the sub part of the question text that embraces the [gap] [/gap]
	//	var startGap=currentQuestionBody.indexOf("[gap]");
	//	var lastGap=currentQuestionBody.indexOf("[/gap]");
	//	var questionText1=currentQuestionBody.substring(0,startGap);
	//	var questionText2=currentQuestionBody.substring(lastGap+6,currentQuestionBody.length);
	
};
