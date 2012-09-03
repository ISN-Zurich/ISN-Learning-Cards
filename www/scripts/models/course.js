function CourseModel(controller) {
	var self = this;

	this.controller = controller;

	this.courseList = [];
	this.index = 0;

	this.syncDateTime = 0;
	this.syncState = false;
	// this.syncTimeOut = 3600000;
	this.syncTimeOut = 60000;

	$(document).bind("questionpoolready", function(e, courseID) {
		console.log("model questionPool ready called " + courseID);
		self.courseIsLoaded(courseID);
	});

	$(document).bind("switchtoonline", function() {
		self.switchToOnline();
	});

	$(document).bind("authenticationready", function() {
		self.loadFromServer();
	});

	// this.createCourses();

	this.loadData();

};

CourseModel.prototype.storeData = function() {
	var courseString;
	try {
		courseString = JSON.stringify({
			courses : this.courseList,
			syncDateTime : this.syncDateTime,
			syncState : this.syncState,
			syncTimeOut : this.syncTimeOut
		});
	} catch (err) {
		courseString = "";
	}
	localStorage.setItem("courses", courseString);
};

CourseModel.prototype.loadData = function() {
	var courseObject;
	try {
		courseObject = JSON.parse(localStorage.getItem("courses")) || {};
	} catch (err) {
		courseObject = {};
	}

	// if (!courseObject[0]) { // if no courses are available, new ones are
	// created
	// courseObject = this.createCourses();
	// }

	this.courseList = courseObject.courses || [];
	this.syncDateTime = courseObject.syncDateTime || (new Date()).getTime(); // courseObject.syncDateTime
	// ?
	// courseObject.syncDateTime
	// : 0
	this.syncState = courseObject.syncState || false;
	this.syncTimeOut = (courseObject.syncTimeOut * 1000) || 60000;
	this.index = 0;

	this.checkForTimeOut();
};

CourseModel.prototype.checkForTimeOut = function() {
	var timeDelta = ((new Date()).getTime() - this.syncDateTime);
	console.log("timeDelta: " + timeDelta);
	console.log("syncTimeOut: " + this.syncTimeOut);
	if (timeDelta > this.syncTimeOut) {
		this.syncState = false;
		console.log("check for timeout is false");
	}
};

CourseModel.prototype.isLoaded = function(courseId) {
	if (courseId > 0) {
		for ( var c in this.courseList) {
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
	console.log("loadFromServer-Course is called");
	var self = this;
	self.checkForTimeOut();
	if (self.controller.models['authentication'].isLoggedIn()
			&& !self.syncState) {
		var userId = self.controller.models['authentication'].getUserId();
		console.log("loadFromServer-Course for user " + userId);

		$.ajax({
					url : 'http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards/courses.php',
					type : 'GET',
					dataType : 'json',
					success : createCourseList,
					error: function() { console.log("Error while loading course list from server"); },
					beforeSend : setHeader
				});

		function setHeader(xhr) {
			xhr.setRequestHeader('userid', userId);
		}

		function createCourseList(data) {
			console.log("success");
			var courseObject;
			try {
				courseObject = data;

			} catch (err) {
				courseObject = {};
				console.log("Couldn't load courses from server " + err);
			}
			console.log("course data loaded from server");

			// if (!courseObject[0]) { // if no courses are available,
			// // new ones are created
			// courseObject = self.createCourses();
			// }
			console.log(courseObject);
			self.courseList = courseObject.courses || [];
			self.syncDateTime = (new Date()).getTime();
			self.syncState = true;
			self.syncTimeOut = courseObject.syncTimeOut;
			self.index = 0;
			self.storeData();
			console.log("JSON CourseList: " + self.courseList);
			self.reset();

			$(document).trigger("courselistupdate");

			for ( var c in self.courseList) {
				self.courseList[c].isLoaded = false;
				self.controller.models["questionpool"]
						.loadFromServer(self.courseList[c].id);
			}
		}
	}
};

CourseModel.prototype.courseIsLoaded = function(courseId) {
	for ( var c in this.courseList) {
		if (this.courseList[c].id == courseId) {
			this.courseList[c].isLoaded = true;
			console.log(this.courseList[c].id + " is loaded");
			break;
		}
	}
};

CourseModel.prototype.switchToOnline = function() {
	console.log("switch to online - load all not yet loaded courses");

	this.checkForTimeOut();

	if (!this.syncState) {
		this.loadFromServer();
	} else {
		for ( var c in this.courseList) {
			if (!this.courseList[c].isLoaded || !this.courseList[c].syncState) {
				console.log(this.courseList[c].id + " is not loaded yet");
				this.controller.models["questionpool"]
						.loadFromServer(this.courseList[c].id);
			}
		}
	}
};
