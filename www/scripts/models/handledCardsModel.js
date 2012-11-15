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
 * @class HandledCardsModel  
 * This model holds how many cards the users has handled for a course
 * @constructor 
 * It initializes the  number of handled cars as well as their improvement in time
 * It initializes the query, so that it will be ready when the value will be calculated
 * @param {String} statisticsModel 
 */
function HandledCardsModel(statisticsModel){
    this.modelName = " handled cards";
    this.superModel = statisticsModel;
    this.handledCards = -1;
    this.improvementHandledCards = 0;
    this.initQuery();
}


/**
 * Create the Query "how many questions the learner has handled for the specific course?"
 * From the counting of questions are excluded the cases when an achievement has been reached. 
 * This is identified in the database (the existence of an achievement) if the duration for a specific record as a 100 value.
 * @prototype
 * @function initQuery
 */
HandledCardsModel.prototype.initQuery = function(){
	this.query = 'SELECT count(*) as c FROM statistics WHERE course_id=? AND duration!=-100 AND day>=? AND day<=?';
};


/**
 * Execute the query by using the global function  queryDatabase.
 * * @prototype
 * @function queryDB
 */
HandledCardsModel.prototype.queryDB = queryDatabase;


/**
 * Execute the query by assigning its current values 
 * in order to calculate the handled cards in the results handler (=calculateHandledCards)
 * @prototype
 * @function calculateValue
 */
HandledCardsModel.prototype.calculateValue = function(){
	var self = this;
	self.values = self.superModel.getCurrentValues(SUBMODEL_QUERY_THREE);
	moblerlog("current values for handled cards"+ self.values.join(", "));
	self.queryDB( 
		function cbHC(t,r) {self.calculateHandledCards(t,r);});

};


/**
 * Calculates how many cards have been handled for the specific course
 * from the first active day
 * Calculates the improvement of the number of handled cards during the last 24 hours
 * @prototype
 * @function calculateHandledCards
 * @param transaction, resutls
 */
HandledCardsModel.prototype.calculateHandledCards = function(transaction, results) {
	var self = this;
	if (results.rows.length > 0) {
		var row = results.rows.item(0);
		moblerlog("number of handled cards:" + row['c']);
		this.handledCards = row['c'];
		moblerlog("handledCards:"+this.handledCards);

	} else {
		self.handledCards = 0;
	}
	
	// calculate improvement
	
	self.values = self.superModel.getLastActiveValues();
	self.queryDB(function cbCalculateImprovements(t,r) {
		self.calculateImprovementHandledCards(t,r);
	});

};


/**
 * Calculates the improvement of number of the handled cards in comparison to the last active day
 * @prototype
 * @function calculateImprovementHandledCards
 * @param transaction, resutls
 */
HandledCardsModel.prototype.calculateImprovementHandledCards = function (transaction,results){
	
	var self = this;
	moblerlog("rows in calculate improvement handled cards: "+ results.rows.length);
	if (results.rows.length > 0) {
		var row = results.rows.item(0);
		moblerlog("number of handled cards:" + row['c']);
		oldHandledCards = row['c'];
		newHandledCards = this.handledCards;
		this.improvementHandledCards  = newHandledCards - oldHandledCards;
		moblerlog("improvement handled cards: "+ this.improvementHandledCards);
		/**
		 * It is triggered when the calculations of the number of handler cards
		 * has been finished 
		 ** @event statisticcalculationsdone
		 */
		$(document).trigger("statisticcalculationsdone");
		
	} else {
		this.improvementHandledCards = this.handledCards;
	}
	//When the calculation is done, this model notifies the statistics model by increasing the boolAllDone value 
	//and calling then the allCalculationsDone() function, where the counting of the so far calculated statistis metrics
	//will be taken into account
	this.superModel.boolAllDone++;
	this.superModel.allCalculationsDone();		
};





