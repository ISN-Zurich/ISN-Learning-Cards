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
 * * @author Evangelia Mitsopoulou 
 */
/*jslint vars: true, sloppy: true */



/**
 * @Class LMS View
 * View for displaying the list with the different lms's
 * 
 * @constructor
 * - it sets the tag ID for the lms view
 * - assigns event handler when taping on the close icon 
 * - binds 3 events, that are related with loading of courses and questions
 *   and they handle the  display of the list of courses as well as
 *   the transformation of the loading icon to statistics icon 
 * @param {String} controller
*/ 
function LMSView(controller) {

	var self = this;

	self.tagID = 'lmsView';
	this.controller = controller;
	self.active = false;
	self.firstLoad = true;
	this.didApologize = false;
	
	//handler when taping on the settings button
	jester($('#closeLMSIcon')[0]).tap(function() {
		self.closeLMS();
	});

	
	/**It is triggered when an unregistered lms item is selected and and there is no internet connection
	 * @event lmsOffline
	 * @param: a callback function that displays a message that states that we are offline and no registration can take place
	 * 			for the specific unregistered lms
	 */
	$(document).bind("lmsOffline", function(servername) {
		moblerlog("we are offline");
		self.LMSNotClickable(servername);	
	});
	
	/**It is triggered when an lms is online and failed to register for any reason. More specifically 
	 * it is triggered when no more than 24 hours have been passed from the first failed attempt for registration.
	 * @event lmsNotRegistrableYet
	 * @param: a callback function that displays a message to the user that the server is not available and the 
	 * 		   registration cannot take place
	*/
	$(document).bind("lmsNotRegistrableYet", function(servername) {
		self.showLMSRegistrationMessage(jQuery.i18n.prop('msg_lms_registration_message'));
	});
	
	/**It is triggered when the registration of an lms fails because of any reason
	 * @event registrationfailed
	 * @param:a callback function  that displays a message to the user that the server is not available and the
	 *		  registration cannot take place 
	*/
	$(document).bind("registrationfailed", function() {
		self.showLMSRegistrationMessage(jQuery.i18n.prop('msg_lms_registration_message'));
	});
}

/**
 * tap does nothing
 * @prototype
 * @function handleTap
 **/ 
LMSView.prototype.handleTap = doNothing;


/**
 * swipe does nothing
 * @prototype
 * @function handleSwipe
 **/ 
LMSView.prototype.handleSwipe = doNothing;

/**
 * pinch does nothing
 * @prototype
 * @function handlePinch
 **/ 
LMSView.prototype.handlePinch = doNothing;


/**
 * opens the view
 * @prototype
 * @function openDiv
 **/ 
LMSView.prototype.openDiv = openView;

/**
 * opens the view,
 * it sets the current view is the active
 * it shows the LMS list after clearing previous remaining items
 * @prototype
 * @function open
 **/ 
LMSView.prototype.open = function() {
	moblerlog("open lms view");
	this.active = true;
	$("#lmsList").empty();
	this.showLMSList();
	this.firstLoad = false;
	this.openDiv();
};

/**
 * closes the view
 * @prototype
 * @function closeDiv
 **/ 
LMSView.prototype.closeDiv = closeView;

/**
 * unsets the closing view from being active
 * and then closes the view.
 * empties afterwards the lms list
 * @prototype
 * @function close
 **/ 
LMSView.prototype.close = function() {
	moblerlog("close lms view");
	this.active = false;
	this.closeDiv();
	$("#lmsbody").empty();
};


/**
 * closes the lms view
 * and leads to login view
 * @prototype
 * @function closeLMS
 */
LMSView.prototype.closeLMS = function() {
	this.controller.transitionToLogin();
};


/**
 * shows the list with the available
 * different lms's 
 * for each lms are displayed:
 * - logo image
 * - label
 * @prototype
 * @function showLMSList
 */ 
LMSView.prototype.showLMSList = function() {
	var lmsObj = this.controller.models['lms'];
	
	$("#lmsbody").empty();
	this.hideLMSConnectionMessage();
	this.hideLMSRegistrationMessage();
	if (lmsObj.getLMSData() ){
		var lmsData = lmsObj.getLMSData(), i = 0;
		//creation of lms list
		var ul = $("<ul/>", {
			"id": "lmsList"
		}).appendTo("#lmsbody");
		for (i=0; i< lmsData.length; i++) {
			this.createLMSItem(ul, lmsData[i]);
		} //end of for
	}//end of if
	else {
		this.didApologize = true; 
		doApologize();
	}

};

/**
 * creates/designs the lms list
 * assigns tap handlers when tap on an item
 * prevent default behavior of the "touch start" gesture
 * in order the transition to login to take place smmothly and not to display
 * poping out the input fields.
 * @prototype
 * @function createLMSItem
 * @param {String, String} ul, lmsData, the name of the selected server
 **/ 
LMSView.prototype.createLMSItem = function(ul, lmsData) {
	var self = this;
	var sn = lmsData.servername;
	
	var li = $(
			"<li/>",
			{
				"id" : "lms " +sn
			}).appendTo(ul);
	moblerlog("the first lms is" + sn);
	// create the div container within the li element
	// that will host the image and logo of the lms's
	var div = $("<div/>", {
		"class" : "lmsListItem"
	}).appendTo(li);

	var prevent=true;
	jester(div[0]).tap(function(e,prevent) {
		e.preventDefault();
		e.stopPropagation();	
		self.clickLMSItem(sn);
	});

	$(div[0]).bind("touchstart", function(e) {
		moblerlog(" gesture start in lms  detected ");
		e.preventDefault();
		e.stopPropagation();
	});	

	img = $("<img/>", {
		"id":"lmsImage" +sn,
		"class" : "pfp left",
		"src":lmsData.logoImage
	}).appendTo(div);
	span = $("<div/>", {
		"id":"lmslabel"+sn,
		"class" : "lsmlabel",
		"text":lmsData.logoLabel
	}).appendTo(div);
	
};
	
		

/**
 * click on an lms item 
 * and sets properties
 * of the selected server
 * @prototype
 * @function clickLMSItem
 * @param {String} servername, the name of the selected server
 **/ 
LMSView.prototype.clickLMSItem = function(servername) {
	this.controller.models['lms'].setActiveServer(servername);
};


/**
 * shows the warning message from lms list view
 * that displayed a notification because there was
 * not internet connection and no registration could take place
 * @prototype
 * @function LMSNotClickable
 * @param {String} message, a text with containing the warning message
 */ 
LMSView.prototype.LMSNotClickable = function(servername) {
	moblerlog("enter LMS not clickable");
	var lmsObj = this.controller.models['lms'];
	var lmsData = lmsObj.getLMSData();
	// to make the specific LMS item unclickable
	$("#lms" + lmsData.servername).addClass("notClickable");
	
	// to display an error message
	this.showLMSConnectionMessage(jQuery.i18n.prop('msg_lms_connection_message'));
};


/**
 * shows the warning message from lms list view
 * that displayed a notification because there was
 * not internet connection and no registration could take place
 * @prototype
 * @function showLMSConnectionMessage
 * @param {String} message, a text with containing the warning message
 */ 
LMSView.prototype.showLMSConnectionMessage = function(message) {
	// to display an error message that we are
	// offline and we cannot register with the server
	moblerlog("enter show lms message");
	$("#lmserrormessage").text(message);
	$("#lmserrormessage").show();
};



/**
 * hides the warning message from lms list view
 * that displayed a notification because there was
 * not internet connection and no registration could take place
 * @prototype
 * @function hideLMSConnectionMessage
 */ 
LMSView.prototype.hideLMSConnectionMessage = function() {
	$("#lmserrormessage").text("");
	$("#lmserrormessage").hide();
};


/**
 * shows the warning message from lms list view
 * that displayed a notification regarding an error
 * during the registration of an lms
 * @prototype
 * @function showLMSRegistrationMessage
 * @param {String} message, a text with containing the warning message
 */ 
LMSView.prototype.showLMSRegistrationMessage = function(message) {
	// to display an error message that we are
	//offline and we cannot register with the server
	moblerlog("enter show lms message");
	$("#lmsregistrationmessage").text(message);
	$("#lmsregistrationmessage").show();
};


/**
 * hides the warning message from lms list view
 * that displayed a notification regarding an error
 * during the registration of an lms
 * @prototype
 * @function hideLMSRegistrationMessage
 */ 
LMSView.prototype.hideLMSRegistrationMessage = function() {
	$("#lmsregistrationmessage").text("");
	$("#lmsregistrationmessage").hide();
};

