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

// View for displaying the achievements
 
function AchievementsView(){
	
	 var self = this;
	    
	 self.tagID = 'achievementsView';
	
	 jester($('#closeAchievementsIcon')[0]).tap(function(){ self.closeAchievements(); } );
	
}; 


// pinch leads to statistics view

AchievementsView.prototype.handlePinch = function(){
    controller.transitionToStatistics();
};


// tap does nothing
 
AchievementsView.prototype.handleTap = doNothing;


// swipe leads to statistics view

AchievementsView.prototype.handleSwipe = function() {
	controller.transitionToStatistics();
};


// opens the view
 
AchievementsView.prototype.openDiv = openView;

//shows the achievements body

AchievementsView.prototype.open = function() {
	this.showAchievementsBody();
	this.openDiv();	
};

//closes the view
 
AchievementsView.prototype.close = closeView;

//leads to statistics view

AchievementsView.prototype.closeAchievements = function() {
	console.log("close Achievements button clicked");
	controller.transitionToStatistics();
};

//shows the achievements

AchievementsView.prototype.showAchievementsBody = function() {
	var statisticsModel = controller.models['statistics'];
	var statistics = statisticsModel.getStatistics();
	$("#stackHandlerIcon").removeClass("blue");
	$("#cardBurnerIcon").removeClass("blue");

	$("#valueStackHandler").text(statistics['stackHandler']+"%");
//checkMaxEfficiency(statistics['stackHandler']);
	if (statistics['stackHandler'] == 100){
			$("#stackHandlerIcon").addClass("blue");			
	};
	$("#valueCardBurner").text(statistics['cardBurner']+"%");
	if (statistics['cardBurner'] == 100){
			$("#cardBurnerIcon").addClass("blue");			
	};
	


}