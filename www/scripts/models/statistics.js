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

/**
 * @author Isabella Nake
 * @author Evangelia Mitsopoulou
*/

/*jslint vars: true, sloppy: true */


/**
 * @function queryDatabase
 * @param cbResult
 * */


function queryDatabase(cbResult){
	moblerlog("enter queryDatabase " + this.modelName);
	var self = this;
	self.superModel.db.transaction(function(transaction) {
                                   transaction.executeSql(self.query, self.values, cbResult, function(tx,e) {moblerlog("DB Error cause: " + self.modelName); self.superModel.dbErrorFunction(tx,e);});
	});
}


/**
 * Each achivement, either a stackhandler or a card burner should be reached and calculated only once.
 * Check in this function if an achievement of any type (stackhandler or card burner) was already achieved
 * If an achievement has not been reached done then calculation of the value of the achievement
 * is performed as normal 
 * @function checkAchievements
 * */

function checkAchievement() {
	var self = this;
	self.superModel.db.transaction(function(transaction) {
		transaction.executeSql( "SELECT * FROM statistics WHERE course_id = ? AND question_id = ?", [this.courseId, this.achievementName], 
                               function cbSuccess(t,r) {
                               if ( r.rows.length > 0 ) {
                                  self.achievementValue = 100;
                                  self.superModel.allDone();
                               } else {
                                  self.calculateAchievementValues();
                               }
                               },
                               self.superModel.dbErrorFunction);
	});
}


/**
 * When an achievement is reached (score =100), it is inserted in the database of the server
 * by assigning an -100 value to the duration property 
 * * @function insertAchievement
 * */

function insertAchievement() {
	var self = this;
	var insert = 'INSERT INTO statistics(course_id, question_id, day, score, duration) VALUES (?, ?, ?, ?, ?)';
	var insertValues = [ self.courseId, this.achievementName, (new Date()).getTime(), 100, -100];
	self.superModel.queryDB(insert, insertValues, function() {
				moblerlog("successfully inserted achievement");
			});
}



/**
 *A global property/variable that activates and deactivates the display of console logs.
 *It is passed as parameter in global function moblerlog in common.js.
 *
 *@property MOBLERDEBUG
 *@default 0
 *
 **/

var MOBLERDEBUG = 1;

/**
 *Global properties/variables that show the number of values 
 *that are passed and returned during the execution of the queries
 *in the various statistics sub models
 *
 *@property SUBMODEL_QUERY_ONE
 *@default 1, it applies to BestDayScore model
 *
 *@property SUBMODEL_QUERY_ONE
 *@default 3, it applies to AverageScore, AverageSpeed, HandledCards, CardBurner models
 *
 *@property SUBMODEL_QUERY_ONE
 *@default 4, it applies to Progress Model
 **/

var SUBMODEL_QUERY_ONE = 1;
var SUBMODEL_QUERY_THREE = 3;
var SUBMODEL_QUERY_FOUR = 4;


/**
 *Global property/variable that stores the
 *duration of a day in miliseconds. It is used as a means
 *of co
 
 *@property TWENTY_FOUR_HOURS
 *@default 1000 * 60 * 60 * 24
 **/

var TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24; 





/**
 * @class StatisticsModel 
 * This model holds the statistics for a course
 * @constructor 
 * It sets and initializes basic properties such as:
 *  - the current course Id
 *  - the first active and last active day
 *  - the time that data were last sent to the server
 *  - local database
 * It loads data from the server if the user is logged in
 * It listens to an event that is triggered when achievements are checked whether they have been reached or not 
 * @param {String} controller 
 */


function StatisticsModel(controller) {
	var self = this;
	this.controller = controller;
	//initialization of model's variables
	this.lastSendToServer;
	this.db = openDatabase('ISNLCDB', '1.0', 'ISN Learning Cards Database',	100000);
	this.currentCourseId = -1;
	this.firstActiveDay;
	this.lastActiveDay;
	
	self.statisticsIsLoaded = self.controller.getConfigVariable("statisticsLoaded");
	moblerlog("statistcsIsLoaded is" + self.controller.getConfigVariable("statisticsLoaded"));
	
	// check the localstorage if the the data is already loaded
	// if the the data is not loaded but the user is logged in, then loadFromServer 
	
	if (this.controller.getConfigVariable("statisticsLoaded")== false && self.controller.getLoginState()){
		moblerlog("enters heree");
			self.loadFromServer();
	}
	
	/**
	 * It is triggered in Statistics Model when calculations are done in all statistics sub models.  
	 * @event checkachievements
	 * @param: a callback function that 
	 * FIXME: the call back is undefined
	 * */
	
	$(document).bind("checkachievements", function(p, courseId) {
		//self.checkAchievements(courseId);
		self.cardBurner.calculateValue(courseId);
	});
	
}

/**
 * Sets the current course id and starts the calculations
 * @prototype
 * @function setCurrentCourseId
 */

StatisticsModel.prototype.setCurrentCourseId = function(courseId) {
	var s;
    this.currentCourseId = courseId;

	for ( s in this.statistics) {
		this.statistics[s] = -1;
	}
	
	moblerlog("course-id: " + courseId);
	//this.getAllDBEntries(); //useful for debugging, defined in the end of the file
	this.controller.models['questionpool'].loadData(courseId);
	moblerlog("statistics are loaded? " + (this.statisticsIsLoaded ? "yes1" : "no1"));
	moblerlog("statistics are loaded? " + (this.controller.getConfigVariable("statisticsLoaded") ? "yes2" : "no2"));
	//if (this.statisticsIsLoaded ) {
	if (this.controller.getConfigVariable("statisticsLoaded")== true){	
		// load the appropriate models for our course
		this.initSubModels();
      	moblerlog("sub models are initialized");
		//checks if card burner achievement was already achieved
		//and starts the calculations
       //this.checkCardBurner();
		this.getFirstActiveDay();
	}
	else {
        
		$(document).trigger("allstatisticcalculationsdone");	
	}
};


/**
 * @prototype
 * @function getStatistics
 * @return statistics
 */

 
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


// gets the timestamp of the first activity
 
StatisticsModel.prototype.getFirstActiveDay = function() {
	moblerlog("enters first active day");
	var self = this;
	this.queryDB('SELECT min(day) as firstActivity FROM statistics WHERE course_id=? AND duration != -100',
						[ self.currentCourseId ], 
						function dataSelectHandler(transaction, results) {
							if (results.rows.length > 0) {
								row = results.rows.item(0);
								moblerlog("first active day: " + JSON.stringify(row));
								if (row['firstActivity']) {
									moblerlog("do we enter with null?");
									self.firstActiveDay = row['firstActivity'];
								} else {
									self.firstActiveDay = (new Date()).getTime(); 
								}
							} else {
								self.firstActiveDay = (new Date()).getTime(); 
								moblerlog("get a new first active day");
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
		this.queryDB('SELECT count(id) as counter FROM statistics WHERE course_id=? AND duration != -100 AND day>=? AND day<=?',
							[ self.currentCourseId, (day - TWENTY_FOUR_HOURS), day ], 
							function dataSelectHandler( transaction, results) {
								if (results.rows.length > 0 && results.rows.item(0)['counter'] !== 0) {
										moblerlog("active day: " + day);
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
    var retval = [];
    switch (val){
        case 0:
            retval =  [this.currentCourseId];
            break;
        case 1:
            retval = [this.currentCourseId,time24hAgo,timeNow ];
            break;
        case 2:
        default:
            retval = [this.currentCourseId,1,time24hAgo,timeNow ];
            break;
	}
    return retval;
};

StatisticsModel.prototype.getLastActiveValues = function(progressVal) {
	var lastActiveDay24hBefore = this.lastActiveDay - TWENTY_FOUR_HOURS;
	if (!progressVal){
        return [this.currentCourseId,lastActiveDay24hBefore, this.lastActiveDay ];
    }
	return [this.currentCourseId,1,lastActiveDay24hBefore, this.lastActiveDay ];
	
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
	moblerlog(" finished n="+this.boolAllDone +" calculations");
	if ( this.boolAllDone === 6) {
		$(document).trigger("allstatisticcalculationsdone");
    }
};

// class for querying the database

StatisticsModel.prototype.queryDB = function(query, values, cbResult) {
	var self = this;
	self.db.transaction(function(transaction) {
                        transaction.executeSql(query, values, cbResult, function(tx,e) {self.dbErrorFunction(tx,e);});
                        });
};


// checks if any achievements have been achieved

StatisticsModel.prototype.checkAchievements = function(courseId) {
	//check if cardburner was already achieved
	self.cardBurner.calculateValue(courseId);
};


//function that is called if an error occurs while querying the database
 
StatisticsModel.prototype.dbErrorFunction = function(tx, e) {
	moblerlog("DB Error: " + e.message);
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
						moblerlog("success");
                      moblerlog("JSON: " + data);
						var i, statisticsObject;
						try {
							statisticsObject = data;
                      moblerlog("statistics data from server: " + JSON.stringify(statisticsObject));
						} catch (err) {
							moblerlog("Error: Couldn't parse JSON for statistics");
						}

						if (!statisticsObject) {
							statisticsObject = [];
						}
						
						for ( i = 0; i < statisticsObject.length; i++) {
							self.insertStatisticItem(statisticsObject[i]);
						}
						moblerlog("after inserting statistics from server");
						// trigger event statistics are loaded from server
						//self.statisticsIsLoaded = true;
						// FIXME: Store a flag into the local storage that the data is loaded.
						
//						var configObject = {
//								statisticsLoaded= "true"	
//						}
						self.controller.setConfigVariable("statisticsLoaded", true);
						
						//self.statisticsIsLoaded = true;
						$(document).trigger("loadstatisticsfromserver");
					},
					error : function(xhr, err, errorString) {
						moblerlog("Error while getting statistics data from server: " + errorString);
					},
                      beforeSend : function setHeader(xhr) {
                      xhr.setRequestHeader('sessionkey',
                                           self.controller.models['authentication'].getSessionKey());
                      }
				});
	}
};


//inserts the statistic item into the database if it doesn't exist there yet

StatisticsModel.prototype.insertStatisticItem = function(statisticItem) {
	var self = this;
    moblerlog("day: " + statisticItem['day']);
	
	self
	.queryDB(
			"SELECT id FROM statistics WHERE day = ?",
			[ statisticItem['day'] ], function cbSelect(t,r) {checkIfItemExists(t,r);});

	function checkIfItemExists(transaction, results) {
		var item = statisticItem;
		if (results.rows.length === 0) {
			moblerlog("No entry for day: " + item['day']);
			query = "INSERT INTO statistics(course_id, question_id, day, score, duration) VALUES (?,?,?,?,?)";
			values = [ item['course_id'],
			           item['question_id'],
			           item['day'],
			           item['score'],
			           item['duration'] ];
			self.queryDB(query, values, function cbInsert(transaction,
					results) {
                         moblerlog("after inserting");
			});
		}
	}
};


/**Sends statistics data to the server
 * @function sendToServer
 * */

StatisticsModel.prototype.sendToServer = function() {
	var self = this;
	var url = self.controller.models['authentication'].urlToLMS + '/statistics.php';
	moblerlog("url statistics: " + url);

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
				moblerlog("error! while loading pending statistics");
			}
			
			sessionkey = pendingStatistics.sessionkey;
			uuid = pendingStatistics.uuid;
			statistics = pendingStatistics.statistics;
			numberOfStatisticsItems = statistics.length; 
		}else {
			numberOfStatisticsItems = results.rows.length;
            var i;
			moblerlog("results length: " + results.rows.length);
			for ( i = 0; i < results.rows.length; i++) {
				row = results.rows.item(i);
				statistics.push(row);
                moblerlog("sending " + i + ": " + JSON.stringify(row));
			}
			sessionkey = self.controller.models['authentication'].getSessionKey();
			uuid = device.uuid;
		}
		
		moblerlog("count statistics=" + statistics.length);
		var statisticsString = JSON.stringify(statistics);
		
		//processData has to be set to false!
		$.ajax({
			url : url,
			type : 'PUT',
			data : statisticsString,
			processData: false,
			success : function(data) {
				moblerlog("statistics data successfully send to the server");
				localStorage.removeItem("pendingStatistics");
				
				if (data) {
					if (numberOfStatisticsItems < data) {
						moblerlog("server has more items than local database -> fetch statistics from server");
						self.loadFromServer();
					}
				}
				
				self.lastSendToServer = (new Date()).getTime();
				$(document).trigger("statisticssenttoserver");
			},
			error : function() {
				moblerlog("Error while sending statistics data to server");
				var statisticsToStore = {
					sessionkey : sessionkey,
					uuid : device.uuid,
					statistics : statistics
				};
				localStorage.setItem("pendingStatistics", JSON.stringify(statisticsToStore));
				$(document).trigger("statisticssenttoserver");
			},
               beforeSend : function setHeader(xhr) {
               xhr.setRequestHeader('sessionkey', sessionkey);
               xhr.setRequestHeader('uuid', device.uuid);
               }
		});
	}

};

/**Initialization of sub models
 * @function initSubModels
 * */

StatisticsModel.prototype.initSubModels = function(){
    moblerlog("start submodel initializion")
	this.bestDay = new BestDayScoreModel(this);
    moblerlog("finish submodel bestday");

	this.handledCards = new HandledCardsModel(this);
    moblerlog("finish submodel handled cards");

	this.averageScore = new AverageScoreModel(this);
    moblerlog("finish submodel avg score");

	this.progress = new ProgressModel(this);
    moblerlog("finish submodel progress");

	this.averageSpeed = new AverageSpeedModel(this);
    moblerlog("finish submodel avg speed");

	this.stackHandler = new StackHandlerModel(this);
    moblerlog("finish submodel stackhandler");

	this.cardBurner = new CardBurnerModel(this);
    moblerlog("finish submodel initialization");
};



/**Display all entries of the database for a specific course
 * @function getAllDBEntries
 * */

StatisticsModel.prototype.getAllDBEntries = function(){

	this.db.transaction(function(transaction) {
		transaction
		.executeSql('SELECT * FROM statistics WHERE course_id=?',
				[ courseId ], dataSelectHandler, function(tx, e) {
			moblerlog("Error for select average score: "+ e.message);
		});
	});

	//handler of 
	function dataSelectHandler(transaction, results) {
        var i;
		moblerlog("ALL ROWS: " + results.rows.length);
		for ( i = 0; i < results.rows.length; i++) {
			row = results.rows.item(i);

			moblerlog(i + ": " + JSON.stringify(row));
		}
	}
};



