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


function StackHandlerModel(statisticsModel){
    this.modelName = " stack handler";
    this.superModel = statisticsModel;
    this.achievementName = 'stackhandler';
    this.achievementValue = -1;
    this.initQuery();
}

StackHandlerModel.prototype.initQuery = function(){
	this.query = 'SELECT DISTINCT question_id FROM statistics WHERE course_id=? AND duration!=-100';
};

StackHandlerModel.prototype.queryDB = queryDatabase;

StackHandlerModel.prototype.calculateValueHelper = checkAchievement;

StackHandlerModel.prototype.calculateValue = function() {
	this.courseId = this.superModel.currentCourseId;
	this.calculateValueHelper();
};

StackHandlerModel.prototype.calculateAchievementValues = function(){
	var self = this;
	var val = 0;
	self.values= self.superModel.getCurrentValues(SUBMODEL_QUERY_ONE);
	moblerlog("current values for stack handler"+self.values);
	self.queryDB( 
		function cbSH(t,r) {self.calculateStackHandler(t,r);});

};


/**
 * calculates the stack handler achievement
 * you get the stack handler if you have handled each card of a course
 * at least once
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
		//self.statistics['stackHandler'] = 0;
		this.achievementValue = 0;
	} else {
		//self.statistics['stackHandler'] = Math
		//		.round((numHandledCards / numAllCards) * 100);
		this.achievementValue = Math.round((numHandledCards / numAllCards) * 100);
	}
	
	if (this.achievementValue >= 100) {
		this.insertAchievementHelper();
	}
	moblerlog("stackHandler: " + self.achievementName + " handled: " + numHandledCards + " all: " + numAllCards);
	moblerlog("stackHandler: " + this.achievementValue + " handled: " + numHandledCards + " all: " + numAllCards);
	self.superModel.boolAllDone++;
	self.superModel.allCalculationsDone();

};

StackHandlerModel.prototype.insertAchievementHelper = insertAchievement;






