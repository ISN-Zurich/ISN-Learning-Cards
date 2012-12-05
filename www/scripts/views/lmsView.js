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
 * - it sets the tag ID for the settings view
 * - assigns event handler when taping on the settings icon 
 * - bind 2 events, that are related with loading of courses and questions
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

	
	/**
	 * TO DO COMMENTS
	 * 
	 */
	
	$(document).bind("lmsNotRegisteredYet", function(servername) {
		
		if (self.controller.isOffline()){
			moblerlog("offline and cannot click and register");
			self.LMSNotClickable(servername);
		}	
		else { // we are online 
			moblerlog("will do a registration because we are online");

			// if we had tried to register for the specific server 
			// and we failed and if this failure took place less than 24 hours ago
			// then display to the usre the lms registation message t
			if	(self.controller.models["lms"].lastTryToRegister[servername] > ((new Date()).getTime() - 24*60*60*1000)){
				moblerlog("less than 24 hours have passed");
				self.showLMSRegistrationMessage(jQuery.i18n.prop('msg_lms_registration_message'));	
			}else {
				moblerlog("do the registration");
				self.controller.models['lms'].register(servername);  //we will get a client key
			}//end of else
		}
	});
	
	
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
 * pinch leads to settings view
 * @prototype
 * @function handlePinch
 **/ 
LMSView.prototype.handlePinch = function(){
    this.controller.transitionToSettings();
};


/**
 * opens the view
 * @prototype
 * @function openDiv
 **/ 
LMSView.prototype.openDiv = openView;

/**
 * shows the LMS list and shows it
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
 * empties the course list
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
 * leads to settings
 * @prototype
 * @function clickSettingsButton
 */
LMSView.prototype.closeLMS = function() {
	this.controller.transitionToLogin();
};


/**
 * shows the list with the available
 * different lms's logo image and label
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

	//static list from index.html
	
//	$("#lms1Image").attr("src",lmsObj.getServerLogoImage());
//	$("#lms1label").text(lmsObj.getServerLogoLabel());
//	$("#lms2Image").attr("src",lmsObj.getServerLogoImage());
//	$("#lms2label").text(lmsObj.getServerLogoLabel());
//	$("#lms3Image").attr("src",lmsObj.getServerLogoImage());
//	$("#lms3label").text(lmsObj.getServerLogoLabel());

};

LMSView.prototype.createLMSItem = function(ul, lmsData) {
	var self = this;
	var sn = lmsData.servername;
	// $.each( lmsData, function(c, val) {
	var li = $(
			"<li/>",
			{
				"id" : "lms " +sn
			}).appendTo(ul);
	moblerlog("the first lms is" + sn);
	// create the div container within the li element
	// that will host the image and logo of the lms's
	var div = $("<div/>", {
		"class" : "lmsListItem",
	}).appendTo(li);

	jester(div[0]).tap(function(e) {
		e.stopPropagation();
		self.clickLMSItem(sn);
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
 * checks if the selected lms has been registered
 * then it goes to login view
 * @prototype
 * @function 
 * @param {String} servername, the name of the selected server
 **/ 
LMSView.prototype.clickLMSItem = function(servername) {
	this.controller.models['lms'].setActiveServer(servername);
};



LMSView.prototype.LMSNotClickable = function(servername) {
	moblerlog("enter LMS not clickable");
	var lmsObj = this.controller.models['lms'];
	var lmsData = lmsObj.getLMSData();
	// to make the specific LMS item unclickable
	$("#lms" + lmsData.servername).addClass("notClickable");
	
	// to display an error message
	this.showLMSConnectionMessage(jQuery.i18n.prop('msg_lms_connection_message'));

};


LMSView.prototype.showLMSConnectionMessage = function(message) {
	// to display an error message that we are
	//offline and we cannot register with the server
	moblerlog("enter show lms message");
	$("#lmserrormessage").text(message);
	$("#lmserrormessage").show();
};



LMSView.prototype.hideLMSConnectionMessage = function() {
	
	$("#lmserrormessage").text("");
	$("#lmserrormessage").hide();
};




LMSView.prototype.showLMSRegistrationMessage = function(message) {
	var self = this;
	// to display an error message that we are
	//offline and we cannot register with the server
	moblerlog("enter show lms message");
	$("#lmsregistrationmessage").text(message);
	$("#lmsregistrationmessage").show();
};

LMSView.prototype.hideLMSRegistrationMessage = function() {
	$("#lmsregistrationmessage").text("");
	$("#lmsregistrationmessage").hide();
};

