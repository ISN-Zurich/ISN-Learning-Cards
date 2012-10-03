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

function queryDatabase(cbResult){
	console.log("enter queryDatabase");
	var self = this;
	self.superModel.db.transaction(function(transaction) {
		transaction.executeSql(self.query, self.values, cbResult, self.superModel.dbErrorFunction);
	});
}

var TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24; 

//This model holds the statistics for a course



function StatisticsModel(controller) {
	this.controller = controller;
	this.lastSendToServer;
	
	this.db = openDatabase('ISNLCDB', '1.0', 'ISN Learning Cards Database',
			100000);

	this.currentCourseId = -1;

this.statistics = [];
//	this.statistics['handledCards'] = -1;
//	this.statistics['progress'] = -1;
//	this.statistics['averageScore'] = -1;
//	this.statistics['averageSpeed'] = -1;
//	this.statistics['bestDay'] = -1;
//	this.statistics['bestScore'] = -1;
	this.statistics['stackHandler'] = -1;
//	this.statistics['cardBurner'] = -1;

//	this.improvement = [];
//	this.improvement['handledCards'] = 0;
//	this.improvement['progress'] = 0;
//	this.improvement['averageScore'] = 0;
//	this.improvement['averageSpeed'] = 0;
//	
	this.queries = [];
	this.initQueries();
	
	this.firstActiveDay;
	this.lastActiveDay;

	// setInterval(function() {console.log("interval is active");}, 5000);
	

	var self = this;
	$(document).bind("checkachievements", function(p, courseId) {
		self.checkAchievements(courseId);
	});


};


//sets the current course id and starts the calculations
 
StatisticsModel.prototype.setCurrentCourseId = function(courseId) {
	this.currentCourseId = courseId;

	for ( var s in this.statistics) {
		this.statistics[s] = -1;
	}
	
	console.log("course-id: " + courseId);

	// load the appropriate models for our course
	this.initSubModels();
	
	
	//this.getAllDBEntries();//useful for debugging, defined in the of the file

	this.controller.models['questionpool'].loadData(courseId);
	
	//checks if card burner achievement was already achieved
	//and starts the calculations
	this.checkCardBurner();
	
};

// @return statistics
 
StatisticsModel.prototype.getStatistics = function() {
	return this.statistics;
};

// @return improvement
 
StatisticsModel.prototype.getImprovement = function() {
	return this.improvement;
};

/**
 * checks if card burner achievement was already achieved
 * if first active day wasn't set yet, it gets the first active day
 * sets the last activity
 */
StatisticsModel.prototype.checkCardBurner = function() {
	var self = this;
	var query = "SELECT * FROM statistics WHERE course_id = ? AND question_id = ?";
	var values = [this.currentCourseId, 'cardburner'];
	this.queryDB(query, values, function(transaction, results) {
		if (results.rows && results.rows.length > 0) {
			self.statistics['cardBurner'] = 100;
		}
		if (!self.firstActiveDay) {
			self.getFirstActiveDay();
		} else {
			self.checkActivity((new Date()).getTime() - TWENTY_FOUR_HOURS);
		}
	});
};

// gets the timestamp of the first activity
 
StatisticsModel.prototype.getFirstActiveDay = function() {
	var self = this;
	this.queryDB('SELECT min(day) as firstActivity FROM statistics WHERE course_id=? AND question_id != "cardburner"',
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

/**
 * sets the last active day
 * if no activity is found, the last activity is set to the 
 * current timestamp
 */
StatisticsModel.prototype.checkActivity = function(day) {
	var self = this;
	if (day > self.firstActiveDay) {
		this.queryDB('SELECT count(id) as counter FROM statistics WHERE course_id=? AND question_id != "cardburner" AND day>=? AND day<=?',
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


//initializes all queries that are needed for the calculations
 
StatisticsModel.prototype.initQueries = function() {
	
	this.initSubModels();
	
	this.queries['stackHandler'] = {
		query : "",
		values : [],
		valuesLastActivity : []
	};
	
	
	// stack handler
	this.queries['stackHandler'].query = 'SELECT DISTINCT question_id FROM statistics WHERE course_id=? AND question_id != "cardburner"';
};

//initializes all values that are needed for the calculations
StatisticsModel.prototype.getCurrentValues = function(progressVal) {
	var timeNow = new Date().getTime();
	var time24hAgo = timeNow - TWENTY_FOUR_HOURS;
	if (!progressVal) {
	return [this.currentCourseId,time24hAgo,timeNow ];
	}else{
		return [this.currentCourseId,1,time24hAgo,timeNow ];
	}
};

StatisticsModel.prototype.getLastActiveValues = function(progressVal) {
	var lastActiveDay24hBefore = this.lastActiveDay - TWENTY_FOUR_HOURS;
	if (!progressVal){
	return [this.currentCourseId,lastActiveDay24hBefore, this.lastActiveDay ];
	}else {
	return [this.currentCourseId,1,lastActiveDay24hBefore, this.lastActiveDay ];		
	}
};

StatisticsModel.prototype.initQueryValues = function() {	
	var timeNow = new Date().getTime();
	var time24hAgo = timeNow - TWENTY_FOUR_HOURS;

	console.log("first active day: " + this.firstActiveDay);
	console.log("last active day: " + this.lastActiveDay);

	var lastActiveDay24hBefore = this.lastActiveDay - TWENTY_FOUR_HOURS;

	console.log("now: " + timeNow);
	console.log("24 hours ago: " + time24hAgo);
	
	
	// stack handler
	this.queries['stackHandler'].values = [ this.currentCourseId ];
	
	
	
	
};


//queries the database and calculates the statistics and improvements

StatisticsModel.prototype.calculateValues = function() {
	var self = this;
	self.initQueryValues();

	self.boolAllDone = 0;

	self.handledCards.calculateValue();
	self.averageScore.calculateValue();
	self.averageSpeed.calculateValue();
	self.progress.calculateValue();
	self.bestDay.calculateValue();

	// calculate stack handler
	self.queryDB(self.queries['stackHandler'].query,
		self.queries['stackHandler'].values, function cbSH(t,r) {self.calculateStackHandler(t,r);});	
//	self.stackHandler.calculateValue();
	
};

/**
 * after each finished calculation, this function is called
 * if the function is called by all of the calculations,
 * the allstatisticcalculationsdone event is triggered
 */
StatisticsModel.prototype.allCalculationsDone = function() {
	console.log(" finished n="+this.boolAllDone +" calculations");
	if ( this.boolAllDone == 6) {
		$(document).trigger("allstatisticcalculationsdone");
	
	} 	
};

// class for querying the database

StatisticsModel.prototype.queryDB = function(query, values, cbResult) {
	var self = this;
	self.db.transaction(function(transaction) {
		transaction.executeSql(query, values, cbResult, self.dbErrorFunction);
});
	};



/**
 * calculates the stack handler achievement
 * you get the stack handler if you have handled each card of a course
 * at least once
 */
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
};


// checks if any achievements have been achieved

StatisticsModel.prototype.checkAchievements = function(courseId) {
	//check if cardburner was already achieved
	this.checkCardBurnerAchievement(courseId);
};

/**
 * checks if the card burner achievement was achieved
 * you get the card burner achievement if you handle 100 cards within 24 hours
 */
StatisticsModel.prototype.checkCardBurnerAchievement = function(courseId) {
	//check if we have already achieved card burner
	console.log("check card burner achievement");
	var self = this;
	var query = "SELECT * FROM statistics WHERE course_id = ? AND question_id = ?";
	var values = [courseId, 'cardburner'];
	this.queryDB(query, values, function(transaction, results) {
		
		//if we have not achieved the card burner yet,
		//count number of answered questions in the last 24 hours
		if (results.rows.length == 0) {
			console.log("card burner not achieved yet")
			var query2 = "SELECT count(*) as c FROM statistics WHERE course_id=? AND question_id != 'cardburner' AND day>=? AND day<=?";
			var day = (new Date()).getTime();
			var values2 = [courseId, (day - TWENTY_FOUR_HOURS), day];
			self.queryDB(query2, values2, function(transaction, results) {
				console.log("second check if card burner was achieved");
				if (results.rows.length > 0) {
					var row = results.rows.item(0);
					
					//if card burner was achieved (100 handled cards within 24 hours), insert a marker into the database
					if (row['c'] == 100) {
						console.log("cardburner was achieved");
						var insert = 'INSERT INTO statistics(course_id, question_id, day, score, duration) VALUES (?, ?, ?, ?, ?)';
						var insertValues = [ courseId, "cardburner", day, 100, 0];
						self.queryDB(insert, insertValues, function() {
									console.log("successfully inserted card burner");
								}, function(tx, e) {
									console.log("error: "
											+ e.message);
								});
					} else {
						console.log("cardburner still not achieved yet");
					}
				}
			});
		}
	});
};

//function that is called if an error occurs while querying the database
 
StatisticsModel.prototype.dbErrorFunction = function(tx, e) {
	console.log("DB Error: " + e.message);
};


// loads the statistics data from the server and stores it in the local database

StatisticsModel.prototype.loadFromServer = function() {
	var self = this;
	if (self.controller.models['authentication'].isLoggedIn()) {
		$
				.ajax({
					url : self.controller.models['authentication'].urlToLMS + '/statistics.php',
					type : 'GET',
					dataType : 'json',
					success : function(data) {
						console.log("success");
//						console.log("JSON: " + data);
						var statisticsObject;
						try {
							statisticsObject = data;
//							console.log("statistics data from server: " + JSON.stringify(statisticsObject));
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
						console.log("after inserting statistics from server");
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


//inserts the statistic item into the database if it doesn't exist there yet

StatisticsModel.prototype.insertStatisticItem = function(statisticItem) {
	var self = this;
//	console.log("day: " + statisticItem['day']);
	
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
//				console.log("after inserting");
			});
		}
	}
};


//sends statistics data to the server

StatisticsModel.prototype.sendToServer = function() {
	var self = this;
	var url = self.controller.models['authentication'].urlToLMS + '/statistics.php';
	console.log("url statistics: " + url);

	self.queryDB('SELECT * FROM statistics', [], function(t,r) {sendStatistics(t,r);});

	function sendStatistics(transaction, results) {
		statistics = [];
		numberOfStatisticsItems = 0;
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
			numberOfStatisticsItems = statistics.length; 
		}else {
			numberOfStatisticsItems = results.rows.length;
			console.log("results length: " + results.rows.length);
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
			url : url,
			type : 'PUT',
			data : statisticsString,
			processData: false,
			success : function(data) {
				console
				.log("statistics data successfully send to the server");
				localStorage.removeItem("pendingStatistics");
				
				if (data) {
					if (numberOfStatisticsItems < data) {
						console.log("server has more items than local database -> fetch statistics from server");
						self.loadFromServer();
					}
				}
				
				self.lastSendToServer = (new Date()).getTime();
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


StatisticsModel.prototype.initSubModels = function(){
	
	this.bestDay = new BestDayScoreModel(this);
	this.handledCards = new HandledCardsModel(this);
	this.averageScore = new AverageScoreModel(this);
	this.progress = new ProgressModel(this,this.controller);
	this.averageSpeed = new AverageSpeedModel(this);
//	this.stackHanlder = new StackHandlerModel(this);
		
};






StatisticsModel.prototype.getAllDBEntries = function(){
	
	// Display all entries of the database
//	this.db.transaction(function(transaction) {
//		transaction
//				.executeSql('SELECT * FROM statistics WHERE course_id=?',
//						[ courseId ], dataSelectHandler, function(tx, e) {
//							console.log("Error for select average score: "
//									+ e.message);
//						});
//	});
//
//	function dataSelectHandler(transaction, results) {
//		console.log("ALL ROWS: " + results.rows.length);
//		for ( var i = 0; i < results.rows.length; i++) {
//			row = results.rows.item(i);
//
//			console.log(i + ": " + JSON.stringify(row));
//		}
//	}
	
	
}

