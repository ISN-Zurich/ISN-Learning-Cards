/**
 * This model holds the statistics for a question
 */
function StatisticsModel(controller) {
	this.controller = controller;

	this.allStatistics = [];
	this.currentCourseId = -1;
	this.start = -1;

	this.db;
	this.initDB();

	this.loadFromDB();
};

StatisticsModel.prototype.setCurrentCourseId = function(courseId) {
	this.currentCourseId = courseId;
	if (!this.allStatistics[courseId]) {
		this.allStatistics[courseId] = [];
	}
}

StatisticsModel.prototype.hasStarted = function() {
	return this.start != -1;
};

StatisticsModel.prototype.startTimer = function() {
	this.start = (new Date()).getTime();
};

StatisticsModel.prototype.addScore = function(questionId, score) {
	var day = new Date();
	var speed = ((new Date()).getTime() - this.start);
	var newItem = {
		"question" : questionId,
		"score" : score,
		"day" : day,
		"speed" : speed
	};
	this.allStatistics[this.currentCourseId].push(newItem);
	this.storeInDB(newItem);

	console.log("new Statistic: " + questionId + ": " + score + "(" + day
			+ ", " + speed + "ms)");

	this.resetTimer();
};

StatisticsModel.prototype.resetTimer = function() {
	this.start = -1;
};

StatisticsModel.prototype.getAverageSpeed = function() {
	if (this.allStatistics[this.currentCourseId].length > 0) {
		var overallTime = 0.0;
		for ( var s in this.allStatistics[this.currentCourseId]) {
			overallTime += this.allStatistics[this.currentCourseId][s].speed;
		}
		return (overallTime / this.allStatistics[this.currentCourseId].length) / 1000;
	}
	return 0;
};

StatisticsModel.prototype.initDB = function() {
	this.db = openDatabase('ISNLCDB', '1.0', 'ISN Learning Cards Database',
			100000);
	this.db
			.transaction(function(transaction) {
				transaction
						.executeSql(
								'CREATE TABLE IF NOT EXISTS statistics(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, course_id TEXT, question_id TEXT, day DATETIME, score INTEGER, speed INTEGER);',
								[], function() {/* nullDataHandler */
								}, function() {/* errorHandler */
								});
			});
};

StatisticsModel.prototype.storeInDB = function(data) {
	var self = this;
	this.db
			.transaction(function(transaction) {
				transaction
						.executeSql(
								'INSERT INTO statistics(course_id, question_id, day, score, speed) VALUES (?, ?, ?, ?, ?)',
								[ self.currentCourseId, data.question,
										data.day, data.score, data.speed ]);
			});
};

StatisticsModel.prototype.loadFromDB = function() {
	var self = this;
	self.allStatistics = [];
	this.db.transaction(function(transaction) {
		transaction.executeSql('SELECT * FROM statistics;', [],
				dataSelectHandler, function() {/* errorHandler */
				});
	});

	function dataSelectHandler(transaction, results) {
		for ( var i = 0; i < results.rows.length; i++) {
			row = results.rows.item(i);
			if (!self.allStatistics[row['course_id']]) {
				self.allStatistics[row['course_id']] = [];
			}
			self.allStatistics[row['course_id']].push({
				"question" : row['question_id'],
				"score" : row['score'],
				"day" : row['day'],
				"speed" : row['speed']
			});
		}

		console.log("Load from DB:");
		for ( var c in self.allStatistics) {
			for ( var q in self.allStatistics[c]) {
				console.log("Course: " + c + " Question: "
						+ self.allStatistics[c][q].question + " Score: "
						+ self.allStatistics[c][q].score);
			}
		}
	}

};