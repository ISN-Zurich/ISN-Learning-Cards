/**
 * This model holds the question of an question pool
 * and a queue for the last answered questions
 */
function QuestionPoolModel(controller) {
	this.controller = controller;

	this.questionList = [];
	this.index = 0;
	this.indexAnswer = 0;

	this.reset();
	this.queue = [];
	
	//if the question list length is less than this constant,
	//the queue is not used
	this.queueConstant = 4;
	
	// this.createQuestionPools();

};

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
				+ course_id));
	} catch (err) {
		questionPoolObject = [];
	}

	if (!questionPoolObject[0]) { // if no questions are available, new ones
		// are created
		questionPoolObject = this.createPool(course_id);
	}

	this.questionList = questionPoolObject;
};

/**
 * loads the question pool from the server and stores it in the local storage
 * when all data is loaded, the questionpoolready event is triggered
 */
QuestionPoolModel.prototype.loadFromServer = function(courseId) {

	var self = this;
	jQuery
			.getJSON(
					"http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards/questions.php/"
							+ courseId, function(data) {
						console.log("success");
						console.log("JSON: " + data);
						var questionPoolObject;
						try {
							questionPoolObject = data.questions;
						} catch (err) {
							console.log("Error: Couldn't parse JSON for course"
									+ data.courseID);
							questionPoolObject = [];
						}

						// if (!questionPoolObject[0]) { // if no courses are
						// available, new ones are created
						// console.log("no questionpool loaded");
						// questionPoolObject = self.createPool(data.courseID);
						// }
						
						console.log("Object: " + questionPoolObject);
						self.questionList = questionPoolObject || [];;
						self.index = 0;
						self.storeData(data.courseID);
						$(document).trigger("questionpoolready", data.courseID);
					});
};

/**
 * removes the data for the specified course id from the local storage
 */
QuestionPoolModel.prototype.removeData = function(course_id) {
	localStorage.removeItem("questionpool_" + course_id);
};

/**
 * @return the question type of the current question
 */
QuestionPoolModel.prototype.getQuestionType = function() {
	return (this.index > this.questionList.length - 1) ? false
			: this.questionList[this.index].type;
};

/**
 * @return the question text of the current question
 */
QuestionPoolModel.prototype.getQuestionBody = function() {
	return (this.index > this.questionList.length - 1) ? false
			: this.questionList[this.index].question;
};

/**
 * @return the answer of the current question
 */
QuestionPoolModel.prototype.getAnswer = function() {
	return (this.index > this.questionList.length - 1) ? false
			: this.questionList[this.index].answer;
};

/**
 * sets the index to the index of the next question
 * a random number is created. if the random number is not the
 * same as the current index and is not an index that is stored
 * in the queue, the new index is the random number
 */
QuestionPoolModel.prototype.nextQuestion = function() {
	var random;
	
	do {
		//generates a random number between 0 and questionList.length - 1
		random = Math.floor((Math.random() * this.questionList.length));
	} while (this.index == random
			|| (this.queue.length*2 <= this.questionList.length && jQuery.inArray(
					random, this.queue) >= 0));
		 
	this.index = random;
	return this.index < this.questionList.length;
};

/**
 * puts the current index into the queue, if the length of the 
 * question list is greater than the queue constant
 */
QuestionPoolModel.prototype.queueCurrentQuestion = function() {
	if (this.questionList.length >= this.queueConstant){	
		this.queue.shift();
		this.queue.push(this.index);
	 }
}

/**
 * increases the index of the current answer
 */
QuestionPoolModel.prototype.nextAnswerChoice = function() {
	this.indexAnswer = (this.indexAnswer + 1);
	return this.indexAnswer < this.questionList[this.index].answer.length;
};

/**
 * @return the answertext of the current answer of the current question
 */
QuestionPoolModel.prototype.getAnswerChoice = function() {
	return (this.indexAnswer > this.questionList[this.index].answer.length - 1) ? false
			: this.questionList[this.index].answer[this.indexAnswer].answertext;
};

/**
 * @return the score of the current answer of the current question
 */
QuestionPoolModel.prototype.getAnswerChoiceScore = function() {
	return (this.indexAnswer > this.questionList[this.index].answer.length - 1) ? false
			: this.questionList[this.index].answer[this.indexAnswer].points;
};

/**
 * @return the score of the answer with the specified index of the current question
 */
QuestionPoolModel.prototype.getScore = function(index) {
	return (index < this.questionList[this.index].answer.length) ? this.questionList[this.index].answer[index].points
			: false;
};

/**
 * @return the correct feedback of the current question
 */
QuestionPoolModel.prototype.getCorrectFeedback = function() {
	return this.questionList[this.index].correctFeedback;
};

/**
 * @return the error feedback of the current question
 */
QuestionPoolModel.prototype.getWrongFeedback = function() {
	return this.questionList[this.index].errorFeedback;
};

/**
 * resets the queue and the question index
 */
QuestionPoolModel.prototype.reset = function() {
	this.queue = [ "-1", "-1", "-1" ];
	this.index = 0;
};

/**
 * resets the answer index
 */
QuestionPoolModel.prototype.resetAnswer = function() {
	this.indexAnswer = 0;
};

/**
 * creates 2 questionpools with index 1 and 2
 */
QuestionPoolModel.prototype.createQuestionPools = function() {
	this.createPool(1);
	this.createPool(2);
};

/**
 * if course_id is 1 or 2 and no questionpools with those indices
 * are already stored in the local storage, new ones are created 
 */
QuestionPoolModel.prototype.createPool = function(course_id) {
	if (course_id == 1) {
		if (!localStorage.questionpool_1) {
			initQuPo1();
		}
		try {
			return JSON.parse(localStorage.getItem("questionpool_1"));
		} catch (err) {
			return [];
		}

	} else if (course_id == 2) { 
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

<<<<<<< HEAD
QuestionPoolModel.prototype.queueCurrentQuestion = function() {
	var constant = 10;
	
	if (this.questionList.length >= constant)
	 {	
		
	this.queue.shift();
	this.queue.push(this.index);
	 }
}

QuestionPoolModel.prototype.createQuestionPools = function() {
	this.createPool(1);
	this.createPool(2);
};

QuestionPoolModel.prototype.loadFromServer = function(courseId) {

	var self = this;
	jQuery
			.getJSON(
					"http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards/questions.php/"
							+ courseId, function(data) {
						console.log("success");
						console.log("JSON: " + data);
						var questionPoolObject;
						try {
							questionPoolObject = data.questions; // JSON.parse(data);
							// controller.models["courses"].courseLoaded(data.courseID);
						} catch (err) {
							console.log("Error: Couldn't parse JSON for course"
									+ data.courseID);
							questionPoolObject = [];
						}

						// if (!questionPoolObject[0]) { // if no courses are
						// available, new ones are created
						// console.log("no questionpool loaded");
						// questionPoolObject = self.createPool(data.courseID);
						// }
						if (questionPoolObject[0]) {
							console.log("Object: " + questionPoolObject);
							self.questionList = questionPoolObject;
							self.index = 0;
							self.storeData(data.courseID);
							$(document).trigger("questionpoolready",
									data.courseID);
						}
					});
};
=======
>>>>>>> refs/remotes/isabella/master
