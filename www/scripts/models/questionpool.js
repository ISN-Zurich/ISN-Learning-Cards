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

//QuestionPoolModel.prototype.getAnswer = function() {
	//return (this.index > this.questionList.length - 1) ? false : this.questionList[this.index].answer;
//}; this function was replaced by the getAnswerChoice below, because our answers are multiple items

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
	return this.questionList[this.index].answer[index].score;
}

QuestionPoolModel.prototype.reset = function() {
	this.index = 0;
};

QuestionPoolModel.prototype.resetAnswer = function() {
	this.indexAnswer = 0;
};








//
//function Questionpool(id) {
//	
//	this.i = 0;
//	this.id = id;
//	this.questionIds = new Array();
//	this.currentQuestion = "";
//	this.answer = "";
//	this.feedback = "";
//	
//}
//
//Questionpool.prototype.nextQuestion = function() {
//	this.currentQuestion = this.questions[this.i].getQuestion();
//	this.answer = this.questions[this.i].getAnswer();
//	this.feedback = this.questions[this.i].getFeedback();
//	this.i = (this.i+1) % this.questions.length;
//};
//Questionpool.prototype.getCurrentQuestion = function() {return this.currentQuestion;};
//Questionpool.prototype.getAnswer = function() {return this.answer;};
//Questionpool.prototype.getFeedback = function() {return this.feedback;};
//Questionpool.prototype.addQuestion = function(question) {this.questions.push(question);};
//
//
//
//var questions = new Array();
//	
//function Question(id, question, answer, feedback) {
//	this.id = id;
//	this.question = question;
//	this.answer = answer;
//	this.feedback = feedback;
//	
//	questions.push(this);
//}
//
//Question.prototype.getId = function() {return this.id;};
//Question.prototype.getQuestion = function() {return this.question;};
//Question.prototype.getAnswer = function() {return this.answer;};
//Question.prototype.getFeedback = function() {return this.feedback;};
//
//function getQuestion(id) { 
//	for (var q in questions) {
//		if (questions[q].getId() == id) {
//			return questions[q];
//		}
//	}
//	return null;
//}
// 
//function storeQuestion(id) {
//	var qu = getQuestion(id);
//	var q = {
//		question: qu.getQuestion(),
//		answer: qu.getAnswer(),
//		feedback: qu.getFeedback()
//	};
//	eval("localStorage.question" + questions[i].getId() + "= q");
//}
//
//function storeAllQuestions() {
//	for (var i in questions) {
//		var q = {
//			question: questions[i].getQuestion(),
//			answer: questions[i].getAnswer(),
//			feedback: questions[i].getFeedback()
//		};
//		eval("localStorage.question" + questions[i].getId() + "= q");
//	}
//}