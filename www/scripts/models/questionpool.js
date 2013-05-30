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
 * @class QuestionPoolModel
 * This model holds the questions of a question pool and a queue for the last
 * answered questions
 * @constructor 
 * It sets and initializes basic properties such as:
 *  - the questionList
 *  - the id of the active question
 *  - the whole structure and content of the active question
 *  - an array that contains in mixed/random order the answer items of a question
 *  - a flag that specifies if the current answer items are mixed or not
 *  - a queue that holds the most recently answered questions, whose lenght is specified to be 4 
 */
function QuestionPoolModel(controller) {
	this.controller = controller;
	this.questionList = [];
	this.id = 0;
	this.indexAnswer = 0;
	this.activeQuestion = {};
	this.mixedAnswers = [];
	this.currentAnswersAreMixed = false;

	this.reset();
	this.queue = [];

	// if the question list length is less than this constant,
	// the queue is not used
	this.queueConstant = 4;
	var featuredContent_id = FEATURED_CONTENT_ID;
}


/**
 * Stores the data of a question pool into the local storage (key = "questionpool_[course_id]")
 * Therefore the questionlist is converted into a string
 * @prototype
 * @function storeData
 * @param{Number}course_id, the if of the current course
 */
QuestionPoolModel.prototype.storeData = function(course_id) {
	var questionPoolString;
	try {
		questionPoolString = JSON.stringify(this.questionList);
	} catch (err) {
		questionPoolString = "";
	}
	localStorage.setItem("questionpool_" + course_id, questionPoolString);
};


/**
 * Loads the data from the local storage (key = "questionpool_[course_id]")
 * Therefore the string is converted into an array
 * @prototype
 * @function loadData
 * @param {Number}course_id, the id of the current course
 * */
QuestionPoolModel.prototype.loadData = function(course_id) {
	var questionPoolObject;
	try {
		moblerlog("question pool object exists");
		questionPoolObject = JSON.parse(localStorage.getItem("questionpool_"
				+ course_id)) || [];
		moblerlog("questionpool Object is "+questionPoolObject );
	} catch (err) {
		moblerlog("question pool object is zero");
		questionPoolObject2 = [];
	}
	moblerlog("questionpool pool id is ????:"+course_id);
	this.questionList = questionPoolObject;
	moblerlog("question pool list for the course_id is "+this.questionList);
	this.reset();
};



/**
 * Loads the question pool from the server and stores it in the local storage
 * When all data is loaded, the questionpoolready event is triggered. 
 * During the request to the server, the session key of the authenticated user is
 * sent via headers
 * @prototype
 * @function loadFromServer
 */
QuestionPoolModel.prototype.loadFromServer = function(courseId) {

	var self = this;
	var activeURL = self.controller.getActiveURL();

	$
			.ajax({
				url: activeURL + "/questions.php/"+ courseId,
				type : 'GET',
				dataType : 'json',
				success : function(data) {
					moblerlog("success");
					//if this was a pending question pool, remove it from the storage
					localStorage.removeItem("pendingQuestionPool" + courseId);
					if (data) {
                    moblerlog("JSON: " + data);
						var questionPoolObject;
						
						questionPoolObject = data.questions;				
						if (!questionPoolObject) {
							questionPoolObject = [];
						}
						
						//clean html before inserting the data into the localstorage
						if (questionPoolObject.length > 0) {
							for (var j = 0; j < questionPoolObject.length; j++) {
								var question = questionPoolObject[j];				
								//clear the answertext 
								self.cleanupAnswertext(question,j);
								
								//clear the question
								question["question"] = self.cleanupHTML(question["question"]);
								
								//clear the feedback-more 
								question["errorFeedback"] = self.cleanupHTML(question["errorFeedback"]);
								question["correctFeedback"] = self.cleanupHTML(question["correctFeedback"]);		
							}
						}
										
						moblerlog("Object: " + questionPoolObject);
						
						var questionPoolString;
						try {
							questionPoolString = JSON.stringify(questionPoolObject);
							moblerlog("questionpool string "+questionPoolString);
						} catch (err) {
							questionPoolString = "";
						}
						
						//OLD Regular Expressions
						// remove images by using regular expression
						// questionPoolString = questionPoolString.replace(/<img[^>]*>/g,"");
						
						// remove br by using regual expression
						// questionPoolString=questionPoolString.replace(/<br[^>]*>/g,"");
						
						// remove empty p
						// questionPoolString=questionPoolString.replace('/<p>\s*</p>/', '');
						
						// moblerlog("questionpool string after removal of tags "+questionPoolString);
						//var questionPoolString1=$.parseHTML(questionPoolString);
						localStorage.setItem("questionpool_" +  data.courseID, questionPoolString);
						
						/**It is triggered after the successful loading of questions from the server 
						 * @event questionpoolready
						 * @param:courseID
						 */
						
                  		$(document).trigger("questionpoolready", data.courseID);
					}
				},
				error : function(request) {
					
					//if there was an error while sending the request,
					//store the course id for the question pool in the local storage
					localStorage.setItem("pendingQuestionPool_" + courseId, true);
					moblerlog("Error while loading question pool from server");
					moblerlog("Error while loading course list from server");
					moblerlog("ERROR status code is : " + request.status);
					moblerlog("ERROR returned data is: "+ request.responseText); 
				},
				beforeSend : setHeader
			});

	function setHeader(xhr) {
		xhr.setRequestHeader('sessionkey',
				self.controller.models['authentication'].getSessionKey());
	}

};

/**
 * we use this function when we want explicitily to define which html-tags we want to remove
 * and from which part of the text.
 * the tags we want to remove are:
 * - empty <p>
 * - <hr>
 * - dublicate <br/>
 * - <img>
 * - leading and trailing <br/> 
 * @prototype
 * @function cleanupHTML
 * @param {string} htmltext, it can be the question view text, the feedback more view text or the cloze question text
 * */
QuestionPoolModel.prototype.cleanupHTML = function(htmltext) {
	//cleaning leading and trailing empty tags
	var helperDiv = $("#modelHelperQuestionpool");
	helperDiv.empty();
	helperDiv.html(htmltext);
	// remove all the image tags
	helperDiv.find("img, hr, br + br").remove();

	// remove all the empty p tags
	var pTags = helperDiv.find("p");
	pTags.each(function(){if ( ! /\S/.test($(this).text()) ) { $(this).remove(); } });

	// now remove the leading and trailing BRs
	var brTags = helperDiv.find("br");
	// we are only interested in the first and the last element in this list
	// for the first BR we need to check if there is anything else than whitespaces in front of it
	// for the last BR we need to check if there is anything else than whitespaces in front of it
	
	// finally we return the resulting htmltext
	htmltext = helperDiv.html();
	helperDiv.empty();
	return htmltext;
};

/**
 * We use this function when we want to clear the answer text from any html-tags
 * that's why we use the text() function to get only the text from the html elements.
 * For the text of clozeQuestions we need to be picky on the removal of the html elements.
 * For that reason we use there the cleanUpHtml function, which is used also in the cases for
 * a) question view text
 * b) feedbback more text (correct and wrong one)
 * @prototype
 * @function cleanupAnswertext
 * @param {array} questionobject, the current question
 * */
QuestionPoolModel.prototype.cleanupAnswertext = function(questionobject,questionIndex) {
	switch (questionobject.type) {
	case "assSingleChoice":
	case "assMultipleChoice":
	case "assOrderingQuestion":
	case "assOrderingHorizontal":
		//the answer is an array, so we need to loop
		for (var i = 0; i < questionobject.answer.length; i++) {
			questionobject.answer[i].answertext = $("#modelHelperQuestionpool").html(questionobject.answer[i].answertext).text();
			moblerlog("passed clearing answer view for various question types");
			$("#modelHelperQuestionpool").empty();
		}
		break;
	case "assClozeTest":
		moblerlog("enter cloze question type case");
		// this is a bit more complicated
		// for the cloze Text
		moblerlog("cloze text is"+questionobject.answer["clozeText"]);
		questionobject.answer["clozeText"] = this.cleanupHTML(questionobject.answer["clozeText"]);
		
		// we clean the correct gap definition as well, just to be safe.
		//NOTE:Ilias automatically correct the p, br and hr tags
		//it keeps the b,i 
		for (gapIndex=0; gapIndex<jQuery(questionobject.answer.correctGaps).size();gapIndex++){
			var items=questionobject.answer.correctGaps[gapIndex]["items"];
			for(k=0; k<jQuery(items).size();k++){
				items[k]["answertext"]=$("#modelHelperQuestionpool").html(items[k]["answertext"]).text();
				questionobject.answer.correctGaps[gapIndex].items[k]["answertext"] = $("#modelHelperQuestionpool").html(items[k]["answertext"]).text();
			}
		}
		$("#modelHelperQuestionpool").empty();
	

		break;
	case "assNumeric":
	default: 		
		break;
	}
};

/**
 * Removes the data for the specified course id from the local storage
 * @prototype
 * @function removeData
 */
QuestionPoolModel.prototype.removeData = function(course_id) {
	localStorage.removeItem("questionpool_" + course_id);
};


/**
 * Returns the type of the current question
 * There are currently supported the following question types, according to ILIAS naming conventions: 
 * - "assMultipleChoice",
 * - "assSingleChoice", 
 * - "assOrderingQuestion",
 * - "assNumeric", 
 * - "assOrderingHorizontal"
 * @prototype
 * @function getQuestionType
 * @return type, the question type of the current question
 */
QuestionPoolModel.prototype.getQuestionType = function() {
	return this.activeQuestion.type;
};


/**
 * @prototype
 * @function getQuestionBody
 * @return activeQuestion.question, the question text of the current question
 */
QuestionPoolModel.prototype.getQuestionBody = function() {
	return this.activeQuestion.question;
};


/**
 * @prototype
 * @function getAnswer
 * @return {Array} answer, the answer of the current active question in an array format which consists of answer items
 */
QuestionPoolModel.prototype.getAnswer = function() {
	return this.activeQuestion.answer;
};


/**
 * @prototype
 * @function getMixedAnswersArray
 * @return mixedAnswers, the array that contains the mixed answers
 */
QuestionPoolModel.prototype.getMixedAnswersArray = function() {
	return this.mixedAnswers;
};



/**
 * @prototype
 * @function currAnswersMixed
 * @return{Boolean} true, if the answer items of the active questions are mixed it returns true, otherwise false
 */
QuestionPoolModel.prototype.currAnswersMixed = function() {
	return this.currentAnswersAreMixed;
};

/**
 * Mixes the answer items of the current question and sets as true the flag 
 * that tracks if the answers are mixed or not
 * @prototype
 * @function mixAnswers
 */
QuestionPoolModel.prototype.mixAnswers = function() {
	var answers = this.activeQuestion.answer;
	this.mixedAnswers = [];
	while (this.mixedAnswers.length < answers.length) {
		var random = Math.floor((Math.random() * answers.length));

		// if the current random number is already in the mixed
		// answers array , then get the next element as random number
		while (this.mixedAnswers.indexOf(random) !== -1) {
			random = (++random) % answers.length;
		}

		this.mixedAnswers.push(random);
	}
	this.currentAnswersAreMixed = true;
};

/**
 * Increases the index. Sets the id to the id of the next question. 
 * A random number is created in order to get the id of the next question
 * at the random position/index of the question list. 
 * If the random number is not the same as the current id and is not an id 
 * that is stored in the queue, the new id is the random number
 * @prototype
 * @function nextQuestion
 * @return {Boolean} returns false if it has reached the end of the list
 */
QuestionPoolModel.prototype.nextQuestion = function() {
	var random;
	var newId;

	do {
		// generates a random number between 0 and questionList.length 
		random = Math.floor((Math.random() * this.questionList.length));
		moblerlog("random:" +random);
		newId = this.questionList[random].id;
		moblerlog("New ID: " + newId);
		//keeps repeating the process of getting the id of the new random question of question list
		//while the new random id is still the same with id of the current question or if this new random id is still 
		//stored in the waiting queue 	
	} while (this.id === newId || (this.queue.length * 2 <= this.questionList.length && jQuery
					.inArray(newId, this.queue) >= 0));

	this.id = newId;

	this.activeQuestion = this.questionList[random];
	this.currentAnswersAreMixed = false;
	return this.id < this.questionList.length;
};


/**
 * Puts the current id of the active question into the queue only if the length of the question list is
 * greater than the queue constant
 * Push in the queue the current question, only if questionpool is longer than the queue.
 * @prototype
 * @function queueCurrentQuestion
 */
QuestionPoolModel.prototype.queueCurrentQuestion = function() {
	if (this.questionList.length >= this.queueConstant) {
		this.queue.shift();
		this.queue.push(this.id);
	}
};


/**
 * @prototype
 * @function getAnswerChoice
 * @return {String} answertext, the text of the current answer item of the current  active question
 */
QuestionPoolModel.prototype.getAnswerChoice = function() {
	return this.activeQuestion.answer[this.indexAnswer].answertext;
};


/**
 * This functions applies to multiple and single choice questions, whose
 * answer body consists of a list of answer items. It returns the score of each answer item  
 * that is assigned from the LMS. 
 * @prototype
 * @function getScore
 * @param {Number} index, the position/index of the answer item  of the active question
 * @return {Number} points, the score in points of the current answer item of the active question
 * @return -1 if no score is specified for the specific answer item
 * */
QuestionPoolModel.prototype.getScore = function(index) {
	if (index >= 0 && index < this.activeQuestion.answer.length) { 
		return this.activeQuestion.answer[index].points;
	}
    return -1;
};


/**
 * Gives more textual explanatory feedback to the user when he gets correct results
 * @prototype
 * @function getCorrectFeedback
 * @return {String} correctFeedback, the correct feedback of the current question
 */
QuestionPoolModel.prototype.getCorrectFeedback = function() {
	return this.activeQuestion.correctFeedback;
};


 
/**
 * Gives more textual explanatory feedback to the user when he gets wrong results
 * @prototype
 * @function getWrongFeedback
 * @return {String} erroFeedback, the wrong feedback of the current question
 */
QuestionPoolModel.prototype.getWrongFeedback = function() {
	return this.activeQuestion.errorFeedback;
};


/**
 * @prototype
 * @function getId
 * @return {Number} id, the id of the current active question
 */ 
QuestionPoolModel.prototype.getId = function() {
	return this.activeQuestion.id;
};



/**
 * Resets a question pool by:
 * 1. Emptying the queue that holds the recently answered questions
 * 2. Initializing the question id
 * 3. Clearing the current question body
 * 4. Reseting the mixing of the answered items of each question
 * After the reseting of the above elements has been done, we start again the question pool by moving to the next question
 * @prototype
 * @function reset
 */ 
QuestionPoolModel.prototype.reset = function(featuredContent_id) {
	moblerlog("reset question pool");
	this.queue = [ "-1", "-1", "-1" ];
	if (featuredContent_id){
		this.id=featuredContent_id;
	}
	else{
	this.id = 0;
	}
	this.activeQuestion = {};
	this.currentAnswersAreMixed = false;
	if (this.questionList.length > 0) {
		this.nextQuestion(featuredContent_id);
	}
};


/**
 * Resets the answer index
 * @prototype
 * @function resetAnswer
 */ 
 QuestionPoolModel.prototype.resetAnswer = function() {
	this.indexAnswer = 0;
};


/**
 * checks the existence and validity 
 * of the question pool list
 * @prototype
 * @function dataAvailable
 */ 
QuestionPoolModel.prototype.dataAvailable= function() {
	if (this.questionList) {
		moblerlog("questionpool list exists");
		return true;
	}
	moblerlog("questionpool list does not exist");
	return false;
};
