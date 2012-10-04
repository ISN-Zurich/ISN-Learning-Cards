function AverageScoreModel(statisticsModel){

this.superModel = statisticsModel;
this.averageScore = -1;
this.improvementAverageScore = 0;
this.initQuery();

	
};

AverageScoreModel.prototype.initQuery = function(){
//	
//	this.values = [];
//	this.valuesLastActivity = [];
	   
	this.query = 'SELECT sum(score) as score, count(id) as num FROM statistics WHERE course_id=? AND duration!=-100'
		+ ' AND day>=? AND day<=?' + ' GROUP BY course_id';

};

AverageScoreModel.prototype.queryDB = queryDatabase;


AverageScoreModel.prototype.calculateValue = function(){
	var self = this;
	var val = 1;
	self.values= self.superModel.getCurrentValues(val); 
	self.queryDB( 
			function cbAS(t,r) {self.calculateAverageScore(t,r);});

};


//calculates the average score the was achieved

AverageScoreModel.prototype.calculateAverageScore = function(transaction, results) {
	
	var self = this;
	console.log("rows: " + results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		console.log("row: " + JSON.stringify(row));
		if (row['num'] == 0) {
			this.averageScore = 0;
		} else {
			this.averageScore =  Math.round((row['score'] / row['num']) * 100);
		}
		console.log("AVERAGE SCORE: " + this.averageScore);
	} else {
		this.averageScore = 0;
	}
	
	// calculate improvement
		
	
	self.values = self.superModel.getLastActiveValues();
	self.queryDB(function cbCalculateImprovements(t,r) {
		self.calculateImprovementAverageScore(t,r);
	});
	
};

//calculates the improvement of the average score in comparison to the last active day

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
		newAverageScore = this.averageScore;
		this.improvementAverageScore = newAverageScore - oldAverageScore;
		$(document).trigger("statisticcalculationsdone");
		
	} else {
	  this.improvementAverageScore = this.averageScore;
	}
	console.log("improvement average score: "
			+ this.improvementAverageScore);
	this.superModel.boolAllDone++;
	this.superModel.allCalculationsDone();
		
};





