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
 * @class ProgressModel 
 * This model caclulates the number (in percentage) of questions of a specific course 
 * that were answered correctly. It shows the progress of a user.
 * It also checks if the progress is improved in time, by comparing the percentage value between
 * the current day and the last active day.
 * @constructor 
 * It assigns a name to the specific statistics model
 * It initializes the progress value
 * It intializes the improvement value of the progress
 * It initializes the query that will be executed for the calculation of progress
 * @param {String} statisticsModel 
 */
function ProgressModel(statisticsModel){
    this.modelName = " progress";
    this.superModel = statisticsModel;
    this.progress = -1;
    this.improvementProgress = 0;
    this.initQuery();
}


/**
 * Creates the Query "select the distinct number of questions of a specific course that are answered correctly within 24 hours"
 * From the counting of questions are excluded the cases when an achievement has been reached. 
 * This is identified in the database (the existence of an achievement) if the duration for a specific record as a 100 value.
 * @prototype
 * @function initQuery
 */
ProgressModel.prototype.initQuery = function(){
	
	this.values = [];
	this.valuesLastActivity = [];
	this.query = 'SELECT count(DISTINCT question_id) as numCorrect FROM statistics WHERE course_id=? AND duration!=-100 AND score=?'
		+ ' AND day>=? AND day<=?';
};


/**
 * Pass the current variables to the above query that will be
 * used in the execution of the transaction.
 * The execution of the transacion is done in queryDB
 * @prototype
 * @function calculateValue
 */
ProgressModel.prototype.calculateValue = function(){
	var self = this;
	self.values= self.superModel.getCurrentValues(SUBMODEL_QUERY_FOUR);
	moblerlog("current values progess model" +self.values);
	self.queryDB( 
		function cbP(t,r) {self.calculateProgress(t,r);});
};


/**
 * Execute the query by using the global function queryDatabase
 * where the transaction is executed
 * @prototype
 * @function queryDB
 */
ProgressModel.prototype.queryDB = queryDatabase;


/**
 * Calculates the progress (the correctly answered questions for a specific course) within the last 24 hours.
 * If there are no questions to be answered (cards=0) then the progress is zero.
 * @prototype
 * @function calculateProgress
 * @param transaction, results
 */
ProgressModel.prototype.calculateProgress = function(transaction, results) {
	
	var self = this;
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		moblerlog("number of correct questions:" + row['numCorrect']);
		moblerlog("number of answered questions:"+ self.superModel.handledCards.handledCards);
		cards = self.superModel.controller.models['questionpool'].questionList.length;
		if (cards === 0) {
			this.progress = 0;
		} else {
		this.progress = Math.round(((row['numCorrect']) / cards) * 100);
		}
		moblerlog("progress: " +this.progress);
	} else {
		this.progress = 0;
	}

	// calculate improvement by executing the same query for the last active day
	var progressVal = true;
	self.values = self.superModel.getLastActiveValues(progressVal);
	self.queryDB(function cbCalculateImprovements(t,r) {
		self.calculateImprovementProgress(t,r);
	});
};


/**
 * Calculates the number of correctly answered questions(the percentage value of it) in the 
 * last active day and compares it with the progress value of the current day.
 * If no results are retrieved, then there is no improvement.
 * @prototype
 * @function calculateImprovementProgress
 * @param transaction, results
 */
ProgressModel.prototype.calculateImprovementProgress= function (transaction,results){
	var self = this;
	moblerlog("rows in calculate improvement progress: "+ results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		moblerlog("progress row" + JSON.stringify(row));
		cards = self.superModel.controller.models['questionpool'].questionList.length;
		if (cards === 0) {
			this.improvementProgress = 0;
		} else {
			moblerlog("Progress Num Correct: " + row['numCorrect']);
			oldProgress = Math
				.round(((row['numCorrect']) / cards) * 100);
			newProgress = this.progress;
			this.improvementProgress = newProgress - oldProgress;
			moblerlog("improvement progress: " + this.improvementProgress);
			/**
			 * It is triggered when the calculations of user's progress and its 
			 * improvement have been finished
			 ** @event statisticcalculationsdone
			 */
			$(document).trigger("statisticcalculationsdone");
		}
	} else {
		this.improvementProgress = this.progress;
	}
	//When the calculation is done, this model notifies the statistics model by increasing the boolAllDone value 
	//and calling then the allCalculationsDone() function, where the counting of the so far calculated statistis metrics
	//will be done summative 
	this.superModel.boolAllDone++;
	this.superModel.allCalculationsDone();	
	
	
		
};





