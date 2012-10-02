function HandledCardsModel(statisticsModel){

this.superModel = statisticsModel;
this.handledCards= -1;
this.initQuery();

	
};

HandledCardsModel.prototype.initQuery = function(){
	
	this.values = [];
	this.valuesLastActivity = [];
	   
	this.query = 'SELECT count(*) as c FROM statistics WHERE course_id=? AND question_id != "cardburner" AND day>=? AND day<=?';
};

HandledCardsModel.prototype.initQueryValue = function () {
	
	this.values = this.superModel.getCurrentValues();
};

HandledCardsModel.prototype.initQueryValueLastActivity = function () {
	
	this.valuesLastActivity = this.superModel.getLastActiveValues();
};


HandledCardsModel.prototype.calculateValue = function(){
	var self = this;
	self.queryDB( 
		function cbBDS(t,r) {self.calculateHandledCards(t,r);});

};

HandledCardsModel.prototype.queryDB = queryDatabase;


HandledCardsModel.prototype.calculateHandledCards = function(transaction, results) {
	
	
	var self = this;
	if (results.rows.length > 0) {
		var row = results.rows.item(0);
		console.log("number of handled cards:" + row['c']);
		self.statistics['handledCards'] = row['c'];
		if (self.statistics['cardBurner'] != 100) {
			if (row['c'] > 100) {
				self.statistics['cardBurner'] = 100;
			} else {
				self.statistics['cardBurner'] = row['c'];
			}
		}
		console.log("card burner: " + self.statistics['cardBurner']);
	} else {
		self.statistics['handledCards'] = 0;
		self.statistics['cardBurner'] = 0;
	}
	
	
};









