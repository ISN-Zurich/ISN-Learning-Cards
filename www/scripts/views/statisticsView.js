function StatisticsView() {
    var self = this;
    
    self.tagID = 'statisticsView';
    
    jester($('#closeStatisticsIcon')[0]).tap(function(){ self.closeStatistics(); } );
//    jester($('#logOutStatistics')[0]).tap(function(){ self.logout(); } );
    
    
    jester($('#statsSlot1')[0]).tap(function() {
		self.clickToAchievements();
	});
    
    
    jester($('#statsSlot2')[0]).tap(function() {
		self.clickToAchievements();
	});
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


StatisticsView.prototype.clickToAchievements = function() {
	console.log("slot 1 or slot 2 clicked");
	controller.transitionToAchievements();
};

StatisticsView.prototype.loadData = function() {
	
	var statisticsModel = controller.models['statistics'];
	var statistics = statisticsModel.getStatistics();
	var improvement = statisticsModel.getImprovement();
	
	var avgScore = statistics['averageScore'];
	if (avgScore < 0) {
		avgScore =  0;
	}
	
	var avgSpeed = statistics['averageSpeed'];
	if (avgSpeed <= 0) {
		avgSpeed =  "";
	}
	
	var handledCards = statistics['handledCards'];
	if (handledCards < 0) {
		handledCards =  0;
	}
	
	var progress = statistics['progress'];
	if (progress < 0) {
		progress =  0;
	}
	
	var bestDay = statistics['bestDay'];
	if (!bestDay) {
		bestDay = "";
	}
	
	var bestScore = statistics['bestScore'];
	if (bestScore < 0) {
		bestScore =  0;
	}

	//$("#statisticsBody").empty();
	$("#statBestDayValue").text(bestDay);
	$("#statBestScoreValue").text(bestScore+"%");
	$("#statHandledCardsValue").text(handledCards);
	$("#statsHandledCardsIconchange").addClass(checkImprovement(improvement['handledCards']));
	$("#statAverageScoreValue").text(avgScore+"%");
	$("#statsAverageScoreIconchange").addClass(checkImprovement(improvement['averageScore']));
	$("#statProgressValue").text(progress+"%");
	$("#statsProgressIconchange").addClass(checkImprovement(improvement['progress']));
	$("#statSpeedValue").text(avgSpeed);
	$("#statsSpeedIconchange").addClass(checkImprovement(improvement['averageSpeed']));	

	function checkImprovement(improvementValue) {
		if (improvementValue > 0) {
			return msg_positiveImprovement_icon + " green";
		} else if (improvementValue < 0) {
			return msg_negativeImprovement_icon + " red";
		} else {
			return msg_neutralImprovement_icon;
		}
	}

};	
	
// ******isabella refactoring*********
//	$("#statisticsData").empty();
//	$("<li/>", {
//		  text: "Best Day: " + bestDay
//		}).appendTo("#statisticsData");
//	$("<li/>", {
//	  text: "Best Score: " + bestScore + "%"
//	}).appendTo("#statisticsData");
//	$("<li/>", {
//		  text: "Average Score: " + avgScore + "% " + improvement['averageScore']
//		}).appendTo("#statisticsData");
//	$("<li/>", {
//	  text: "Average Speed: " + avgSpeed + " sec " + improvement['averageSpeed']
//	}).appendTo("#statisticsData");	
//	$("<li/>", {
//		  text: "Handled Cards: " + handledCards + " " + improvement['handledCards']
//		}).appendTo("#statisticsData");
//	
//	$("<li/>", {
//		  text: "Progress: " + progress +"% correct answers " + improvement['progress']
//		}).appendTo("#statisticsData");


	

