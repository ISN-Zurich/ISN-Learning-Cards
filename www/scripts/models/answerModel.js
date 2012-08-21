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

AnswerModel.prototype.getAnswers = function() {

	return this.answerList;

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
	
	questionpool.resetAnswer();
	
	var correctAnswers = 0;
	var corr_ticked = 0;
	var wrong_ticked = 0;
	
	do {
		if (questionpool.getAnswerChoiceScore() == 1) {
			correctAnswers++;
			if (this.answerList.indexOf(numberOfAnswers) != -1) {
				corr_ticked++;
				console.log("corr_ticked");
			} 
		} else {
			if (this.answerList.indexOf(numberOfAnswers) != -1) {
				wrong_ticked++;
				console.log("wrong_ticked");
			}
		}	
		console.log("nextLoop");
		numberOfAnswers++;
	} while(questionpool.nextAnswerChoice());

	console.log("Number of answers: " + numberOfAnswers);
	console.log("Correct ticked: " + corr_ticked);
	console.log("Wrong ticked: " + wrong_ticked);
	
	if ((corr_ticked + wrong_ticked) == numberOfAnswers) {
		return "Wrong";
	}
	
	if (corr_ticked == 0) {
		return "Wrong";
	}
	
	if (corr_ticked > 0 && corr_ticked < correctAnswers) {
		return "Partially Correct";
	}
	
	if (corr_ticked == correctAnswers && wrong_ticked > 0) {
		return "Partially Correct";
	}
	
	if (corr_ticked == correctAnswers && wrong_ticked == 0) {
		return "Excellent";
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

AnswerModel.prototype.deleteData = function() {
	this.answerList = [];
}