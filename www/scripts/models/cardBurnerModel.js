function CardBurnerModel(statisticsModel){

this.superModel = statisticsModel;
this.achievementName = 'cardburner';
this.achievementValue = -1;
this.initQuery();

	
};

CardBurnerModel.prototype.initQuery = function(){
//	
//	this.values = [];
//	this.valuesLastActivity = [];
	   
	this.query = "SELECT count(*) as c FROM statistics WHERE course_id=? AND duration!=-100 AND day>=? AND day<=?";
};

CardBurnerModel.prototype.queryDB = queryDatabase;

CardBurnerModel.prototype.calculateValueHelper = checkAchievement;

CardBurnerModel.prototype.calculateValue = function(courseId){
	this.courseId = courseId;
	this.calculateValueHelper();
	
};

CardBurnerModel.prototype.calculateAchievementValues = function(){
	var self = this;
	var val = 1;
	self.values= self.superModel.getCurrentValues(val); 
	//console.log("current values for card burner"+self.values);
	self.queryDB( 
		function cbSH(t,r) {self.calculateCardBurner(t,r);});

};


/**
 * calculates the stack handler achievement
 * you get the stack handler if you have handled each card of a course
 * at least once
 */
CardBurnerModel.prototype.calculateCardBurner = function(transaction, results) {
	
	
	var self = this;
	if (results.rows.length > 0) {
		var row = results.rows.item(0);
		
		//if card burner was achieved (100 handled cards within 24 hours), insert a marker into the database
		if (row['c'] >= 100) {
			//console.log("cardburner was achieved");
			this.achievementValue = 100;
			this.insertAchievementHelper();
		} else {
			this.achievementValue = row['c'];
			//console.log("cardburner still not achieved yet");
		}
	}
	self.superModel.boolAllDone++;
	self.superModel.allCalculationsDone();

};


CardBurnerModel.prototype.insertAchievementHelper = insertAchievement;




