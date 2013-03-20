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

/**
 *A global property/variable that shows for how long the synchronization is valid.
 *The following default value shows the time period after which a new synchromization 
 *should take place.
 *
 *@property DEFAULT_SYNC_TIMEOUT 
 *@default 60000 
 *
 **/

var DEFAULT_SYNC_TIMEOUT = 6000;


/**
 * @class CourseModel  
 * This model holds the course list and information about the current
 * synchronization of the data with the server
 * @constructor 
 * It sets and initializes basic properties such as:
 *  - index of the current course
 *  - the courseList
 *  - the state and date/time of the synchronization 
 * It loads data from the local storage
 * It listens to 3 events regarding the readiness of the system after the authentication and the loading of the data, which
 * means it listens when the authentication is ready, when the questionpool is ready and when internet connection is found
 * @param {String} controller 
 */
function CourseModel(controller) {
	var self = this;

	this.controller = controller;

	this.courseList = [];
	this.index = 0; // index of the current course
	this.syncDateTime = 0;
	this.syncState = false;
	this.syncTimeOut = DEFAULT_SYNC_TIMEOUT;
	
	 /** 
	 * It is binded when all the questions of a valid questionpol have been loaded from server
	 * @event questionpoolready
	 * @param: callback function in which are activated to true the flags that
	 * keep track of the loading of the course and its synchronization state
	 **/
		$(document).bind("questionpoolready", function(e, courseID) {
		moblerlog("model questionPool ready called " + courseID);
		self.courseIsLoaded(courseID);
	});

	 /** 
	  * It it binded when an online connection is detected
	 * @event switchtoonline
	 * @param:  a call back function in which the courses(and any pending questions) 
	 *          are loaded from the server
	 * **/
	
	$(document).bind("online", function() {
		self.switchToOnline();
	});
	
	
	 /**  
	 * @event authenticationready 
	 * @param call back function in which the courses list is loaded from the server
	 * **/
	$(document).bind("authenticationready", function() {
		self.loadFromServer();
	});

	this.loadData();

}

/**
 * Stores the data into the local storage (key = "courses"). Therefore the data is
 * combined into a json object which is converted into a string
 * @prototype
 * @function storeData
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
	moblerlog("courses object is " +localStorage.getItem("courses"));
};

/**
 * Loads the data from the local storage (key = "courses"). Therefore the string
 * is converted into a json object of which the data is taken. The very first time
 * we launch the app, everything is initialized and set to false, empty and get the current time.
 * @function //
 */
CourseModel.prototype.loadData = function() {
	var courseObject;
	try {
		courseObject = JSON.parse(localStorage.getItem("courses")) || {};
	} catch (err) {
		courseObject = {};
	}

	this.courseList = courseObject.courses || [];
	this.syncDateTime = courseObject.syncDateTime || (new Date()).getTime();
	this.syncState = courseObject.syncState || false;
	this.syncTimeOut = courseObject.syncTimeOut || DEFAULT_SYNC_TIMEOUT;
	this.index = 0;

	this.checkForTimeOut();
	
	moblerlog("object courses is "+localStorage.getItem("courses"));
	moblerlog("course list in load data is "+this.courseList);
};

/**
 * If the user is logged in and the syncState is set to false, it loads the
 * course list from the server and stores it in the local storage.
 * When all data is loaded the courselistupdate event is triggered and the question pools are
 * told to load their data from the server
 * @prototype
 * @function loadFromServer
 */

CourseModel.prototype.loadFromServer = function() {
	moblerlog("loadFromServer-Course is called");
	var self = this;
	var syncStateCache = [];
	var activeURL = self.controller.getActiveURL();
	self.checkForTimeOut();
	if (self.controller.getLoginState()
			&& !self.syncState) {
		// var sessionkey = self.controller.getSessionKey();
		var sessionKey = self.controller.models['authentication']
				.getSessionKey();

		// save current syncStates for this course
		if (self.courseList && self.courseList.length > 0) {
            var c;
			for ( c in self.courseList) {
				syncStateCache[self.courseList[c].id] = self.courseList[c].syncState;
			}
		}

			$
				.ajax({
					url:  activeURL + '/courses.php',
					type : 'GET',
					dataType : 'json',
					success : createCourseList,
					error : function() {
						localStorage.setItem("pendingCourseList", true);
						console
								.log("Error while loading course list from server");
					},
					beforeSend : setHeader
				});

		function setHeader(xhr) {
			xhr.setRequestHeader('sessionkey', sessionKey);
		}

		function createCourseList(data) {
			moblerlog("success");

			// if there was a pending course list, remove it from the storage
			localStorage.removeItem("pendingCourseList");

			var courseObject;
			try {
				courseObject = data;

			} catch (err) {
				courseObject = {};
				moblerlog("Couldn't load courses from server " + err);
			}
			moblerlog("course data loaded from server");
            moblerlog(courseObject);
			self.courseList = courseObject.courses || [];
			self.syncDateTime = (new Date()).getTime();
			self.syncState = true;
			self.syncTimeOut = courseObject.syncTimeOut || DEFAULT_SYNC_TIMEOUT;
			self.storeData();
			moblerlog("JSON CourseList: " + JSON.stringify(self.courseList));
			self.reset();
			
			//if there was any saved sync state then assign it to the sync state of the courses of the course list
			if (syncStateCache.length > 0) {
                var c;
				for ( c in self.courseList) {
					self.courseList[c].syncState = syncStateCache[self.courseList[c].id];
				}
			}
			
			 /**  
			  * It is triggered when the loading of the course list from the server has been finished
			 * @event courselistupdate 
			 **/
			$(document).trigger("courselistupdate");
			
			//download all the quesitons(questionlist) for each course
            var c;
			for ( c in self.courseList) {
				self.courseList[c].isLoaded = false;

				self.controller.models["questionpool"]
						.loadFromServer(self.courseList[c].id);
			}

		}
	}
};

/**
 * @prototype
 * @function getId
 * @return the id of the current course
 */
CourseModel.prototype.getId = function() {
	return (this.index > this.courseList.length - 1) ? false
			: this.courseList[this.index].id;
};



/**
 * @prototype
 * @function getTitle
 * @return the title of the current course
 */
CourseModel.prototype.getTitle = function() {
	return (this.index > this.courseList.length - 1) ? false
			: this.courseList[this.index].title;
};


/**
 * It checks whether a course is synchronized the server.Synchronizations differences may exist because:
 * - New questions have added to a specific courses or have been deleted from it
 * - Due to lost of internet connectivity the loading of courses from server in the local storage might have been interrupted
 * @prototype
 * @function getSyncState
 * @return the synchronization state of the current course
 */
 
CourseModel.prototype.getSyncState = function() {
	return (this.index > this.courseList.length - 1) ? false
			: this.courseList[this.index].syncState;
};



/**
 * Increases the index in the course list, which means we move to the next course.
 * @prototype
 * @function nextCourse
 * @return true if a course with an appropriate index exists, otherwise false
 */
CourseModel.prototype.nextCourse = function() {
	this.index++;
	return this.index < this.courseList.length;
};



/**
 * Sets index to 0
 * @prototype
 * @function reset
 */
CourseModel.prototype.reset = function() {
	this.index = 0;
};

/**
 * Sets syncState to false if the time that passed since the last
 * synchronization is greater than the value of syncTimeOut
 * @prototype
 * @function checkForTimeOut
 */
CourseModel.prototype.checkForTimeOut = function() {
	var timeDelta = ((new Date()).getTime() - this.syncDateTime);
	moblerlog("timeDelta: " + timeDelta);
	moblerlog("syncTimeOut: " + this.syncTimeOut);
	if (timeDelta > this.syncTimeOut) {
		this.syncState = false;
		moblerlog("check for timeout is false");
	}
};

/**
 * @prototype
 * @function isLoaded
 * @param {Number} courseId, the id of the current course
 * @return {Boolean}, if a course id is passed to the method, it returns true, if the course with
 * 						the specified id is loaded, otherwise false.  If no course id is passed, it returns true, 
 * 						if the current course is loaded, otherwise false
 */
CourseModel.prototype.isLoaded = function(courseId) {
	if (courseId > 0) {
        var c;
		for ( c in this.courseList) {
			if (this.courseList[c].id === courseId) {
				return this.courseList[c].isLoaded;
			}
		}
		return false;
	}
	return (this.index > this.courseList.length - 1) ? false
			: this.courseList[this.index].isLoaded;
};

/**
 * Sets the isLoaded and the synchState of the course with the specified course id to true
 * @prototype
 * @function courseIsLoaded
 * @param {Number} courseId, the id of the current course
 */
CourseModel.prototype.courseIsLoaded = function(courseId) {
    var c;
	for (c in this.courseList) {
		if (this.courseList[c].id === courseId) {
			this.courseList[c].isLoaded = true;
			this.courseList[c].syncState = true;
			this.storeData();
			moblerlog(this.courseList[c].id + " is loaded");
			break;
		}
	}
};

/**
 * Returns the synchronization state of a specific course, which means if the locally stored course is
 * in synchornization (has the same data, questions) with the one line.
 * @prototype
 * @function isSynchronized
 * @param {Number} courseId, the id of the current course
 * @return {Boolean} true if the course with the specified id is synchronized, otherwise
 *         false
 */
CourseModel.prototype.isSynchronized = function(courseId) {
	if (courseId > 0) {
        var c;
		for ( c in this.courseList) {
			if (this.courseList[c].id === courseId) {
				return this.courseList[c].syncState;
			}
		}
	}
	return false;
};

/**When internet connectivity is detected the loading of courses is taking place.
 * If syncState is true, it loads the data for the course list from the server
 * If syncState is false, is loads the data for these questionpools, which are not
 * yet loaded from the server
 * @prototype
 * @function switchToOnline
 */
CourseModel.prototype.switchToOnline = function() {
	moblerlog("switch to online - load all not yet loaded courses");

	this.checkForTimeOut();

	if (this.syncState) {
		this.loadFromServer();
	} else {
        var c;
		for ( c in this.courseList) {
			if (!this.courseList[c].isLoaded || !this.courseList[c].syncState) {
				moblerlog(this.courseList[c].id + " is not loaded yet");
				this.controller.models["questionpool"]
						.loadFromServer(this.courseList[c].id);
			}
		}
	}
};



/** Resets the course list by:
 * - emptying the course list
 * - intializing the index of the current course
 * - initializing the date and time of synchronization
 * - sets the synchronozation state to false
 * - sets the default synchronization time out time
 * @prototype
 * @function resetCourseList
 * */
 CourseModel.prototype.resetCourseList = function() {
	this.courseList = [];
	this.index = 0; // index of the current course
	this.syncDateTime = 0;
	this.syncState = false;
	this.syncTimeOut = DEFAULT_SYNC_TIMEOUT;
};

/**
 * Returns the course list
 * @prototype
 * @function getCourseList
 * */
CourseModel.prototype.getCourseList = function() {
	var self=this;
	//moblerlog("course list in courses model is "+JSON.stringify(this.courseList));
	self.loadData();
	moblerlog("course list in getCourseList is"+self.courseList);
	var c;
	var coursesIdList=[];
	for ( c in this.courseList){
	coursesIdList[c]=this.courseList[c].id;	
	}
	moblerlog("courses id list is"+coursesIdList);
	return coursesIdList;
}