function CourseModel(controller) {
	var self = this;
	
	this.controller = controller;
	
	this.courseList = [];
	this.index = 0;

	$(document).bind("questionpoolready", function(e, courseID) {
		console.log("model questionPool ready called " + courseID);
		self.courseIsLoaded(courseID);
	});
	
	$(document).bind("switchtoonline", function() {self.switchToOnline();});
	
	this.createCourses();

	this.loadFromServer();
};

CourseModel.prototype.storeData = function() {
	var courseString;
	try {
		courseString = JSON.stringify(this.courseList);
	} catch (err) {
		courseString = "";
	}
	localStorage.setItem("courses", courseString);
};

CourseModel.prototype.loadData = function() {	
	var courseObject;
	try {
		courseObject = JSON.parse(localStorage.getItem("courses"));
	} catch (err) {
		courseObject = [];
	}

	if (!courseObject[0]) { // if no courses are available, new ones are created
		courseObject = this.createCourses();
	}

	this.courseList = courseObject;
	this.index = 0;
};

CourseModel.prototype.isLoaded = function(courseId) {
	if (courseId > 0) {
		for (var c in this.courseList) {
			if (this.courseList[c].id == courseId) {
				return this.courseList[c].isLoaded;
			}
		}
		return false;
	}
	return (this.index > this.courseList.length - 1) ? false
			: this.courseList[this.index].isLoaded;
};

CourseModel.prototype.getId = function() {
	return (this.index > this.courseList.length - 1) ? false
			: this.courseList[this.index].id;
};

CourseModel.prototype.getTitle = function() {
	return (this.index > this.courseList.length - 1) ? false
			: this.courseList[this.index].title;
};

CourseModel.prototype.getSyncState = function() {
	return (this.index > this.courseList.length - 1) ? false
			: this.courseList[this.index].syncState;
};

CourseModel.prototype.nextCourse = function() {
	this.index++;
	return this.index < this.courseList.length;
};

CourseModel.prototype.reset = function() {
	this.index = 0;
};

CourseModel.prototype.createCourses = function() {
	console.log("create courses");
	if (!localStorage.courses) {
		initCourses();
	}
	try {
		return JSON.parse(localStorage.getItem("courses"));
	} catch (err) {
		return [];
	}
};

CourseModel.prototype.loadFromServer = function() {
	var self = this;
	jQuery.get(
					"http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards/courses.php/1.json",
					function(data) {
						console.log("success");
						var courseObject;
						try {
							courseObject = JSON.parse(data);
						} catch (err) {
							courseObject = [];
						}

						if (!courseObject[0]) { // if no courses are available, new ones are created
							courseObject = self.createCourses();
						}
						console.log(courseObject);
						self.courseList = courseObject;
						self.index = 0;
						self.storeData();
						
						for (var c in courseObject) {
							self.courseList[c].isLoaded = false;
							self.controller.models["questionpool"].loadFromServer(courseObject[c].id);
						}
					});
};

CourseModel.prototype.courseIsLoaded = function(courseId) {
	for (var c in this.courseList) {
		if (this.courseList[c].id == courseId) {
			this.courseList[c].isLoaded = true;
			console.log(this.courseList[c].id + " is loaded");
			break;
		}
	}
};

CourseModel.prototype.switchToOnline = function() {
	console.log("switch to online - load all not yet loaded courses");
	for (var c in this.courseList) {
		if (!this.courseList[c].isLoaded) {
			console.log(this.courseList[c].id + " is not loaded yet");
			this.controller.models["questionpool"].loadFromServer(this.courseList[c].id);
		}
	}
};
