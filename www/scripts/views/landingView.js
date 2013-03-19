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

/**
 * @author Evangelia Mitsopoulou
 */

/*jslint vars: true, sloppy: true */

/**
 * @Class LandingView
 * View for displaying the first page that is visible to the user when the app is launched.
 * It contains the courses that are available free to the user, whithout beeing registrated.
 *  @constructor
 *  - it sets the tag ID for the landing view
 *  - assigns various event handlers when taping on the elements of the
 *    landing form such as featured content, exclusive content (and free content soon)
 *  - it binds synhronization events such as the sending of statistics to the server,
 *    the update of courses and questions. It prevents the display of the appropriate
 *    views that are also binded with the aforementioned events by displaying the
 *    login form itself.(FIX ME:. stay here instead of redirecting to the login view)
 *  @param {String} controller  
 **/
function LandingView(controller) {
	var self = this;

	self.tagID = 'landingView';
	this.controller = controller;
	this.active = false;
	this.fixedRemoved= false;
	var prevent=true;
	var featuredContent_id = FEATURED_CONTENT_ID;
	
	jester($('#selectarrowLanding')[0]).tap(function(e) {
//		e.stopPropagation();
		moblerlog("taped statistics icon landing view");
		self.clickFeaturedStatisticsIcon(featuredContent_id);
	});
	
	jester($('#landingLmsLabel')[0]).tap(function(e,prevent) {
		moblerlog("taped feautured Content");
//		$('#featuredContent').addClass("gradientSelected");
//		e.stopPropagation();
//		e.preventDefault();
		self.clickFeaturedItem(featuredContent_id);
	});
	
	
	//handler when taping on the exclusive content element
	jester($('#selectExclusiveContent')[0]).tap(function(e,prevent) {
		//$('#selectExclusiveContent').addClass("gradientSelected");
		moblerlog(" enters in landing view 1 ");
//		e.preventDefault();
//		e.stopPropagation();
		self.selectExclusiveContent();
	});
		
	/** 
	 * It is triggered when an online connection is detected.
	 * @event errormessagehide
	 * @param: a function that hides the error message from login view
	 * **/
	$(document).bind("errormessagehide", function() {
		moblerlog(" hide error message loaded ");
		self.hideErrorMessage();
	});	
		
	$('#selectExclusiveContent').bind("touchstart", function(e) {
		moblerlog(" enters in landing view 2 ");
		$("#selectExclusiveContent").addClass("gradientSelected");
		e.preventDefault();
		e.stopPropagation();
	});	
	
	$('#featuredContent').bind("touchstart", function(e) {
		moblerlog(" enters in landing view 3 ");
		$("#featuredContent").addClass("gradientSelected");
		moblerlog("color changed");
		e.preventDefault();
		e.stopPropagation();
	});	
	
	$(document).bind("featuredContentlistupdate", function(e,featuredCourseId) {
		
	self.showForm(featuredCourseId); //this will be called when a synchronization update takes place
	
	});

	
	
} //end of constructor


/**
 * 
 * @prototype
 * @function handleTap
 **/
LandingView.prototype.handleTap =doNothing;


/**
 * pinch does nothing
 * @prototype
 * @function handlePinch
 **/
LandingView.prototype.handlePinch = doNothing;

/**
 * swipe does nothing
 * @prototype
 * @function handleSwipe
 **/
LandingView.prototype.handleSwipe = doNothing;


/**
 * opens the view
 * @prototype
 * @function openDiv
 **/
LandingView.prototype.openDiv = openView;


/**
 * It opens the landing view
 * @prototype
 * @function open
 **/
LandingView.prototype.open = function(featuredContent_id) {
	moblerlog("landingView: open sesame");
	this.showForm(featuredContent_id);
	this.openDiv();
	this.active = true;
	setFeaturedWidth();
};


/**
 * closes the view
 * @prototype
 * @function closeDiv
 **/ 
LandingView.prototype.closeDiv = closeView;


/**
 * closes the view after firstly removing the gradients 
 * of the featured and exclusive content
 * @prototype
 * @function close
 **/ 
LandingView.prototype.close = function() {
//	$('#featuredContent').removeClass("gradientSelected");
//	$('#featuredContent').addClass("gradient2");
	$("#selectExclusiveContent").removeClass("gradientSelected");
	$("#featuredContent").removeClass("gradientSelected");
	this.active = false;
	this.closeDiv();
};


/**
 * transition to login view when the exclusive option
 * is selected in the landing page
 * @prototype
 * @function selectExclusiveContent
 */
LandingView.prototype.selectExclusiveContent = function() {
	this.controller.transitionToLogin();
};


/**
 * displays the landing form 
 * @prototype
 * @function showForm
 * @param{string}, featuredContent_id
 */ 
LandingView.prototype.showForm = function(featuredContent_id) {
	moblerlog("enter show form of landing view");
	var self=this;
	var featuredModel = self.controller.models['featured'];
	this.hideErrorMessage();
	if (this.controller.models['connection'].isOffline()) {
		this.showErrorMessage(jQuery.i18n.prop('msg_landing_message'));}
	$("#featuredContent").attr("id",featuredContent_id);
	$("#landingViewHeader").show();
	moblerlog("showed landing view header");
	$("#landingLmsLabel").text(featuredModel.getTitle());
	
	if ($("#selectarrowLanding").hasClass("icon-loading loadingRotation")) {
			$("#selectarrowLanding").addClass("icon-bars").removeClass("icon-loading loadingRotation");
		
	}
	$("#landingBody").show();	
	moblerlog("showed the body of the landing page");
 
}


/**
 * shows the specified error message
 * @prototype
 * @function showErrorMessage
 */ 
LandingView.prototype.showErrorMessage = function(message) {
	$("#warningmessageLanding").hide();
	$("#errormessageLanding").text(message);
	$("#errormessageLanding").show();
};

/**
 * click on the default featured content, loads its questions
 * @prototype
 * @function clickFeaturedItem
 */ 
LandingView.prototype.clickFeaturedItem = function(featuredContent_id){
	//if (this.controller.models['featured'].isSynchronized(featuredContent_id)) {
		//	$("#featuredContent").addClass("gradientSelected");
	this.controller.models['questionpool'].reset();
	this.controller.models['questionpool'].loadData(featuredContent_id);
	this.controller.models['answers'].setCurrentCourseId(featuredContent_id);
	moblerlog("enters clickFeauturedItem");
	this.controller.transitionToQuestion(featuredContent_id);
	//}
};


/**
* hides the specified error message
* @prototype
* @function hideErrorMessage
**/ 
LandingView.prototype.hideErrorMessage = function() {
	$("#errormessageLanding").text("");
	$("#errormessageLanding").hide();
};


/**
* handles dynamically any change that should take place on the layout
* when the orientation changes.
* @prototype
* @function changeOrientation
* @param {string, number, number} orientationLayout, width of device screen, height of device screen
**/ 
LandingView.prototype.changeOrientation = function(orientationLayout, w, h) {
	moblerlog("change orientation in landing view");
	setFeaturedWidth();
};


/**
 * click on statistic icon calculates the appropriate statistics and 
 * loads the statistics view after transforming the statistics icon into loading icon
 * @prototype
 * @function clickStatisticsIcon
 * @param {string} featuredContent_id
 */ 
LandingView.prototype.clickFeaturedStatisticsIcon = function(featuredContent_id) {
	moblerlog("statistics button in landing view clicked");
	
	if ($("#selectarrowLanding").hasClass("icon-bars")) {
		moblerlog("select arrow landing has icon bars");
		$("#selectarrowLanding").removeClass("icon-bars").addClass("icon-loading loadingRotation");
		
		//icon-loading, icon-bars old name
		//all calculations are done based on the course id and are triggered
		//within setCurrentCourseId
		this.controller.transitionToStatistics(featuredContent_id);
	}
};

/**
 * sets dynamically the width of the elements
 * of the landing form.
 * it is calculated by substracting from the device width in the current mode (landscape, portrait)
 * which has been detected in the controller the sum of the widths of the rest dom elements around it
 * such as: dash bar, icon container and separator.
 * @function setInputWidth
 * */
function setFeaturedWidth(){
	window_width = $(window).width();
	var inputwidth = window_width - 49- 34 - 18;
	$("#landingLmsLabel").css("width", inputwidth + "px");
	$("#exclusiveContentLabel").css("width", inputwidth + "px");
}

