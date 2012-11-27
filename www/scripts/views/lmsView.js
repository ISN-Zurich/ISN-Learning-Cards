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
	//this.showLMSList();
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
	$("#lmsList").empty();
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
 * updates the course list
 * @prototype
 * @function showLMSList
 */ 
LMSView.prototype.showLMSList = function() {
	var self = this;

//	var courseModel = self.controller.models['course'];
//	var statisticsModel = self.controller.models['statistics'];
	var lmsModel = self.controller.models['course'];
	courseModel.reset();
	$("#lmsList").empty();

	moblerlog("First lms id: " + lmsModel.getId());
	
	if (lmsModel.lmsList.length == 0) {
		
		var li = $("<li/>", {
		}).appendTo("#lmsList");
		
		$("<div/>", {
			"class": "text",
			text : "there are no other lms available",
		}).appendTo(li);
		
	} else {
		do {
			var lmsID = lmsModel.getId();

			var li = $("<li/>", {
				"id" : "course" + courseID,
				
			}).appendTo("#coursesList");

			
			div = $("<div/>", {
				"class" : "courseListIcon right"
			}).appendTo(li);
			
			span = $("<div/>", {
				"id":"courseListIcon"+ courseID,
				"class" : (courseModel.isSynchronized(courseID) ? "icon-bars" : "icon-loading loadingRotation")
			}).appendTo(div);
			
			var mydiv = $("<div/>", {
				
				"class" : "text marginForCourseList",
				text : courseModel.getTitle()
			}).appendTo(li);
			
			jester(mydiv[0]).tap(function(e) {
				e.stopPropagation();
				//e.preventDefault();
				self.clickCourseItem($(this).parent().attr('id').substring(6));
				
			});


			jester(span[0]).tap(
					function(e) {
						self.clickStatisticsIcon($(this).parent().parent().attr('id')
								.substring(6));
						e.stopPropagation();
					});

			
		} while (courseModel.nextCourse());
		self.setIconSize();
	}
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