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
	//handler when taping on the exclusive content element
	jester($('#selectExclusiveContent')[0]).tap(function(e,prevent) {
		moblerlog(" enters in landing view 1 ");
		e.preventDefault();
		e.stopPropagation();
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
		e.preventDefault();
		e.stopPropagation();
	});	
	
	
	$(document).bind("featuredContentlistupdate", function(e) {
		
		//self.showForm();
	});
	
	jester($('#featuredContent')[0]).tap(function(e) {
		moblerlog("taped feautured Content");
		$('#featuredContent').removeClass("gradient2");
		$('#featuredContent').addClass("gradientSelected");
		//e.stopPropagation();
		//e.preventDefault();
		self.clickFeaturedItem(featuredContent_id);
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
 * closes the view after firstly clearing
 * the input fields of the login form
 * @prototype
 * @function close
 **/ 
LandingView.prototype.close = function() {
	$('#featuredContent').removeClass("gradientSelected");
	$('#featuredContent').addClass("gradient2");
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
 */ 
LandingView.prototype.showForm = function(featuredContent_id) {
	var self=this;
	var featuredModel = self.controller.models['featured'];
	this.hideErrorMessage();
	if (this.controller.models['connection'].isOffline()) {
		this.showErrorMessage(jQuery.i18n.prop('msg_landing_message'));}
	$("#featuredContent").attr("id",featuredContent_id);
	$("#landingViewHeader").show();
	
	
	$("#landingLmsLabel").text(featuredModel.getTitle());
	$("#landingBody").show();	
	moblerlog("just show the title of the featured courses");
   

	
	

	
	
	//**********************Design landing page in Javascript*********************
//	var li = $("<li/>", { }).appendTo("#landingElements");
//	
//	var div = $("<div/>", {
//		"id" : "featuredContent",
//		"class": "selectWidget gradient2"
//	}).appendTo(li);
//	
//	var div2 = $("<div/>", {
//		"class": "left lineContainer selectItemContainer"
//	}).appendTo(div);
//	
//	var span1 = $("<span/>", {
//		"class": "select icon-dash"
//	}).appendTo(div2);
//	
//	var div3 = $("<div/>", {
//		"id":"leftElement1",
//		"class":"labelContainer"
//	}).appendTo(div);
//	
//	
//	var div3_1=$("<div/>", {
//		"id":"landingLmsLabel",
//		"class":"lsmlabel textShadow",
//		"text":"Featured Content"
//	}).appendTo(div3);
//	
//	var div4 = $("<div/>", {
//		"id":"rightElements",
//		"class":"right"
//	}).appendTo(div);
//	
//	var div4_1 = $("<div/>", {
//		"id":"separatorLanding",
//		"class":"lineContainer separatorContainerCourses radial"
//	}).appendTo(div4);
//	
//	var div4_2 = $("<div/>", {
//		"id":"selectarrowLanding",
//		"class":"lineContainer selectItemContainer select"
//	}).appendTo(div4);
//	
//	var span4_2 = $("<span/>", {
//		"class": "icon-bars"
//	}).appendTo(div4_2);
//	
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
 * click on the defautl featured content, loads its questions
 * @prototype
 * @function clickFeaturedItem
 */ 
LandingView.prototype.clickFeaturedItem = function(featuredContent_id){
	//if (this.controller.models['featured'].isSynchronized(featuredContent_id)) {
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
* TODO: to check the misbehavior when changing from horizontal mode to vertical mode, 
* after coming back from login view
* @prototype
* @function changeOrientation
**/ 
LandingView.prototype.changeOrientation = function(orientationLayout, w, h) {
	moblerlog("change orientation in landing view");
	setFeaturedWidth();
};


/**
 * sets dynamically the width of the input elements
 * of the login form.
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

