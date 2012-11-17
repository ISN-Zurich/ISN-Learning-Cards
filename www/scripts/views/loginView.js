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
 *  - it sets the tag ID for the settings view
 *  - assigns various event handlers when taping on various elements of the view
 *    such as the close button, the logout button and the "more info" icon.
 *  - it binds the event that is triggered when the authentication is ready
 *  @param {String} controller  
 **/
function LoginView(controller) {
	var self = this;

	self.tagID = 'splashScreen';
	this.controller = controller;
	this.active = false;

	jester($('#loginButton')[0]).tap(function() {
		self.clickLoginButton();
		
	var prevent=false;
	jester($('#usernameInput')[0]).tap(function(e, prevent){
			focusLogos(e);
		});	
	jester($('#password')[0]).tap(function(e,prevent) {
			focusLogos(e);	
		});	
	
	
	$(document).bind("statisticssenttoserver", function() {
		if ((self.tagID === self.controller.activeView.tagID) && (self.controller.models['authentication'].configuration.loginState === "loggedOut"))
		{
			moblerlog("stays in login view, despite the synchronization updates");
			self.showForm();
		}
		});
	
	$(document).bind("questionpoolready", function() {
		if ((self.tagID === self.controller.activeView.tagID) && (self.controller.models['authentication'].configuration.loginState === "loggedOut"))
		{
			moblerlog("stays in login view, despite the synchronization updates");
			self.showForm();
		}
	});
		

	$(document).bind("courselistupdate", function() {
		if ((self.tagID === self.controller.activeView.tagID) && (self.controller.models['authentication'].configuration.loginState === "loggedOut"))
		{
			moblerlog("stays in login view, despite the synchronization updates");
			self.showForm();
		}
	});
			
	});
	

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
		moblerlog("focus logos " + e.currentTarget);
		$("#logos").removeClass("bottom");
		$("#logos").addClass("static");
	}

	function unfocusLogos(e) {
		moblerlog("unfocus logos " + e.currentTarget);
		$("#logos").addClass("bottom");
		$("#logos").removeClass("static");
	}

} //end of constructor

//tap, swipe and pinch do nothing

/**
 * Pinch leads to course list
 * @prototype
 * @function handlePinch
 **/
LoginView.prototype.handleTap = doNothing;

/**
 * Pinch leads to course list
 * @prototype
 * @function handlePinch
 **/
LoginView.prototype.handlePinch = doNothing;

/**
 * Pinch leads to course list
 * @prototype
 * @function handlePinch
 **/
LoginView.prototype.handleSwipe = doNothing;

/**
 * opens the view
 * @prototype
 * @function openDiv
 **/
LoginView.prototype.openDiv = openView;



/**
 * shows the login form
 * @prototype
 * @function open
 **/
LoginView.prototype.open = function() {
    // hide unnecessary errors and warnings 
    this.hideErrorMessage();
    this.hideWarningMessage();
    
	this.showForm();
	this.openDiv();

	this.active = true;
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

	this.closeDiv();
};


/**
 * click on the login button sends data to the authentication model data is only
 * sent, if input fields contain some values after successful login, the course
 * list is displayed
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


//displays the login form

LoginView.prototype.showForm = function() {
	$("#loginForm").show();
	this.hideErrorMessage();
	if (this.controller.models['connection'].isOffline()) {
		this.showErrorMessage(jQuery.i18n.prop('msg_network_message'));
	}
	
	var config = this.controller.models['authentication'];
	$("#lmsImage").attr("src",config.getServerLogoImage());
	$("#pfpLabel1").text(config.getServerLogoLabel());
	
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
}


/**
 * shows the specified warning message
 * @prototype
 * @function showWarningMessage
 */ 
LoginView.prototype.showWarningMessage = function(message) {
	$("#errormessage").hide();
	$("#warningmessage").text(message);
	$("#warningmessage").show();
}


/**
* hides the specified error message
* @prototype
* @function showWarningMessage
**/ 
LoginView.prototype.hideErrorMessage = function() {
	
	$("#errormessage").text("");
	$("#errormessage").hide();
}


/**
* hides the specified warning message
* @prototype
* @function hideWarningMessage
**/ 
LoginView.prototype.hideWarningMessage = function() {
	$("#warningmessage").text("");
	$("#warningmessage").hide();
}
