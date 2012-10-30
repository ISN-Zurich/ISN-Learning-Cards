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




function checkAchievement() {
	var self = this;
	self.superModel.db.transaction(function(transaction) {
		transaction.executeSql( "SELECT * FROM statistics WHERE course_id = ? AND question_id = ?", [this.courseId, this.achievementName], 
				function cbSuccess(t,r) { 
					if ( r.rows.length > 0 ) {
						self.achievementValue = 100; 
						self.superModel.allDone();
					} else self.calculateAchievementValues();
				},
				self.superModel.dbErrorFunction);
	});
}

function insertAchievement() {
	var self = this;
	var insert = 'INSERT INTO statistics(course_id, question_id, day, score, duration) VALUES (?, ?, ?, ?, ?)';
	var insertValues = [ self.courseId, this.achievementName, (new Date()).getTime(), 100, -100];
	self.superModel.queryDB(insert, insertValues, function() {
				console.log("successfully inserted achievement");
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

	this.firstActiveDay;
	this.lastActiveDay;

	var self = this;

	// FIXME: check the localstorage if the the data is already loaded
	// if the the data is not loaded but the user is logged in, then loadFromServer()
	self.statisticsIsLoaded = self.controller.getConfigVariable("statisticsLoaded");
	if (!self.statisticsIsLoaded && self.controller.getLoginState() ) {
			self.loadFromServer();
	}
	
	$(document).bind("checkachievements", function(p, courseId) {
		self.checkAchievements(courseId);
	});
	
//	this.db.transaction(function(transaction) {
//		transaction.executeSql( "DELETE FROM statistics WHERE question_id = ?", ["stackhandler"]);
//	});
};


//sets the current course id and starts the calculations
 
StatisticsModel.prototype.setCurrentCourseId = function(courseId) {
	this.currentCourseId = courseId;

	for ( var s in this.statistics) {
		this.statistics[s] = -1;
	}
	
	console.log("course-id: " + courseId);
	
	//this.getAllDBEntries();//useful for debugging, defined in the of the file

	this.controller.models['questionpool'].loadData(courseId);
	console.log("statistics are loaded? " + (this.statisticsIsLoaded ? "yes" : "no"));
	if ( this.statisticsIsLoaded ) {
		// load the appropriate models for our course
		this.initSubModels();

		//checks if card burner achievement was already achieved
		//and starts the calculations
//		this.checkCardBurner();

		this.getFirstActiveDay();
	}
	else {
		$(document).trigger("allstatisticcalculationsdone");	
	}
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
//StatisticsModel.prototype.checkCardBurner = function() {
//	var self = this;
//	var query = "SELECT * FROM statistics WHERE course_id = ? AND question_id = ?";
//	var values = [this.currentCourseId, 'cardburner'];
//	this.queryDB(query, values, function(transaction, results) {
//		if (results.rows && results.rows.length > 0) {
//			self.statistics['cardBurner'] = 100;
//		}
//		if (!self.firstActiveDay) {
//			self.getFirstActiveDay();
//		} else {
//			self.checkActivity((new Date()).getTime() - TWENTY_FOUR_HOURS);
//		}
//	});
//};

// gets the timestamp of the first activity
 
StatisticsModel.prototype.getFirstActiveDay = function() {
	console.log("enters first active day");
	var self = this;
	this.queryDB('SELECT min(day) as firstActivity FROM statistics WHERE course_id=? AND question_id != "cardburner"',
						[ self.currentCourseId ], 
						function dataSelectHandler(transaction, results) {
							if (results.rows.length > 0) {
								row = results.rows.item(0);
								console.log("first active day: " + JSON.stringify(row));
								if (row['firstActivity']) {
									console.log("do we enter with null?");
									self.firstActiveDay = row['firstActivity'];
								} else {
									self.firstActiveDay = (new Date()).getTime(); 
								}
							} else {
								self.firstActiveDay = (new Date()).getTime(); 
								console.log("get a new first active day");
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


 

//initializes all values that are needed for the calculations
StatisticsModel.prototype.getCurrentValues = function(val) {
	var timeNow = new Date().getTime();
	var time24hAgo = timeNow - TWENTY_FOUR_HOURS;
	if (val== 0) {
		return [this.currentCourseId];
	} else if (val== 1) {
	return [this.currentCourseId,time24hAgo,timeNow ];
	}else if (val== 2){
		return [this.currentCourseId,1,time24hAgo,timeNow ];
	}
	else return [];
};

StatisticsModel.prototype.getLastActiveValues = function(progressVal) {
	var lastActiveDay24hBefore = this.lastActiveDay - TWENTY_FOUR_HOURS;
	if (!progressVal){
	return [this.currentCourseId,lastActiveDay24hBefore, this.lastActiveDay ];
	}else {
	return [this.currentCourseId,1,lastActiveDay24hBefore, this.lastActiveDay ];		
	}
};




//queries the database and calculates the statistics and improvements

StatisticsModel.prototype.calculateValues = function() {
	var self = this;

	self.boolAllDone = 0;

	self.bestDay.calculateValue();
	self.handledCards.calculateValue();
	self.averageScore.calculateValue();
	self.averageSpeed.calculateValue();
	self.progress.calculateValue();

	// calculate the achievements
	self.stackHandler.calculateValue();
	self.checkAchievements(this.currentCourseId);
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


// checks if any achievements have been achieved

StatisticsModel.prototype.checkAchievements = function(courseId) {
	var self = this;
	//check if cardburner was already achieved
	self.cardBurner.calculateValue(courseId);
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
						// trigger event statistics are loaded from server
						self.statisticsIsLoaded = true;
						// FIXME: Store a flag into the local storage that the data is loaded.
						
//						var configObject = {
//								statisticsLoaded= "true"	
//						}
						self.controller.setConfigVariable("statisticsLoaded", true);
						
						self.statisticsIsLoaded = true;
						$(document).trigger("loadstatisticsfromserver");
					},
					error : function(xhr, err, errorString) {
						console
								.log("Error while getting statistics data from server: " + errorString);
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
	this.progress = new ProgressModel(this);
	this.averageSpeed = new AverageSpeedModel(this);
	this.stackHandler = new StackHandlerModel(this);
	this.cardBurner = new CardBurnerModel(this);
		
};




//Display all entries of the database

StatisticsModel.prototype.getAllDBEntries = function(){

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


}

