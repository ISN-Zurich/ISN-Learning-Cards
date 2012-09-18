function StatisticsView() {
    var self = this;
    
    self.tagID = 'statisticsView';
    
    jester($('#closeStatisticsIcon')[0]).tap(function(){ self.closeStatistics(); } );
//    jester($('#logOutStatistics')[0]).tap(function(){ self.logout(); } );
} 

StatisticsView.prototype.handlePinch = doNothing;
StatisticsView.prototype.handleTap = doNothing;
StatisticsView.prototype.handleSwipe = doNothing;
StatisticsView.prototype.openDiv = openView;
StatisticsView.prototype.open = function() {
	this.loadData();
	this.openDiv();	
};
StatisticsView.prototype.close = closeView;

StatisticsView.prototype.closeStatistics = function() {
	console.log("close Statistics button clicked");
	controller.transitionToCourses();
};

StatisticsView.prototype.loadData = function() {
	
	var statisticsModel = controller.models['statistics'];
	statisticsModel.calculateValues();
	
	//$("#statisticsBody").empty();
	$("#statBestDayValue").text("");
	$("#statBestScoreValue").text("");
	$("#statHandledCardsValue").text(statisticsModel.getHandledCards());
	$("#statAverageScoreValue").text(statisticsModel.getAverageScore());
	$("#statProgressValue").text(statisticsModel.getProgress());
	$("#statSpeedValue").text(statisticsModel.getAverageSpeed());
	
	
	
	
//	$("#statisticsData").empty();
//	$("<li/>", {
//		  text: "Average Score: " + statisticsModel.getAverageScore()
//		}).appendTo("#statisticsData");
//	$("<li/>", {
//	  text: "Average Speed: " + statisticsModel.getAverageSpeed()
//	}).appendTo("#statisticsData");
//	
//	$("<li/>", {
//		  text: "Handled Cards: " + statisticsModel.getHandledCards()
//		}).appendTo("#statisticsData");
//	
//	$("<li/>", {
//		  text: "Progress: " + statisticsModel.getProgress() +"% correct answers"
//		}).appendTo("#statisticsData");
//	
	
	};
