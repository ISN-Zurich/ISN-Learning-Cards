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
	self.controller = controller;
	self.active = false;
	self.firstLoad = true;
	this.didApologize = false;
	
	//handler when taping on the settings button
	jester($('#closeLMSIcon')[0]).tap(function() {
		self.closeLMS();
	});

	
			
	function setOrientation() {
       	self.setIconSize(); 
    }
    
    //when orientation changes, set the new width and height
    //resize event should be caught, too, because not all devices
    //send an orientationchange event
    window.addEventListener("orientationchange", setOrientation, false);
    window.addEventListener("resize", setOrientation, false);
       
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
	this.setIconSize();
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
 * click on LMS item.
 * it appears as the selected lms on the login view
 * @prototype
 * @function clickLMSItem
 **/ 
LMSView.prototype.clickLMSItem = function(course_id) {
//	if (this.controller.models['course'].isSynchronized(course_id)) {
//		this.controller.models['questionpool'].reset();
//		this.controller.models['questionpool'].loadData(course_id);
//		this.controller.models['answers'].setCurrentCourseId(course_id);
//		this.controller.transitionToQuestion();
//	}
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
//	var length= lmsObj.getLMSData().length;
	moblerlog("legth of lmsObj is"+length);
//	moblerlog("lms obj is"+lmsObj.getLMSData());
	
	$("#lmsbody").empty();
	if (lmsObj.getLMSData() ){
		var lmsData = lmsObj.getLMSData(), i = 0;

		//creation of lms list
		var ul = $("<ul/>", {
			"id": "lmsList"
		}).appendTo("#lmsbody");
		for (i=0; i< lmsData.length; i++) {
			var sn = lmsData[i].servername;
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

			img = $("<img/>", {
				"id":"lmsImage" +sn,
				"class" : "pfp left",
				"src":lmsData[i].logoImage
			}).appendTo(div);
			span = $("<div/>", {
				"id":"lmslabel"+sn,
				"class" : "lsmlabel",
				"text":lmsData[i].logoLabel
			}).appendTo(div);

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


/**
 * sets the height property of the lms list icon
 * @prototype
 * @function setIconSize
 */ 
LMSView.prototype.setIconSize = function() {
//	$("#coursesList li").each(function() {
//		var height = $(this).height();
//		$(this).find(".courseListIcon").height(height);
//		$(this).find(".courseListIcon").css("line-height", height + "px");
//	});
};