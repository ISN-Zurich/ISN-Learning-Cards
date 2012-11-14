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

var MOBLERDEBUG = 0;

 // View for displaying the course list
 
function CoursesListView(controller) {

	var self = this;

	self.tagID = 'coursesListView';
	self.controller = controller;

	self.active = false;

	self.firstLoad = true;
	
	// $('#coursesListSetIcon').click(function(){ self.clickSettingsButton(); }
	// );
	jester($('#coursesListSetIcon')[0]).tap(function() {
		self.clickSettingsButton();
	});

	/*
	 * In some rare cases an automated transition from login view to course list view takes place. 
	 * This might have happened because a synchronization of questions ( pending questions exist in the local storage) took place.
	 * So when the courseListView or the CourseModel bind/listen to that event (because it was triggered when pending questions were loaded), we should check 
	 * IF WE ARE LOGGED IN in order to perform the callback function otherwise we should transite to login view.
	 */
	$(document).bind("questionpoolready", function(e, courseID) {
		if ((self.tagID === self.controller.activeView.tagID) && (self.controller.models['authentication'].configuration.loginState === "loggedIn")){
		moblerlog("view questionPool ready called " + courseID);
		self.courseIsLoaded(courseID);
		}});
	
	
	/*
	 * In some rare cases an automated transition from login view to course list view takes place. 
	 * This might have happened because a synchronization of courses pending questions took place and when the "courseListUpdate" event was triggered
	 * then the the courses list view (which binds/listens to this event) was displayed by the execution of the update function below.
	 * So we should check IF WE ARE LOGGED IN in order to perform the call back function otherwise we should transite to login view.
	 */

	$(document).bind("courselistupdate", function(e) {
		if ((self.tagID === self.controller.activeView.tagID) && (self.controller.models['authentication'].configuration.loginState === "loggedIn")) {
		moblerlog("course list update called");
			self.firstLoad = false;
			if (self.active) {
				moblerlog("course list view is active");
				self.update();
			}}});
	
	
		
	function setOrientation() {
       	self.setIconSize(); 
    }
    
    //when orientation changes, set the new width and height
    //resize event should be caught, too, because not all devices
    //send an oritentationchange even
    window.addEventListener("orientationchange", setOrientation, false);
    window.addEventListener("resize", setOrientation, false);
    
    
}

// tap does nothing
 
CoursesListView.prototype.handleTap = doNothing;

// swipe does nothing
 
CoursesListView.prototype.handleSwipe = doNothing;

//pinch leads to settings

CoursesListView.prototype.handlePinch = function(){
    this.controller.transitionToSettings();
};

//opens the view

CoursesListView.prototype.openDiv = openView;

//updates the course list and shows it

CoursesListView.prototype.open = function() {
	moblerlog("open course list view");
	this.active = true;
	this.update();
	this.firstLoad = false;
	this.openDiv();
	this.setIconSize();
};

 //closes the view
CoursesListView.prototype.closeDiv = closeView;

 //empties the course list
CoursesListView.prototype.close = function() {
	moblerlog("close course list view");
	this.active = false;
	this.closeDiv();
	$("#coursesList").empty();
};

//click on course item loads the appropriate question pool
 
CoursesListView.prototype.clickCourseItem = function(course_id) {
	if (this.controller.models['course'].isSynchronized(course_id)) {
		this.controller.models['questionpool'].reset();
		this.controller.models['questionpool'].loadData(course_id);
		
		this.controller.models['answers'].setCurrentCourseId(course_id);
		this.controller.transitionToQuestion();
	}
};

/**
 * leads to settings
 */
CoursesListView.prototype.clickSettingsButton = function() {
	this.controller.transitionToSettings();
};

//click on statistic icon calculates the appropriate statistics and shows them
 
CoursesListView.prototype.clickStatisticsIcon = function(courseID) {
	moblerlog("statistics button clicked");
	
	if ($("#courseListIcon"+courseID).hasClass("icon-bars")) {
		$("#courseListIcon"+courseID).addClass("icon-loading loadingRotation").removeClass("icon-bars");
	
		//all calculations are done based on the course id and are triggered
		//within setCurrentCourseId
		//this.controller.models['statistics'].setCurrentCourseId(courseID);
		this.controller.transitionToStatistics(courseID);
	}
};

//updates the course list

CoursesListView.prototype.update = function() {
	var self = this;

	var courseModel = self.controller.models['course'];
	var statisticsModel = self.controller.models['statistics'];
	courseModel.reset();
	$("#coursesList").empty();

	moblerlog("First course id: " + courseModel.getId());
	
	if (courseModel.courseList.length == 0) {
		
		var li = $("<li/>", {
		}).appendTo("#coursesList");
		
		$("<div/>", {
			"class": "text",
			text : (self.firstLoad ? "Courses are being loaded" : "No Courses"),
		}).appendTo(li);
		
	} else {
		do {
			var courseID = courseModel.getId();

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

//changes the loading icon to the statistics icon for the specified course id
 
CoursesListView.prototype.courseIsLoaded = function(courseId) {
	moblerlog("courseIsLoaded: " + courseId);
	moblerlog("selector length: "+ $("#course" + courseId + " .icon-loading").length);
	$("#course" + courseId + " .icon-loading").addClass("icon-bars")
			.removeClass("icon-loading loadingRotation");
};

//sets the height property of the course list icon

CoursesListView.prototype.setIconSize = function() {
	// $(".courseListIcon").each(function() { 
//	var height = $(this).parent().height();
//	$(this).height(height);
//	$(this).css("line-height", height + "px");
//	});
	$("#coursesList li").each(function() {
		var height = $(this).height();
		$(this).find(".courseListIcon").height(height);
		$(this).find(".courseListIcon").css("line-height", height + "px");
	});
};