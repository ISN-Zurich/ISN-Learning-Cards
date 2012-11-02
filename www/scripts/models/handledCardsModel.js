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

function HandledCardsModel(statisticsModel){
    this.modelName = " handled cards";
    this.superModel = statisticsModel;
    this.handledCards = -1;
    this.cardBurner = -1;
    this.improvementHandledCards = 0;
    this.initQuery();
}

HandledCardsModel.prototype.initQuery = function(){
	this.query = 'SELECT count(*) as c FROM statistics WHERE course_id=? AND duration!=-100 AND day>=? AND day<=?';
};

HandledCardsModel.prototype.queryDB = queryDatabase;

HandledCardsModel.prototype.calculateValue = function(){
	var self = this;
	self.values = self.superModel.getCurrentValues(SUBMODEL_QUERY_THREE);
	moblerlog("current values for handled cards"+ self.values.join(", "));
	self.queryDB( 
		function cbHC(t,r) {self.calculateHandledCards(t,r);});

};


/* TODO: MORE COMMENTS PLEASE (Christian)
 * 
 */
//calculates how many cards have been handled
HandledCardsModel.prototype.calculateHandledCards = function(transaction, results) {
	
	
	var self = this;
	if (results.rows.length > 0) {
		var row = results.rows.item(0);
		moblerlog("number of handled cards:" + row['c']);
		this.handledCards = row['c'];
		moblerlog("handledCards:"+this.handledCards);
//			if (self.cardBurner != 100) {
//			if (row['c'] > 100) {
//				self.cardBurner = 100;
//			} else {
//				self.cardBurner =row['c'];
//			}
//		}
	} else {
		self.handledCards = 0;
//		self.cardBurner = 0;
	}
	
	// calculate improvement
	
	self.values = self.superModel.getLastActiveValues();
	self.queryDB(function cbCalculateImprovements(t,r) {
		self.calculateImprovementHandledCards(t,r);
	});

};

//calculates the improvement of number of the handled cards in comparison to the last active day

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
		
		$(document).trigger("statisticcalculationsdone");
		
	} else {
		this.improvementHandledCards = this.handledCards;
	}
	this.superModel.boolAllDone++;
	this.superModel.allCalculationsDone();	
	
		
};





