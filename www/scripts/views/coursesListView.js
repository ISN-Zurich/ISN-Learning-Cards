function CoursesListView(controller) {

	var self = this;

	self.tagID = 'coursesListView';
	self.controller = controller;

	self.active = false;

	// $('#coursesListSetIcon').click(function(){ self.clickSettingsButton(); }
	// );
	jester($('#coursesListSetIcon')[0]).tap(function() {
		self.clickSettingsButton();
	});

	$(document).bind("questionpoolready", function(e, courseID) {
		console.log("view questionPool ready called " + courseID);
		self.courseIsLoaded(courseID);
	});

	$(document).bind("courselistupdate", function(e) {
		console.log("course list update called");
		if (self.active) {
			self.update();
		}
	});
}

CoursesListView.prototype.handleTap = doNothing;
CoursesListView.prototype.handlePinch = doNothing;
CoursesListView.prototype.handleSwipe = doNothing;
CoursesListView.prototype.openDiv = openView;
CoursesListView.prototype.open = function() {
	this.active = true;
	this.update();
	this.openDiv();
};
CoursesListView.prototype.closeDiv = closeView;
CoursesListView.prototype.close = function() {
	this.active = false;
	this.closeDiv();
};

CoursesListView.prototype.clickCourseItem = function(course_id) {
	if (controller.models['course'].isLoaded(course_id)) {
		controller.models['questionpool'].reset();
		controller.models['questionpool'].loadData(course_id);
		controller.transitionToQuestion();
	}
};

CoursesListView.prototype.clickSettingsButton = function() {
	controller.transitionToSettings();
};

CoursesListView.prototype.clickStatisticsIcon = function(courseID) {
	console.log("statistics button clicked");
};

CoursesListView.prototype.update = function() {
	var self = this;

	var courseModel = self.controller.models['course'];
	courseModel.reset();
	$("#coursesList").empty();

	console.log("First course id: " + courseModel.getId());
	
	if (courseModel.courseList.length == 0) {
		var li = $("<li/>", {
			text : "No Courses"
		}).appendTo("#coursesList");
	} else {

		do {
			var courseID = courseModel.getId();

			var li = $("<li/>", {
				"id" : "course" + courseID,
				text : courseModel.getTitle()
			}).appendTo("#coursesList");

			jester(li[0]).tap(function() {
				self.clickCourseItem($(this).attr('id').substring(6));
			});

			var span = $("<span/>", {
				"class" : "right"
			}).appendTo(li);

			jester(span[0]).tap(
					function() {
						self.clickStatisticsIcon($(this).parent().attr('id')
								.substring(6));
					});

			$("<span/>", {
				"class" : courseModel.isLoaded() ? "icon-bars" : "icon-loading"
			}).appendTo(span);

		} while (courseModel.nextCourse());
	}
};

CoursesListView.prototype.courseIsLoaded = function(courseId) {
	console.log("courseIsLoaded: " + courseId);
	console.log("selector length: "
			+ $("#course" + courseId + " .icon-loading").length);
	$("#course" + courseId + " .icon-loading").addClass("icon-bars")
			.removeClass("icon-loading");
};