function AnswerModel() {
	this.answerList = [];

};

AnswerModel.prototype.getAnswerBody = function() {
}; // will assing a class
// with highligted
// foreground to the
// correct answers

AnswerModel.prototype.setAnswers = function(tickedAnswers) {

	this.answerList = tickedAnswers;

};

AnswerModel.prototype.getAnswerResults = function() {

	// to return the the 3 different answer results
	// excellent, partially correct, wrong
	var questionType = controller.models['questionpool'].getQuestionType();
	var clicked;

	if (questionType == "Multiple Choice Question") {
		return this.getMultipleAnswerResults();
	} else {
		return this.getSingleAnswerResults();
	}

};

// the different possible answers of each question will be stored in the local
// storage, but
// the "taped" answers of the learner will not be stored. they will be passed on
// a variable

AnswerModel.prototype.getMultipleAnswerResults = function() {
	var questionpool = controller.models["questionpool"];
	var numberOfAnswers = 0;
	var points = 0;
	
	questionpool.resetAnswer();
	
	do {
		if (questionpool.getAnswerChoiceScore() == 1 && this.answerList.indexOf(numberOfAnswers) != -1) {
			points++;
		} else if (questionpool.getAnswerChoiceScore() == 0 && this.answerList.indexOf(numberOfAnswers) == -1) {
			points++;
		}
		
		numberOfAnswers++;	
		
	} while(questionpool.nextAnswerChoice());
	
	points = points/numberOfAnswers;
	
	if (points == 1) {
		return "Excellent";
	} else if (points == 0) {
		return "Wrong";
	} else {
		return "Partially Correct";
	}
	
};

AnswerModel.prototype.getSingleAnswerResults = function() {

	var clickedAnswerIndex = this.answerList[0];
	// var correctAnswer =
	// controller.models.["questionpool"].["answer"][2].score;

	var returnedResult;

	if (controller.models["questionpool"].getScore(clickedAnswerIndex) == 1) {
		return returnedResult = "Excellent";

	} else {

		return returnedResult = "Wrong";
	}

};