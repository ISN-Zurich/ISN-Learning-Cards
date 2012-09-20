/**
 * This model holds the statistics for a question
 */
function StatisticsModel(controller) {
	this.controller = controller;

	this.db = openDatabase('ISNLCDB', '1.0', 'ISN Learning Cards Database',
			100000);

	this.currentCourseId = -1

	this.statistics = [];
	this.statistics['handledCards'] = -1;
	this.statistics['progress'] = -1;
	this.statistics['averageScore'] = -1;
	this.statistics['averageSpeed'] = -1;
	this.statistics['bestDay'];
	this.statistics['bestScore'] = -1;
	this.statistics['stackHandler'] = -1;
	this.statistics['cardBurner']

	this.improvement = [];
	this.improvement['handledCards'] = 0;
	this.improvement['progress'] = 0;
	this.improvement['averageScore'] = 0;
	this.improvement['averageSpeed'] = 0;

	this.queries = [];
	this.initQueries();

};

StatisticsModel.prototype.setCurrentCourseId = function(courseId) {
	this.currentCourseId = courseId;

	for ( var s in this.statistics) {
		this.statistics[s] = -1;
	}

	// Display all entries of the database
	this.db.transaction(function(transaction) {
		transaction
				.executeSql('SELECT * FROM statistics WHERE course_id=?',
						[ courseId ], dataSelectHandler, function(tx, e) {
							console.log("Error for select average score: "
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

StatisticsModel.prototype.getStatistics = function() {
	return this.statistics;
};

StatisticsModel.prototype.getImprovement = function() {
	return this.improvement;
};

StatisticsModel.prototype.initQueries = function() {
	this.queries['avgScore'] = {
		query : "",
		values : [],
		values24hBefore : []
	};
	this.queries['avgSpeed'] = {
		query : "",
		values : [],
		values24hBefore : []
	};
	this.queries['handledCards'] = {
		query : "",
		values : [],
		values24hBefore : []
	};
	this.queries['progress'] = {
		query : "",
		values : [],
		values24hBefore : []
	};
	this.queries['best'] = {
		query : "",
		values : [],
		values24hBefore : []
	};
	this.queries['stackHandler'] = {
		query : "",
		values : [],
		values24hBefore : []
	};

	// average score
	this.queries['avgScore'].query = 'SELECT sum(score) as score, count(id) as num FROM statistics WHERE course_id=?'
			+ ' AND day>=? AND day<=?' + ' GROUP BY course_id';

	// average speed
	this.queries['avgSpeed'].query = 'SELECT sum(duration) as duration, count(id) as num FROM statistics WHERE course_id=?'
			+ ' AND day>=? AND day<=?' + ' GROUP BY course_id';

	// handled cards
	this.queries['handledCards'].query = 'SELECT count(*) as c FROM statistics WHERE course_id=? AND day>=? AND day<=?';

	// progress
	this.queries['progress'].query = 'SELECT  COUNT(id) as numCorrect  FROM statistics  WHERE course_id=? AND score=?'
			+ ' AND day>=? AND day<=?';

	// best day and score
	this.queries['best'].query = "SELECT DATE(day/1000, 'unixepoch') as day, sum(score) as score, count(id) as num"
			+ " FROM statistics WHERE course_id=?"
			+ " GROUP BY DATE(day/1000, 'unixepoch')";

	// stack handler
	this.queries['stackHandler'].query = 'SELECT DISTINCT question_id FROM statistics WHERE course_id=?';
};

StatisticsModel.prototype.initQueryValues = function() {
	var timeNow = new Date().getTime();
	var time24hAgo = timeNow - 1000 * 60 * 60 * 24;
	var time48hAgo = timeNow - 1000 * 60 * 60 * 24 * 2;
	console.log("now: " + timeNow);
	console.log("24 hours ago: " + time24hAgo);
	console.log("48 hours ago: " + time48hAgo);
	// average score
	this.queries['avgScore'].values = [ this.currentCourseId, time24hAgo,
			timeNow ];
	this.queries['avgScore'].values24hBefore = [ this.currentCourseId,
			time48hAgo, time24hAgo ];

	// average speed
	this.queries['avgSpeed'].values = [ this.currentCourseId, time24hAgo,
			timeNow ];
	this.queries['avgSpeed'].values24hBefore = [ this.currentCourseId,
			time48hAgo, time24hAgo ];

	// handled cards
	this.queries['handledCards'].values = [ this.currentCourseId, time24hAgo,
			timeNow ];
	this.queries['handledCards'].values24hBefore = [ this.currentCourseId,
			time48hAgo, time24hAgo ];

	// progress
	this.queries['progress'].values = [ this.currentCourseId, 1, time24hAgo,
			timeNow ];
	this.queries['progress'].values24hBefore = [ this.currentCourseId, 1,
			time48hAgo, time24hAgo ];

	// best day and score
	this.queries['best'].values = [ this.currentCourseId ];

	// stack handler
	this.queries['stackHandler'].values = [ this.currentCourseId ];
};

StatisticsModel.prototype.calculateValues = function() {
	var self = this;
	self.initQueryValues();

	// calculate handled cards
	self.queryDB(self.queries['handledCards'].query,
			self.queries['handledCards'].values, self.calculateHandledCards);

	// calculate average score
	self.queryDB(self.queries['avgScore'].query,
			self.queries['avgScore'].values, self.calculateAverageScore);

	// calculate average speed
	self.queryDB(self.queries['avgSpeed'].query,
			self.queries['avgSpeed'].values, self.calculateAverageSpeed);

	// calculate progress
	self.queryDB(self.queries['progress'].query,
			self.queries['progress'].values, self.calculateProgress);

	// calculate best day and score
	self.queryDB(self.queries['best'].query, self.queries['best'].values,
			self.calculateBestDayAndScore);

	// calculate stack handler
	self.queryDB(self.queries['stackHandler'].query,
			self.queries['stackHandler'].values, self.calculateStackHandler);
};

StatisticsModel.prototype.queryDB = function(query, values, cbResult) {
	var self = this;
	self.db.transaction(function(transaction) {
		transaction.executeSql(query, values, function(transaction, results) {
			cbResult(self, transaction, results);
		}, self.dbErrorFunction);
	});
};

StatisticsModel.prototype.calculateHandledCards = function(statisticsModel,
		transaction, results) {
	var self = statisticsModel;
	if (results.rows.length > 0) {
		var row = results.rows.item(0);
		console.log("number of handled cards:" + row['c']);
		self.statistics['handledCards'] = row['c'];
		if (row['c'] > 100) {
			self.statistics['cardBurner'] = 100;
		} else {
			self.statistics['cardBurner'] = row['c'];
		}
		console.log("card burner: " + self.statistics['cardBurner']);

		// calculate improvement
		self.queryDB(self.queries['handledCards'].query,
				self.queries['handledCards'].values24hBefore,
				self.calculateImprovementHandledCards);
	}
};

StatisticsModel.prototype.calculateAverageScore = function(statisticsModel,
		transaction, results) {
	var self = statisticsModel;
	console.log("rows: " + results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		console.log("row: " + JSON.stringify(row));
		self.statistics['averageScore'] = Math
				.round((row['score'] / row['num']) * 100);
		console.log("AVERAGE SCORE: " + self.statistics['averageScore']);

		// calculate improvement
		self.queryDB(self.queries['avgScore'].query,
				self.queries['avgScore'].values24hBefore,
				self.calculateImprovementAverageScore);
	}
};

StatisticsModel.prototype.calculateAverageSpeed = function(statisticsModel,
		transaction, results) {
	var self = statisticsModel;
	console.log("rows: " + results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		console.log("row: " + JSON.stringify(row));
		self.statistics['averageSpeed'] = Math
				.round((row['duration'] / row['num']) / 1000);
		console.log("AVERAGE SPEED: " + self.statistics['averageSpeed']);

		// calculate improvement
		self.queryDB(self.queries['avgSpeed'].query,
				self.queries['avgSpeed'].values24hBefore,
				self.calculateImprovementAverageSpeed);
	}
};

StatisticsModel.prototype.calculateProgress = function(statisticsModel,
		transaction, results) {
	var self = statisticsModel;
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		console.log("number of correct questions:" + row['numCorrect']);
		console.log("number of answered questions:"
				+ self.statistics['handledCards']);
		self.statistics['progress'] = Math
				.round(((row['numCorrect']) / (self.statistics['handledCards'])) * 100);
		console.log("progress: " + self.statistics['progress']);

		// calculate improvement
		self.queryDB(self.queries['progress'].query,
				self.queries['progress'].values24hBefore,
				self.calculateImprovementProgress);
	}
};

StatisticsModel.prototype.calculateBestDayAndScore = function(statisticsModel,
		transaction, results) {
	console.log("rows: " + results.rows.length);
	var self = statisticsModel;
	var bestDay;
	var bestScore = -1;
	for ( var i = 0; i < results.rows.length; i++) {
		row = results.rows.item(i);
		console.log(JSON.stringify(row));
		score = row['score'] / row['num'];
		if (score >= bestScore) {
			bestDay = row['day'];
			bestScore = score;
		}
	}
	console.log("best day: " + bestDay);
	self.statistics['bestDay'] = bestDay;
	console.log("best score: " + bestScore);
	self.statistics['bestScore'] = Math.round(bestScore * 100);
	$(document).trigger("statisticcalculationsdone");
};

StatisticsModel.prototype.calculateImprovementHandledCards = function(
		statisticsModel, transaction, results) {
	var self = statisticsModel;
	console.log("rows in calculate improvement handled cards: "
			+ results.rows.length);
	if (results.rows.length > 0) {
		var row = results.rows.item(0);
		console.log("number of handled cards:" + row['c']);
		oldHandledCards = row['c'];
		newHandledCards = self.statistics['handledCards'];
		self.improvement['handledCards'] = newHandledCards - oldHandledCards;
		console.log("improvement handled cards: "
				+ self.improvement['handledCards']);
		$(document).trigger("statisticcalculationsdone");
	}
};

StatisticsModel.prototype.calculateImprovementAverageScore = function(
		statisticsModel, transaction, results) {
	var self = statisticsModel;
	console.log("rows in calculate improvement average score: "
			+ results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		console.log("row: " + JSON.stringify(row));
		oldAverageScore = Math.round((row['score'] / row['num']) * 100);
		newAverageScore = self.statistics['averageScore'];
		self.improvement['averageScore'] = newAverageScore - oldAverageScore;
		console.log("improvement average score: "
				+ self.improvement['averageScore']);
		$(document).trigger("statisticcalculationsdone");
	}
};

StatisticsModel.prototype.calculateImprovementAverageSpeed = function(
		statisticsModel, transaction, results) {
	var self = statisticsModel;
	console.log("rows in calculate improvement average speed: "
			+ results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		console.log("row: " + JSON.stringify(row));
		oldAverageSpeed = Math.round((row['duration'] / row['num']) / 1000);
		newAverageSpeed = self.statistics['averageSpeed'];
		self.improvement['averageSpeed'] = (newAverageSpeed - oldAverageSpeed)
				* (-1);
		console.log("improvement average speed: "
				+ self.improvement['averageSpeed']);
		$(document).trigger("statisticcalculationsdone");
	}
};

StatisticsModel.prototype.calculateImprovementProgress = function(
		statisticsModel, transaction, results) {
	var self = statisticsModel;
	console.log("rows in calculate improvement progress: "
			+ results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		// get the number of handled cards
		self.queryDB(self.queries['handledCards'].query,
				self.queries['handledCards'].values24hBefore, function(
						statisticsModel, transaction, results) {
					statisticsModel.calculateImprovementProgressHelperFunction(
							statisticsModel, transaction, results,
							row['numCorrect']);
				});
	}
};

StatisticsModel.prototype.calculateImprovementProgressHelperFunction = function(
		statisticsModel, transaction, results, numCorrect) {
	var self = statisticsModel;
	if (results.rows.length > 0) {
		var row = results.rows.item(0);
		console.log("number of handled cards:" + row['c']);
		handledCards = row['c'];
		oldProgress = Math.round((numCorrect / handledCards) * 100);
		newProgress = self.statistics['progress'];
		self.improvement['progress'] = newProgress - oldProgress;
		console.log("improvement progress: " + self.improvement['progress']);
		$(document).trigger("statisticcalculationsdone");
	}
};

StatisticsModel.prototype.calculateStackHandler = function(statisticsModel,
		transaction, results) {
	var self = statisticsModel;
	allCards = controller.models["questionpool"].questionList;
	handledCards = [];
	numHandledCards = 0;
	for ( var i = 0; i < results.rows.length; i++) {
		row = results.rows.item(i);
		handledCards.push(row['question_id']);
	}
	for ( var a in allCards) {
		if (handledCards.indexOf(allCards[a].id) != -1) {
			numHandledCards++;
		}
	}
	numAllCards = allCards.length;
	self.statistics['stackHandler'] = Math
			.round((numHandledCards / numAllCards) * 100);
	console.log("stackHandler: " + self.statistics['stackHandler']
			+ " handled: " + numHandledCards + " all: " + numAllCards);
}

StatisticsModel.prototype.dbErrorFunction = function(tx, e) {
	console.log("DB Error: " + e.message);
};

/**
 * loads the statistics data from the server and stores it in the local database
 */
StatisticsModel.prototype.loadFromServer = function() {
	var self = this;
	if (self.controller.models['authentication'].isLoggedIn()) {
		$
				.ajax({
					url : 'http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards/statistics.php',
					type : 'GET',
					dataType : 'json',
					success : function(data) {
						console.log("success");
						console.log("JSON: " + data);
						var statisticsObject;
						try {
							statisticsObject = data;
							console.log("statistics data from server");
						} catch (err) {
							console
									.log("Error: Couldn't parse JSON for statistics");
						}

						if (!statisticsObject) {
							statisticsObject = [];
						}

						self.queryDB(
								"SELECT max(id) as last_id FROM statistics",
								[], lastIdCb);

						function lastIdCb(statisticsModel, transaction, results) {
							var self = statisticsModel;
							if (results.rows.length > 0) {
								var row = results.rows.item(0);
								lastId = row['last_id'];

								if (!lastId) {
									lastId = -1;
								}

								console
										.log("last id from client db: "
												+ lastId);
								console.log("count statistics: "
										+ statisticsObject.length);

								for ( var i = (lastId + 1); i < statisticsObject.length; i++) {
									statisticItem = statisticsObject[i];

									console.log(JSON.stringify(statisticItem));
									query = "INSERT INTO statistics(id, course_id, question_id, day, score, duration) VALUES (?,?,?,?,?,?)";
									values = [ statisticItem['id'],
											statisticItem['course_id'],
											statisticItem['question_id'],
											statisticItem['day'],
											statisticItem['score'],
											statisticItem['duration'] ];
									self.queryDB(query, values, function(
											statisticsModel, transaction,
											results) {
										console.log("after inserting");
									})

								}
							}
						}

					},
					error : function() {
						console
								.log("Error while getting statistics data from server");
					},
					beforeSend : setHeader
				});

		function setHeader(xhr) {
			xhr.setRequestHeader('sessionkey',
					self.controller.models['authentication'].getSessionKey());
		}

	}
};

/**
 * sends statistics data to the server
 */
StatisticsModel.prototype.sendToServer = function(authData) {
	var self = this;

	self.queryDB('SELECT * FROM statistics', [], sendStatistics);

	function sendStatistics(statisticsModel, transaction, results) {
		var self = statisticsModel;
		statistics = "";
		header = [];
		for ( var i = 0; i < results.rows.length; i++) {
			row = results.rows.item(i);
			header.push(row);
			console.log(i + ": " + JSON.stringify(row));
		}
		statistics = JSON.stringify(header);

		$.ajax({
			url : 'http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards/statistics.php',
			type : 'PUT',
			success : function() {
				console
						.log("statistics data successfully send to the server");
				$(document).trigger("statisticssenttoserver");
			},
			error : function() {
				console
						.log("Error while sending statistics data to server");
			},
			beforeSend : setHeader
		});

		function setHeader(xhr) {
			xhr.setRequestHeader('sessionkey',
					self.controller.models['authentication'].getSessionKey());
			xhr.setRequestHeader('statistics', statistics);

		}
	}

}