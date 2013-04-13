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

/*jslint vars: true, sloppy: true */

/** @author Isabella Nake
 * @author Evangelia Mitsopoulou
 */


/**
 * @Class AchievementsView
 * View for displaying the achievements of a user, such as:
 * - Stackhandler
 * - CardBurner
 *  @constructor
 *  - it sets the tag ID for the settings view
 *  - assigns event handler when taping on close button
 *  - bind 2 events, similarly with statistics view that are related with 
 *    the loading of statistics and the calculation of all the statistics metrics. 
 *  @param {String} controller
 **/ 
function AchievementsView(controller){
	
	 var self = this;
	 self.controller = controller;  
	 self.tagID = 'achievementsView';
	 var featuredContent_id = FEATURED_CONTENT_ID;
	 var achievementsFlag= true;
	
	 // set prevent to false, in order to enable taping
	 // because the clicks don't work after the set of
	 // prevent to true within jester (in order swipe to work)
	 var prevent=false;
	 jester($('#closeAchievementsIcon')[0]).tap(function(event){
		 moblerlog("achievements: close tap");
		 self.closeAchievements(achievementsFlag);
		 event.stopPropagation(); } );

		/**It is triggered after statistics loaded locally from the server. This happens during the
		 * authentication
		 * @event loadstatisticsfromserver
		 * @param: a callback function that gets the first active day in order to start the calculation
		 *         of all thedifferent statistics metrics.
		 */	 
	 $(document).bind("loadstatisticsfromserver", function() {
		if ((self.tagID === self.controller.activeView.tagID)&& (self.controller.models['authentication'].configuration.loginState === "loggedIn"))
	    	{
	    		moblerlog("enters load statistics from server is done");
				 self.controller.models['statistics'].getFirstActiveDay();
	    	}
		  });
	 
	    /**It is triggered when the calculation of all the statistics metrics is done
		 * @event allstatisticcalculationsdone
		 * @param: a callback function that loads the body of the achievements view, which are
		 *        the two achievement types (cardBurner, stackHandler) and their values.
		 */	  
	  $(document).bind("allstatisticcalculationsdone", function() { 
	    	moblerlog("enters in calculations done 1 ");
	    if ((self.tagID === self.controller.activeView.tagID) && (self.controller.models['authentication'].configuration.loginState === "loggedIn"))
	    	{
	    		moblerlog("enters in calculations done 2 ");
	    		self.showAchievementsBody();
	    	}
	    });
	
}; 



/**
 * Pinch leads to statistics view. 
 * It works currently only on iOS devices.
 * @prototype
 * @function handlePinch
 **/
AchievementsView.prototype.handlePinch = function(){
	this.closeAchievements();
};


/**
 * Tap does nothing
 * @prototype
 * @function handleTap
 **/
AchievementsView.prototype.handleTap = doNothing;



/**
 * swipe leads to statistics view
 * @prototype
 * @function handleSwipe
 **/
AchievementsView.prototype.handleSwipe = function() {
	moblerlog("swiped in achievements view");
	this.closeAchievements();
};



/**
 * opens the view
 * @prototype
 * @function openDiv
 **/
AchievementsView.prototype.openDiv = openView;


/**
 * When the view opens it checks whether the statistics 
 * have been loaded from the server to the local storage.
 * If they do, then the vies is loaded normally otherwise
 * a loading message is displayed that notifies the user.
 * @prototype
 * @function open
 **/
AchievementsView.prototype.open = function(featuredContent_id) {
	var self=this;
	if (featuredContent_id){
		self.showAchievementsBody();	
	}
	else {
	
	if (this.controller.getConfigVariable("statisticsLoaded")== true){
	this.showAchievementsBody();
	}
	else {
		self.showLoadingMessage();
	}  
	}
	this.openDiv();	
};

/**
 * closes the view
 * @prototype
 * @function close
 **/
AchievementsView.prototype.close = closeView;

/**
 * leads to statistics view
 * @prototype
 * @function closeAchievements
 **/
AchievementsView.prototype.closeAchievements = function() {
	moblerlog("close Achievements button clicked");
	controller.transitionToStatistics(controller.models['statistics'].currentCourseId, 1);
};


/**
 * Shows the achievements body after firstly removing
 * the loading message.
 * For every achievement type it displays:
 * -its name
 * -its definition and value
 * -its icon, which has blue font color if the achievement has been reached 
 * @prototype
 * @function showAchievementsBody
 **/
AchievementsView.prototype.showAchievementsBody = function() {
	var statisticsModel = controller.models['statistics'];
	$("#loadingMessageAchievements").hide();
	$("#StackHandlerContainer").show();
	$("#CardBurnerContainer").show();
	$("#stackHandlerIcon").removeClass("blue");
	$("#cardBurnerIcon").removeClass("blue");
	$("#valueStackHandler").text(statisticsModel.stackHandler.achievementValue+"%");

	if (statisticsModel.stackHandler.achievementValue == 100){
		$("#stackHandlerIcon").addClass("blue");	
		$("#stackHandlerDash").removeClass("dashGrey");
		$("#stackHandlerDash").addClass("select");	
	};
	
	$("#valueCardBurner").text(statisticsModel.cardBurner.achievementValue+"%");

	if (statisticsModel.cardBurner.achievementValue == 100){
			$("#cardBurnerIcon").addClass("blue");	
			$("#cardBurnerDash").removeClass("dashGrey");
			$("#cardBurnerDash").addClass("select");	
	};
};

/**
 * shows loading message that achievements are being loaded
 * from the server
 * @prototype
 * @function showLoadingMessage
 **/
AchievementsView.prototype.showLoadingMessage = function() {
	$("#StackHandlerContainer").hide();
	$("#CardBurnerContainer").hide();
	$("#loadingMessageAchievements").show();	
	
};

/**
* handles dynamically any change that should take place on the layout
* when the orientation changes.
* @prototype
* @function changeOrientation
**/ 
AchievementsView.prototype.changeOrientation = function() {
//	window_width = $(window).width();
//	var gridWidth = 48;
//	var separatorWidth= 8;
//	var dashWidth = 40;
//	var inputwidth = window_width - gridWidth - separatorWidth - dashWidth-70;
//	moblerlog(" width in achievements view is "+inputwidth);
//	$(".labelContainer").css("width", inputwidth + "px");
};