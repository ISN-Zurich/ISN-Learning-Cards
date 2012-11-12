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


/**
 * This model holds the question of an question pool and a queue for the last
 * answered questions
 */
/*jslint vars: true, sloppy: true */

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
 * therefor the questionlist is converted into a string
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
 */
QuestionPoolModel.prototype.loadData = function(course_id) {
	var questionPoolObject;
	try {
		questionPoolObject = JSON.parse(localStorage.getItem("questionpool_"
				+ course_id))
				|| [];
	} catch (err) {
		questionPoolObject = [];
	}

	// if (!questionPoolObject[0]) { // if no questions are available, new ones
	// are created
	// questionPoolObject = this.createPool(course_id);
	// }

	this.questionList = questionPoolObject;
	this.reset();
};

/**
 * loads the question pool from the server and stores it in the local storage
 * when all data is loaded, the questionpoolready event is triggered
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
						

						// if (!questionPoolObject[0]) { // if no courses are
						// available, new ones are created
						moblerlog("no questionpool loaded");
						// questionPoolObject = self.createPool(data.courseID);
						// }
						
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
						
                    //self.questionList = questionPoolObject || [];
                    //self.reset();
                    //self.storeData(data.courseID);
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

 //removes the data for the specified course id from the local storage

QuestionPoolModel.prototype.removeData = function(course_id) {
	localStorage.removeItem("questionpool_" + course_id);
};

// @return the question type of the current question

QuestionPoolModel.prototype.getQuestionType = function() {
	return this.activeQuestion.type;
};

//@return the question text of the current question

QuestionPoolModel.prototype.getQuestionBody = function() {
	return this.activeQuestion.question;
};

// @return the answer of the current question

QuestionPoolModel.prototype.getAnswer = function() {
	return this.activeQuestion.answer;
};

 // @return the array that contains the mixed answers

QuestionPoolModel.prototype.getMixedAnswersArray = function() {
	return this.mixedAnswers;
};

/**
 * @return true if the current answers are mixed,
 * otherwise false
 */
QuestionPoolModel.prototype.currAnswersMixed = function() {
	return this.currentAnswersAreMixed;
};

QuestionPoolModel.prototype.mixAnswers = function() {
	var answers = this.activeQuestion.answer;
	this.mixedAnswers = [];
	while (this.mixedAnswers.length < answers.length) {
		var random = Math.floor((Math.random() * answers.length));

		// if the current random number is already in the mixed
		// answers
		// array
		// the the next element as random number
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
	// for (var q in this.questionList) {
	// if (this.questionList[q].id == this.id) {
	// this.activeQuestion = this.questionList[q];
	// }
	// }

	return this.id < this.questionList.length;
};

/**
 * puts the current id into the queue, if the length of the question list is
 * greater than the queue constant
 */
QuestionPoolModel.prototype.queueCurrentQuestion = function() {
	if (this.questionList.length >= this.queueConstant) {
		this.queue.shift();
		this.queue.push(this.id);
	}
};

//increases the index of the current answer

QuestionPoolModel.prototype.nextAnswerChoice = function() {
	this.indexAnswer = (this.indexAnswer + 1);
	return this.indexAnswer < this.activeQuestion.answer.length;
};

//@return the answertext of the current answer of the current question
 
QuestionPoolModel.prototype.getAnswerChoice = function() {
	return this.activeQuestion.answer[this.indexAnswer].answertext;
};

// @return the score of the current answer of the current question
 
QuestionPoolModel.prototype.getAnswerChoiceScore = function() {
	return this.activeQuestion.answer[this.indexAnswer].points;
};

//@return the score of the answer with the specified index of the current question
 
QuestionPoolModel.prototype.getScore = function(index) {
	if (index >= 0 && index < this.activeQuestion.answer.length) { //index && 
		return this.activeQuestion.answer[index].points;
	}
    return -1;
};

// @return the correct feedback of the current question

QuestionPoolModel.prototype.getCorrectFeedback = function() {
	return this.activeQuestion.correctFeedback;
};


// @return the error feedback of the current question

QuestionPoolModel.prototype.getWrongFeedback = function() {
	return this.activeQuestion.errorFeedback;
};

//@return the id of the current question
 
QuestionPoolModel.prototype.getId = function() {
	return this.activeQuestion.id;
};


//resets the queue and the question id
 
QuestionPoolModel.prototype.reset = function() {
	this.queue = [ "-1", "-1", "-1" ];
	this.id = 0;
	this.activeQuestion = {};
	this.currentAnswersAreMixed = false;
	if (this.questionList.length > 0) {
		this.nextQuestion();
	}
};

//resets the answer index
 
QuestionPoolModel.prototype.resetAnswer = function() {
	this.indexAnswer = 0;
};

// creates 2 questionpools with index 1 and 2

QuestionPoolModel.prototype.createQuestionPools = function() {
	this.createPool(1);
	this.createPool(2);
};

/**
 * if course_id is 1 or 2 and no questionpools with those indices are already
 * stored in the local storage, new ones are created
 */
QuestionPoolModel.prototype.createPool = function(course_id) {
	if (course_id === 1) {
		if (!localStorage.questionpool_1) {
			initQuPo1();
		}
		try {
			return JSON.parse(localStorage.getItem("questionpool_1"));
		} catch (err) {
			return [];
		}

	} else if (course_id === 2) {
		// if no questions are available, new ones are created
		if (!localStorage.questionpool_2) {
			initQuPo2();
		}

		try {
			return JSON.parse(localStorage.getItem("questionpool_2"));
		} catch (err) {
			return [];
		}
	}
};
