function AverageSpeedModel(statisticsModel){

this.superModel = statisticsModel;
this.averageSpeed = -1;
this.improvementSpeed = 0;
this.initQuery();

	
};

AverageSpeedModel.prototype.initQuery = function(){
	
	this.values = [];
	this.valuesLastActivity = [];
	   
	this.query = 'SELECT sum(duration) as duration, count(id) as num FROM statistics WHERE course_id=? AND question_id != "cardburner"'
		+ ' AND day>=? AND day<=?' + ' GROUP BY course_id';

};

AverageSpeedModel.prototype.queryDB = queryDatabase;


AverageSpeedModel.prototype.calculateValue = function(){
	var self = this;
	self.values= self.superModel.getCurrentValues(); 
	self.queryDB( 
		function cbASp(t,r) {self.calculateAverageSpeed(t,r);});

};


//calculates the average time that was needed to handle the cards


AverageSpeedModel.prototype.calculateAverageSpeed = function(transaction, results) {
	
	var self = this;
	console.log("rows: " + results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		console.log("row: " + JSON.stringify(row));
		if (row['num'] == 0) {
			this.averageSpeed = 0;
		} else {
			this.averageSpeed = Math
			.round((row['duration'] / row['num']) / 1000);
		}
		console.log("AVERAGE SPEED: " +this.averageSpeed);

	} else {
		this.averageSpeed = 0;
	}
	
	self.values = self.superModel.getLastActiveValues();
	self.queryDB(function cbCalculateImprovements(t,r) {
		self.calculateImprovementAverageSpeed(t,r);
	});
};

//calculates the improvement of the average speed in comparison to the last active day

AverageSpeedModel.prototype.calculateImprovementAverageSpeed = function (transaction,results){
	
	var self = this;
	console.log("rows in calculate improvement average speed: "
			+ results.rows.length);
	if (results.rows.length > 0) {
		row = results.rows.item(0);
		console.log("row: " + JSON.stringify(row));
		var oldAverageSpeed = 0;
		if (row['num'] != 0) {
			oldAverageSpeed = Math.round((row['duration'] / row['num']) / 1000);
		}
		newAverageSpeed = this.averageSpeed;
		if (oldAverageSpeed == 0 && newAverageSpeed != 0) {
			this.improvementSpeed = -1;
		} else	if (newAverageSpeed != 0) {
			this.improvementSpeed = (newAverageSpeed - oldAverageSpeed);
		
		} else if (oldAverageSpeed == 0) {
			this.improvementSpeed = 0;
		} else {
			this.improvementSpeed = 1;
		}
		console.log("improvement average speed: "
				+ this.improvementSpeed);
		$(document).trigger("statisticcalculationsdone");
		
	} else {
		this.improvementSpeed=(-this.averageSpeed);
	}
	this.superModel.boolAllDone++;
	this.superModel.allCalculationsDone();
		
};





