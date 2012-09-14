/** 
 * The answer model holds/handles the answers of a question of every type
 */

function AnswerModel() {
	this.answerList = []; //array that will store the answers of the current question

};

/**
 * Stores the ticked-selected answers to answers array
 */

AnswerModel.prototype.setAnswers = function(tickedAnswers) {

	this.answerList = tickedAnswers;

};

/**
 * Get the selected answers of the learner
 */
AnswerModel.prototype.getAnswers = function() {

	return this.answerList;

};


/**
 * Get the answer resutls 
 */


AnswerModel.prototype.getAnswerResults = function() {

	// to return the the 3 different answer results
	// excellent, partially correct, wrong
	var questionType = controller.models['questionpool'].getQuestionType();

	switch (questionType) {

	case 'assSingleChoice':
		return this.getSingleAnswerResults();
		break;
	case 'assMultipleChoice':
		return this.getMultipleAnswerResults();
		break;
	case 'assNumeric':
		return this.getNumericAnswerResults();
		break;
	case 'assOrderingQuestion':
		return this.getTextSortAnswerResults();
		break;
	default:
		break;
	}

};


/**
 * Calculate the answer results (excellent, wrong, partially correct) for multiple choice questions
 */

AnswerModel.prototype.getMultipleAnswerResults = function() {
	var questionpool = controller.models["questionpool"];
	var numberOfAnswers = 0;

	questionpool.resetAnswer();

	var correctAnswers = 0;
	var corr_ticked = 0;
	var wrong_ticked = 0;

	do {
		if (questionpool.getAnswerChoiceScore() > 0) {
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
	} while (questionpool.nextAnswerChoice());

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

/**
 * Calculate the answer results (excellent, wrong) for single choice questions
 */

AnswerModel.prototype.getSingleAnswerResults = function() {

	var clickedAnswerIndex = this.answerList[0];
	// var correctAnswer =
	// controller.models.["questionpool"].["answer"][2].score;

	var returnedResult;

	if (clickedAnswerIndex && clickedAnswerIndex < 0) {
		returnedResult = "Wrong";
	} else if (controller.models["questionpool"].getScore(clickedAnswerIndex) > 0) {
		returnedResult = "Excellent";
	} else {
		returnedResult = "Wrong";
	}
	console.log('XX ' + returnedResult);
	return returnedResult;
};


/**
 * Calculate the answer results (excellent,partially correct wrong) for text sorting questions based on scoring 
 */

AnswerModel.prototype.getTextSortAnswerResults = function() {
	var scores = this.getTextSortScoreArray();

	if (scores.indexOf("0.5") == -1 && scores.indexOf("0") == -1
			&& scores.indexOf("1") == -1) {
		return "Excellent";
	} else if (scores.indexOf("1.5") == -1 && scores.indexOf("0.5") == -1) {
		return "Wrong";
	} else {
		return "Partially Correct";
	}
};



/**
 * Calculate the scoring for text sorting questions
 */
AnswerModel.prototype.getTextSortScoreArray = function() {
	var scores = [];
	var corr = false;
	for ( var i = 0; i < this.answerList.length; i++) {
		if (this.answerList[i] == i) {
			corr = true;
		}
		var currIndex = this.answerList[i];
		var followingIndex = i + 1;
		var followingCorrAnswers = 0;
		while (followingIndex < this.answerList.length
				&& this.answerList[followingIndex] == (++currIndex) + "") {
			followingCorrAnswers++;
			followingIndex++;
		}
		if (followingCorrAnswers + 1 > this.answerList.length / 2) {
			for ( var j = i; j <= i + followingCorrAnswers; j++) {
				if (corr) {
					scores[this.answerList[j]] = "1.5";
				} else {
					scores[this.answerList[j]] = "0.5";
				}
			}
		} else {
			for ( var j = i; j <= i + followingCorrAnswers; j++) {
				if (corr) {
					scores[this.answerList[j]] = "1";
				} else {
					scores[this.answerList[j]] = "0";
				}
			}1
		}
		i = i + followingCorrAnswers;
		corr = false;

	}
	return scores;
};


/**
 * Calculate the answer results (excellent, wrong) for numeric questions
 */

AnswerModel.prototype.getNumericAnswerResults = function() {

	var answerModel = controller.models["answers"];

	var questionpoolModel = controller.models['questionpool'];

	var returnedResult;

	if (questionpoolModel.getAnswer()[0] == answerModel.getAnswers()) {
		//if the answers provided in the question pool are the same with the ones the learner selected
		returnedResult = "Excellent";
	} else {
		returnedResult = "Wrong";
	}

	return returnedResult;
};


/**
 * Empty the answers array 
*/

AnswerModel.prototype.deleteData = function() {
	this.answerList = [];
};