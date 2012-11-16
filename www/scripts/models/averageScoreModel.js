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
 * @class AverageScoreModel 
 * This model caclulates the average score of a user for a specific course. 
 * It also checks the improvement of the average score in time and accordingly
 * notifies the user via up and down arrows in the GUI if the improvement was positive or negative.
 * @constructor 
 * It assigns a name to the specific statistics model
 * It initializes average score
 * It intializes the improvement value of the average score
 * It initializes the query that will be executed for the calculation of the average score
 * @param {String} statisticsModel 
 */
function AverageScoreModel(statisticsModel){
    this.modelName = "avg score";
    this.superModel = statisticsModel;
    this.averageScore = -1;
    this.improvementAverageScore = 0;
    this.initQuery();
    
	
}

/**
 * Creates the Query "select the sum of the score, as well as the number of the answered questions for a specific course for the last 24 hours "
 * From the counting of questions are excluded the cases when an achievement has been reached. 
 * This is identified in the database (the existence of an achievement) if the duration for a specific record as a 100 value.
 * @prototype
 * @function initQuery
 */
AverageScoreModel.prototype.initQuery = function(){
	   
	this.query = 'SELECT sum(score) as score, count(id) as num FROM statistics WHERE course_id=? AND duration!=-100'
		+ ' AND day>=? AND day<=?' + ' GROUP BY course_id';

};


/**
 * Pass the current variables to the above query that will be
 * used in the execution of the transaction.
 * The execution of the transacion is done in queryDB
 * @prototype
 * @function calculateValue
 */
AverageScoreModel.prototype.calculateValue = function(){
	var self = this;
	self.values= self.superModel.getCurrentValues(SUBMODEL_QUERY_THREE);
	self.queryDB( 
			function cbAS(t,r) {self.calculateAverageScore(t,r);});

};

/**
 * Execute the query by using the global function queryDatabase
 * where the transaction is executed
 * @prototype
 * @function queryDB
 */
AverageScoreModel.prototype.queryDB = queryDatabase;


/**
 * Calculates the average score that was achieved by
 * dividing the sum score with the number of records that were identified
 * Afterwards this function executes a query that calculates
 * the value of the average score on the last active day.
 * @prototype
 * @function calculateAverageScore
 * @param transaction, results
 */
AverageScoreModel.prototype.calculateAverageScore = function(transaction, results) {
	
	var self = this;
	moblerlog("rows: " + results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		moblerlog("row: " + JSON.stringify(row));
		if (row['num'] === 0) {
			this.averageScore = 0;
		} else {
			this.averageScore =  Math.round((row['score'] / row['num']) * 100);
		}
		moblerlog("AVERAGE SCORE: " + this.averageScore);
	} else {
		this.averageScore = 0;
	}
	
	// calculate improvemen by executing the same query for the last active day
	// so the day arguments are different
		self.values = self.superModel.getLastActiveValues();
	self.queryDB(function cbCalculateImprovements(t,r) {
		self.calculateImprovementAverageScore(t,r);
	});
	
};


/**
 *Calculates the improvement of the average score in comparison to the last active day
 *@prototype
 *@function calculateImprovementAverageScore
 *@param transaction, results
 */
AverageScoreModel.prototype.calculateImprovementAverageScore = function (transaction,results){
	
	var self = this;
	moblerlog("rows in calculate improvement average score: "+ results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		moblerlog("row: " + JSON.stringify(row));
		var oldAverageScore = 0;
		if (row['num'] !== 0) {
			oldAverageScore = Math.round((row['score'] / row['num']) * 100);
		}
		newAverageScore = this.averageScore;
		this.improvementAverageScore = newAverageScore - oldAverageScore;
		/**
		 * It is triggered when the calculations of the average Score and its 
		 * improvement have been finished
		 ** @event statisticcalculationsdone
		 */
		$(document).trigger("statisticcalculationsdone");
		
	} else {
		//if no results were retrieved for the last active day then 
		//the improvement score is the same with the average score of the
		//current 24 hours
	  this.improvementAverageScore = this.averageScore;
	}
	moblerlog("improvement average score: "+ this.improvementAverageScore);
	//When the calculation is done, this model notifies the statistics model by increasing the boolAllDone value 
	//and calling then the allCalculationsDone() function, where the counting of the so far calculated statistis metrics
	//will be done summative 
	this.superModel.boolAllDone++;
	this.superModel.allCalculationsDone();
		
};





