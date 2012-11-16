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
 * @class CardBurnerModel 
 * This model calculates how many cards the user has handled within 24 hours. If the user 
 * has handled at least 100 then he has reached the achievement "Card Burner". 
 * Once this achievement has been reached, it shouldn't be recaulculated.
 * @constructor 
 * It assigns a name to the specific statistics model
 * It assigns a name to the specific achievement
 * It intializes the value of the specific achievement
 * It initializes the query that will be executed for the calculation of the card burner
 * @param {String} statisticsModel 
 */
function CardBurnerModel(statisticsModel){
    this.modelName = " card burner";
    this.superModel = statisticsModel;
    this.achievementName = 'cardburner';
    this.achievementValue = -1;
    this.initQuery();
}


/**
 * Create the Query "how many questions the learner has handled for the specific course in 24 hours?"
 * From the counting of questions are excluded the cases when an achievement has been reached. 
 * This is identified in the database (the existence of an achievement) if the duration for a specific record as a 100 value.
 * @prototype
 * @function initQuery
 */
CardBurnerModel.prototype.initQuery = function(){
	   
	this.query = "SELECT count(*) as c FROM statistics WHERE course_id=? AND duration!=-100 AND day>=? AND day<=?";
};


/**
 * Execute the query by using the global function  queryDatabase.
 * @prototype
 * @function queryDB
 */
CardBurnerModel.prototype.queryDB = queryDatabase;


/**
 * Before calculating the card burner it checks whether it has been achieved or not
 * @prototype
 * @function calculateValue
 */
CardBurnerModel.prototype.calculateValue = function(courseId){
	this.courseId = courseId;
	this.calculateValueHelper();
	
};


/**
 * Check if the achievement has been reached or not by using the 
 * global function checkAchievemnt. 
 * @prototype
 * @function calculateValueHelper
 */
CardBurnerModel.prototype.calculateValueHelper = checkAchievement;


/**
 * Pass the current variables to the above query that will be
 * used in the execution of the transaction
 * The execution of the transacion is done in queryDB
 * @prototype
 * @function calculateAchievementValues
 */
CardBurnerModel.prototype.calculateAchievementValues = function(){
	var self = this;
    self.values= self.superModel.getCurrentValues(SUBMODEL_QUERY_THREE);
	moblerlog("current values for card burner"+self.values);
	self.queryDB( 
		function cbSH(t,r) {self.calculateCardBurner(t,r);});

};


/**
 * Calculates the card burner achievement
 * You get the card burner if you have handled at least once 100 cards within 1 day
 * @prototype
 * @function calculateCardBurner
 * @param transaction, results
 */
CardBurnerModel.prototype.calculateCardBurner = function(transaction, results) {
	
	var self = this;
	if (results.rows.length > 0) {
		var row = results.rows.item(0);
		
		//if card burner was achieved (100 handled cards within 24 hours)
		//some markers (via the achievement helper function) are inserted into the database 
		if (row['c'] >= 100) {
			moblerlog("cardburner was achieved");
			this.achievementValue = 100;
			this.insertAchievementHelper();
		} else {
			this.achievementValue = row['c'];
			moblerlog("cardburner still not achieved yet");
		}
	}
	
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
CardBurnerModel.prototype.insertAchievementHelper = insertAchievement;




