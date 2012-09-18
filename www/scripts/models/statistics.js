/**
 * This model holds the statistics for a question
 */
function StatisticsModel(controller) {
	this.controller = controller;

	this.db;
	this.initDB();

	this.currentCourseId = -1;
	this.averageScore = -1;
	this.averageSpeed = -1;
	this.bestDay;
	this.bestScore = -1;
};

StatisticsModel.prototype.setCurrentCourseId = function(courseId) {
	this.currentCourseId = courseId;

	this.averageScore = -1;
	this.averageSpeed = -1;
	this.bestDay;
	this.bestScore = -1;
	
	this.db.transaction(function(transaction) {
		transaction.executeSql(
						'SELECT * FROM statistics WHERE course_id=?',
						[ courseId],
						dataSelectHandler,
						function(tx, e) {
							console
									.log("Error for select average score: "
											+ e.message);
						});
	});
	
	function dataSelectHandler(transaction, results) {
		console.log("ALL ROWS: " + results.rows.length);
		for ( var i = 0; i < results.rows.length; i++) {
			row = results.rows.item(i);
			console.log(i + ": " + JSON.stringify(row));
		}
	}
	
	this.calculateValues();
};

StatisticsModel.prototype.getAverageScore = function() {
	return this.averageScore;
};

StatisticsModel.prototype.getAverageSpeed = function() {
	return this.averageSpeed;
};

StatisticsModel.prototype.getBestScore = function() {
	return this.bestScore;
};

StatisticsModel.prototype.getBestDay = function() {
	return this.bestDay;
};

StatisticsModel.prototype.initDB = function() {
	this.db = openDatabase('ISNLCDB', '1.0', 'ISN Learning Cards Database',
			100000);
};

StatisticsModel.prototype.calculateValues = function() {
	var today = new Date().getTime();
	var self = this;

	// using JQuery Deferred for triggering the statisticcalculationsdone event
	// only after the calculate methods are done
	$.when(self.calculateAverageScore(today),
			self.calculateAverageSpeed(today), self.calculateBestDayAndScore())
			.then(function() {
				$(document).trigger("statisticcalculationsdone");
			});
}

StatisticsModel.prototype.calculateAverageScore = function(day) {
	var dfd = $.Deferred();
	var self = this;
	console.log("course: " + self.currentCourseId);
	console.log("day: " + day);
	// returns the score and the number of answered cards of the last 24-hours
	// before the specified timestamp
	// we take the last 24-hours so that we have a constant time intervall (no
	// matter if we call this function
	// in the morning or in the evening)
	day -= 1000 * 60 * 60 * 24;
	self.db
			.transaction(function(transaction) {
				transaction
						.executeSql(
								'SELECT sum(score) as score, count(id) as num FROM statistics WHERE course_id=?'
										+ ' AND day>=?' + ' GROUP BY course_id',
								[ self.currentCourseId, day ],
								dataSelectHandler,
								function(tx, e) {
									console
											.log("Error for select average score: "
													+ e.message);
								});
			});

	function dataSelectHandler(transaction, results) {
		console.log("rows: " + results.rows.length);
		if (results.rows.length > 0) {
			row = results.rows.item(0);
			console.log("row: " + JSON.stringify(row));
			self.averageScore = Math.round((row['score'] / row['num']) * 100);
			console.log("AVERAGE SCORE: " + self.averageScore);
		}
		dfd.resolve();
	}

	return dfd.promise();
};

StatisticsModel.prototype.calculateAverageSpeed = function(day) {
	var dfd = $.Deferred();
	var self = this;
	console.log("course: " + self.currentCourseId);
	console.log("day: " + day);
	// returns the speed and the number of answered cards of the last 24-hours
	// before the specified timestamp
	// we take the last 24-hours so that we have a constant time intervall (no
	// matter if we call this function
	// in the morning or in the evening)
	day -= 1000 * 60 * 60 * 24;
	self.db
			.transaction(function(transaction) {
				transaction
						.executeSql(
								'SELECT sum(duration) as duration, count(id) as num FROM statistics WHERE course_id=?'
										+ ' AND day>=?' + ' GROUP BY course_id',
								[ self.currentCourseId, day ],
								dataSelectHandler,
								function(tx, e) {
									console
											.log("Error for select average speed: "
													+ e.message);
								});
			});

	function dataSelectHandler(transaction, results) {
		console.log("rows: " + results.rows.length);
		if (results.rows.length > 0) {
			row = results.rows.item(0);
			console.log("row: " + JSON.stringify(row));
			self.averageSpeed = Math
					.round((row['duration'] / row['num']) / 1000);
			console.log("AVERAGE SPEED: " + self.averageSpeed);
			dfd.resolve();
		}
		return dfd.promise();
	}
};

StatisticsModel.prototype.calculateBestDayAndScore = function() {
	var dfd = $.Deferred();
	var self = this;
	console.log("course: " + self.currentCourseId);
	self.db
			.transaction(function(transaction) {
				transaction
						.executeSql(
								"SELECT DATE(day/1000, 'unixepoch') as day, sum(score) as score, count(id) as num FROM statistics WHERE course_id=?"
										+ " GROUP BY DATE(day/1000, 'unixepoch')",
								[ self.currentCourseId ],
								dataSelectHandler,
								function(tx, e) {
									console
											.log("Error for select best day and score: "
													+ e.message);
								});
			});

	function dataSelectHandler(transaction, results) {
		console.log("rows: " + results.rows.length);
		var bestDay;
		var bestScore = -1;
		for ( var i = 0; i < results.rows.length; i++) {
			row = results.rows.item(i);
			console.log(JSON.stringify(row));
			score = row['score'] / row['num'];
			if (score >= bestScore) {
				day = row['day'];
				bestDay = day;
				bestScore = score;
			}
		}
		console.log("best day: " + bestDay);
		self.bestDay = bestDay;
		console.log("best score: " + bestScore);
		self.bestScore = Math.round(bestScore * 100);
		dfd.resolve();
	}
	return dfd.promise();
};