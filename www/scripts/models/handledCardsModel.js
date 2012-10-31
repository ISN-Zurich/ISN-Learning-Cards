function HandledCardsModel(statisticsModel){

this.superModel = statisticsModel;
this.handledCards = -1;
this.cardBurner = -1;
this.improvementHandledCards = 0;
this.initQuery();

	
};

HandledCardsModel.prototype.initQuery = function(){
	
//	this.values = [];
//	this.valuesLastActivity = [];
	   
	this.query = 'SELECT count(*) as c FROM statistics WHERE course_id=? AND duration!=-100 AND day>=? AND day<=?';
};

HandledCardsModel.prototype.queryDB = queryDatabase;


HandledCardsModel.prototype.calculateValue = function(){
	var self = this;
	var val = 1;
	self.values= self.superModel.getCurrentValues(val); 
	//console.log("current values for handled cards"+self.values);
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
		//console.log("number of handled cards:" + row['c']);
		this.handledCards = row['c'];
		//console.log("handledCards:"+this.handledCards);
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
	//console.log("rows in calculate improvement handled cards: "+ results.rows.length);
	if (results.rows.length > 0) {
		var row = results.rows.item(0);
		//console.log("number of handled cards:" + row['c']);
		oldHandledCards = row['c'];
		newHandledCards = this.handledCards;
		this.improvementHandledCards  = newHandledCards - oldHandledCards;
		//console.log("improvement handled cards: "+ this.improvementHandledCards);
		
		$(document).trigger("statisticcalculationsdone");
		
	} else {
		this.improvementHandledCards = this.handledCards;
	}
	this.superModel.boolAllDone++;
	this.superModel.allCalculationsDone();	
	
		
};





