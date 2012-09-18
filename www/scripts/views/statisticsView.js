function StatisticsView() {
    var self = this;
    
    self.tagID = 'statisticsView';
    
    jester($('#closeStatisticsIcon')[0]).tap(function(){ self.closeStatistics(); } );
//    jester($('#logOutStatistics')[0]).tap(function(){ self.logout(); } );
    
    $(document).bind("statisticcalculationsdone", function() {self.loadData();});
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
	
	var avgScore = statisticsModel.getAverageScore();
	if (avgScore < 0) {
		avgScore =  0;
	}
	
	var avgSpeed = statisticsModel.getAverageSpeed();
	if (avgSpeed < 0) {
		avgSpeed =  0;
	}
	
	var handledCards = statisticsModel.getHandledCards();
	if (handledCards < 0) {
		handledCards =  0;
	}
	
	var progress = statisticsModel.getProgress();
	if (progress < 0) {
		progress =  0;
	}
	
	var bestDay = statisticsModel.getBestDay();
	if (!bestDay) {
		bestDay = "";
	}
	
	var bestScore = statisticsModel.getBestScore();
	if (bestScore < 0) {
		bestScore =  0;
	}
	
	$("#statisticsData").empty();
	$("<li/>", {
		  text: "Best Day: " + bestDay
		}).appendTo("#statisticsData");
	$("<li/>", {
	  text: "Best Score: " + bestScore + "%"
	}).appendTo("#statisticsData");
	$("<li/>", {
		  text: "Average Score: " + avgScore + "%"
		}).appendTo("#statisticsData");
	$("<li/>", {
	  text: "Average Speed: " + avgSpeed + " sec"
	}).appendTo("#statisticsData");	
	$("<li/>", {
		  text: "Handled Cards: " + handledCards
		}).appendTo("#statisticsData");
	
	$("<li/>", {
		  text: "Progress: " + progress +"% correct answers"
		}).appendTo("#statisticsData");
	
	
	};
