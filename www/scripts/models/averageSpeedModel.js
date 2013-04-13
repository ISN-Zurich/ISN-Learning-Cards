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
 * @class AverageSpeedModel 
 * This model caclulates the average speed that a user nneds to answer a question of a specific course.
 * The duration time that is spent on a question is calculated from the time the user enters the
 * question view until the time he leaves the answer view.
 * It also checks the improvement of the average speed in time and accordingly
 * notifies the user via colorfoul up and down arrows in the GUI if there was any improvement in the speed or the opposite.
 * @constructor 
 * It assigns a name to the specific statistics model
 * It initializes average speed
 * It intializes the improvement value of the average speed
 * It initializes the query that will be executed for the calculation of the average speed
 * @param {String} statisticsModel 
 */
function AverageSpeedModel(statisticsModel){
    this.modelName = "avg speed";
    this.superModel = statisticsModel;
    this.averageSpeed = -1;
    this.improvementSpeed = 0;
    this.initQuery();
}


/**
 * Creates the Query "select the sum of the duration time spent on a question, as well as the number of the answered questions for a specific course for the last 24 hours "
 * From the counting of questions are excluded the cases when an achievement has been reached. 
 * This is identified in the database (the existence of an achievement) if the duration for a specific record as a 100 value.
 * @prototype
 * @function initQuery
 */
AverageSpeedModel.prototype.initQuery = function(){

	this.query = 'SELECT sum(duration) as duration, count(id) as num FROM statistics WHERE course_id=? AND duration!=-100'
		+ ' AND day>=? AND day<=?' + ' GROUP BY course_id';
};



/**
 * Pass the current variables to the above query that will be
 * used in the execution of the transaction
 * The execution of the transacion is done in queryDB
 * @prototype
 * @function calculateValue
 */
AverageSpeedModel.prototype.calculateValue = function(){
	var self = this;
	self.values= self.superModel.getCurrentValues(SUBMODEL_QUERY_THREE);
	self.queryDB( 
		function cbASp(t,r) {self.calculateAverageSpeed(t,r);});

};

/**
 * Executes the query by using the global function queryDatabase
 * where the transaction is executed
 * @prototype
 * @function queryDB
 */
AverageSpeedModel.prototype.queryDB = queryDatabase;


/**Calculates the average time that was needed to handle a card
 * If not records/results were found after the execution of the query, 
 * then the average speed is set to zero.
 * @prototype
 * @function calculateAverageSpeed
 * @param transaction, results
 */
AverageSpeedModel.prototype.calculateAverageSpeed = function(transaction, results) {
	
	var self = this;
	moblerlog("rows: " + results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		moblerlog("row: " + JSON.stringify(row));
		if (row['num'] === 0) {
			this.averageSpeed = 0;
		} else {
			this.averageSpeed = Math.round((row['duration'] / row['num']) / 1000);
		}
		moblerlog("AVERAGE SPEED: " +this.averageSpeed);

	} else {
		this.averageSpeed = 0;
	}
	
	//calculate improvement by executing the same query for the last active day
	self.values = self.superModel.getLastActiveValues();
	self.queryDB(function cbCalculateImprovements(t,r) {
		self.calculateImprovementAverageSpeed(t,r);
	});
};


/**calculates the improvement of the average speed in comparison to the last active day
 * @prototype
 * @function calculateImprovementAverageSpeed
 */
AverageSpeedModel.prototype.calculateImprovementAverageSpeed = function (transaction,results){
	
	var self = this;
	moblerlog("rows in calculate improvement average speed: "+ results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		moblerlog("row: " + JSON.stringify(row));
		var oldAverageSpeed = 0;
		if (row['num'] !== 0) {
			oldAverageSpeed = Math.round((row['duration'] / row['num']) / 1000);
		}
		newAverageSpeed = this.averageSpeed;
		if (oldAverageSpeed === 0 && newAverageSpeed !== 0) {
			this.improvementSpeed = -1;
		} else	if (newAverageSpeed !== 0) {
			this.improvementSpeed = (newAverageSpeed - oldAverageSpeed);
		
		} else if (oldAverageSpeed === 0) {
			this.improvementSpeed = 0;
		} else {
			this.improvementSpeed = 1;
		}
		moblerlog("improvement average speed: "+ this.improvementSpeed);
		/**
		 * It is triggered when the calculations of the average speed and its 
		 * improvement have been finished
		 ** @event statisticcalculationsdone
		 */
		$(document).trigger("statisticcalculationsdone");
		
	} else {
		this.improvementSpeed=(-this.averageSpeed);
	}
	//When the calculation is done, this model notifies the statistics model by increasing the boolAllDone value 
	//and calling then the allCalculationsDone() function, where the counting of the so far calculated statistis metrics
	//will be done summative 
	this.superModel.boolAllDone++;
	this.superModel.allCalculationsDone();
		
};





