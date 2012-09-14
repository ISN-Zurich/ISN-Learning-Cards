/**
 * This model holds the course list and information about the current
 * synchronization of the data with the server
 */
function CourseModel(controller) {
	var self = this;

	this.controller = controller;

	this.courseList = [];
	this.index = 0; // index of the current course

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

/**
 * stores the data into the local storage (key = "courses") therefor the data is
 * combined into a json object which is converted into a string
 */
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

/**
 * loads the data from the local storage (key = "courses") therefor the string
 * is converted into a json object of which the data is taken
 */
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
	this.syncDateTime = courseObject.syncDateTime || (new Date()).getTime();
	this.syncState = courseObject.syncState || false;
	this.syncTimeOut = (courseObject.syncTimeOut * 1000) || 60000;
	this.index = 0;

	this.checkForTimeOut();
};

/**
 * if the user is logged in and the syncState is set to false, it loads the
 * course list from the server and stores it in the local storage when all data
 * is loaded, the courselistupdate event is triggered and the question pools are
 * told to load their data from the server
 */
CourseModel.prototype.loadFromServer = function() {
	console.log("loadFromServer-Course is called");
	var self = this;
	if (self.controller.models['connection'].isOffline()) {
		// TODO do something if user cannnot connect to server because he/she is
		// offline
		// self.loadData();
	} else {
		var syncStateCache = new Array();
		self.checkForTimeOut();
		if (self.controller.models['authentication'].isLoggedIn()
				&& !self.syncState) {

			var sessionKey = self.controller.models['authentication']
					.getSessionKey();

			// save current syncStates for this course
			if (self.courseList && self.courseList.length > 0) {
				for ( var c in self.courseList) {
					syncStateCache[self.courseList[c].id] = self.courseList[c].syncState;
				}
			}

			$
					.ajax({
						url : 'http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards/courses.php',
						type : 'GET',
						dataType : 'json',
						success : createCourseList,
						error : function() {
							console
									.log("Error while loading course list from server");
						},
						beforeSend : setHeader
					});

			function setHeader(xhr) {
				xhr.setRequestHeader('sessionkey', sessionKey);
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
				self.storeData();
				console.log("JSON CourseList: " + self.courseList);
				self.reset();

				if (syncStateCache.length > 0) {
					for ( var c in self.courseList) {
						self.courseList[c].syncState = syncStateCache[self.courseList[c].id];
					}
				}

				$(document).trigger("courselistupdate");

				for ( var c in self.courseList) {
					self.courseList[c].isLoaded = false;

					self.controller.models["questionpool"]
							.loadFromServer(self.courseList[c].id);
				}
			}
		}
	}
};

/**
 * @return the id of the current course
 */
CourseModel.prototype.getId = function() {
	return (this.index > this.courseList.length - 1) ? false
			: this.courseList[this.index].id;
};

/**
 * @return the title of the current course
 */
CourseModel.prototype.getTitle = function() {
	return (this.index > this.courseList.length - 1) ? false
			: this.courseList[this.index].title;
};

/**
 * @return the synchronization state of the current course
 */
CourseModel.prototype.getSyncState = function() {
	return (this.index > this.courseList.length - 1) ? false
			: this.courseList[this.index].syncState;
};

/**
 * increases index
 * 
 * @return true if a course with an appropriate index exists, otherwise false
 */
CourseModel.prototype.nextCourse = function() {
	this.index++;
	return this.index < this.courseList.length;
};

/**
 * sets index to 0
 */
CourseModel.prototype.reset = function() {
	this.index = 0;
};

/**
 * sets syncState to false if the time that passed since the last
 * synchronization is greater than the value of syncTimeOut
 */
CourseModel.prototype.checkForTimeOut = function() {
	var timeDelta = ((new Date()).getTime() - this.syncDateTime);
	console.log("timeDelta: " + timeDelta);
	console.log("syncTimeOut: " + this.syncTimeOut);
	if (timeDelta > this.syncTimeOut) {
		this.syncState = false;
		console.log("check for timeout is false");
	}
};

/**
 * if a course id is passed to the method, it returns true, if the course with
 * the specified id is loaded, otherwise false
 * 
 * if no course id is passed, it returns true, if the current course is loaded,
 * otherwise false
 */
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

/**
 * sets the isLoaded and the synchState of the course with the specified course
 * id to true
 */
CourseModel.prototype.courseIsLoaded = function(courseId) {
	for ( var c in this.courseList) {
		if (this.courseList[c].id == courseId) {
			this.courseList[c].isLoaded = true;
			this.courseList[c].syncState = true;
			 this.storeData();
			console.log(this.courseList[c].id + " is loaded");
			break;
		}
	}
};

/**
 * @return true, if the course with the specified id is synchronized,otherwise
 *         false
 */
CourseModel.prototype.isSynchronized = function(courseId) {
	if (courseId > 0) {
		for ( var c in this.courseList) {
			if (this.courseList[c].id == courseId) {
				return this.courseList[c].syncState;
			}
		}
	}
	return false;
};

/**
 * if syncState is false, it loads the data for the course list from the server
 * if syncState is true, it loaded the data for all not yet loaded question
 * pools from the server
 */
CourseModel.prototype.switchToOnline = function() {
	console.log("switch to online - load all not yet loaded courses");

	this.checkForTimeOut();

	if (this.syncState) {
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

/**
 * if no course list is stored in the local storage, a new one is created
 */
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