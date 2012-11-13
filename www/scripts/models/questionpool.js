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
 *  - a flag that specify if the current answer items are mixed or not
 *  - a queue that holds the most recently answered questions
 * It resets the current question pool by emptying the queue and setting the question id to zero 
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

	// this.createQuestionPools();

}


/**
 * stores the data into the local storage (key = "questionpool_[course_id]")
 * therefore the questionlist is converted into a string
 * @prototype
 * @function storeData
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
 * loads the data from the local storage (key = "questionpool_[course_id]")
 * therefor the string is converted into an array
 * @prototype
 * @function loadData
 * */
QuestionPoolModel.prototype.loadData = function(course_id) {
	var questionPoolObject;
	try {
		questionPoolObject = JSON.parse(localStorage.getItem("questionpool_"
				+ course_id))
				|| [];
	} catch (err) {
		questionPoolObject = [];
	}

	this.questionList = questionPoolObject;
	this.reset();
};


/**
 * loads the question pool from the server and stores it in the local storage
 * when all data is loaded, the questionpoolready event is triggered
 * @prototype
 * @function loadFromServer
 */
QuestionPoolModel.prototype.loadFromServer = function(courseId) {

	var self = this;

	$
			.ajax({
				url : self.controller.models['authentication'].urlToLMS + "/questions.php/"
						+ courseId,
				type : 'GET',
				dataType : 'json',
				success : function(data) {
					moblerlog("success");
					
					//if this was an pending question pool, remove it from the storage
					localStorage.removeItem("pendingQuestionPool" + courseId);
					if (data) {
                    moblerlog("JSON: " + data);
						var questionPoolObject;
						
						questionPoolObject = data.questions;				
						if (!questionPoolObject) {
							questionPoolObject = [];
						}
                        moblerlog("Object: " + questionPoolObject);
						
						var questionPoolString;
						try {
							questionPoolString = JSON.stringify(questionPoolObject);
						} catch (err) {
							questionPoolString = "";
						}
						localStorage.setItem("questionpool_" +  data.courseID, questionPoolString);
						
                  		$(document).trigger("questionpoolready", data.courseID);
					}
				},
				error : function() {
					
					//if there was an error while sending the request,
					//store the course id for the question pool in the local storage
					localStorage.setItem("pendingQuestionPool_" + courseId, true);
					console
							.log("Error while loading question pool from server");
				},
				beforeSend : setHeader
			});

	function setHeader(xhr) {
		xhr.setRequestHeader('sessionkey',
				self.controller.models['authentication'].getSessionKey());
	}

};



/**
 * removes the data for the specified course id from the local storage
 * @prototype
 * @function removeData
 */
QuestionPoolModel.prototype.removeData = function(course_id) {
	localStorage.removeItem("questionpool_" + course_id);
};


/**
 * @prototype
 * @function getQuestionType
 * @return activeQuestion.type, the question type of the current question
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
 * @return activeQuestion.answer, the answer of the current question
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
 * @return{Boolean} true if the current answers are mixed, otherwise false
 */
QuestionPoolModel.prototype.currAnswersMixed = function() {
	return this.currentAnswersAreMixed;
};


/**
 * Mixes the answer items of the current question and sets as true the flag (=currentAnsweredAreMixed)
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
		// answers array the next element as random number
		while (this.mixedAnswers.indexOf(random) !== -1) {
			random = (++random) % answers.length;
		}

		this.mixedAnswers.push(random);
	}
	this.currentAnswersAreMixed = true;
};

/**
 * sets the id to the id of the next question a random number is created. if the
 * random number is not the same as the current id and is not an id that is
 * stored in the queue, the new id is the random number
 * @prototype
 * @function nextQuestion
 */
QuestionPoolModel.prototype.nextQuestion = function() {
	var random;
	var newId;

	do {
		// generates a random number between 0 and questionList.length - 1
		random = Math.floor((Math.random() * this.questionList.length));
		newId = this.questionList[random].id;
		moblerlog("New ID: " + newId);
	} while (this.id === newId
			|| (this.queue.length * 2 <= this.questionList.length && jQuery
					.inArray(newId, this.queue) >= 0));

	this.id = newId;

	this.activeQuestion = this.questionList[random];
	this.currentAnswersAreMixed = false;
	return this.id < this.questionList.length;
};

/**
 * puts the current id into the queue, if the length of the question list is
 * greater than the queue constant
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
 * increases the index of the current answer
 * greater than the queue constant
 * @prototype
 * @function nextAnswerChoice
 */
QuestionPoolModel.prototype.nextAnswerChoice = function() {
	this.indexAnswer = (this.indexAnswer + 1);
	return this.indexAnswer < this.activeQuestion.answer.length;
};


/**
 * @prototype
 * @function getAnswerChoice
 * @return answertext of the current answer of the current question
 */

QuestionPoolModel.prototype.getAnswerChoice = function() {
	return this.activeQuestion.answer[this.indexAnswer].answertext;
};


/**
 * @prototype
 * @function getAnswerChoiceScore
 * @return {Number} points, the score of the current answer of the current question
 */
QuestionPoolModel.prototype.getAnswerChoiceScore = function() {
	return this.activeQuestion.answer[this.indexAnswer].points;
};

/**
 * @prototype
 * @function getScore
 * @return {Number} points,  the score of the answer with the specified index of the current question
 * @return -1 if anything goes wrong and no index is specified for the answer
 * */
QuestionPoolModel.prototype.getScore = function(index) {
	if (index >= 0 && index < this.activeQuestion.answer.length) { 
		return this.activeQuestion.answer[index].points;
	}
    return -1;
};


/**
 * @prototype
 * @function getCorrectFeedback
 * @return {String} correctFeedback, the correct feedback of the current question
 */
QuestionPoolModel.prototype.getCorrectFeedback = function() {
	return this.activeQuestion.correctFeedback;
};


 
/**
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
 * Resets the queue, the question id and the active question.
 * It sets the flag for the mixing of answers to be false. 
 * @prototype
 * @function reset
 */ 
QuestionPoolModel.prototype.reset = function() {
	this.queue = [ "-1", "-1", "-1" ];
	this.id = 0;
	this.activeQuestion = {};
	this.currentAnswersAreMixed = false;
	if (this.questionList.length > 0) {
		this.nextQuestion();
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


