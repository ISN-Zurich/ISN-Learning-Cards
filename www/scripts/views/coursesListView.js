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
			console.log("course list view is active");
			self.update(true);
		}
	});
}

CoursesListView.prototype.handleTap = doNothing;
CoursesListView.prototype.handlePinch = doNothing;
CoursesListView.prototype.handleSwipe = doNothing;
CoursesListView.prototype.openDiv = openView;
CoursesListView.prototype.open = function() {
	console.log("open course list view");
	this.active = true;
	this.update(false);
	this.openDiv();
};
CoursesListView.prototype.closeDiv = closeView;
CoursesListView.prototype.close = function() {
	console.log("close course list view");
	this.active = false;
	this.closeDiv();
};

CoursesListView.prototype.clickCourseItem = function(course_id) {
	if (this.controller.models['course'].isLoaded(course_id)) {
		this.controller.models['questionpool'].reset();
		this.controller.models['questionpool'].loadData(course_id);
		this.controller.transitionToQuestion();
	}
};

CoursesListView.prototype.clickSettingsButton = function() {
	this.controller.transitionToSettings();
};

CoursesListView.prototype.clickStatisticsIcon = function(courseID) {
	console.log("statistics button clicked");
};

CoursesListView.prototype.update = function(update) {
	var self = this;

	var courseModel = self.controller.models['course'];
	courseModel.reset();
	$("#coursesList").empty();

	console.log("First course id: " + courseModel.getId());
	
	if (courseModel.courseList.length == 0) {
		
		var li = $("<li/>", {
			text : (update ? "No Courses" : "Courses are being loaded")
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
				"class" : courseModel.isSynchronized(courseID) ? "icon-bars" : "icon-loading"
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