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
 * A global property/variable that stores the id of the 
 * featured content
 *
 * @property FEATURED_CONTENT_ID 
 * @default fd 
 *
 **/
var FEATURED_CONTENT_ID = "fd";

/**
 *A global property/variable that shows for how long the synchronization is valid.
 *The following default value shows the time period after which a new synchromization 
 *should take place.
 **@property DEFAULT_SYNC_TIMEOUT 
 **@default 60000 
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
	this.featuredQuestions = [];
	this.featuredId;
	this.featuredQuestionList;
	this.activeQuestion = {};
	this.featuredCourseId = FEATURED_CONTENT_ID;
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
	
	$(document).bind("online", function() {
		self.switchToOnline();
	});
	
	
	this.loadData(); //we will load data from local storage 
	//this.loadFeaturedCourseFromServer();
}


/**
 * Loads the data from the local storage (key = "featuredContent"). Therefore the string
 * is converted into a json object of which the data is taken. The very first time
 * we launch the app, everything is initialized and set to false, empty and get the current time.
 * @function loadData
 */
FeaturedContentModel.prototype.loadData = function() {
	moblerlog("enter load data in featured model");
	var featuredObject;
	try {
		featuredObject = JSON.parse(localStorage.getItem("featuredContent")) || {};
	} catch (err) {
		featuredObject = {};
	}
moblerlog("featured object issssss: "+featuredObject);
moblerlog("featured object lenght isss "+JSON.stringify(featuredObject).length);
	if (featuredObject.length > 0) {
	this.featuredContentList = featuredObject.featuredCourses || [];
	this.syncDateTime = featuredObject.syncDateTime || (new Date()).getTime();
	this.syncState = featuredObject.syncState || false;
	this.syncTimeOut = featuredObject.syncTimeOut || DEFAULT_SYNC_TIMEOUT;
	this.index = 0;

	this.checkForTimeOut();
	moblerlog("object featuredContent is "+localStorage.getItem("featuredContent"));
	moblerlog("featured content list in load data is "+JSON.stringify(this.featuredContentList));
	}
	else {
		moblerlog("featured content loaded from server");
		this.loadFeaturedCourseFromServer();
	}
	
};

/**
 * stores featured course data into the local storage 
 * @function storeData 
 * @param {string}, featuredCourseString
 */
FeaturedContentModel.prototype.storeData = function(){
	var featuredString;
	try {
//		featuredString = "{" +
//				"\"featuredCourses\":"+featuredCourseString+","+
//				"\"syncDateTime\":"+ this.syncDateTime+","+
//				"\"syncState\":"+ this.syncState+","+
//				"\"syncTimeOut\" :"+ this.syncTimeOut+
//	"}";
		
		featuredString = JSON.stringify({
			featuredCourses: this.featuredContentList,
			syncDateTime: this.syncDateTime,
			syncState:this.syncState,
			syncTimeOut: this.syncTimeOut			
		});		
	} catch (err) {
		featuredString = "";
	}
	localStorage.setItem("featuredContent", featuredString);
	moblerlog("featured content object is "+localStorage.getItem("featuredContent"));
};



/**
 * load featured course and all its questions from the server
 * stores downloaded featured course data into the local storage 
 * @function loadFeaturedCourseFromServer 
 */
FeaturedContentModel.prototype.loadFeaturedCourseFromServer = function(){
	moblerlog("loadFromServer-Course is called");
	var self = this;
	var syncStateCache = [];
	var activeURL = self.controller.getActiveURL();
	self.checkForTimeOut();

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

			// if there was a pending featured course list, remove it from the storage
			localStorage.removeItem("pendingFeaturedContentList");

			var featuredObject;
			try {
				featuredObject = data;
			} catch (err) {
				featuredObject = {};
				moblerlog("Couldn't load featured courses from server " + err);
			}
			moblerlog("featuredOboject is"+featuredObject);
			self.featuredContentList = featuredObject.featuredCourses || [];
			self.featuredQuestions = self.featuredContentList[0]["questions"];
			stringifiedFeaturedQuestions = JSON.stringify(self.featuredQuestions);
			moblerlog("featured questions are "+stringifiedFeaturedQuestions);
						
//			x=JSON.stringify(self.featuredContentList);
//			moblerlog("JSON Featured Content: "+x);
//			moblerlog("featured Content info length "+ self.featuredContentList.length); //needed this for title debugging

//			var pos=x.indexOf("questions");
//			q="questions";
//			l=q.length;
//			var last= x.indexOf(x.length-2);
//			moblerlog("position of last pointer: "+last);
//			var list= x.substring(pos+l+2, x.length-2);
//			moblerlog("featured questions are "+list);
//			
			self.syncDateTime = (new Date()).getTime();
			self.syncState = true;
			self.syncTimeOut = featuredObject.syncTimeOut || DEFAULT_SYNC_TIMEOUT;
			moblerlog("sync time out is:"+JSON.stringify(self.syncTimeOut));
			//store the featured questions in the same local storage object with the exclusive content questions
			//they will all be handled by the same model- questionpool.
			//var featuredCourseId = FEATURED_CONTENT_ID;
//			localStorage.setItem("questionpool_" +featuredCourseId, list);
			
			localStorage.setItem("questionpool_" +self.featuredCourseId,stringifiedFeaturedQuestions);
			moblerlog("questionpool object for fd is "+localStorage.getItem("questionpool_"+this.featuredCourseId));
			
			//store in the local storage all the data except the questions

			// 	var featuredCourseString=x.substring(0,pos-2).concat("}]");
			//	moblerlog("featured course string is"+featuredCourseString);
			//	self.storeData(featuredCourseString);	
			
			
			self.storeData();
			
			self.reset();
			
			//if there was any saved sync state then assign it to the sync state of the courses of the course list
			if (syncStateCache.length > 0) {
				moblerlog("sync state cache existis");
                var c;
				for ( c in self.featuredContentList) {
					self.featuredContentList[c].syncState = syncStateCache[self.featuredContentList[c].id];
					moblerlog("sync state of featured content list is "+self.featuredContentList[c].syncState);
				}
			}
			
			 /**  
			  * It is triggered when the loading of the course list from the server has been finished
			 * @event courselistupdate 
			 **/
			$(document).trigger("featuredContentlistupdate",this.featuredCourseId);
		} //end of function createCourseList
		
};



/**
 * @prototype
 * @function checkForTimeOut
 */
FeaturedContentModel.prototype.checkForTimeOut = function(){};

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
 * in synchronization (has the same data, questions) with the online one.
 * @prototype
 * @function isSynchronized
 * @param {Number} featuredContentId, the id of the featured course
 * @return {Boolean} true if the course with the specified id is synchronized, otherwise false
 */
FeaturedContentModel.prototype.isSynchronized = function(featuredContentId) {
	if (featuredContentId > 0) {
		var c;
		for (c in this.featuredContentList) {
			moblerlog (""+featuredContentList[c].id);
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
		this.loadFeaturedCourseFromServer();
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

//
///**
// * Sets index to 0
// * @prototype
// * @function reset
// */
FeaturedContentModel.prototype.reset = function() {
	this.index = 0;
};





