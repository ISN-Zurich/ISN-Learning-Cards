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



/** @author Evangelia Mitsopoulou

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
 * @class FeaturedContentModel  
 * This model holds the the list and information about the current
 * synchronization of the data with the server
 * @constructor 
 * It sets and initializes basic properties such as:
 *  - index of the current featured content course
 *  - the featuredContentList
 *  - the state and date/time of the synchronization 
 * It loads data from the local storage
 * It listens to 3 events regarding the readiness of the system after the authentication and the loading of the data, which
 * means it listens when the authentication is ready, when the questionpool is ready and when internet connection is found
 * @param {String} controller 
 */
function FeaturedContentModel(controller) {
	var self = this;

	this.controller = controller;

	
	this.featuredContentList = [];
	this.featuredQuestionList =[];
	this.activeQuestion = {};
	this.index = 0; // index of the current course
	this.syncDateTime = 0;
	this.syncState = false;
	this.syncTimeOut = DEFAULT_SYNC_TIMEOUT;
	this.queue = [];

	
	 /** 
	  * It it binded when an online connection is detected
	 * @event switchtoonline
	 * @param:  a call back function in which the featured(and any pending questions) 
	 *          are loaded from the server
	 * **/
	
	$(document).bind("switchtoonline", function() {
		self.switchToOnline();
	});
	
	
	//this.loadData(); //we will load data from local storage or from the local json file 
					// if we decide to have a json file, we will first export it from ILIAS...
					// and then we will store  it in the resources folder of our client and the json file
					// will be already there during the installation of the app
					// the future featured contents/fee course will be exported as json files from ilias 
					// during runtime

	this.loadFeaturedCourseFromServer();
}


/**
 * Loads the data from the local storage (key = "featuredContent"). Therefore the string
 * is converted into a json object of which the data is taken. The very first time
 * we launch the app, everything is initialized and set to false, empty and get the current time.
 * @function loadData
 */
FeaturedContentModel.prototype.loadData = function() {
	var featuredObject;
	try {
		featuredObject = JSON.parse(localStorage.getItem("featuredContent")) || {};
	} catch (err) {
		featuredObject = {};
	}

	this.featuredContentList = featuredObject.featuredCourses || [];
	this.syncDateTime = featuredObject.syncDateTime || (new Date()).getTime();
	this.syncState = featuredObject.syncState || false;
	this.syncTimeOut = featuredObject.syncTimeOut || DEFAULT_SYNC_TIMEOUT;
	this.index = 0;

	this.checkForTimeOut();
	
};

/**
 * stores data into the local storage 
 * or TODO: into a local json file
 **
 **/
FeaturedContentModel.prototype.storeData = function(){
	var courseString;
	try {
		featuredString = JSON.stringify({
			featuredCourses : this.featuredContentList,
			syncDateTime : this.syncDateTime,
			syncState : this.syncState,
			syncTimeOut : this.syncTimeOut
		});
	} catch (err) {
		featuredString = "";
	}
	localStorage.setItem("featuredContent", courseString);
};


/**
 * stores questions data into the local storage 
 * or TODO: into a local json file
 * to write more comments
 **
 **/
FeaturedContentModel.prototype.storeQuestionsData = function () {
	var questionPoolString;
	try {
		questionPoolString = JSON.stringify(this.featuredQuestionList);
	} catch (err) {
		questionPoolString = "";
	}
	localStorage.setItem("featuredQuestionpool_" + course_id, questionPoolString);
};


/**
 **TODO:
 */
FeaturedContentModel.prototype.loadQuestionsData = function(){
	var questionPoolObject;
	try {
		questionPoolObject = JSON.parse(localStorage.getItem("questionpool_"
				+ course_id))
				|| [];
	} catch (err) {
		questionPoolObject = [];
	}

	this.questionList = questionPoolObject;
	this.questionsReset();
	
};



//loadDatafromServer
// in this function we will load data from the server, and will store them in a json file in the local folders of the app
// the loadData function above, will load the contents from the json file or from the local storage if we decide to store them there
// we will have two functions
// 1. loadFeaturedCourseFromServer 
// 2. loadQuestionsDataFromServer



FeaturedContentModel.prototype.loadFeaturedCourseFromServer = function(){
	moblerlog("loadFromServer-Course is called");
	var self = this;
	var syncStateCache = [];
	var activeURL = self.controller.getActiveURL();
	self.checkForTimeOut();
//	if (self.controller.getLoginState() && !self.syncState) {
	//	var sessionKey = self.controller.models['authentication']
	//			.getSessionKey();

		// save current syncStates for this featured course
		if (self.featuredContentList && self.featuredContentList.length > 0) {
			moblerlog("before AJAX request");
            var c;
			for ( c in self.featuredContentList) {
				syncStateCache[self.featuredContentList[c].id] = self.featuredContentList[c].syncState;
			}
		}

			
		$
				.ajax({
					url:  'http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards/featuredContentCourse.php',
					type : 'GET',
					dataType : 'json',
					success : createFeaturedContentList,
					error : function() {
						localStorage.setItem("pendingFeaturedContentList", true);
						console
								.log("Error while loading featured course list from server");
					},
					beforeSend : setHeader
				});

		function setHeader(xhr) {
		// xhr.setRequestHeader('sessionkey', sessionKey);
		// we don't need to send anything 
		}

		function createFeaturedContentList(data) {
			moblerlog("success");

			// if there was a pending course list, remove it from the storage
			localStorage.removeItem("pendingFeaturedContentList");

			var featuredObject;
			try {
				featuredObject = data;

			} catch (err) {
				featuredObject = {};
				moblerlog("Couldn't load featured courses from server " + err);
			}
			moblerlog("featured course data loaded from server");
            moblerlog(featuredObject);
			//self.featuredContentList = featuredObject.featuredCourses || [];
			self.featuredContentList = featuredObject.featuredCourses || [];
			moblerlog("featuredList length "+ self.featuredContentList.length);
			self.syncDateTime = (new Date()).getTime();
			self.syncState = true;
			self.syncTimeOut = featuredObject.syncTimeOut || DEFAULT_SYNC_TIMEOUT;
			self.storeData();
			moblerlog("JSON Featured Content List: " + self.featuredContentList);
			self.reset();
			
			//if there was any saved sync state then assign it to the sync state of the courses of the course list
			if (syncStateCache.length > 0) {
                var c;
				for ( c in self.featuredContentList) {
					self.featuredContentList[c].syncState = syncStateCache[self.featuredContentList[c].id];
				}
			}
			
			 /**  
			  * It is triggered when the loading of the course list from the server has been finished
			 * @event courselistupdate 
			 **/
			$(document).trigger("featuredContentlistupdate");
			
			//download all the questions(questionlist) for each course
            var c;
            for ( c in self.featuredContentList) {
             self.featuredContentList[c].isLoaded = false;

             self.loadQuestionsFromServer(13040);
             }

		} //end of function createCourseList
		//} //end of if getLoginState()
	
};



FeaturedContentModel.prototype.loadQuestionsFromServer = function(courseId){
	
	var self = this;
	var courseId=13040;
	//var activeURL = self.controller.getActiveURL();

	$			.ajax({
				url: "http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards/featuredQuestions.php",
				type : 'GET',
				dataType : 'json',
				success : function(data) {
					moblerlog("success");
					//if this was a pending question pool, remove it from the storage
					localStorage.removeItem("pendingFeaturedQuestionPool" + courseId);
					if (data) {
                    moblerlog("JSON: " + data);
						var questionPoolObject;
						
						questionPoolObject = data.questions;				
						if (!questionPoolObject) {
							questionPoolObject = [];
						}
                        moblerlog("Object: " + questionPoolObject);
						
						var questionPoolString;
						try {
							questionPoolString = JSON.stringify(questionPoolObject);
						} catch (err) {
							questionPoolString = "";
						}
						localStorage.setItem("featuredQuestionpool_" +  data.courseID, questionPoolString);
						
						/**It is triggered after the successful loading of questions from the server 
						 * @event questionpoolready
						 * @param:courseID
						 */
						
                  		$(document).trigger("questionpoolready", data.courseID);
					}
				},
				error : function() {
					
					//if there was an error while sending the request,
					//store the course id for the question pool in the local storage
					localStorage.setItem("pendingQuestionPool_" + courseId, true);
					moblerlog("Error while loading featured question pool from server");
				},
				beforeSend : setHeader
			});

	function setHeader(xhr) {
//		xhr.setRequestHeader('sessionkey',
//				self.controller.models['authentication'].getSessionKey());
	}
	
};

FeaturedContentModel.prototype.checkForTimeOut = function(){
	
	
};

/**
 * @prototype
 * @function getTitle
 * @return the title of the current course
 */
FeaturedContentModel.prototype.getTitle = function() {
	var self=this;
	moblerlog("index of the current course is"+this.index);
	moblerlog("length of featured content list in getTitle"+self.featuredContentList.length);
	
	return (this.index > this.featuredContentList.length - 1) ? false
		: this.featuredContentList[this.index].title;
	//return  this.featuredContentList[this.index].title;
};




/**
 * Returns the synchronization state of a specific featured course, which means if the locally stored course is
 * in synchronization (has the same data, questions) with the one line.
 * @prototype
 * @function isSynchronized
 * @param {Number} featuredContentId, the id of the featured course
 * @return {Boolean} true if the course with the specified id is synchronized, otherwise
 *         false
 */
FeaturedContentModel.prototype.isSynchronized = function(featuredContentId) {
	if (courseId > 0) {
		var c;
		for ( c in this.featuredContentList) {
			if (this.featuredContentList[c].id === featuredContentId) {
				return this.featuredContentList[c].syncState;
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
FeaturedContentModel.prototype.switchToOnline = function() {
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


/**
 * Sets index to 0
 * @prototype
 * @function reset
 */
FeaturedContentModel.prototype.reset = function() {
	this.index = 0;
};




/**
 * Resets a question pool by:
 * 1. Emptying the queue that holds the recently answered questions
 * 2. Initializing the question id
 * 3. Clearing the current question body
 * 4. Reseting the mixing of the answered items of each question
 * After the reseting of the above elements has been done, we start again the question pool by moving to the next question
 * @prototype
 * @function reset
 */ 
FeaturedContentModel.prototype.questionsReset = function() {
	this.queue = [ "-1", "-1", "-1" ];
	this.id = 0;
	this.activeQuestion = {};
	this.currentAnswersAreMixed = false;
	if (this.featuredQuestionList.length > 0) {
		this.nextQuestion();
	}
};

/**
 * TODO: write comments
 **/
FeaturedContentModel.prototype.getQuestionBody = function(){
	return this.activeQuestion.question;
	
};



/**TODO
 * to upadte commments to be compatibe with this model
 * Increases the index. Sets the id to the id of the next question. 
 * A random number is created in order to get the id of the next question
 * at the random position/index of the question list. 
 * If the random number is not the same as the current id and is not an id 
 * that is stored in the queue, the new id is the random number
 * @prototype
 * @function nextQuestion
 * @return {Boolean} returns false if it has reached the end of the list
 */
FeaturedContentModel.prototype.nextQuestion = function() {
	var random;
	var newId;

	do {
		// generates a random number between 0 and questionList.length 
		random = Math.floor((Math.random() * this.questionList.length));
		moblerlog("random:" +random);
		newId = this.featuredQuestionList[random].id;
		moblerlog("New ID: " + newId);
		//keeps repeating the process of getting the id of the new random question of question list
		//while the new random id is still the same with id of the current question or if this new random id is still 
		//stored in the waiting queue 	
	} while (this.id === newId
			|| (this.queue.length * 2 <= this.featuredQuestionList.length && jQuery
					.inArray(newId, this.queue) >= 0));

	this.id = newId;

	this.activeQuestion = this.featuredQuestionList[random];
	this.currentAnswersAreMixed = false;
	return this.id < this.featuredQuestionList.length;
};