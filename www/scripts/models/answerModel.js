/**	THIS COMMENT MUST NOT BE REMOVED

Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file 
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0  or see LICENSE.txt

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.	


*/


/** @author Isabella Nake
 * @author Evangelia Mitsopoulou

*/

var DB_VERSION = 1;


//The answer model holds/handles the answers of a question of every type

function AnswerModel() {
	this.answerList = [];
	this.answerScoreList = [];
	this.answerScore = -1;

	this.currentCourseId = -1;
	this.currentQuestionId = -1;
	this.start = -1;

	this.db = openDatabase('ISNLCDB', '1.0', 'ISN Learning Cards Database',
			100000);
	if (!localStorage.getItem("db_version")) {
		this.initDB();
	}

};

//sets the answer list
 
AnswerModel.prototype.setAnswers = function(tickedAnswers) {
	this.answerList = tickedAnswers;
};


//Get the selected answers of the learner

AnswerModel.prototype.getAnswers = function() {
	return this.answerList;
};

// @return the score list

AnswerModel.prototype.getScoreList = function() {
	return this.answerScoreList;
};


//deletes the data

AnswerModel.prototype.deleteData = function() {
	this.answerList = [];
	this.answerScoreList = [];
	this.answerScore = -1;
};

 // @return if answer score is 1 Execellent  
 // @return if answer score is 0 Wrong
 // otherwise PariallyCorrect
 
AnswerModel.prototype.getAnswerResults = function() {
	//console.log("answer score: " + this.answerScore);
	if (this.answerScore == 1) {
		//console.log("Excellent");
		return "Excellent";
	} else if (this.answerScore == 0) {
		return "Wrong";
	} else {
		return "PartiallyCorrect";
	}
};

//calculate the score for single choice questions
 
AnswerModel.prototype.calculateSingleChoiceScore = function() {
	var clickedAnswerIndex = this.answerList[0];

	if (controller.models["questionpool"].getScore(clickedAnswerIndex) > 0) {
		this.answerScore = 1;
	} else {
		this.answerScore = 0;
	}
};

//calculate the score for multiple choice questions

AnswerModel.prototype.calculateMultipleChoiceScore = function() {

	var questionpool = controller.models["questionpool"];

	var correctAnswers = questionpool.getAnswer();
	var numberOfAnswers = correctAnswers.length;

	var correctAnswers = 0;
	var corr_ticked = 0;
	var wrong_ticked = 0;

	for ( var i = 0; i < numberOfAnswers; i++) {
		//console.log("answer " + i + ": " + questionpool.getScore(i));
		if (questionpool.getScore(i) > 0) {
			correctAnswers++;
			if (this.answerList.indexOf(i) != -1) {
				corr_ticked++;
				//console.log("corr_ticked");
			}
		} else {
			if (this.answerList.indexOf(i) != -1) {
				wrong_ticked++;
				//console.log("wrong_ticked");
			}
		}
	}

	//console.log("Number of answers: " + numberOfAnswers);
	//console.log("Correct ticked: " + corr_ticked);
	//console.log("Wrong ticked: " + wrong_ticked);

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

//Calculate the score for text sorting questions

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

//Calculate the answer score for numeric questions

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


//sets the course id
 
AnswerModel.prototype.setCurrentCourseId = function(courseId) {
	this.currentCourseId = courseId;
};

//starts the timer for the specified question

AnswerModel.prototype.startTimer = function(questionId) {
	this.start = (new Date()).getTime();
	this.currentQuestionId = questionId;
	//console.log("currentQuestionId: " + this.currentQuestionId);
};


//@return true, if timer has started, otherwise false
 
AnswerModel.prototype.hasStarted = function() {
	return this.start != -1;
};

//resets the timer
 
AnswerModel.prototype.resetTimer = function() {
	this.start = -1;
};

//creates a statistics table in the database if it doesn't exist yet
 
AnswerModel.prototype.initDB = function() {
	this.db
			.transaction(function(transaction) {
				transaction
						.executeSql(
								'CREATE TABLE IF NOT EXISTS statistics(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, course_id TEXT, question_id TEXT, day INTEGER, score NUMERIC, duration INTEGER);',
								[]);
							});
	localStorage.setItem("db_version", DB_VERSION);
};

//inserts the score into the database

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
									//console.log("successfully inserted");
									$(document).trigger("checkachievements", self.currentCourseId);
								}, function(tx, e) {
									//console.log("error! NOT inserted: "+ e.message);
								});
			});

	this.resetTimer();
	
	
};

//deletes everything from the statistics table
AnswerModel.prototype.deleteDB = function() {
	localStorage.removeItem("db_version");
	this.db.transaction(function(tx) {
		tx.executeSql("DELETE FROM statistics", [], function() {
			//console.log("statistics table cleared");
		}, function() {
			//console.log("error: statistics table not cleared");
		});
	});
};


AnswerModel.prototype.calculateScore = function () {
	var questionpoolModel = controller.models['questionpool'];
	var questionType = questionpoolModel.getQuestionType();
	switch (questionType) {
	case 'assSingleChoice':
		this.calculateSingleChoiceScore();
		break;
	case 'assMultipleChoice':
		this.calculateMultipleChoiceScore();
		break;
	case 'assOrderingQuestion':
		this.calculateTextSortScore();
		break;
	case 'assNumeric':
		this.calculateNumericScore();
		break;
	default:
		break;
	}
	
};
