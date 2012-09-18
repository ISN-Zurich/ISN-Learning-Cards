/**
 * This model holds the statistics for a question
 */
function StatisticsModel(controller) {
	this.controller = controller;

	this.db;
	this.initDB();


	this.handledCards= -1;
	this.progress=-1;
	this.currentCourseId = -1;
	this.averageScore = -1;
	this.averageSpeed = -1;

}

StatisticsModel.prototype.setCurrentCourseId = function(courseId) {
	this.currentCourseId = courseId;
};

StatisticsModel.prototype.getAverageScore = function() {
	return this.averageScore;
};

StatisticsModel.prototype.getAverageSpeed = function() {
	return this.averageSpeed;
};


StatisticsModel.prototype.getHandledCards = function() {
	return this.handledCards;
};


StatisticsModel.prototype.getProgress = function() {
	return this.progress;
};



StatisticsModel.prototype.initDB = function() {
	this.db = openDatabase('ISNLCDB', '1.0', 'ISN Learning Cards Database',
			100000);
};



StatisticsModel.prototype.calculateValues = function() {
	var today = new Date();
	this.calculateAverageScore(today);
	this.calculateAverageSpeed(today);
	this.calculateHandledCards(today);
	this.calculateProgress(today);
}

StatisticsModel.prototype.calculateAverageScore = function(day) {
	var self = this;
	console.log("COURSE: " + self.currentCourseId);
	console.log("day: " + day);
	//returns the score and the number of answered cards of the last 24-hours before the specified timestamp
	//we take the last 24-hours so that we have a constant time intervall (no matter if we call this function
	//in the morning or in the evening)
	day -= 1000*60*60*24;
	self.db.transaction(function(transaction) {
		transaction
				.executeSql(
						'SELECT sum(score) as score, count(id) as num FROM statistics WHERE course_id=?'
								+ ' AND day>=?'
								+ ' GROUP BY course_id', [
								self.currentCourseId, day ], dataSelectHandler,
						function(tx, e) {
							console.log("Error for select average score: "
									+ e.message);
						});
	});

	function dataSelectHandler(transaction, results) {
		console.log("rows: " + results.rows.length);
		if (results.rows.length > 0) {
			row = results.rows.item(0);
			console.log("ROW: " + JSON.stringify(row));
			self.averageScore = row['score'] / row['num'];
			// console.log("CARDS: " + row['id']);
			console.log("AVERAGE SCORE: " + self.averageScore);
		}
	}
};

StatisticsModel.prototype.calculateAverageSpeed = function(day) {
	var self = this;
	console.log("COURSE: " + self.currentCourseId);
	console.log("day: " + day);
	//returns the speed and the number of answered cards of the last 24-hours before the specified timestamp
	//we take the last 24-hours so that we have a constant time intervall (no matter if we call this function
	//in the morning or in the evening)
	day -= 1000*60*60*24;
	self.db.transaction(function(transaction) {
		transaction
				.executeSql(
						'SELECT sum(duration) as duration, count(id) as num FROM statistics WHERE course_id=?'
								+ ' AND day>=?'
								+ ' GROUP BY course_id', [
								self.currentCourseId, day ], dataSelectHandler,
						function(tx, e) {
							console.log("Error for select average speed: "
									+ e.message);
						});
	});

	function dataSelectHandler(transaction, results) {
		console.log("rows: " + results.rows.length);
		if (results.rows.length > 0) {
			row = results.rows.item(0);
			console.log("ROW: " + JSON.stringify(row));
			self.averageSpeed = (row['duration'] / row['num']) / 1000;
			// console.log("CARDS: " + row['id']);
			console.log("AVERAGE SPEED: " + self.averageSpeed);
		}
	}
};





StatisticsModel.prototype.getBestDayAndScore = function() {
	var self = this;
	console.log("COURSE: " + self.currentCourseId);
	self.db
			.transaction(function(transaction) {
				transaction
						.executeSql(
								'SELECT s1.day, sum(s1.score)/count(s1.id) as score1 FROM statistics s1 WHERE s1.course_id=?'
										// + ' HAVING score1 >= ALL(SELECT
										// sum(s2.score)/count(s2.id) as
										// score2 FROM statistics s2 WHERE
										// s2.course_id=?'
										// + ' GROUP BY DATE(s2.day))'
										+ ' GROUP BY DATE(s1.day)',
								[ self.currentCourseId /*
														 * ,
														 * self.currentCourseId
														 */],
								dataSelectHandler,
								function(tx, e) {
									console
											.log("Error for select best day and score: "
													+ e.message);
								});
			});
	// AND day='//day, count(id),
	// + '(SELECT DISTINCT day FROM statistics)'
	function dataSelectHandler(transaction, results) {
		console.log("rows: " + results.rows.length);
		for ( var i = 0; i < results.rows.length; i++) {
			row = results.rows.item(i);
			console.log("DAY: " + row['day']);
			// console.log("CARDS: " + row['id']);
			console.log("SCORE: " + row['score1']);
		}
	}
};


StatisticsModel.prototype.calculateHandledCards = function(day) {
	var self = this;
	day -= 1000*60*60*24;
	self.db.transaction(function(transaction){
		transaction.executeSql('SELECT COUNT(*) as c FROM statistics WHERE course_id=?'
				+ ' AND day>=?', [self.currentCourseId, day ], resultDataHandler,errorHandler);
	});
	
	function errorHandler(tx, e){
		console.log("error! NOT inserted: " + e.message);	 
	}; 


	function resultDataHandler(transaction, results){
		if (results.rows.length > 0){
			var row = results.rows.item(0);
			console.log("number of handled cards:" +row['c']);
			self.handledCards = row['c'];
	
		}
		
	};

};


StatisticsModel.prototype.calculateProgress = function(day){
	var self=this;
	day -= 1000*60*60*24;
	
	self.db.transaction(function(transaction){
		transaction.executeSql('SELECT  COUNT(id) as numCorrect  FROM statistics  WHERE score=?'
				+ ' AND day>=?', [1,day], resultDataHandler,errorHandler);
	});
	
	function errorHandler(tx, e){
		console.log("error! NOT inserted: " + e.message);	 
	}; 
	
	function resultDataHandler(transaction, results){
		var progress;
		if (results.rows.length > 0){
			row = results.rows.item(0);
			console.log("number of correct questions:" +row['numCorrect']);
			console.log("number of answered questions:" +self.handledCards);
			
			self.progress= Math.round((row['numCorrect'])/(self.handledCards)*100);
			console.log("progress: " + self.progress);
	
		}
		
	};
	
	
};

