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




/**@author Isabella Nake
 * @author Evangelia Mitsopoulou
 */

/*jslint vars: true, sloppy: true */

/**
 * @Class LoginView
 * View for displaying the login form and the default lms
 * Additionally it displays error and warning messages while
 * the user is trying to authenticate,depending on the problem 
 * fox example: lost of internet connectivity, wrong user name etc.
 * In the bottom part of the view are displayed the logos of the organisation 
 *  @constructor
 *  - it sets the tag ID for the login view
 *  - assigns various event handlers when taping on the elements of the
 *    login form such as username, password, login button
 *  - it binds synhronization events such as the sending of statistics to the server,
 *    the update of courses and questions. It prevents the display of the appropriate
 *    views that are also binded with the aforementioned events by displaying the
 *    login form itself.
 *  @param {String} controller  
 **/
function LoginView(controller) {
	var self = this;
	self.tagID = 'loginView';
	this.controller = controller;
	this.active = false;
	this.fixedRemoved= false;
	var featuredContent_id = FEATURED_CONTENT_ID;

	//handler when taping on the login button
	jester($('#loginButton')[0]).tap(function() {
		self.clickLoginButton();
	});
	//handler when taping on the close button of login button
	jester($('#loginViewBackIcon')[0]).tap(function() {
		self.clickCloseLoginButton();
	});
		//handler when taping on the username field 
	var prevent=false;
	jester($('#usernameInput')[0]).tap(function(e,prevent){
		//e.stopPropagation();
		focusLogos(e);
		});	
	//handler when taping on the password field
	jester($('#password')[0]).tap(function(e,prevent) {
		//e.stopPropagation();
			focusLogos(e);	
		});	
	
	//handler when taping on the select lms button
	jester($('#selectLMS')[0]).tap(function(e) {
		e.stopPropagation();
		e.preventDefault();
		moblerlog("enters in tap of select lms");
		self.selectLMS();
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
		
	
	// if keyboard is displayed, move the logos up
	// if keyboard is not displayed anymore, move logos down
	$("#usernameInput")[0].addEventListener("focus", focusLogos);
	$("#password")[0].addEventListener("focus", focusLogos);
	$("#usernameInput")[0].addEventListener("blur", unfocusLogos);
	$("#password")[0].addEventListener("blur", unfocusLogos);

	function focusLogos(e) {
		e.stopPropagation();
		e.preventDefault;
		
		moblerlog("focus logos " + e.currentTarget);
		$("#loginButton").removeClass("fixed");
		var fixedRemoved= true;
		$("#logos").removeClass("bottom");
		$("#logos").addClass("static");
	}

	function unfocusLogos(e) {
		e.stopPropagation();
		e.preventDefault;
		moblerlog("unfocus logos " + e.currentTarget);
		$("#loginButton").addClass("fixed");
		$("#loginButton").show();
		moblerlog("loginButton is now fixed");
		var fixedRemoved= false; //it is back on its old position
		$("#logos").addClass("bottom");
		$("#logos").removeClass("static");
	}
		
} //end of constructor


/**
 * 
 * @prototype
 * @function handleTap
 **/
LoginView.prototype.handleTap = function(){
	moblerlog("tap shows the loggin button");
	$("#loginButton").show();
};


/**
 * pinch does nothing
 * @prototype
 * @function handlePinch
 **/
LoginView.prototype.handlePinch = doNothing;

/**
 * swipe does nothing
 * @prototype
 * @function handleSwipe
 **/
LoginView.prototype.handleSwipe = doNothing;


/**
 * opens the view
 * @prototype
 * @function openDiv
 **/
LoginView.prototype.openDiv = openView;


/**
 * shows the login form after firstly hide the error messages 
 * that might be displayed because of connection failure 
 * due to various reasons (wrong data, no internet etc) 
 * @prototype
 * @function open
 **/
LoginView.prototype.open = function() {
	moblerlog("loginView: open sesame");
	// hide unnecessary errors and warnings 
	this.hideErrorMessage();
	this.hideWarningMessage();
	$("#selectLMS").removeClass("gradientSelected");
	this.showForm();
	this.openDiv();
	this.active = true;
	setInputWidth();
};


/**
 * closes the view
 * @prototype
 * @function closeDiv
 **/ 
LoginView.prototype.closeDiv = closeView;


/**
 * closes the view after firstly clearing
 * the input fields of the login form
 * @prototype
 * @function close
 **/ 
LoginView.prototype.close = function() {
	$("#password").val("");
	$("#usernameInput").val("");
	$("#password").blur();
	$("#usernameInput").blur();
	this.active = false;
	injectStyle();
	this.closeDiv();
};


/**
 * click on the login button sends data to the authentication model,
 * data is only sent if input fields contain some values
 * after successful login the course list is displayed
 * @prototype
 * @function clickLoginButton
 */
LoginView.prototype.clickLoginButton = function() {
	var user, password;
	var self = this;

	function cbLoginSuccess() {
		if (self.active) {
			moblerlog("is logIn");
			$(document).trigger("trackingEventDetected",["Login"]);
			controller.transitionToCourses();
		}
	}
	
	function cbLoginFailure(e, errormessage) {
		moblerlog("authentication failed, reason: " + errormessage);
		switch (errormessage) {
		case "connectionerror":
			self.showErrorMessage(jQuery.i18n.prop('msg_connection_message'));
			break;
		case "nouser":
			moblerlog("no user error");
			self.showErrorMessage(jQuery.i18n.prop('msg_authenticationFail_message'));
			break;
		case "invalidclientkey":
			self.showErrorMessage(jQuery.i18n.prop('msg_connection_message'));
			break;
		default:
			break;
		}
	}

	moblerlog("check logIn data");
	if ($("#usernameInput").val() && $("#password").val()) {
		if (!self.controller.models["connection"].isOffline()) {
			moblerlog("has logIn data");

			$(document).bind("authenticationready", cbLoginSuccess);
			$(document).bind("authenticationfailed", cbLoginFailure);

			self.showWarningMessage(jQuery.i18n.prop('msg_warning_message'));
			controller.models['authentication'].login(
					$("#usernameInput").val(), $("#password").val());
		}//use else to display an error message that the internet connectivity is lost, or remove the if sanity check (offline)
		// the isOffline seems to work not properly
	} else {
		self.showErrorMessage(jQuery.i18n.prop('msg_authentication_message'));
	}
};


/**
 * displays the login form
 * @prototype
 * @function showForm
 */ 
LoginView.prototype.showForm = function() {
	moblerlog("show form in login view");
	$("#lmsImage").attr("src",this.controller.getActiveLogo());
	$("#loginLmsLabel").text(this.controller.getActiveLabel());
	calculateLabelWidth();	
				
	this.hideErrorMessage();
	$("#loginViewHeader").show();
	$("#loginViewBackIcon").show();
	$("#loginBody").show();
	
	if (this.controller.models['connection'].isOffline()) {
		this.showErrorMessage(jQuery.i18n.prop('msg_network_message'));
	}
};

/**
 * shows the specified error message
 * @prototype
 * @function showErrorMessage
 */ 
LoginView.prototype.showErrorMessage = function(message) {
	$("#warningmessage").hide();
	$("#errormessage").text(message);
	$("#errormessage").show();
};


/**
 * shows the specified warning message
 * @prototype
 * @function showWarningMessage
 */ 
LoginView.prototype.showWarningMessage = function(message) {
	$("#errormessage").hide();
	$("#warningmessage").text(message);
	$("#warningmessage").show();
};


/**
* hides the specified error message
* @prototype
* @function hideErrorMessage
**/ 
LoginView.prototype.hideErrorMessage = function() {
	$("#errormessage").text("");
	$("#errormessage").hide();
};


/**
* hides the specified warning message
* @prototype
* @function hideWarningMessage
**/ 
LoginView.prototype.hideWarningMessage = function() {
	$("#warningmessage").text("");
	$("#warningmessage").hide();
};


/**
* when user taps on the select lms button
* it leads to lms list view
* @prototype
* @function selectLMS
**/ 
LoginView.prototype.selectLMS = function() {
	var self=this;
	moblerlog("select lms");
	$("#selectLMS").removeClass("textShadow");
	$("#selectLMS").addClass("gradientSelected");
	self.storeSelectedLMS();
	setTimeout(function() {self.controller.transitionToLMS();},100);
};

/** 
 * storing the selected LMS  in an array
* @prototype
* @function storeSelectedLMS
 * */
LoginView.prototype.storeSelectedLMS = function(){
	var selectedLMS=$("#loginLmsLabel").text();
	moblerlog("stored selected lms is"+JSON.stringify(selectedLMS));
	this.controller.models["lms"].setSelectedLMS(selectedLMS);
};


/** detects when a click event is happenig in login view
* @prototype
* @function detectClick
 * */
LoginView.prototype.detectClick = function() {
	moblerlog("click in login view detected");
};

/**
* handles dynamically any change that should take place on the layout
* when the orientation changes.
*  - the width of the lms label in select widget is adjusted dynamically
* @prototype
* @function changeOrientation
**/ 
LoginView.prototype.changeOrientation = function(orientationLayout, w, h) {
	var self=this;
	moblerlog("change orientation in login view");
	w1=$(".imageContainer").height();
	w2=$(".separator").height();
	w3=$(".selectItemContainer").height();
	width = w - (w1 + w2 + w3 + w3 + w1); //rough estimation 
	$(".labelContainer").css("width", width + "px");

	if (orientationLayout==false || self.fixedRemoved== true) //we are in portrait mode and previously
															 // we had removed the fixed position of login button
	{$("#loginButton").removeClass("fixed");}
	else if (self.fixedRemoved== false){
		$("#loginButton").addClass("fixed");
	};

	if (orientationLayout || self.fixedRemoved== true) //we are in landscape mode and previously
													 //we had removed the fixed position of login button
	{
		//$("#loginButton").removeClass("fixed");
	}
	else if (self.fixedRemoved== false) {
		$("#loginButton").addClass("fixed");
	};	
	
	
	var buttonwidth, window_width = $(window).width();
	buttonwidth = window_width-2;
	$(".forwardButton").css("width", buttonwidth + "px");
	
	setInputWidth();
};


/**
* transition to landing view when tapping on the
* close button on the up right corner of login view 
* @prototype
* @function clickCloseLoginButton
 * */
LoginView.prototype.clickCloseLoginButton=function(){
	controller.transitionToLanding();

};

/**
 * sets dynamically the width of the input elements
 * of the login form.
 * it is calculated by substracting from the device width in the current mode (landscape, portrait)
 * which has been detected in the controller the sum of the widths of the rest dom elements around it
 * such as: dash bar, icon container and separator.
 * @function setInputWidth
 * */
function setInputWidth(){
	window_width = $(window).width();
	var inputwidth = window_width - 49- 34 - 18;
	$("#usernameInput").css("width", inputwidth + "px");
	$("#password").css("width", inputwidth + "px");
	moblerlog("window width in landing view is "+window_width);
	var gridWidth = 34;
	var separatorWidth= 12;
	var dashWidth = 34;
	var iconWidth= 30;
	var lmsWidth = window_width - gridWidth -separatorWidth - dashWidth - iconWidth;
	$("#lsmlabel").css("width", inputwidth + "px");
}

