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

//pinch leads to course list

StatisticsView.prototype.handlePinch = function() {
    this.controller.transitionToCourses();  
};

//tap does nothing

StatisticsView.prototype.handleTap   = doNothing;

//swipe does nothing

StatisticsView.prototype.handleSwipe = doNothing;

//closes the view

StatisticsView.prototype.close = closeView;

//opens the view

StatisticsView.prototype.openDiv = openView;

//shows the statistics data

StatisticsView.prototype.open = function() {
	this.loadData();
	this.openDiv();	
};

 //leads to course list
 
StatisticsView.prototype.closeStatistics = function() {
	console.log("close Statistics button clicked");
	this.controller.transitionToCourses();
};

//leads to achievements view

StatisticsView.prototype.clickToAchievements = function() {
	console.log("slot 1 or slot 2 clicked");
	this.controller.transitionToAchievements();
};


//loads the statistics data

StatisticsView.prototype.loadData = function() {
	var statisticsModel = this.controller.models['statistics'];
	var bestDayScoreModel = new BestDayScoreModel(this);
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
	var bestday = BestDayScoreModel.calculateBestDayAndScore.bestDay;
	var bestscore = BestDayScoreModel.calculateBestDayAndScore.bestScore;
	//var bestDay = statistics['bestDay'];
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
	
	var removeClasses = msg_positiveImprovement_icon + " " + msg_negativeImprovement_icon + " " + msg_neutralImprovement_icon + 
			" red green";
	
	$("#statBestDayValue").text(oBestDay.getDate()  + " " + jQuery.i18n.prop('msg_monthName_'+ (oBestDay.getMonth() +1)));
	$("#statBestDayInfo").text(oBestDay.getFullYear());
	$("#statBestScoreValue").text(bestScore+"%");
	$("#statHandledCardsValue").text(handledCards);
	$("#statsHandledCardsIconchange").removeClass(removeClasses);
	$("#statsHandledCardsIconchange").addClass(checkImprovement(improvement['handledCards']));
	$("#statAverageScoreValue").text(avgScore+"%");
	$("#statsAverageScoreIconchange").removeClass(removeClasses);
	$("#statsAverageScoreIconchange").addClass(checkImprovement(improvement['averageScore']));
	$("#statProgressValue").text(progress+"%");
	$("#statsProgressIconchange").removeClass(removeClasses);
	$("#statsProgressIconchange").addClass(checkImprovement(improvement['progress']));
	$("#statSpeedValue").text(avgSpeed);
	$("#statsSpeedIconchange").removeClass(removeClasses);
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

	

