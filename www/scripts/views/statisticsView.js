function StatisticsView(controller) {
    var self = this;
    
    self.tagID = 'statisticsView';
    self.controller = controller;
    
    console.log( 'statistics view init touch events');
    
    jester($('#closeStatisticsIcon')[0]).tap(function(){ self.closeStatistics(); });
    
    jester($('#statsSlot1')[0]).tap(function() {
		self.clickToAchievements();
	});
    
    
    jester($('#statsSlot2')[0]).tap(function() {
		self.clickToAchievements();
	});
    
    console.log('bind the application events');
    
    
    console.log('done');
}

StatisticsView.prototype.handlePinch = doNothing;
StatisticsView.prototype.handleTap   = doNothing;
StatisticsView.prototype.handleSwipe = doNothing;
StatisticsView.prototype.close = closeView;

StatisticsView.prototype.openDiv = openView;

StatisticsView.prototype.open = function() {
	this.loadData();
	this.openDiv();	
};

StatisticsView.prototype.closeStatistics = function() {
	console.log("close Statistics button clicked");
	this.controller.transitionToCourses();
};


StatisticsView.prototype.clickToAchievements = function() {
	console.log("slot 1 or slot 2 clicked");
	this.controller.transitionToAchievements();
};

StatisticsView.prototype.loadData = function() {
	var statisticsModel = this.controller.models['statistics'];
	var statistics = statisticsModel.getStatistics();
	var improvement = statisticsModel.getImprovement();
	console.log("init values for statistics");
	var avgScore = statistics['averageScore'];
	if (avgScore < 0) {
		avgScore =  0;
	}
	
	var avgSpeed = statistics['averageSpeed'];
	if (avgSpeed <= 0) {
		avgSpeed =  "-";
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
		// if the database does not know better, today is the best day!
		bestDay = new Date().getTime();
	}
	var oBestDay = new Date(bestDay);
	
	var bestScore = statistics['bestScore'];
	if (bestScore < 0) {
		bestScore =  0;
	}
console.log("initialization of data done");
	
	//$("#statisticsBody").empty();
	$("#statBestDayValue").text(oBestDay.getDate()  + " " + jQuery.i18n.prop('msg_monthName_'+ (oBestDay.getMonth() +1)));
	$("#statBestDayInfo").text(oBestDay.getFullYear());
	$("#statBestScoreValue").text(bestScore+"%");
	$("#statHandledCardsValue").text(handledCards);
	$("#statsHandledCardsIconchange").addClass(checkImprovement(improvement['handledCards']));
	$("#statAverageScoreValue").text(avgScore+"%");
	$("#statsAverageScoreIconchange").addClass(checkImprovement(improvement['averageScore']));
	$("#statProgressValue").text(progress+"%");
	$("#statsProgressIconchange").addClass(checkImprovement(improvement['progress']));
	$("#statSpeedValue").text(avgSpeed);
	$("#statsSpeedIconchange").addClass(checkSpeedImprovement(improvement['averageSpeed']));	

	function checkImprovement(improvementValue) {
		if (improvementValue > 0) {
			return msg_positiveImprovement_icon + " green";
		} else if (improvementValue < 0) {
			return msg_negativeImprovement_icon + " red";

		}else{
			return msg_neutralImprovement_icon + " green";
		}
    }

	function checkSpeedImprovement(improvementValue){
		if (improvementValue > 0) {
			return msg_positiveImprovement_icon + " red";
		} else if (improvementValue < 0) {
			return msg_negativeImprovement_icon + " green";

		}else{
			return msg_neutralImprovement_icon + " green";
		}
		
	}
	
	console.log("end load data");
};	

	

