function CoursesListView(controller) {

	var self = this;

	self.tagID = 'coursesListView';
	self.controller = controller;

	// $('#coursesListSetIcon').click(function(){ self.clickSettingsButton(); }
	// );
	jester($('#coursesListSetIcon')[0]).tap(function() {
		self.clickSettingsButton();
	});
	
	$(document).bind("questionpoolready", function(e, courseID) {
		console.log("view questionPool ready called " + courseID);
		self.courseIsLoaded(courseID);
	});
}

CoursesListView.prototype.handleTap = doNothing;
CoursesListView.prototype.handlePinch = doNothing;
CoursesListView.prototype.handleSwipe = doNothing;
CoursesListView.prototype.openDiv = openView;
CoursesListView.prototype.open = function() {
	this.update();
	this.openDiv();
};
CoursesListView.prototype.close = closeView;

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

		jester(span[0]).tap(function() {
			self.clickStatisticsIcon($(this).parent().attr('id').substring(6));
		});

		$("<span/>", {
			"class" : courseModel.isLoaded() ? "icon-bars" : "icon-loading"
		}).appendTo(span);

	} while (courseModel.nextCourse());
};

CoursesListView.prototype.courseIsLoaded = function(courseId) {
	console.log("courseIsLoaded: " + courseId);
	console.log("selector length: " + $("#course" + courseId + " .icon-loading").length);
	$("#course" + courseId + " .icon-loading").addClass("icon-bars").removeClass("icon-loading");
};