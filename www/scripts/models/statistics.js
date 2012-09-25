var TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24; 

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
	this.statistics['bestDay'] = -1;
	this.statistics['bestScore'] = -1;
	this.statistics['stackHandler'] = -1;
	this.statistics['cardBurner'] = -1;

	this.improvement = [];
	this.improvement['handledCards'] = 0;
	this.improvement['progress'] = 0;
	this.improvement['averageScore'] = 0;
	this.improvement['averageSpeed'] = 0;

	this.queries = [];
	this.initQueries();
	
	this.firstActiveDay;
	this.lastActiveDay;

	// setInterval(function() {console.log("interval is active");}, 5000);

};

StatisticsModel.prototype.setCurrentCourseId = function(courseId) {
	this.currentCourseId = courseId;

	for ( var s in this.statistics) {
		this.statistics[s] = -1;
	}
	
	console.log("course-id: " + courseId);

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

	this.controller.models['questionpool'].loadData(courseId);
	
	if (!this.firstActiveDay) {
		this.getFirstActiveDay();
	} else {
		this.checkActivity((new Date()).getTime() - TWENTY_FOUR_HOURS);
	}
//	this.calculateValues();
};

StatisticsModel.prototype.getStatistics = function() {
	return this.statistics;
};

StatisticsModel.prototype.getImprovement = function() {
	return this.improvement;
};

StatisticsModel.prototype.getFirstActiveDay = function() {
	var self = this;
	this.queryDB('SELECT min(day) as firstActivity FROM statistics WHERE course_id=?',
						[ self.currentCourseId ], 
						function dataSelectHandler(transaction, results) {
							if (results.rows.length > 0) {
								row = results.rows.item(0);
								console.log("first active day: " + JSON.stringify(row));
								if (row['firstActivity']) {
									self.firstActiveDay = row['firstActivity'];
								} else {
									self.firstActiveDay = (new Date()).getTime(); 
								}
							} else {
								self.firstActiveDay = (new Date()).getTime(); 
							}
							self.checkActivity((new Date()).getTime() - TWENTY_FOUR_HOURS);
	});
};

StatisticsModel.prototype.checkActivity = function(day) {
	var self = this;
	if (day > self.firstActiveDay) {
		this.queryDB('SELECT count(id) as counter FROM statistics WHERE course_id=? AND day>=? AND day<=?',
							[ self.currentCourseId, (day - TWENTY_FOUR_HOURS), day ], 
							function dataSelectHandler( transaction, results) {
								if (results.rows.length > 0 && results.rows.item(0)['counter'] != 0) {
										console.log("active day: " + day);
										self.lastActiveDay = day;
										self.calculateValues();
								}
								else {
										self.checkActivity(day - TWENTY_FOUR_HOURS);
								} 
		});
	} else {
		self.lastActiveDay = day;
		self.calculateValues();
	}
};

StatisticsModel.prototype.initQueries = function() {
	this.queries['avgScore'] = {
		query : "",
		values : [],
		valuesLastActivity : []
	};
	this.queries['avgSpeed'] = {
		query : "",
		values : [],
		valuesLastActivity : []
	};
	this.queries['handledCards'] = {
		query : "",
		values : [],
		valuesLastActivity : []
	};
	this.queries['progress'] = {
		query : "",
		values : [],
		valuesLastActivity : []
	};
	this.queries['best'] = {
		query : "",
		values : [],
		valuesLastActivity : []
	};
	this.queries['stackHandler'] = {
		query : "",
		values : [],
		valuesLastActivity : []
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
	this.queries['progress'].query = 'SELECT count(DISTINCT question_id) as numCorrect FROM statistics WHERE course_id=? AND score=?'
			+ ' AND day>=? AND day<=?';

	// best day and score
	this.queries['best'].query = "SELECT min(day) as day, sum(score) as score, count(id) as num"
			+ " FROM statistics WHERE course_id=?"
			+ " GROUP BY DATE(day/1000, 'unixepoch')";

	// stack handler
	this.queries['stackHandler'].query = 'SELECT DISTINCT question_id FROM statistics WHERE course_id=?';
};

StatisticsModel.prototype.initQueryValues = function() {		
	var timeNow = new Date().getTime();
	var time24hAgo = timeNow - TWENTY_FOUR_HOURS;

	console.log("first active day: " + this.firstActiveDay);
	console.log("last active day: " + this.lastActiveDay);

	var lastActiveDay24hBefore = this.lastActiveDay - TWENTY_FOUR_HOURS;

	console.log("now: " + timeNow);
	console.log("24 hours ago: " + time24hAgo);
	// average score
	this.queries['avgScore'].values = [ this.currentCourseId, time24hAgo,
	                                    timeNow ];
	this.queries['avgScore'].valuesLastActivity = [ this.currentCourseId,
	                                                lastActiveDay24hBefore, this.lastActiveDay ];

	// average speed
	this.queries['avgSpeed'].values = [ this.currentCourseId, time24hAgo,
	                                    timeNow ];
	this.queries['avgSpeed'].valuesLastActivity = [ this.currentCourseId,
	                                                lastActiveDay24hBefore, this.lastActiveDay ];

	// handled cards
	this.queries['handledCards'].values = [ this.currentCourseId, time24hAgo,
	                                        timeNow ];
	this.queries['handledCards'].valuesLastActivity = [ this.currentCourseId,
	                                                    lastActiveDay24hBefore, this.lastActiveDay ];

	// progress
	this.queries['progress'].values = [ this.currentCourseId, 1, time24hAgo,
	                                    timeNow ];
	this.queries['progress'].valuesLastActivity = [ this.currentCourseId, 1,
	                                                lastActiveDay24hBefore, this.lastActiveDay ];

	// best day and score
	this.queries['best'].values = [ this.currentCourseId ];

	// stack handler
	this.queries['stackHandler'].values = [ this.currentCourseId ];
};

StatisticsModel.prototype.calculateValues = function() {
	var self = this;
	self.initQueryValues();

	self.boolAllDone = 0;
	// calculate handled cards
	self.queryDB(self.queries['handledCards'].query,
			self.queries['handledCards'].values, function cbHC(t,r) {self.calculateHandledCards(t,r);});

	// calculate average score
	self.queryDB(self.queries['avgScore'].query,
			self.queries['avgScore'].values, function cbASc(t,r) {self.calculateAverageScore(t,r);});

	// calculate average speed
	self.queryDB(self.queries['avgSpeed'].query,
			self.queries['avgSpeed'].values, function cbASp(t,r) {self.calculateAverageSpeed(t,r);});

	// calculate progress
	self.queryDB(self.queries['progress'].query,
			self.queries['progress'].values, function cbP(t,r) {self.calculateProgress(t,r);});

	// calculate best day and score
	self.queryDB(self.queries['best'].query, self.queries['best'].values,
		function cbBDS(t,r) {self.calculateBestDayAndScore(t,r);});

	// calculate stack handler
	self.queryDB(self.queries['stackHandler'].query,
			self.queries['stackHandler'].values, function cbSH(t,r) {self.calculateStackHandler(t,r);});	
};

StatisticsModel.prototype.allCalculationsDone = function() {
	console.log(" finished n="+this.boolAllDone +" calculations");
	if ( this.boolAllDone == 6) {
		$(document).trigger("allstatisticcalculationsdone");
	}
};

StatisticsModel.prototype.queryDB = function(query, values, cbResult) {
	var self = this;
	self.db.transaction(function(transaction) {
		transaction.executeSql(query, values, cbResult, self.dbErrorFunction);
	});
};

StatisticsModel.prototype.calculateHandledCards = function(transaction, results) {
	var self = this;
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
	} else {
		self.statistics['handledCards'] = 0;
		self.statistics['cardBurner'] = 0;
	}
//	else {
//		self.boolAllDone++;
//		self.allCalculationsDone();
//	}
	// calculate improvement
	self.queryDB(self.queries['handledCards'].query,
			self.queries['handledCards'].valuesLastActivity,
	function cbCalculateImprovements(t,r) {
		self.calculateImprovementHandledCards(t,r);
	});
};

StatisticsModel.prototype.calculateAverageScore = function(transaction, results) {
	var self = this;
	console.log("rows: " + results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		console.log("row: " + JSON.stringify(row));
		if (row['num'] == 0) {
			self.statistics['averageScore'] = 0;
		} else {
			self.statistics['averageScore'] = Math
				.round((row['score'] / row['num']) * 100);
		}
		console.log("AVERAGE SCORE: " + self.statistics['averageScore']);
	} else {
		self.statistics['averageScore'] = 0;
	}
//	else {
//		self.boolAllDone++;
//		self.allCalculationsDone();
//	}
	// calculate improvement
	self.queryDB(self.queries['avgScore'].query,
			self.queries['avgScore'].valuesLastActivity,
			function cbCalculateImprovements(t,r) {self.calculateImprovementAverageScore(t,r);});
};

StatisticsModel.prototype.calculateAverageSpeed = function(transaction, results) {
	var self = this;
	console.log("rows: " + results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		console.log("row: " + JSON.stringify(row));
		if (row['num'] == 0) {
			self.statistics['averageSpeed'] = 0;
		} else {
			self.statistics['averageSpeed'] = Math
				.round((row['duration'] / row['num']) / 1000);
		}
		console.log("AVERAGE SPEED: " + self.statistics['averageSpeed']);
	} else {
		self.statistics['averageSpeed'] = 0;
	}
//	else {
//		self.boolAllDone++;
//		self.allCalculationsDone();
//	}
	// calculate improvement
	self.queryDB(self.queries['avgSpeed'].query,
			self.queries['avgSpeed'].valuesLastActivity,
			function cbCalculateImprovements(t,r) {self.calculateImprovementAverageSpeed(t,r);});
};

StatisticsModel.prototype.calculateProgress = function(transaction, results) {
	var self = this;
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		console.log("number of correct questions:" + row['numCorrect']);
		console.log("number of answered questions:"
				+ self.statistics['handledCards']);
		cards = self.controller.models['questionpool'].questionList.length;
		if (cards == 0) {
			self.statistics['progress'] = 0;
		} else {
			self.statistics['progress'] = Math
				.round(((row['numCorrect']) / cards) * 100);
		}
		console.log("progress: " + self.statistics['progress']);
	} else {
		self.statistics['progress'] = 0;
	}
//	else {
//		self.boolAllDone++;
//		self.allCalculationsDone();
//	}
	// calculate improvement
	self.queryDB(self.queries['progress'].query,
			self.queries['progress'].valuesLastActivity,
			function cbCalculateImprovements(t,r) {self.calculateImprovementProgress(t,r);});
};

StatisticsModel.prototype.calculateBestDayAndScore = function(transaction, results) {
	console.log("rows: " + results.rows.length);
	var self = this;
	var bestDay;
	var bestScore = -1;
	for ( var i = 0; i < results.rows.length; i++) {
		row = results.rows.item(i);
		console.log(JSON.stringify(row));
		score = 0;
		if (row['num'] != 0) {
			score = row['score'] / row['num'];
		}
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
	self.boolAllDone++;
	self.allCalculationsDone();
};

StatisticsModel.prototype.calculateImprovementHandledCards = function(transaction, results) {
	var self = this;
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
		
	} else {
		self.improvement['handledCards'] = self.statistics['handledCards'];
	}
	self.boolAllDone++;
	self.allCalculationsDone();
};

StatisticsModel.prototype.calculateImprovementAverageScore = function(transaction, results) {
	var self = this;
	console.log("rows in calculate improvement average score: "
			+ results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		console.log("row: " + JSON.stringify(row));
		var oldAverageScore = 0;
		if (row['num'] != 0) {
			oldAverageScore = Math.round((row['score'] / row['num']) * 100);
		}
		newAverageScore = self.statistics['averageScore'];
		self.improvement['averageScore'] = newAverageScore - oldAverageScore;
		$(document).trigger("statisticcalculationsdone");
		
	} else {
		self.improvement['averageScore'] = self.statistics['averageScore'];
	}
	console.log("improvement average score: "
			+ self.improvement['averageScore']);
	self.boolAllDone++;
	self.allCalculationsDone();
};

StatisticsModel.prototype.calculateImprovementAverageSpeed = function(transaction, results) {
	var self = this;
	console.log("rows in calculate improvement average speed: "
			+ results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		console.log("row: " + JSON.stringify(row));
		var oldAverageSpeed = 0;
		if (row['num'] != 0) {
			oldAverageSpeed = Math.round((row['duration'] / row['num']) / 1000);
		}
		newAverageSpeed = self.statistics['averageSpeed'];
		if (oldAverageSpeed == 0 && newAverageSpeed != 0) {
			self.improvement['averageSpeed'] = -1;
		} else	if (newAverageSpeed != 0) {
			self.improvement['averageSpeed'] = (newAverageSpeed - oldAverageSpeed);
		} else if (oldAverageSpeed == 0) {
			self.improvement['averageSpeed'] = 0;
		} else {
			self.improvement['averageSpeed'] = 1;
		}
		console.log("improvement average speed: "
				+ self.improvement['averageSpeed']);
		$(document).trigger("statisticcalculationsdone");
		
	} else {
		self.improvement['averageSpeed'] = (- self.statistics['averageSpeed']);
	}
	self.boolAllDone++;
	self.allCalculationsDone();
};

StatisticsModel.prototype.calculateImprovementProgress = function(transaction, results) {
	var self = this;
	console.log("rows in calculate improvement progress: "
			+ results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		console.log("progress row" + JSON.stringify(row));
		// get the number of handled cards
		cards = self.controller.models['questionpool'].questionList.length;
		if (cards == 0) {
			self.improvement['progress'] = 0;
		} else {
			console.log("Progress Num Correct: " + row['numCorrect']);
			oldProgress = Math
				.round(((row['numCorrect']) / cards) * 100);
			newProgress = self.statistics['progress'];
			self.improvement['progress'] = newProgress - oldProgress;
			console.log("improvement progress: " + self.improvement['progress']);
		}
	} else {
		self.improvement['progress'] = self.statistics['progress'];
	}
	self.boolAllDone++;
	self.allCalculationsDone();
};

StatisticsModel.prototype.calculateStackHandler = function(transaction, results) {
	var self = this;
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
	if (numAllCards == 0) {
		self.statistics['stackHandler'] = 0;
	} else {
		self.statistics['stackHandler'] = Math
				.round((numHandledCards / numAllCards) * 100);
	}
	console.log("stackHandler: " + self.statistics['stackHandler']
			+ " handled: " + numHandledCards + " all: " + numAllCards);
	self.boolAllDone++;
	self.allCalculationsDone();
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
							console.log("statistics data from server: " + JSON.stringify(statisticsObject));
						} catch (err) {
							console
							.log("Error: Couldn't parse JSON for statistics");
						}

						if (!statisticsObject) {
							statisticsObject = [];
						}
						
						for ( var i = 0; i < statisticsObject.length; i++) {						
							self.insertStatisticItem(statisticsObject[i]);
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

StatisticsModel.prototype.insertStatisticItem = function(statisticItem) {
	var self = this;
	console.log("day: " + statisticItem['day']);
	
	self
	.queryDB(
			"SELECT id FROM statistics WHERE day = ?",
			[ statisticItem['day'] ], function cbSelect(t,r) {checkIfItemExists(t,r);});

	function checkIfItemExists(transaction, results) {
		var item = statisticItem;
		if (results.rows.length == 0) {
			console.log("No entry for day: " + item['day']);
			query = "INSERT INTO statistics(course_id, question_id, day, score, duration) VALUES (?,?,?,?,?)";
			values = [ item['course_id'],
			           item['question_id'],
			           item['day'],
			           item['score'],
			           item['duration'] ];
			self.queryDB(query, values, function cbInsert(transaction,
					results) {
				console.log("after inserting");
			});
		}
	}
};

/**
 * sends statistics data to the server
 */
StatisticsModel.prototype.sendToServer = function() {
	var self = this;

	self.queryDB('SELECT * FROM statistics', [], function(t,r) {sendStatistics(t,r);});

	function sendStatistics(transaction, results) {
		statistics = [];
		uuid = "";
		sessionkey = "";
		if (localStorage.getItem("pendingStatistics")) {
			var pendingStatistics = {};
			try {
				pendingStatistics = JSON.parse(localStorage.getItem("pendingStatistics"));
			} catch (err) {
				console.log("error! while loading pending statistics");
			}
			
			sessionkey = pendingStatistics.sessionkey;
			uuid = pendingStatistics.uuid;
			statistics = pendingStatistics.statistics;
		}else {
			console.log("results length: " + results.rows.length);
			console.log(JSON.stringify(results.rows.item(0)));
			for ( var i = 0; i < results.rows.length; i++) {
				row = results.rows.item(i);
				statistics.push(row);
//				console.log("sending " + i + ": " + JSON.stringify(row));
			}
			sessionkey = self.controller.models['authentication'].getSessionKey();
			uuid = device.uuid;
		}
		
		console.log("count statistics=" + statistics.length);
		var statisticsString = JSON.stringify(statistics);
		
		//processData has to be set to false!
		$.ajax({
			url : 'http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards/statistics.php',
			type : 'PUT',
			data : statisticsString,
			processData: false,
			success : function() {
				console
				.log("statistics data successfully send to the server");
				localStorage.removeItem("pendingStatistics");
				$(document).trigger("statisticssenttoserver");
			},
			error : function() {
				console
				.log("Error while sending statistics data to server");
				var statisticsToStore = {
					sessionkey : sessionkey,
					uuid : device.uuid,
					statistics : statistics
				};
				localStorage.setItem("pendingStatistics", JSON.stringify(statisticsToStore));
				$(document).trigger("statisticssenttoserver");
			},
			beforeSend : setHeader
		});

		function setHeader(xhr) {
			xhr.setRequestHeader('sessionkey', sessionkey);
			xhr.setRequestHeader('uuid', device.uuid);
		}
	}

};
