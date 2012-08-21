function QuestionPoolModel() {
	this.questionList = [];
	this.index = 0;
	this.indexAnswer = 0;
	
};

QuestionPoolModel.prototype.storeData = function(course_id) {
	var questionPoolString;
	try {
		questionPoolString = JSON.stringify(this.questionList);
	} catch(err) {
		questionPoolString = "";
	}
	localStorage.setItem("questionpool_" + course_id, questionPoolString);
};

QuestionPoolModel.prototype.loadData = function(course_id) {
	var questionPoolObject;
	try {
		questionPoolObject = JSON.parse(localStorage.getItem("questionpool_" + course_id));
	} catch(err) {
		questionPoolObject = [];
	}
	
	if (!questionPoolObject[0]) { //if no questions are available, new ones are created
		questionPoolObject = this.createQuPo(course_id);			
	}
	
	this.questionList = questionPoolObject;
};

QuestionPoolModel.prototype.removeData = function(course_id) {
	localStorage.removeItem("questionpool_" + course_id);
};

QuestionPoolModel.prototype.getQuestionType = function() {
	return (this.index > this.questionList.length - 1) ? false : this.questionList[this.index].type;
};

QuestionPoolModel.prototype.getQuestionBody = function() {
	return (this.index > this.questionList.length - 1) ? false : this.questionList[this.index].question;
};

QuestionPoolModel.prototype.getAnswer = function() {
	return (this.index > this.questionList.length - 1) ? false : this.questionList[this.index].answer;
}; 

QuestionPoolModel.prototype.nextQuestion = function() {
	this.index = (this.index + 1) % this.questionList.length;
	return this.index < this.questionList.length;
};


//to define a method nextAnswerChoice (). it will read all the possible answers of each question. 
//either single choice or multiple choice question
QuestionPoolModel.prototype.nextAnswerChoice = function() {
this.indexAnswer = (this.indexAnswer + 1);
return this.indexAnswer < this.questionList[this.index].answer.length;
};

QuestionPoolModel.prototype.getAnswerChoice = function() {
	return (this.indexAnswer > this.questionList[this.index].answer.length - 1) ? false : this.questionList[this.index].answer[this.indexAnswer].text;
};

QuestionPoolModel.prototype.getAnswerChoiceScore = function() {
	return (this.indexAnswer > this.questionList[this.index].answer.length - 1) ? false : this.questionList[this.index].answer[this.indexAnswer].score;
};

QuestionPoolModel.prototype.getScore = function(index) {
	return (index > this.questionList[this.index].answer.length - 1) ? false : this.questionList[this.index].answer[index].score;
};


QuestionPoolModel.prototype.getCorrectFeedback = function() {
	return this.questionList[this.index].correctFeedback;
};

QuestionPoolModel.prototype.getWrongFeedback = function() {
	return this.questionList[this.index].errorFeedback;
};

QuestionPoolModel.prototype.reset = function() {
	this.index = 0;
};

QuestionPoolModel.prototype.resetAnswer = function() {
	this.indexAnswer = 0;
};


QuestionPoolModel.prototype.createQuPo = function(course_id) {
	if (course_id == 1) {
		initQuPo1();
		try {
			return JSON.parse(localStorage.getItem("questionpool_1"));
		} catch(err) {
			return [];
		}
	} else if (course_id == 2) { //if no questions are available, new ones are created
		initQuPo2();		
		try {
			return JSON.parse(localStorage.getItem("questionpool_2"));
		} catch(err) {
			return [];
		}
	}
};
