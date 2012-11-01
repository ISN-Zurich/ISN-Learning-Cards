function ProgressModel(statisticsModel){
    this.modelName = " progress";
    this.superModel = statisticsModel;
    this.progress = -1;
    this.improvementProgress = 0;
    this.initQuery();
}

ProgressModel.prototype.initQuery = function(){
	
	this.values = [];
	this.valuesLastActivity = [];
	   
	this.query = 'SELECT count(DISTINCT question_id) as numCorrect FROM statistics WHERE course_id=? AND duration!=-100 AND score=?'
		+ ' AND day>=? AND day<=?';

};

ProgressModel.prototype.queryDB = queryDatabase;


ProgressModel.prototype.calculateValue = function(){
	var self = this;
	self.values= self.superModel.getCurrentValues(SUBMODEL_QUERY_FOUR);
	//console.log ("current values progess model" +self.values);
	self.queryDB( 
		function cbP(t,r) {self.calculateProgress(t,r);});

};



//calculates the progress
ProgressModel.prototype.calculateProgress = function(transaction, results) {
	
	var self = this;
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		//console.log("number of correct questions:" + row['numCorrect']);
		//console.log("number of answered questions:"+ self.superModel.handledCards.handledCards);
		cards = self.superModel.controller.models['questionpool'].questionList.length;
		if (cards === 0) {
			this.progress = 0;
		} else {
		this.progress = Math.round(((row['numCorrect']) / cards) * 100);
		}
		//console.log("progress: " +this.progress);
	} else {
		this.progress = 0;
	}

	// calculate improvement
	var progressVal = true;
	self.values = self.superModel.getLastActiveValues(progressVal);
	self.queryDB(function cbCalculateImprovements(t,r) {
		self.calculateImprovementProgress(t,r);
	});
};


//calculates the improvement of the progress in comparison to the last active day

ProgressModel.prototype.calculateImprovementProgress= function (transaction,results){
	var self = this;
	//console.log("rows in calculate improvement progress: "+ results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		//console.log("progress row" + JSON.stringify(row));
		cards = self.superModel.controller.models['questionpool'].questionList.length;
		if (cards === 0) {
			this.improvementProgress = 0;
		} else {
			//console.log("Progress Num Correct: " + row['numCorrect']);
			oldProgress = Math
				.round(((row['numCorrect']) / cards) * 100);
			newProgress = this.progress;
			this.improvementProgress = newProgress - oldProgress;
			//console.log("improvement progress: " + this.improvementProgress);
		}
	} else {
		this.improvementProgress = this.progress;
	}
	this.superModel.boolAllDone++;
	this.superModel.allCalculationsDone();	
	
	
		
};





