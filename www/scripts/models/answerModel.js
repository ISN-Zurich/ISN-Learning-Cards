/** 
 * The answer model holds/handles the answers of a question of every type
 */

<<<<<<< HEAD
function AnswerModel() {
	this.answerList = []; //array that will store the answers of the current question

};

/**
 * Stores the ticked-selected answers to answers array
 */

=======
// Constructor. It 
function AnswerModel() {
	this.answerList = [];
	this.answerScoreList = [];
	this.answerScore = 0;

};

>>>>>>> refs/remotes/isabella/master
AnswerModel.prototype.setAnswers = function(tickedAnswers) {
	this.answerList = tickedAnswers;
};

/**
 * Get the selected answers of the learner
 */
AnswerModel.prototype.getAnswers = function() {
	return this.answerList;
};

AnswerModel.prototype.getScoreList = function() {
	return this.answerScoreList;
};

<<<<<<< HEAD

/**
 * Get the answer resutls 
 */


AnswerModel.prototype.getAnswerResults = function() {
=======
AnswerModel.prototype.deleteData = function() {
	this.answerList = [];
	this.answerScoreList = [];
	this.answerScore = 0;
};
>>>>>>> refs/remotes/isabella/master

AnswerModel.prototype.getAnswerResults = function() {
	console.log("answer score: " + this.answerScore);
	if (this.answerScore == 1) {
		console.log("Excellent");
		return "Excellent";
	} else if (this.answerScore == 0) {
		return "Wrong";
	} else {
		return "Partially Correct";
	}
};

AnswerModel.prototype.calculateSingleChoiceScore = function() {
	var clickedAnswerIndex = this.answerList[0];

	if (controller.models["questionpool"].getScore(clickedAnswerIndex) > 0) {
		this.answerScore = 1;
	} else {
		this.answerScore = 0;
	}
};

<<<<<<< HEAD

/**
 * Calculate the answer results (excellent, wrong, partially correct) for multiple choice questions
 */

AnswerModel.prototype.getMultipleAnswerResults = function() {
=======
AnswerModel.prototype.calculateMultipleChoiceScore = function() {
>>>>>>> refs/remotes/isabella/master
	var questionpool = controller.models["questionpool"];

	var correctAnswers = questionpool.getAnswer();
	var numberOfAnswers = correctAnswers.length;

	var correctAnswers = 0;
	var corr_ticked = 0;
	var wrong_ticked = 0;

	for ( var i = 0; i < numberOfAnswers; i++) {
		console.log("answer " + i + ": " + questionpool.getScore(i));
		if (questionpool.getScore(i) > 0) {
			correctAnswers++;
			if (this.answerList.indexOf(i) != -1) {
				corr_ticked++;
				console.log("corr_ticked");
			}
		} else {
			if (this.answerList.indexOf(i) != -1) {
				wrong_ticked++;
				console.log("wrong_ticked");
			}
		}
	}

	console.log("Number of answers: " + numberOfAnswers);
	console.log("Correct ticked: " + corr_ticked);
	console.log("Wrong ticked: " + wrong_ticked);

	if ((corr_ticked + wrong_ticked) == numberOfAnswers || corr_ticked == 0) {
		// if all answers are ticked or no correct answer is ticked, we assign 0
		// to the answer score
		this.answerScore = 0;
	} else if ((corr_ticked > 0 && corr_ticked < correctAnswers)
			|| (corr_ticked == correctAnswers && wrong_ticked > 0)) {
		// if some but not all correct answers are ticked or if all correct
		// answers are ticked but also some wrong one,
		// we assign 0.5 to the answer score
		this.answerScore = 0.5;
	} else if (corr_ticked == correctAnswers && wrong_ticked == 0) {
		// if all correct answers and no wrong ones, we assign 1 to the answer
		// score
		this.answerScore = 1;
	}
};

<<<<<<< HEAD
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
=======
AnswerModel.prototype.calculateTextSortScore = function() {
>>>>>>> refs/remotes/isabella/master
	var scores = [];
	this.answerScore = 0;

	for ( var i = 0; i < this.answerList.length; i++) {

		// 1. Check for correct sequences
		var currAnswer = this.answerList[i];
		var followingIndex = i + 1;
		var followingCorrAnswers = 0;
		// count the number of items in sequence and stop if we loose the
		// sequence
		while (followingIndex < this.answerList.length
				&& this.answerList[followingIndex++] == (++currAnswer) + "") {
			followingCorrAnswers++;
			// followingIndex++;
		}

		// 2. calculate the score for all elements in a sequence
		var itemScore = 0;
		// if the item is in the correct position we assign a low score
		if (this.answerList[i] == i) {
			itemScore += 0.5;
		}
		// if the item is in a sequence, we assign a higher score
		if (followingCorrAnswers + 1 > this.answerList.length / 2) {
			itemScore += 1;
			this.answerScore = 0.5;
		}
		if (followingCorrAnswers + 1 == this.answerList.length) {
			this.answerScore = 1;
		}

		// 3. assign the score for all items in the sequence
		for ( var j = i; j <= i + followingCorrAnswers; j++) {
			scores[this.answerList[j]] = itemScore;
		}

		// 4. skip all items that we have handled already
		i = i + followingCorrAnswers;

	}
	this.answerScoreList = scores;
};

<<<<<<< HEAD

/**
 * Calculate the answer results (excellent, wrong) for numeric questions
 */

AnswerModel.prototype.getNumericAnswerResults = function() {

	var answerModel = controller.models["answers"];

=======
AnswerModel.prototype.calculateNumericScore = function() {

	var answerModel = controller.models["answers"];
>>>>>>> refs/remotes/isabella/master
	var questionpoolModel = controller.models['questionpool'];

	if (questionpoolModel.getAnswer()[0] == answerModel.getAnswers()) {
<<<<<<< HEAD
		//if the answers provided in the question pool are the same with the ones the learner selected
		returnedResult = "Excellent";
=======
		this.answerScore = 1;
>>>>>>> refs/remotes/isabella/master
	} else {
		this.answerScore = 0;
	}
<<<<<<< HEAD

	return returnedResult;
};


/**
 * Empty the answers array 
*/

AnswerModel.prototype.deleteData = function() {
	this.answerList = [];
};
=======
};

>>>>>>> refs/remotes/isabella/master
