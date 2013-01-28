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
 * @Class SettingsView
 *  View for displaying the settings which are:
 *  - name (first name and last name) of the user
 *  - email address of user
 *  - selected language
 *  @constructor
 *  - it sets the tag ID for the settings view
 *  - assigns various event handlers when taping on various elements of the view
 *    such as the close button, the logout button and the "more info" icon.
 *  - it binds the event that is triggered when the authentication is ready  
 **/
function SettingsView(controller) {
    var self = this;
    this.controller = controller;
    self.tagID = 'settingsView';
    
    // assigning gesture handlers on the view elements (close, logout  and more info button)
    // when they are tapped
    jester($('#closeSettingsIcon')[0]).tap(function(){ self.closeSettings(); } );
    jester($('#logOutSettings')[0]).tap(function() {
    	self.logout();
    });
    jester($('#aboutMore')[0]).tap(function() {
		self.clickAboutMore();
	});
    
    /**
     * When all authentication data are received and stored in the local storage
     * the authenticationready event is triggered and binded here
     * @event authenticationready
     * @param e, userID, the user id 
     */  
    $(document).bind("authenticationready", function(e, userID) {
		moblerlog("authentication ready called " + userID);
		self.loadData();
	});    
} 


/**
 * pinch leads to course list
 * @prototype
 * @function handlePinch
 **/
SettingsView.prototype.handlePinch = function() {
    controller.transitionToCourses();
};

/**
 * tap does nothing
 * @prototype
 * @function handleTap
 **/
SettingsView.prototype.handleTap = doNothing;


/**
 * swipe does nothing
 * @prototype
 * @function handleSwipe
 **/
SettingsView.prototype.handleSwipe = doNothing;


/**
 * opens the view
 * @prototype
 * @function openDiv
 **/
SettingsView.prototype.openDiv = openView;


/**
 * shows the settings data
 * @prototype
 * @function open
 **/
SettingsView.prototype.open = function() {
	this.loadData();
	this.openDiv();
	
	controller.models['authentication'].loadFromServer();	
};


/**
 * closes the view
 * @prototype
 * @function close
 **/
SettingsView.prototype.close = closeView;

 
/**
 * Leads to course list
 * @prototype
 * @function closeSettings
 **/
SettingsView.prototype.closeSettings = function() {
	moblerlog("close settings button clicked");
	controller.transitionToCourses();
};



/**
 *leads to logout confirmation view
 * @prototype
 * @function logout
 **/
SettingsView.prototype.logout = function() {
	controller.transitionToLogout();
};


/**
 * loads the statistics data
 * @prototype
 * @function loadData
 **/
SettingsView.prototype.loadData = function(){
	var self=this;
	var lmsObj = controller.models['lms'];
	var config = controller.models['authentication'];
	$("#aboutMore").show();
	$("#lmsLabelSet").attr("src",self.controller.getActiveLogo());
	$("#pfpItemSet").text(self.controller.getActiveLabel());
	$("#nameItemSet").text(config.getDisplayName());
	$("#usernameItemSet").text(config.getUserName());
	$("#emailItemSet").text(config.getEmailAddress());
	$("#languageItemSet").text(jQuery.i18n.prop('msg_' + config.getLanguage() + '_title'));	
};


/**
 * This function is executed when the user clicks on the "info" button on the statistics view.
 * Leads to about view
 * @prototype
 * @function clickAboutMore
 **/
SettingsView.prototype.clickAboutMore = function() {
	controller.transitionToAbout();
}

