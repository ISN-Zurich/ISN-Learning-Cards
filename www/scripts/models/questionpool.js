function QuestionPoolModel(controller) {
	this.controller = controller;

	this.questionList = [];
	this.indexAnswer = 0;

	this.reset();
	this.queue = [];

	// this.createQuestionPools();

};

QuestionPoolModel.prototype.storeData = function(course_id) {
	var questionPoolString;
	try {
		questionPoolString = JSON.stringify(this.questionList);
	} catch (err) {
		questionPoolString = "";
	}
	localStorage.setItem("questionpool_" + course_id, questionPoolString);
};

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

QuestionPoolModel.prototype.removeData = function(course_id) {
	localStorage.removeItem("questionpool_" + course_id);
};

QuestionPoolModel.prototype.getQuestionType = function() {
	return (this.index > this.questionList.length - 1) ? false
			: this.questionList[this.index].type;
};

QuestionPoolModel.prototype.getQuestionBody = function() {
	return (this.index > this.questionList.length - 1) ? false
			: this.questionList[this.index].question;
};

QuestionPoolModel.prototype.getAnswer = function() {
	return (this.index > this.questionList.length - 1) ? false
			: this.questionList[this.index].answer;
};

QuestionPoolModel.prototype.nextQuestion = function() {
	// this.index = (this.index + 1) % this.questionList.length;
	var random;
	
	
	do {

		random = Math.floor((Math.random() * this.questionList.length)); // random

		// number
		// between
		// 0
		// and
		// (this.questionList.length
		// - 1)
	} while (this.index == random
			|| (this.queue.length*2 <= this.questionList.length && jQuery.inArray(
					random, this.queue) >= 0));
	// remove the oldest item from the queue and add the current index to the
	// queue
	

	 
	this.index = random;
	return this.index < this.questionList.length;
   

};

// to define a method nextAnswerChoice (). it will read all the possible answers
// of each question.
// either single choice or multiple choice question
QuestionPoolModel.prototype.nextAnswerChoice = function() {
	this.indexAnswer = (this.indexAnswer + 1);
	return this.indexAnswer < this.questionList[this.index].answer.length;
};

QuestionPoolModel.prototype.getAnswerChoice = function() {
	return (this.indexAnswer > this.questionList[this.index].answer.length - 1) ? false
			: this.questionList[this.index].answer[this.indexAnswer].answertext;
};

QuestionPoolModel.prototype.getAnswerChoiceScore = function() {
	return (this.indexAnswer > this.questionList[this.index].answer.length - 1) ? false
			: this.questionList[this.index].answer[this.indexAnswer].points;
};

QuestionPoolModel.prototype.getScore = function(index) {
	return (index < this.questionList[this.index].answer.length) ? this.questionList[this.index].answer[index].points
			: false;
};

QuestionPoolModel.prototype.getCorrectFeedback = function() {
	return this.questionList[this.index].correctFeedback;
};

QuestionPoolModel.prototype.getWrongFeedback = function() {
	return this.questionList[this.index].errorFeedback;
};

QuestionPoolModel.prototype.reset = function() {
	this.queue = [ "-1", "-1", "-1" ];
	this.index = 0;
};

QuestionPoolModel.prototype.resetAnswer = function() {
	this.indexAnswer = 0;
};

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

	} else if (course_id == 2) { // if no questions are available, new ones
		// are created
		initQuPo2();

	} else if (course_id == 2) { // if no questions are available, new ones
		// are created
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