function CoursesListView () {
	
    var self = this;
    
    self.tagID = 'coursesListView';
	
	$('#coursesListSetIcon').click(function(){ self.clickSettingsButton(); } );
}

CoursesListView.prototype.handleTap = doNothing;
CoursesListView.prototype.handleSwipe = doNothing;
CoursesListView.prototype.open = function() {
	this.update();
	openView();
};
CoursesListView.prototype.close = closeView;

CoursesListView.prototype.clickCourseItem = function (course_id) {
	controller.transitionToQuestion(courseId);
};

CoursesListView.prototype.clickSettingsButton = function () {controller.transitionToSettings();};

CoursesListView.prototype.clickStatisticsIcon = function (courseID) { };

CoursesListView.prototype.update = function() {
	var self = this;
	
	var courseModel = controller.models['course'];
	courseModel.reset();
	    
		do {
			var courseID = courseModel.getId();
			$("#coursesList").empty();
			
			var li = $("<li/>", {
				  "id": "course" + courseID,
				  text: courseModel.getTitle(),
				  click: function(){
				    self.clickCourseItem(courseID);
				  }
				}).appendTo("#coursesList");
			
			$("<span/>", {
				"class": courseModel.isLoaded() ? "span2" : "span1",
				click: function() {
					self.clickStatisticsIcon(courseID);
				}
			}).appendTo(li);
		} while (courseModel.next());	
};