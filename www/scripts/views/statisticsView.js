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

/*jslint vars: true, sloppy: true */

/**
 * @Class StatisticsView
 * The statistics view displays displays the statistics data.
 * - Best day and best score. Their calculations are based on from the first active
 *   day until the current time.
 * - Handled Cards:It is the number of cards the user has handled for a specific course 
 *   during the last 24 hours
 * - Average Score: It is the average score of the handled cards during the last 24 hours
 * - Progress: It is the increase or not in the percentage of the correctly answered
 *   questions of a users on a specific course
 * - Speed:It the average time the user needs to answer a question.
 * @constructor
 * - it sets the tag ID for the settings view
 * - assigns event handler when taping on various elements of the statistics view
 * - bind 2 events, that are related with the loading of statistics and
 *   the calculation of all the statistics metrics.
 * - it resizes the button's height when it detects orientation change
 * @param {String} controller
*/ 
function StatisticsView(controller) {
    var self = this;
    
    self.tagID = 'statisticsView';
    self.controller = controller;
    
    moblerlog( 'statistics view init touch events');
    
    jester($('#closeStatisticsIcon')[0]).tap(function(){ self.closeStatistics(); });
    
    jester($('#statsSlot1')[0]).tap(function() {
		self.clickToAchievements();
	});
    
    jester($('#statsSlot2')[0]).tap(function() {
		self.clickToAchievements();
	});
    
    moblerlog('bind the application events');
    /**It is triggered after statistics are loaded locally from the server. This can happen during the 
	 * authentication or if we had clicked on the statistics icon and moved to the questions.
	 * @event loadstatisticsfromserver
	 * @param: a callback function that displays the answer body and preventing the display of the statistics view
	 */	
    $(document).bind("loadstatisticsfromserver", function() {
    	if ((self.tagID === self.controller.activeView.tagID) && (self.controller.models['authentication'].configuration.loginState === "loggedIn"))
    	{
    		moblerlog("enters load statistics from server is done");
			 self.controller.models['statistics'].getFirstActiveDay();
    	}
    	
	  });
    
    /**It is triggered when the calculation of all the statistics metrics is done in the statistics model
	 * @event allstatisticcalculationsdone
	 * @param: a callback function that displays the statistics view
	 */	
    $(document).bind("allstatisticcalculationsdone", function() { 
    	moblerlog("enters in calculations done 1 ");
    	if (self.tagID === self.controller.activeView.tagID)
    	{
    		moblerlog("enters in calculations done 2 ");
    		self.loadData();
    	}
    	});
     
        moblerlog('done');
    
 
  
}

/**pinch leads to course list
 * @prototype
 * @function handlePinch
 **/
StatisticsView.prototype.handlePinch = function() {
    this.controller.transitionToCourses();  
};


/**tap does nothing
 * @prototype
 * @function handleTap
 **/
StatisticsView.prototype.handleTap   = doNothing;


/**swipe does nothing
 * @prototype
 * @function handleSwipe
 **/
StatisticsView.prototype.handleSwipe = function() {
	controller.transitionToAchievements();
};


/**closes the view
 * @prototype
 * @function close
 **/
StatisticsView.prototype.close = closeView;


/**opens the view
 * @prototype
 * @function openDiv
 **/ 
StatisticsView.prototype.openDiv = openView;


/**Opens the view. First checks if the statistics are loaded from the server.
 * If not displays a "loading" message on the screen, otherwise it
 * loads the statistics data.
 * @prototype
 * @function open
 **/ 
StatisticsView.prototype.open = function() {
	var self=this;
	if (this.controller.getConfigVariable("statisticsLoaded")== true){	
		moblerlog("statistics have been loaded from server");
		self.loadData();	
	}
	else {
		self.showLoadingMessage();
	}  
	this.openDiv();	
};

/**leads to course list
 * @prototype
 * @function closeStatistics
 **/ 
StatisticsView.prototype.closeStatistics = function() {
	moblerlog("close Statistics button clicked");
	this.controller.transitionToCourses();
};


/**show loading message when statistics have not been fully loaded from the server
 * @prototype
 * @function showLoadingMessage
 **/
StatisticsView.prototype.showLoadingMessage = function() {
	$("#statisticsBody").hide();
	$("#loadingMessage").show();		
};


/**leads to achievements view
 * @prototype
 * @function clickToAchievements
 **/
StatisticsView.prototype.clickToAchievements = function() {
	moblerlog("slot 1 or slot 2 clicked");
	this.controller.transitionToAchievements();
};


/**loads the statistics data, whose values are calculated in the answer model
 * additionally, depending on the improvement or not of their values in
 * comparison with the previous 24 hours a red or green up or down arrow is
 * displayed next to the value.
 * @prototype
 * @function loadData
 **/
StatisticsView.prototype.loadData = function() {
	moblerlog("enters load data in statistics");
	var statisticsModel = this.controller.models['statistics'];
	$("#loadingMessage").hide();
	$("#statisticsBody").show();
	
	moblerlog("init values for statistics");
	//starts the calculation of the values of the various
	//statistics metrics
	var avgScore = statisticsModel.averageScore.averageScore;
	var improvementAvgScore = statisticsModel.averageScore.improvementAverageScore;
	if (avgScore < 0) {
		avgScore =  0;
	}
	
	var avgSpeed = statisticsModel.averageSpeed.averageSpeed;
	var improvementSpeed = statisticsModel.averageSpeed.improvementSpeed;
	if (avgSpeed <= 0) {
		avgSpeed =  "-";
	}
	
	var handledCards = statisticsModel.handledCards.handledCards;
	var improvementhandledCards = statisticsModel.handledCards.improvementHandledCards;
    if (handledCards < 0) {
        handledCards =  0;
    }
    
    var progress = statisticsModel.progress.progress;
    var improvementProgress = statisticsModel.progress.improvementProgress;
	if (progress < 0) {
		progress =  0;
	}
    
	var bestDay = statisticsModel.bestDay.bestDay;
	if (!bestDay) {
		// if the database does not know better, today is the best day!
		bestDay = new Date().getTime();
	}
	var oBestDay = new Date(bestDay);
	
	var bestScore = statisticsModel.bestDay.bestScore;
	if (bestScore < 0) {
		bestScore =  0;
	}
	moblerlog("initialization of data done");
	
	var removeClasses = msg_positiveImprovement_icon + " " + msg_negativeImprovement_icon + " " + msg_neutralImprovement_icon +
    " red green";
	//once the calculation of the values is done
	// we display the values, their text and the improvement arrow
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
   
    moblerlog("end load data");
};	

	

