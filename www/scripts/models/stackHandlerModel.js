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


/*jslint vars: true, sloppy: true */

/**
 * @class StackHandlerModel 
 * This model caclulates the percentage of cards the user has handled for a specific course
 * since the first active day. 
 * @constructor 
 * It assigns a name to the specific statistics model
 * It assigns a name to the specific achievement
 * It intializes the value of the specific achievement
 * It initializes the query that will be executed for the calculation of the stack handler
 * @param {String} statisticsModel 
 */
function StackHandlerModel(statisticsModel){
    this.modelName = " stack handler";
    this.superModel = statisticsModel;
    this.achievementName = 'stackhandler';
    this.achievementValue = -1;
    this.initQuery();
}

/**
 * Create the Query "how many distinct questions the learner has handled for the specific course so far?"
 * From the counting of questions are excluded the cases when an achievement has been reached. 
 * This is identified in the database (the existence of an achievement) if the duration for a specific record as a 100 value.
 * @prototype
 * @function initQuery
 */

StackHandlerModel.prototype.initQuery = function(){
	this.query = 'SELECT DISTINCT question_id FROM statistics WHERE course_id=? AND duration!=-100';
};

/**
 * Execute the query by using the global function  queryDatabase.
 * @prototype
 * @function queryDB
 */
StackHandlerModel.prototype.queryDB = queryDatabase;



/**
 * Before calculating the stack Handler it checks whether 
 * it has been achieved or not
 * @prototype
 * @function calculateValue
 */
StackHandlerModel.prototype.calculateValue = function() {
	this.courseId = this.superModel.currentCourseId;
	this.calculateValueHelper();
};



/**
 * Check if the achievement has been reached or not by using the 
 * global function checkAchievemnt. 
 * @prototype
 * @function calculateValueHelper
 */
StackHandlerModel.prototype.calculateValueHelper = checkAchievement;

/**
 * Pass the current variables to the above query that will be
 * used in the execution of the transaction
 * The execution of the transacion is done in queryDB
 * @prototype
 * @function calculateAchievementValues
 */
StackHandlerModel.prototype.calculateAchievementValues = function(){
	var self = this;
	var val = 0;
	self.values= self.superModel.getCurrentValues(SUBMODEL_QUERY_ONE);
	moblerlog("current values for stack handler"+self.values);
	self.queryDB( 
		function cbSH(t,r) {self.calculateStackHandler(t,r);});

};


/**
 * Calculates the stack handler achievement
 * You get the stack handler if you have handled each card of a course
 * at least once
 * @prototype
 * @function calculateStackHandler
 */
StackHandlerModel.prototype.calculateStackHandler = function(transaction, results) {
	var row, a, i, self = this;
	var allCards = self.superModel.controller.models["questionpool"].questionList;
	var handledCards = [];
	var numHandledCards = 0;
	for (i = 0; i < results.rows.length; i++) {
		row = results.rows.item(i);
		handledCards.push(row['question_id']);
	}
	for (a in allCards) {
		if (handledCards.indexOf(allCards[a].id) !== -1) {
			numHandledCards++;
		}
	}
	numAllCards = allCards.length;
	if (numAllCards === 0) {
		this.achievementValue = 0;
	} else {
		this.achievementValue = Math.round((numHandledCards / numAllCards) * 100);
	}
	
	if (this.achievementValue >= 100) {
		this.insertAchievementHelper();
	}
	moblerlog("stackHandler: " + self.achievementName + " handled: " + numHandledCards + " all: " + numAllCards);
	moblerlog("stackHandler: " + this.achievementValue + " handled: " + numHandledCards + " all: " + numAllCards);
	//When the calculation is done, this model notifies the statistics model by increasing the boolAllDone value 
	//and calling then the allCalculationsDone() function, where the counting of the so far calculated statistis metrics
	//will be done summative 
	self.superModel.boolAllDone++;
	self.superModel.allCalculationsDone();

};


/**Inserting of markers in the database when the card burner has been reached
 * This is executed in the globabal function insertAchievement
 * @prototype
 * @function insertAchievementHelper
 */
StackHandlerModel.prototype.insertAchievementHelper = insertAchievement;






