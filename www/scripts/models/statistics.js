/**
 * This model holds the statistics for a question
 */
function StatisticsModel(controller) {
	this.controller = controller;

	this.db;
	this.initDB();

	var handledCards;
};


StatisticsModel.prototype.getAverageSpeed = function() {
//	if (this.allStatistics[this.currentCourseId].length > 0) {
//		var overallTime = 0.0;
//		for ( var s in this.allStatistics[this.currentCourseId]) {
//			overallTime += this.allStatistics[this.currentCourseId][s].speed;
//		}
//		return (overallTime / this.allStatistics[this.currentCourseId].length) / 1000;
//	}
	return 0;
};

StatisticsModel.prototype.initDB = function() {
	this.db = openDatabase('ISNLCDB', '1.0', 'ISN Learning Cards Database',
			100000);
};



StatisticsModel.prototype.getHandledCards = function() {

	this.db.transaction(function(transaction){
	transaction.executeSql('SELECT COUNT(id) FROM statistics ',[], resultDataHandler,errorHandler);
});
	
	function errorHandler(tx, e){
		 console.log("error! NOT inserted: " + e.message);	 
}; 


	function resultDataHandler(transaction, results){
//		//var handledCards [];
//		//count =0;
//		//for (var i=0; i< results.rows.length; i++){	
var row = results.rows.length;
//		//row = results.rows.item(0);	
	console.log("number of handled cards:" +row);
	handledCards = row;
//			//count++; 
		
//		//}
//		//return count;
	};

};





//StatisticsModel.prototype.loadFromDB = function() {
//	allStatistics = [];
//	this.db.transaction(function(transaction) {
//		transaction.executeSql('SELECT * FROM statistics;', [],
//				dataSelectHandler, function() {/* errorHandler */
//				});
//	});
//
//	function dataSelectHandler(transaction, results) {
//		for ( var i = 0; i < results.rows.length; i++) {
//			row = results.rows.item(i);
//			if (!allStatistics[row['course_id']]) {
//				allStatistics[row['course_id']] = [];
//			}
//			allStatistics[row['course_id']].push({
//				"question" : row['question_id'],
//				"score" : row['score'],
//				"day" : row['day'],
//				"speed" : row['speed']
//			});
//		}
//
//		console.log("Load from DB:");
//		for ( var c in allStatistics) {
//			for ( var q in allStatistics[c]) {
//				console.log("Course: " + c + " Question: "
//						+ allStatistics[c][q].question + " Score: "
//						+ allStatistics[c][q].score);
//			}
//		}
//	}
//
//};