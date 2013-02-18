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

/**@author Isabella Nake
 * @author Evangelia Mitsopoulou

*/

/*jslint vars: true, sloppy: true */


/**
 *A global property/variable that hosts the bundle id of the application
 *@property APP_ID
 *@default ch.ethz.isn.learningcards
 **/

var APP_ID = "ch.ethz.isn.learningcards";


/**
 * @class ConfigurationModel 
 * This model holds the data about the current configuration
 * @constructor 
 * It initializes basic properties such as:
 *  - the configuration object of the local storage  
 *  - the url of the selected server,
 *  - the image and the logo of the selected server, 
 * It loads data from the local storage. In the first time there are no data in the local storage. 
 * It specifies the data for the selected server.
 * It listens to an event that is triggered when statistics are sent to the server.
 * @param {String} controller 
 */

function ConfigurationModel(controller) {
	var self=this;
	this.controller = controller;
	var featuredContent_id = FEATURED_CONTENT_ID;
	//initialization of model's variables
	this.configuration = {};
	this.urlToLMS = "";
	this.logoimage = "";
	this.logolabel = "";
		
	// load data from the local storage if any
	this.loadData();
	
	
	/**It is triggered after all statistics data are sent successful to the server. This happens when the user logsout.
	 * @event statisticssenttoserver
	 * @param:a callback function that sends pending data to the server and clears all information from the local storage.
	 * Only the application key remains in the local storage, because it is unique for a specific device for a specific application.
	* 
	* FIXME:
	* Take care that the session key and the server are stored with the pending information so we can send the data 
	* with the correct context to the backend i.e. if you have pening information and you login to a different server
	* then the pending information should be sent to the original server for the original user and not
	* to the new server and the new user. 
	*/

	$(document).bind("statisticssenttoserver", function() {
		if (self.controller.appLoaded && self.configuration.loginState === "loggedOut") {
		self.sendLogoutToServer();
		moblerlog("user logged out");
		}
	});

}

/**
 * Stores the data into the local storage (key = "configuration") therefore the
 * json object is converted into a string
 * @prototype
 * @function storeData
 */
ConfigurationModel.prototype.storeData = function() {
	var configString;
	try {
		configString = JSON.stringify(this.configuration);
	} catch (err) {
		configString = "";
		moblerlog("error while storing");
	}
	moblerlog(configString);
	localStorage.setItem("configuration", configString);

	moblerlog("Configuration Storage after storeData: "+ localStorage.getItem("configuration"));
};

/**
 * Loads the data from the local storage (key = "configuration") therefore the
 * string is converted into a json object
 * @prototype
 * @function 
 */
ConfigurationModel.prototype.loadData = function() {
	var configObject;
	//if there is an item in the local storage with the name "configuration"
	//then get it by parsing the string and convert it into a json object
	try {
		configObject = JSON.parse(localStorage.getItem("configuration"));
	} catch (err) {
		moblerlog("error! while loading");
	}

	moblerlog("configObject: " + JSON.stringify(configObject));
	
	// when the app is launched and before the user logs in there is no local storage 
	// in this case there is no configuration object and it is stated in one of its properties
	// that its login status is set to "loggedOut".
	if (!configObject) {
		configObject = {
			loginState : "loggedOut",
			statisticsLoaded: "false"
		};
	}
	
 	this.configuration = configObject;

};

/**
 * Loads the configuration data from the server such as learner information and synchronization state
 * and stores it in the local storage. When all data is loaded, the authenticationready event is triggered
 * If any error occurs during the authentication then an event will be triggered to notify this.
 * @prototype
 * @function loadFromServer
 */
ConfigurationModel.prototype.loadFromServer = function() {
	var self = this;
	var activeURL = self.controller.getActiveURL();
	
	//if the user is not authenticated yet
	if (this.configuration.userAuthenticationKey
			&& this.configuration.userAuthenicationKey !== "") {
		// authenticate the user by "GETing" his data/learner information from the server
		$
				.ajax({
					url : activeURL + '/authentication.php',
					type : 'GET',
					dataType : 'json',
					success : function(data) {
						moblerlog("success");
                        moblerlog("JSON: " + data);
						var authenticationObject;
						try {
							//the autentication data are successfully received 
							//its object format is assigned to the authentication object variable
							authenticationObject = data;
							moblerlog("authenticationData from server");
						} catch (err) {
							//the authentication data couln't be parsed properly
							moblerlog("Error: Couldn't parse JSON for authentication");
							authenticationObject = {};
						}
						//assign as value to the learner information property of the configuration object 
						//the user authentication data, which were received from server
					    self.configuration.learnerInformation = authenticationObject.learnerInformation;
					    //store in the local storage the synchronization state
						self.configuration.globalSynchronizationState = authenticationObject.globalSynchronizationState;
                      
						//store in the local storage the above received data
						self.storeData();
						
						//sets the language interface for the authenticated user
						//its language preferences were received during the authentication
						//and  were stored in the local storage in the previous step
                        self.controller.setupLanguage();
                        
                        /**
                         * When all authentication data are received and stored in the local storage
                         * the authenticationready event is triggered
                         * @event authenticationready
                         * @param the user id 
                         */                        
						$(document).trigger("authenticationready",
								authenticationObject.learnerInformation.userId);
					},
					// the receive of authenticated data was failed
					error : function() {
						moblerlog("Error while authentication to server");
						/**
                         * When authentication data are not received from the server
                         * the authenticationfailed event is triggered
                         * @event authenticationfailed
                         */
						$(document).trigger("authenticationfailed");
					},
						// we send the user authentication key as "sessionkey" via headers
						// before the autentication takes plae and in order it to be validated or not
                      beforeSend : function setHeader(xhr) {
                      xhr.setRequestHeader('sessionkey',
                                           self.configuration.userAuthenticationKey);
                      }
                      
				});

			}
};

/**
* Logs in user. The user types a username and a password. Therefore the username and a challenge are
*sent to the server. The algorithm that is executed to compute the challenge is based on:
*1. the application key that is bound to a UUID
*2. the user's password (its MD5 hashed value) 
*3. the user's name
* @prototype
* @function login
*/ 
ConfigurationModel.prototype.login = function(username, password) {
	var self=this;
	moblerlog("client key: " + self.controller.getActiveClientKey());
	//remove leading and trailing white spaces
	username = username.trim(); 
	//password is encrypted by an MD5 hash
	passwordHash = faultylabs.MD5(password);
	moblerlog("md5 password: " + passwordHash);
	//challenge is computed by applying an MD5 faulty labs function on username and hashed password
	challenge = faultylabs.MD5(username + passwordHash.toUpperCase()+ self.controller.getActiveClientKey());
	
	
	var auth = {
		"username" : username,
		"challenge" : challenge
	};
	
	//send username and challenge to the server
	this.sendAuthToServer(auth);
	
};

/**
* Logs out user. When logging out the statistics are sent to the server and the 
* local storage (courses, questions) is cleared
* @prototype
* @function logout
*/
ConfigurationModel.prototype.logout = function(featuredContent_id) {
	//send statistics data to server
	this.configuration.loginState = "loggedOut";
	this.controller.models['statistics'].sendToServer(featuredContent_id);
	
	var self = this;

	// remove all question pools and all pending question pool requests
	var c, courseList = this.controller.models["course"].courseList;
	if (courseList) {
		for ( c in courseList ) {
			moblerlog("clear local question pools");
			if (courseList[c].id !== FEATURED_CONTENT_ID){
			localStorage.removeItem("questionpool_" + courseList[c].id);
			localStorage.removeItem("pendingQuestionPool_" + courseList[c].id);
			}
		}
	}
	
	// remove course list and pending course list request
	localStorage.removeItem("pendingCourseList");
	localStorage.removeItem("courses");
	this.controller.models['course'].resetCourseList();

};


/**
* Sends an authentication request (uuid, appid, username, challenge) to the server
* In case of successful authentication, we store back to the local storage the following:
* 1. user authentication key
* 2. learner information such as userId, userName, displayName, emailAddress, langauge
* 3. we set the login state to "logged in".
* Both in successfull or failed authentication an appropriate event is triggered to notify about the status of it.
* @prototype
* @function sendAuthToServer
*/
ConfigurationModel.prototype.sendAuthToServer = function(authData) {
	var self = this;
	var activeURL = self.controller.getActiveURL();
	moblerlog("url: " + self.urlToLMS + '/authentication.php');
	$
			.ajax({
				url : activeURL + '/authentication.php',
				type : 'POST',
				dataType : 'json',
				//if any data are sent back during the authentication 
				success : function(data) {
					//if  any data are sent during the authentication but they are wrong and they send back different error messages
					if (data && data['message']) {
						switch (data['message']) {
						//1. first error message is that the client key is invalid
						case "invalid client key":
							moblerlog("invalid client key - reregister")
							//if the client key is invalide, register in order to get a new one
							self.controller.models['lms'].register();
							 /**
	                         * The authentication fails if no valid client key is received. An event is triggered
	                         * in order notify about the failure and the reason of failure (invalid key)
	                         * @event authenticationfailed 
	                         * @event invalidclientkey 
	                         */
							$(document).trigger("authenticationfailed", "invalidclientkey");
							break;
							//2. second error message is that the user name or password were wrong
						case "wrong user data":
							moblerlog("Wrong username or password!")
							/**
	                         * The authentication fails if wrong user name or password are received. An event is triggered
	                         * in order notify about the failure and the reason of failure (wrong data)
	                         * @event authenticationfailed 
	                         * @event nouser 
	                         */
							$(document).trigger("authenticationfailed", "nouser");
							break;
						default:
							break;
						}
						//if data are sent back from the server during the authentication and they dont contain any error messages
						//and the user has an authenticaiton key
					} else if (data && data.userAuthenticationKey !== "") {
						moblerlog("userAuthenticationKey: "+ data.userAuthenticationKey);
						//store the authenticated data (user authentication key, learner information) in the local storage
						self.configuration.userAuthenticationKey = data.userAuthenticationKey;
						self.configuration.learnerInformation = data.learnerInformation;
						self.configuration.loginState = "loggedIn";
						self.storeData();
						/**
                         * When all authentication data are received and stored in the local storage
                         * the authenticationready event is triggered
                         * @event authenticationready
                         * @param the user authentication key
                         */   
						$(document).trigger("authenticationready",
								self.configuration.userAuthenticationKey);
						
						//sets the language interface for the authenticated user
						//its language preferences were received during the authentication 
											
						self.controller.setupLanguage();
						
						//get statistics data from server
						self.controller.models['statistics'].loadFromServer();
					} else {
						//no error messages from the server and no userauthentication(session) key received
						moblerlog("no error message from server and no session key received");
						$(document).trigger("authenticationfailed", "connectionerror");
					}
				},
				//the authentication to the server failed because of unknown reason
				error : function(jqXHR, textStatus, errorThrown) {
					moblerlog("Error while authentication to server: status:" + jqXHR.status + ", " + jqXHR.responseText);
					/**
                     * When the authentication to the server fails for any unknown reason that is independent from validity of the received data
                     * but related with any internet connectivity or server issue, the authenticationfailed and connectionerror events are triggered
                     * @event authenticationfailed
                     * @event connectionerror
                     */   
					$(document).trigger("authenticationfailed","connectionerror");
				},
				//the authentication data (uuid, appid, username, challenge) are sent to the server via headers
                  beforeSend :function setHeader(xhr) {
                  xhr.setRequestHeader('uuid', device.uuid);
                  xhr.setRequestHeader('appid', APP_ID);
                  xhr.setRequestHeader('authdata', authData.username + ":"
                                       + authData.challenge);
                  }
			});	
};

/**
 * Sends a delete request to the server in order to invalidates the specified session key 
 * or if no session key is specified the current session key.
 * We send via header the session key. After the delete request is sent to the server,
 * we clear the local storage. We keep only the app key.
* @prototype
* @function sendLogoutToServer
* @param userAuthenticationKey
*/
ConfigurationModel.prototype.sendLogoutToServer = function(userAuthenticationKey) {
	var sessionKey,self = this;
	var activeURL = self.controller.getActiveURL();  
	if (userAuthenticationKey) {
		sessionKey = userAuthenticationKey;
	} else {
		sessionKey = self.configuration.userAuthenticationKey;
	}
	
	$
			.ajax({
				url : activeURL + '/authentication.php',
				type : 'DELETE',
				dataType : 'json',
				success : function() {
					
				},
				error : function() {
					moblerlog("Error while logging out from server");
					//adding in the local storage the session key of the pending
					localStorage.setItem("pendingLogout", sessionKey);
				},
				//sends via header the session key in order it to be validated
				beforeSend : function setHeader(xhr) {
					moblerlog("session key to be invalidated: " + sessionKey);
					xhr.setRequestHeader('sessionkey', sessionKey);
				}
			});

	this.configuration = {
			"userAuthenticationKey" : "",
			"learnerInformation" : {
				"userId" : 0
			},
			"loginState": "loggedOut",
			"statisticsLoaded": false
	};
	
	

	//after clearing data from the local storage, save the changes to the local storage item
	this.storeData();

	// drop statistics data table from local database
	this.controller.models['answers'].deleteDB(featuredContent_id);	
};

/**
* Invalidates the specified session key or if no session key is specified the
* current session key
* @prototype
* @function isLoggedIn
* @return true if user is logged in, otherwise false
*/
ConfigurationModel.prototype.isLoggedIn = function() {
	if (this.configuration.userAuthenticationKey && this.configuration.userAuthenticationKey !== "") {
		return true;
	}
	
	moblerlog("configuration.js: is not logged in ... " + this.configuration.userAuthenticationKey); 
	return false;
};


/**
* @prototype
* @function getDisplayName
* @return {String} displayName, the full name of the user that is stored in the configuration object
*/
ConfigurationModel.prototype.getDisplayName = function() {
	return this.configuration.learnerInformation.displayName;
};


/**
* @prototype
* @function getUserName
*  @return {String} displayName, the username that is stored in the configuration object
*/
ConfigurationModel.prototype.getUserName = function() {
	return this.configuration.learnerInformation.userName;
};


/**
* @prototype
* @function getUserId
* @return {Number} userId, the user id that is stored in the configuration object
*/
ConfigurationModel.prototype.getUserId = function() {
	return this.configuration.learnerInformation.userId;
};


/**
* @prototype
* @function getEmailAddress
* @return {String} emailAddress, the email address of the user as it is stored in the configuration object
*/
ConfigurationModel.prototype.getEmailAddress = function() {
	return this.configuration.learnerInformation.emailAddress;
};


/**
* Gets the language of the interface for the specific user. By default it is the selected language of
* the user on the lms. If there is no specified language, then the language of the device is used.
* @prototype
* @function getLanguage
* @return {String} language, the language of the user 
*/
ConfigurationModel.prototype.getLanguage = function() {
	//return "el"; // JUST for testing
	if (this.configuration.learnerInformation && this.configuration.learnerInformation.language && this.configuration.learnerInformation.language.length){
		return this.configuration.learnerInformation.language;
	}
    
    // if we don't know a user's language we try to use the phone's language.
    language = navigator.language.split("-");
    language_root = (language[0]);
    
	return this.configuration.defaultLanguage ? this.configuration.defaultLanguage : language_root;
};


/**
* @prototype
* @function getSessionKey 
* @return {String} userAuthenticationKey, the session key of the user 
*/
ConfigurationModel.prototype.getSessionKey = function() {
	return this.configuration.userAuthenticationKey;
};







