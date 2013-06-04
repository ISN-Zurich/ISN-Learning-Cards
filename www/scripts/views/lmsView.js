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
	this.messageShown=false;
	
	//handler when taping on the settings button
	jester($('#closeLMSIcon')[0]).tap(function() {
		self.closeLMS();
	});

	
	/**It is triggered when an unregistered lms item is selected and and there is no internet connection
	 * @event lmsOffline
	 * @param: a callback function that displays a message that states that we are offline and no registration can take place
	 * 			for the specific unregistered lms
	 */
	$(document).bind("lmsOffline", function(e,servername) {
		moblerlog("we are offline");
		self.showLMSConnectionMessage(jQuery.i18n.prop('msg_lms_connection_message'),servername);	
	});
	
	/**It is triggered when an lms is online and failed to register for any reason. More specifically 
	 * it is triggered when no more than 24 hours have been passed from the first failed attempt for registration.
	 * @event lmsNotRegistrableYet
	 * @param: a callback function that displays a message to the user that the server is not available and the 
	 * 		   registration cannot take place
	*/
	$(document).bind("lmsNotRegistrableYet", function(e,servername,previousLMS) {
		moblerlog("previouslms in bind is "+previousLMS);
		self.showLMSRegistrationMessage(jQuery.i18n.prop('msg_lms_registration_message'),servername,previousLMS);
	});
	
	/**It is triggered when the registration of an lms fails because of any reason
	 * @event registrationfailed
	 * @param:a callback function  that displays a message to the user that the server is not available and the
	 *		  registration cannot take place 
	*/
	$(document).bind("registrationfailed", function(e,servername,previousLMS) {
		moblerlog("previous lms in bind 2 is "+previousLMS);
			self.showLMSRegistrationMessage(jQuery.i18n.prop('msg_lms_registration_message'),servername,previousLMS);
	});
	
	/**It is triggered when the registration of an lms fails because the backend is not activated
	 * @event registrationfailed
	 * @param:a callback function  that displays a message to the user that the server is not available temporarily 
	*/
	$(document).bind("registrationTemporaryfailed", function(e,servername,previousLMS) {
		moblerlog("previous lms in temporary failed lms is "+previousLMS);
			self.showLMSTemporaryRegistrationMessage(jQuery.i18n.prop('msg_lms_deactivate_registration_message'),servername,previousLMS);
	});
	
	
	/**It is triggered when the registration of an lms has just started
	 * @event registrationIsStarted
	 * @param:a callback function  that displays the loading icon in the place of the statistics icon
	*/
	$(document).bind("registrationIsStarted", function(e,servername) {
		moblerlog("server name passed "+servername);
		self.showLoadingIcon(servername);
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
	this.controller.resizeHandler();
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
	
	var self=this;
	var lmsObj = self.controller.models['lms'];
	var lmsData=lmsObj.getLMSData();
	//the item that has a dark grey gradient background color
	//will be set as the active server
	
	var ul= $("#lmsList");
	$("#lmsList li").each(function(){
		if ($(this).hasClass("gradientSelected")){
			var selectedLMSname=$(this).attr("id").substring(13);
			moblerlog("selectedName in cloze is "+selectedLMSname);
			if (lmsData.activeServer !== selectedLMSname){
				lmsData.activeServer = selectedLMSname;
			}
			lmsObj.storeData();
			lmsObj.activeServerInfo = lmsObj.findServerInfo(selectedLMSname);
		}
		
	});
	

	this.controller.transitionToLogin();
};


/**
 * shows the list with the available
 * different lms's. 
 * for each lms are displayed:
 * - logo image
 * - label
 * - a separator line between the these two
 * @prototype
 * @function showLMSList
 */ 
LMSView.prototype.showLMSList = function() {
	var lmsObj = this.controller.models['lms'];
	
	$("#lmsbody").empty();
	var lmsData, i = 0;
	if (lmsData = lmsObj.getLMSData()){
		//creation of lms list
		var ul = $("<ul/>", {
			"id": "lmsList"
		}).appendTo("#lmsbody");

		for (i=0; i< lmsData.length; i++) {
			this.createLMSItem(ul, lmsData[i]);
		} //end of for

		var lastli = $("<li/>", {}).appendTo("#lmsList");

		var shadoweddiv = $("<div/>", {
			"id": "shadowedLiLMS",
			"class" : "gradient1 shadowedLi"
		}).appendTo(lastli);
		
		var marginli = $("<li/>", {
			"class":"spacerMargin"
		}).appendTo(ul);


	}//end of if
	else {
		this.didApologize = true; 
		doApologize();
	}

};

/**
 * creation of the lms list
 * @prototype
 * @function createLMSItem
 * @param {string,string} ul,lmsData
 */ 
LMSView.prototype.createLMSItem = function(ul, lmsData) {
	var self = this;
	var sn = lmsData.servername;
	var lmsModel= self.controller.models['lms'];
	moblerlog("sn is "+sn);
	var selectedLMS = controller.models["lms"].getSelectedLMS();
	
	var li = $(
			"<li/>",
			{
				"id" : "selectLMSitem" +sn,
				"class": (selectedLMS == lmsData.logoLabel ? "gradientSelected":"gradient2 textShadow")
			}).appendTo(ul);
	moblerlog("the first lms is" + sn);
	
	// create the div container within the li element
	// that will host the image and logo of the lms's
	
	var rightDiv = $("<div/>", {
		"id":"rightDivLMS"+ sn,
		"class" : "right "
	}).appendTo(li);
	
	var separator = $("<div/>",{
		"id":"separator"+ sn,
		"class" : "radialCourses lineContainer separatorContainerLMS"
	}).appendTo(rightDiv);
	
	var div = $("<div/>", {
		"id":"imageContainer"+sn,
		"class" : " courseListIconLMS lmsIcon  "
	}).appendTo(rightDiv);
	
	var img = $("<img/>", {
		"id":"lmsImage"+sn,
		//"class" : "imageLogoLMS",
		"class": (lmsModel.isRegistrable(sn) ? "imageLogoLMS" : "hidden"),
		"src":lmsData.logoImage
	}).appendTo(div);
	
	$("<div/>", {
		"id":"lmsWaiting"+sn,
		"class":(lmsModel.isRegistrable(sn) ? "hidden" : "icon-cross red")	// check if the lms has failed to register for less than 24 hours 
																			// and display the red cross
																			// otherwise display the li as normal
	}).appendTo(div);
	
	var div1 = $("<div/>", {
		"class": "left lineContainer selectItemContainer"
		}).appendTo(li);
	
	var span = $("<span/>", {
		"id": "lmsDash"+sn,
		"class": (lmsModel.isRegistrable(sn) ?"select icon-dash":"dashGrey icon-dash")
		}).appendTo(div1);
	
	var mydiv = $("<div/>", {
		"id":"label"+sn,
		"class": (lmsModel.isRegistrable(sn) ? "text marginForCourseList" : "text marginForCourseList lightgrey"),	 // check if the lms has failed to register for less than 24 hours 
																													// and display light grey font color
		"text" : lmsData.logoLabel
	}).appendTo(li);
	
	
	var prevent=true;
	jester(li[0]).tap(function(e,prevent) {
		e.preventDefault();
		e.stopPropagation();	
		self.clickLMSItem(sn,$(this));
	});
};
		

/**
 * applies a specific gradient color and textshadows to the selected lms
 * in order to be differentiated from the rest lms items
 * @prototype
 * @function selectItemVisuals
 * @param {String} servername, the name of the selected server
 **/
LMSView.prototype.selectItemVisuals = function(servername) {
	$("#selectLMSitem"+servername).addClass("gradientSelected");
	$("#selectLMSitem"+servername).removeClass("textShadow");
	$("#selectLMSitem"+servername).addClass("lightShadow");
};

/**
 * deselect the gradient color and text shadow of an already selected lms
 * after the attempt of registrating has been finished
 * @prototype
 * @function deselectItemVisuals
 * @param {String} servername, the name of the selected server
 **/
LMSView.prototype.deselectItemVisuals = function(servername) {
	$("#selectLMSitem"+servername).removeClass("lightShadow");
	$("#selectLMSitem"+servername).removeClass("gradientSelected");
	$("#selectLMSitem"+servername).addClass("textShadow");
};

/**when the attempt of registrating with the selected lms has failed,
 * the specific lms becomes through this function visually inactive.
 * both the side dash and the tesxt color become grey, as well as
 * a red icon cross replaces the image icon 
 * @prototype
 * @function deactivateLMS
 * @param {String} servername, the name of the selected server
 **/
LMSView.prototype.deactivateLMS = function(servername) {
	$("#lmsWaiting"+servername).removeClass("icon-loading loadingRotation");
	moblerlog("loading rotation has been removed");
	$("#lmsImage" +servername).hide();
	$("#lmsDash"+servername).removeClass("select").addClass("dashGrey");
	$("#lmsWaiting"+servername).addClass("icon-cross red");
	$("#lmsWaiting"+servername).show();
	moblerlog("red icon cross has been added");
	$("#label"+servername).addClass("lightgrey");
};


/**when an lms has been temporarily (for one hour) been abanded 
 * from trying to be registered due to an 403 server error.
 * the lms is activated when the one hour has passed.
 * @prototype
 * @function deactivateLMS
 * @param {String} servername, the name of the selected server
 **/
LMSView.prototype.activateLMS = function(servername) {
	$("#lmsWaiting"+servername).removeClass("icon-cross red");
	$("#lmsWaiting"+servername).show();
	$("#lmsImage" +servername).show();
	$("#label"+servername).removeClass("lightgrey");	
	$("#lmsDash"+servername).removeClass("dashGrey").addClass("select");
};

/**
 * when the attempt of registering an lms with the server is finished,
 * the loading rotating icon is beeing replaced by the image
 * @prototype
 * @function hideRotation
 * @param {String} servername, the name of the selected server
 **/
LMSView.prototype.hideRotation = function(servername) {
	$("#lmsWaiting"+servername).removeClass("icon-loading loadingRotation");
	$("#lmsWaiting"+servername).hide();
	$("#lmsImage" +servername).show();
};
	

/**
 * to display a loading icon in the place of the lms image
 * while a registration with a server is being atempted.
 * @prototype
 * @function toggleIconWait
 * @param {String} servername, the name of the selected server
 **/
LMSView.prototype.toggleIconWait = function(servername) {
	var self=this;
	moblerlog("toggle icon wait");
	if ($("#lmsImage"+servername).is(":visible")){
		moblerlog("removed imagea and added loading icon");
		$("#lmsImage"+servername).hide();
		$("#lmsWaiting"+servername).addClass("icon-loading loadingRotation");
		$("#lmsWaiting"+servername).show();

	}else {
		self.hideRotation(servername);
	}	
};

/**
 * click on an lms item 
 * and sets properties of the selected server
 * @prototype
 * @function clickLMSItem
 * @param {String, string} servername,lmsitem the name of the selected server and the current li element that hosts it
 **/ 
LMSView.prototype.clickLMSItem = function(servername,lmsitem) {
	var self=this;
	var lmsModel = self.controller.models['lms'];
	
	
	self.checkLoadingStatus(servername);
	
	if ($("#lmsWaiting"+servername).hasClass("icon-cross red")){
		moblerlog("cannot do anything because the lms item is selected");
		jester($("#selectLMSitem"+servername)[0]).tap(function(e) {
			e.preventDefault();
		$("#selectLMSitem"+previousSelectedLMSname).addClass("gradientSelected");	
	});	}else if ($("#lmsImage"+servername).is(":visible")){
		moblerlog("lms item is clicked " + servername);
		var previousSelectedLMS= lmsitem.parent().find("li.gradientSelected");
		moblerlog("selected lms in click item is "+previousSelectedLMS);
		moblerlog("attr id in click item is "+previousSelectedLMS.attr("id"));
		var previousSelectedLMSname= previousSelectedLMS.attr("id").substring(13);
		moblerlog("previous selected li is "+previousSelectedLMSname);
		previousSelectedLMS.removeClass("gradientSelected").addClass("gradient2 textShadow");
		this.selectItemVisuals(servername);
		setTimeout(function() {
		this.controller.models['lms'].setActiveServer(servername,previousSelectedLMSname);},650);
	}
	
};

/**checks if an lms is trying to be registered.
 * this is achieved by checking if the loading icon is displayed instead of the image and if has also a dark gradient color.
 * @prototype
 * @function checkLoadingStatus
 * @param {String} servername, the name of the selected server
 **/ 
LMSView.prototype.checkLoadingStatus = function(servername){
	if($("#lmsWaiting"+servername).hasClass("icon-loading loadingRotation") && $("#selectLMSitem"+servername).hasClass("gradientSelected")){
		moblerlog("deactivate li item when trying to connect");
		jester($("#selectLMSitem"+servername)[0]).tap(function(e) {
			e.preventDefault();
		});
	}
};

/**
 * @prototype
 * @function checkInactiveStatus
 * @param {String} servername, the name of the selected server
 **/ 
LMSView.prototype.checkInactiveStatus = function(servername){
	if($("#lmsWaiting"+servername).hasClass("icon-loading loadingRotation") && $("#selectLMSitem"+servername).hasClass("gradientSelected")){
	moblerlog("deactivate li item when trying to connect");
	jester($("#selectLMSitem"+servername)[0]).tap(function(e) {
		e.preventDefault();
	});
	}
};

/**
 * shows the warning message from lms list view
 * that displayed a notification because there was
 * not internet connection and no registration could take place
 * @prototype
 * @function showLMSConnectionMessage
 * @param {String, String} message,servername ,a text containing the warning message, and the name of the
 * selected lms
 */ 
LMSView.prototype.showLMSConnectionMessage = function(message, servername) {
	var self=this;
	
	 // to display an error message that we are
	// offline and we cannot register with the server
	moblerlog("enter show lms connection message");
	
	self.toggleIconWait(servername);
	self.checkLoadingStatus(servername);

	var warningLi= $('<li/>', { 
		"id": "lmserrormessage"+servername,
		"class":"gradientMessages lmsmessage",
		"text": jQuery.i18n.prop('msg_lms_connection_message')
	});
	
	$("#selectLMSitem"+servername).after(warningLi);
	$("#lmserrormessage"+servername).hide();
	$("#lmserrormessage"+servername).slideDown(600);
	moblerlog("lmsmessage for server"+servername);
	
	
	setTimeout(function(){
		$("#lmserrormessage"+servername).slideUp(600);
		},2300);
	setTimeout(function(){
	//	$("#lms"+servername).removeClass("gradientSelected");
	 self.hideRotation(servername);
	//self.deselectItemVisuals(servername);
	},2800);
	
	
};



/**
 * shows a warning message regarding an error during the registration 
 * of the selected lms. The message is slided down right below the selected lms
 * and as soon as it is slided up, the lms becomes inactive, by getting a grey font color
 * and a red cross in the  place of the image.
 * @prototype
 * @function showLMSRegistrationMessage
 * @param {String,String,String} message,servername, previouslms,
 * a text with containing the warning message, the name of the selected server, thename of the previous selected server
 */ 
LMSView.prototype.showLMSRegistrationMessage = function(message,servername,previouslms) {
	var self=this;
	
	$("#lmsregistrationwaitingmessage").hide();
	
	self.toggleIconWait(servername);
	self.checkLoadingStatus(servername);
	
	var warningLi= $('<li/>', { 
		"id": "lmsregistrationmessage"+servername,
		"class":"gradientMessages lmsmessage",
		"text": jQuery.i18n.prop('msg_lms_registration_message')
	});

	$("#selectLMSitem"+servername).after(warningLi);
	$("#lmsregistrationmessage"+servername).hide();
	$("#lmsregistrationmessage"+servername).slideDown(600);
	moblerlog("lmsregistrationmessage for server"+servername);

	// to display an error message that 
	// there is a problem with the specific server
	// and we cannot register
	moblerlog("enter show lms registration message");

	setTimeout(function(){
		$("#lmsregistrationmessage"+servername).slideUp(600);
		},2300);
	setTimeout(function(){
	//$("#lms"+servername).removeClass("gradientSelected");
	//self.hideRotation(servername);
	self.deselectItemVisuals(servername);
	self.deactivateLMS(servername);
	moblerlog("previouslms is "+previouslms);
	$("#selectLMSitem"+previouslms).addClass("gradientSelected");	
	},2800);
	
};

/**
* @prototype
* @function showLMSRegistrationMessage
* @param {String,String,String} message,servername, previouslms,
* a text with containing the warning message, the name of the selected server, thename of the previous selected server
*/ 
LMSView.prototype.showLMSTemporaryRegistrationMessage = function(message,servername,previouslms) {
	var self=this;
	moblerlog("enter temporar");
	$("#lmstemporaryregistrationwaitingmessage").hide();
	self.toggleIconWait(servername);
	self.checkLoadingStatus(servername);
	
	var warningLi= $('<li/>', { 
		"id": "lmstemporaryregistrationwaitingmessage"+servername,
		"class":"gradientMessages lmsmessage",
		"text": jQuery.i18n.prop('msg_lms_deactivate_message')
	});

	$("#selectLMSitem"+servername).after(warningLi);
	$("#lmstemporaryregistrationwaitingmessage"+servername).hide();
	$("#lmstemporaryregistrationwaitingmessage"+servername).slideDown(600);
	
	// to display an message that there is a problem with the specific server
	// and we cannot register for the next hour
	setTimeout(function(){
		$("#lmstemporaryregistrationwaitingmessage"+servername).slideUp(600);
		
	},2300);

	setTimeout(function(){
	self.deselectItemVisuals(servername);
	self.deactivateLMS(servername);
	moblerlog("previouslms is "+previouslms);
	$("#selectLMSitem"+previouslms).addClass("gradientSelected");},2800);
		

//after one hour check if the server is active 
//if yes activated it 
	setTimeout(function(){
		moblerlog("reactivation?");
		self.controller.models['lms'].register(servername);
		if (DEACTIVATE) //if we got an 403 again and we are still in deactivate mode
			{moblerlog("is calling itself again");
			setTimeout(myTimer,60*1000);
			}
		else	
			{moblerlog("yes reactivation");
			self.activateLMS(servername);}
	},60*1000);

	function myTimer(){
		moblerlog("reactivation?");
		self.controller.models['lms'].register(servername); //instead of executing the whole registration we can just send the ajax request
		if (DEACTIVATE) //if we got an 403 again and we are still in deactivate mode
		{moblerlog("is calling itself again");
		setTimeout(this,60*1000);
		}
		else	
		{moblerlog("yes reactivation");
		self.activateLMS(servername);}
	}
	
};
/**
 * to display a loading icon in the place of the lms image
 * while a registration with a server is being atempted.
 * @prototype
 * @function showLoadingIcon
 * @param {String} servername, the name of the selected server
 */ 
LMSView.prototype.showLoadingIcon = function(servername) {
	var self=this;
	self.toggleIconWait(servername);
};



/**
 * handles dynamically any change that should take place on the layout
* when the orientation changes.
* - the height of the lms item, as well as the separtor next to it are being calculated dynamically
 ** @prototype
 * @function changeOrientation
 * @param {String, Number, Number}  orientation mode, number, number, the orientation mode  
 * which could be either horizontal or vertical, the width and the height of the detected orientation mode.
 */
LMSView.prototype.changeOrientation = function(o,w,h){
	moblerlog("change orientation in lms view " + o + " , " + w + ", " +h);
	this.setLMSHeight(o,w,h);
};


/**
 * 
 * @prototype
 * @function setLMSHeight
 * @param {String, Number, Number} orientation mode, number, number, the orientation mode  
 * which could be either horizontal or vertical, the width and the height of the detected orientation mode
 */
LMSView.prototype.setLMSHeight = function(orientationLayout, w, h) {
	var twidth = w-65;
	twidth = twidth + "px";
	$("#lmsbody ul li").each(function() {
		$(this).find(".text").css("width", twidth );
		var height = $(this).height()-18;
		$(this).find(".separatorContainerLMS").css("height", height + "px");
		$(this).find(".radial").css("height", height + "px");	
	});
};


