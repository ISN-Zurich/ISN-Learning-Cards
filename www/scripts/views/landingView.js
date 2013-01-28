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
LandingView.prototype.open = function() {
	moblerlog("landingView: open sesame");
	this.showForm();
	this.openDiv();
	this.active = true;
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
LandingView.prototype.showForm = function() {
	calculateLabelWidth();	
	this.hideErrorMessage();
	$("#landingViewHeader").show();
	$("#landingBody").show();
	if (this.controller.models['connection'].isOffline()) {
		this.showErrorMessage(jQuery.i18n.prop('msg_landing_message'));
	}
};


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
* (the distance between the cards and the title should be calculated dynamically) 
* @prototype
* @function changeOrientation
**/ 
LandingView.prototype.changeOrientation = function(orientationLayout, w, h) {
	
};



