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
 * @class BestDayScoreModel 
 * This model caclulates the best score of a user for a specific course and the day
 * on which this best score was achieved. The best score is calculated within the time range
 * from the first active day until the current one. 
 * @constructor 
 * It assigns a name to the specific statistics model
 * It initializes the best day
 * It initializes the best score
 * It initializes the query that will be executed for the calculation of the best day and score
 * @param {String} statisticsModel 
 */
function BestDayScoreModel(statisticsModel){
    this.modelName = " best day";
    this.superModel = statisticsModel;
    this.bestDay= -1;
    this.bestScore = -1;
    this.initQuery();
}


/**
 * Creates the Query "Select the day, the sum of the score, as well as the number of the questions that were answered for a specific course 
 * From the counting of questions are excluded the cases when an achievement has been reached. 
 * This is identified in the database (the existence of an achievement) if the duration for a specific record as a 100 value.
 * @prototype
 * @function initQuery
 */
BestDayScoreModel.prototype.initQuery = function(){
	
	this.query = 'SELECT min(day) as day, sum(score) as score, count(id) as num'
		+ ' FROM statistics WHERE course_id=? AND duration!=-100'
		+ ' GROUP BY DATE(day/1000, "unixepoch")';
};


/**
 * Pass the current variables to the above query that will be
 * used in the execution of the transaction
 * The execution of the transacion is done in queryDB
 * @prototype
 * @function calculateValue
 */
BestDayScoreModel.prototype.calculateValue = function(){
	var self = this;
	
	self.values= self.superModel.getCurrentValues(SUBMODEL_QUERY_ONE);
	self.queryDB( function cbBDS(t,r) {self.calculateBestDayAndScore(t,r);});
};


/**
 * Executes the query by using the global function queryDatabase
 * where the transaction is executed
 * @prototype
 * @function queryDB
 */
BestDayScoreModel.prototype.queryDB = queryDatabase;


/**Calculates the best average score that the user reached 
 * as well as on which day it was reached
 * @prototype
 * @function calculateAverageSpeed
 * @param transaction, results
 */
BestDayScoreModel.prototype.calculateBestDayAndScore = function(transaction, results) {
	
	moblerlog("best day rows: " + results.rows.length);
	var self = this;
	var i, bestDay;
	var bestScore = -1;
	for (i = 0; i < results.rows.length; i++) {
		row = results.rows.item(i);
		moblerlog(JSON.stringify(row));
		score = 0;
		if (row['num'] !== 0) {
			score = row['score'] / row['num'];
		}
		if (score >= bestScore) {
			bestDay = row['day'];
			bestScore = score;
		}
	}
	moblerlog("best day: " + bestDay);
	this.bestDay = bestDay;
	this.bestScore = Math.round(bestScore * 100);
	moblerlog("best score:"+bestScore);
	/**
	 * It is triggered when the calculations of the best average Score and 
	 * then day on which it was reached have been finished
	 ** @event statisticcalculationsdone
	 */
	$(document).trigger("statisticcalculationsdone");
	//When the calculation is done, this model notifies the statistics model by increasing the boolAllDone value 
	//and calling then the allCalculationsDone() function, where the counting of the so far calculated statistis metrics
	//will be done summative 
	this.superModel.boolAllDone++;
	moblerlog("best day calculation done");
	this.superModel.allCalculationsDone();	
};









