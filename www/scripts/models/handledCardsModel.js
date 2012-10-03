function HandledCardsModel(statisticsModel){

this.superModel = statisticsModel;
this.handledCards = -1;
this.cardBurner = -1;
this.improvementHandledCards = 0;
this.initQuery();

	
};

HandledCardsModel.prototype.initQuery = function(){
	
	this.values = [];
	this.valuesLastActivity = [];
	   
	this.query = 'SELECT count(*) as c FROM statistics WHERE course_id=? AND question_id != "cardburner" AND day>=? AND day<=?';
};

HandledCardsModel.prototype.queryDB = queryDatabase;


HandledCardsModel.prototype.calculateValue = function(){
	var self = this;
	self.values= self.superModel.getCurrentValues(); 
	self.queryDB( 
		function cbHC(t,r) {self.calculateHandledCards(t,r);});

};




HandledCardsModel.prototype.calculateHandledCards = function(transaction, results) {
	
	
	var self = this;
	if (results.rows.length > 0) {
		var row = results.rows.item(0);
		console.log("number of handled cards:" + row['c']);
		//self.statistics['handledCards'] = row['c'];
		this.handledCards = row['c'];
		console.log("handledCards:"+this.handledCards);
		//if (self.statistics['cardBurner'] != 100) {
			if (self.cardBurner != 100) {
			if (row['c'] > 100) {
				//self.statistics['cardBurner'] = 100;
				self.cardBurner = 100;
			} else {
				//self.statistics['cardBurner'] = row['c'];
				self.cardBurner =row['c'];
			}
		}
		//console.log("card burner: " + self.statistics['cardBurner']);
	} else {
		//		self.statistics['handledCards'] = 0;
		//		self.statistics['cardBurner'] = 0;
		self.handledCards = 0;
		self.cardBurner = 0;
	}
	
	// calculate improvement
	
	self.values = self.superModel.getLastActiveValues();
	self.queryDB(function cbCalculateImprovements(t,r) {
		self.calculateImprovementHandledCards(t,r);
	});

};


HandledCardsModel.prototype.calculateImprovementHandledCards = function (transaction,results){
	
	var self = this;
	console.log("rows in calculate improvement handled cards: "
			+ results.rows.length);
	if (results.rows.length > 0) {
		var row = results.rows.item(0);
		console.log("number of handled cards:" + row['c']);
		oldHandledCards = row['c'];
		//newHandledCards = self.statistics['handledCards'];
		newHandledCards = this.handledCards;
		//self.improvement['handledCards'] = newHandledCards - oldHandledCards;
		this.improvementHandledCards  = newHandledCards - oldHandledCards;
//		console.log("improvement handled cards: "
//				+ self.improvement['handledCards']);
		console.log("improvement handled cards: "
			+ this.improvementHandledCards);
		
		$(document).trigger("statisticcalculationsdone");
		
	} else {
		this.improvementHandledCards = this.handledCards;
	}
	this.superModel.boolAllDone++;
	this.superModel.allCalculationsDone();	
	
		
};





