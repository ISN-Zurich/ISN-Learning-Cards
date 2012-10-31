/**	THIS COMMENT MUST NOT BE REMOVED

Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file 
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0  or see LICENSE.txt

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.	


*/


/** @author Isabella Nake
 * @author Evangelia Mitsopoulou

*/
 


//View for displaying the statistics
 
 
function StatisticsView(controller) {
    var self = this;
    
    self.tagID = 'statisticsView';
    self.controller = controller;
    
    //console.log( 'statistics view init touch events');
    
    jester($('#closeStatisticsIcon')[0]).tap(function(){ self.closeStatistics(); });
    
    jester($('#statsSlot1')[0]).tap(function() {
		self.clickToAchievements();
	});
    
    
    jester($('#statsSlot2')[0]).tap(function() {
		self.clickToAchievements();
	});
    
    //console.log('bind the application events');
    $(document).bind("loadstatisticsfromserver", function() {
		// if (self.controller.activeView == self.controller.views[self.tagID])
    	if (self.tagID == self.controller.activeView.tagID)	
    	{
    		//console.log("enters load statistics from server is done");
			 self.controller.models['statistics'].getFirstActiveDay();
    	}
	  });
    
    $(document).bind("allstatisticcalculationsdone", function() { 
    	//console.log("enters in calculations done 1 ");
    	//if (self.controller.activeView == self.controller.views[self.tagID])
    	//if (self.controller.activeView == 'statisticsView')
    
    	if (self.tagID == self.controller.activeView.tagID)
    	{
    		//console.log("enters in calculations done 2 ");
    		self.loadData();
    	}
    });
     
        // console.log('done');
    
        // $(document).bind("loadstatisticsfromserver", function() {
        //  this.loadData();
        //	});
  
}

//pinch leads to course list

StatisticsView.prototype.handlePinch = function() {
    this.controller.transitionToCourses();  
};

//tap does nothing

StatisticsView.prototype.handleTap   = doNothing;

//swipe does nothing


StatisticsView.prototype.handleSwipe = function() {
	controller.transitionToAchievements();
};

//closes the view

StatisticsView.prototype.close = closeView;

//opens the view

StatisticsView.prototype.openDiv = openView;

//shows the statistics data

StatisticsView.prototype.open = function() {
	var self=this;
	if (this.controller.models['statistics'].statisticsIsLoaded) {
		//console.log("statistics have been loaded from server");
		self.loadData();	
	}
	else {
		self.showLoadingMessage();
	}  
	this.openDiv();	
};

 //leads to course list
 
StatisticsView.prototype.closeStatistics = function() {
	//console.log("close Statistics button clicked");
	this.controller.transitionToCourses();
};

//show loading message when statistics have not been fully loaded from the server
StatisticsView.prototype.showLoadingMessage = function() {
	$("#statisticsBody").hide();
	$("#loadingMessage").show();	
	
};

//leads to achievements view

StatisticsView.prototype.clickToAchievements = function() {
	//console.log("slot 1 or slot 2 clicked");
	this.controller.transitionToAchievements();
};


//loads the statistics data

StatisticsView.prototype.loadData = function() {
	//console.log("enters load data in statistics");
	var statisticsModel = this.controller.models['statistics'];
	var statistics = statisticsModel.getStatistics();
	var improvement = statisticsModel.getImprovement();
	$("#loadingMessage").hide();
	$("#statisticsBody").show();
	
	//console.log("init values for statistics");
	//var avgScore = statistics['averageScore'];
	var avgScore = statisticsModel.averageScore.averageScore;
	var improvementAvgScore = statisticsModel.averageScore.improvementAverageScore;
	if (avgScore < 0) {
		avgScore =  0;
	}
	
//	var avgSpeed = statistics['averageSpeed'];
	var avgSpeed = statisticsModel.averageSpeed.averageSpeed;
	var improvementSpeed = statisticsModel.averageSpeed.improvementSpeed;
	if (avgSpeed <= 0) {
		avgSpeed =  "-";
	}
	
//var handledCards = statistics['handledCards'];

	var handledCards = statisticsModel.handledCards.handledCards;
	var improvementhandledCards = statisticsModel.handledCards.improvementHandledCards;
	 if (handledCards < 0) {
		 	handledCards =  0;
	 }
	  
	//var progress = statistics['progress'];
	 var progress = statisticsModel.progress.progress;
	 var improvementProgress = statisticsModel.progress.improvementProgress;
	if (progress < 0) {
		progress =  0;
	}

	var bestDay = statisticsModel.bestDay.bestDay;
	//var bestDay = statistics['bestDay'];
	if (!bestDay) {
		// if the database does not know better, today is the best day!
		bestDay = new Date().getTime();
	}
	var oBestDay = new Date(bestDay);
	
	var bestScore = statisticsModel.bestDay.bestScore;
	//var bestScore = statistics['bestScore'];
	if (bestScore < 0) {
		bestScore =  0;
	}
	//console.log("initialization of data done");
	
	var removeClasses = msg_positiveImprovement_icon + " " + msg_negativeImprovement_icon + " " + msg_neutralImprovement_icon + 
			" red green";
	
	$("#loadingMessage").hide();	
	$("#statisticsBody").show();
	$("#statBestDayValue").text(oBestDay.getDate()  + " " + jQuery.i18n.prop('msg_monthName_'+ (oBestDay.getMonth() +1)));
	$("#statBestDayInfo").text(oBestDay.getFullYear());
	$("#statBestScoreValue").text(bestScore+"%");
	$("#statHandledCardsValue").text(handledCards);
	$("#statsHandledCardsIconchange").removeClass(removeClasses);
	$("#statsHandledCardsIconchange").addClass(checkImprovement(improvementhandledCards));
	$("#statAverageScoreValue").text(avgScore+"%");
	$("#statsAverageScoreIconchange").removeClass(removeClasses);
	$("#statsAverageScoreIconchange").addClass(checkImprovement(improvementAvgScore));
	$("#statProgressValue").text(progress+"%");
	$("#statsProgressIconchange").removeClass(removeClasses);
	$("#statsProgressIconchange").addClass(checkImprovement(improvementProgress));
	$("#statSpeedValue").text(avgSpeed);
	$("#statsSpeedIconchange").removeClass(removeClasses);
	$("#statsSpeedIconchange").addClass(checkSpeedImprovement(improvementSpeed));	

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
	
	//console.log("end load data");
};	

	

