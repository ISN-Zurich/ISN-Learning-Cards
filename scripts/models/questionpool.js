function Questionpool() {
	
	this.i = 0;
	this.questions = new Array();
	this.currentQuestion = "";
	this.answer = "";
	this.feedback = "";
	
}

Questionpool.prototype.nextQuestion = function() {
	this.currentQuestion = this.questions[this.i].getQuestion();
	this.answer = this.questions[this.i].getAnswer();
	this.feedback = this.questions[this.i].getFeedback();
	this.i = (this.i+1) % this.questions.length;
};
Questionpool.prototype.getCurrentQuestion = function() {return this.currentQuestion;};
Questionpool.prototype.getAnswer = function() {return this.answer;};
Questionpool.prototype.getFeedback = function() {return this.feedback;};
Questionpool.prototype.addQuestion = function(question) {this.questions.push(question);};



function Question(question, answer, feedback) {
	this.question = question;
	this.answer = answer;
	this.feedback = feedback;
}

Question.prototype.getQuestion = function() {return this.question;};
Question.prototype.getAnswer = function() {return this.answer;};
Question.prototype.getFeedback = function() {return this.feedback;};
