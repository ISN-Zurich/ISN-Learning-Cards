function AverageScoreModel(statisticsModel){

this.superModel = statisticsModel;
this.averageScore = -1;
this.improvementAverageScore = 0;
this.initQuery();

	
};

AverageScoreModel.prototype.initQuery = function(){
	
	this.values = [];
	this.valuesLastActivity = [];
	   
	this.query = 'SELECT sum(score) as score, count(id) as num FROM statistics WHERE course_id=? AND question_id != "cardburner"'
		+ ' AND day>=? AND day<=?' + ' GROUP BY course_id';

};

AverageScoreModel.prototype.queryDB = queryDatabase;


AverageScoreModel.prototype.calculateValue = function(){
	var self = this;
	self.values= self.superModel.getCurrentValues(); 
	self.queryDB( 
		function cbAS(t,r) {self.calculateAverageScore(t,r);});

};




AverageScoreModel.prototype.calculateAverageScore = function(transaction, results) {
	
	var self = this;
	console.log("rows: " + results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		console.log("row: " + JSON.stringify(row));
		if (row['num'] == 0) {
			//self.statistics['averageScore'] = 0;
			this.averageScore = 0;
		} else {
//			self.statistics['averageScore'] = Math
//				.round((row['score'] / row['num']) * 100);
			this.averageScore =  Math.round((row['score'] / row['num']) * 100);
		}
		console.log("AVERAGE SCORE: " + self.statistics['averageScore']);
	} else {
		// self.statistics['averageScore'] = 0;
		this.averageScore = 0;
	}
	
	// calculate improvement
		function cbCalculateImprovements(t,r) {self.calculateImprovementAverageScore(t,r);});	
	
	self.values = self.superModel.getLastActiveValues();
	self.queryDB(function cbCalculateImprovements(t,r) {
		self.calculateImprovementAverageScore(t,r);
	});
	
};


AverageScoreModel.prototype.calculateImprovementAverageScore = function (transaction,results){
	
	var self = this;
	console.log("rows in calculate improvement average score: "
			+ results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		console.log("row: " + JSON.stringify(row));
		var oldAverageScore = 0;
		if (row['num'] != 0) {
			oldAverageScore = Math.round((row['score'] / row['num']) * 100);
		}
		//newAverageScore = self.statistics['averageScore'];
		newAverageScore = this.averageScore;
		//self.improvement['averageScore'] = newAverageScore - oldAverageScore;
		this.improvementAverageScore = newAverageScore - oldAverageScore;
		$(document).trigger("statisticcalculationsdone");
		
	} else {
		//self.improvement['averageScore'] = self.statistics['averageScore'];
	  this.improvementAverageScore = this.averageScore;
	}
	//console.log("improvement average score: "
	//		+ self.improvement['averageScore']);
	console.log("improvement average score: "
			+ improvementAverageScore);
	this.superModel.boolAllDone++;
	this.superModel.allCalculationsDone();
		
};





