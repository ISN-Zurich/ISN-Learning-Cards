function StackHandlerModel(statisticsModel){

this.superModel = statisticsModel;
this.achievementName = 'stackhandler';
this.achievementValue = -1;
this.initQuery();

	
};

StackHandlerModel.prototype.initQuery = function(){
//	
//	this.values = [];
//	this.valuesLastActivity = [];
	   
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
	self.values= self.superModel.getCurrentValues(val); 
	//console.log("current values for stack handler"+self.values);
	self.queryDB( 
		function cbSH(t,r) {self.calculateStackHandler(t,r);});

};


/**
 * calculates the stack handler achievement
 * you get the stack handler if you have handled each card of a course
 * at least once
 */
StackHandlerModel.prototype.calculateStackHandler = function(transaction, results) {
	
	
	var self = this;
	allCards = self.superModel.controller.models["questionpool"].questionList;
	handledCards = [];
	numHandledCards = 0;
	for ( var i = 0; i < results.rows.length; i++) {
		row = results.rows.item(i);
		handledCards.push(row['question_id']);
	}
	for ( var a in allCards) {
		if (handledCards.indexOf(allCards[a].id) != -1) {
			numHandledCards++;
		}
	}
	numAllCards = allCards.length;
	if (numAllCards == 0) {
		//self.statistics['stackHandler'] = 0;
		this.achievementValue = 0;
	} else {
		//self.statistics['stackHandler'] = Math
		//		.round((numHandledCards / numAllCards) * 100);
		this.achievementValue = Math
		.round((numHandledCards / numAllCards) * 100);
	}
	
	if (this.achievementValue >= 100) {
		this.insertAchievementHelper();
	}
	//console.log("stackHandler: " + self.statistics['stackHandler']
	//		+ " handled: " + numHandledCards + " all: " + numAllCards);
	//console.log("stackHandler: " + this.achievementValue
	//		+ " handled: " + numHandledCards + " all: " + numAllCards);
	self.superModel.boolAllDone++;
	self.superModel.allCalculationsDone();

};

StackHandlerModel.prototype.insertAchievementHelper = insertAchievement;






