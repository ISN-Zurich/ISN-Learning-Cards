var DB_VERSION = 1;

/**
 * The answer model holds/handles the answers of a question of every type
 */
// Constructor. It
function AnswerModel() {
	this.answerList = [];
	this.answerScoreList = [];
	this.answerScore = 0;

	this.currentCourseId = -1;
	this.currentQuestionId = -1;
	this.start = -1;

	this.db = openDatabase('ISNLCDB', '1.0', 'ISN Learning Cards Database',
			100000);
	if (!localStorage.getItem("db_version")) {
		// this.deleteDB();
		this.initDB();
	}

	// alter the date structure
//	this.db.transaction(function(tx) {
		// tx.executeSql("ALTER TABLE statistics CHANGE day timestamp
		// DATETIME");
		// tx.executeSql("ALTER TABLE statistics ADD day DATE");

		// get all wrong timestamps
		// generate proper timestamp
		// update table with correct data for timestamp
//		var update = "";
//		tx
//				.executeSql('SELECT id, day FROM statistics WHERE course_id="12984"',
//						[], function dataSelectHandler(transaction,
//								results) {
//							console.log("ALL ROWS: " + results.rows.length);
//							for ( var i = 0; i < results.rows.length; i++) {
//								row = results.rows.item(i);
//								console.log(i + ": " + JSON.stringify(row));
//								var timestamp = Date.parse(row['day']);
//								console.log("NEW DAY: " + timestamp);
//								tx
//								.executeSql("UPDATE statistics SET day=" + timestamp + " WHERE id=" + row['id'] + ";", [], function() {
//									console.log("successfully updated");
//								}, function(tx, e) {
//									console.log("error! NOT updated: "
//											+ e.message);
//								});
//							}
//						}, function(tx, e) {
//							console.log("Error for select average score: "
//									+ e.message);
//						});
//		
//
//	});

};

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

AnswerModel.prototype.deleteData = function() {
	this.answerList = [];
	this.answerScoreList = [];
	this.answerScore = 0;
};

AnswerModel.prototype.getAnswerResults = function() {
	console.log("answer score: " + this.answerScore);
	if (this.answerScore == 1) {
		console.log("Excellent");
		return "Excellent";
	} else if (this.answerScore == 0) {
		return "Wrong";
	} else {
		return "PartiallyCorrect";
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

AnswerModel.prototype.calculateMultipleChoiceScore = function() {

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

/**
 * Calculate the scoring for text sorting questions
 */
AnswerModel.prototype.calculateTextSortScore = function() {

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

/**
 * Calculate the answer results (excellent, wrong) for numeric questions
 */
AnswerModel.prototype.calculateNumericScore = function() {

	var answerModel = controller.models["answers"];
	var questionpoolModel = controller.models['questionpool'];

	if (questionpoolModel.getAnswer()[0] == answerModel.getAnswers()) {
		// if the answers provided in the question pool are the same with the
		// ones the learner selected
		this.answerScore = 1;
	} else {
		this.answerScore = 0;
	}

};

AnswerModel.prototype.setCurrentCourseId = function(courseId) {
	this.currentCourseId = courseId;
};

AnswerModel.prototype.startTimer = function(questionId) {
	this.start = (new Date()).getTime();
	this.currentQuestionId = questionId;
	console.log("currentQuestionId: " + this.currentQuestionId);
};

AnswerModel.prototype.hasStarted = function() {
	return this.start != -1;
};

AnswerModel.prototype.resetTimer = function() {
	this.start = -1;
};

AnswerModel.prototype.initDB = function() {
	this.db
			.transaction(function(transaction) {
				transaction
						.executeSql(
								'CREATE TABLE IF NOT EXISTS statistics(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, course_id TEXT, question_id TEXT, day DATETIME, score INTEGER, duration INTEGER);',
								[]);
				// transaction.executeSql(
				// 'CREATE TABLE IF NOT EXISTS statistics(id INTEGER NOT NULL
				// PRIMARY KEY AUTOINCREMENT, course_id TEXT, question_id TEXT,
				// timestamp DATETIME, day DATE, score INTEGER, duration
				// INTEGER);',
				// []);
			});
	localStorage.setItem("db_version", DB_VERSION);
};

AnswerModel.prototype.storeScoreInDB = function() {
	var self = this;
	var day = new Date();
	var duration = ((new Date()).getTime() - this.start);
	// var day = timestamp.toISOString().substring(0,9);
	this.db
			.transaction(function(transaction) {
				transaction
						.executeSql(
								'INSERT INTO statistics(course_id, question_id, day, score, duration) VALUES (?, ?, ?, ?, ?)',
								[ self.currentCourseId, self.currentQuestionId,
										day.getTime(), self.answerScore, duration ],
								function() {
									console.log("successfully inserted");
								}, function(tx, e) {
									console.log("error! NOT inserted: "
											+ e.message);
								});
			});

	this.resetTimer();
};

AnswerModel.prototype.deleteDB = function() {
	this.db.transaction(function(tx) {
		tx.executeSql("DROP TABLE statistics", [], function() {
		}, function() {
		});
	});
};