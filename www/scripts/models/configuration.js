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
 *A global property/variable that is used to set the default server with which the application will be connected
 *in order to exchange data.
 *
 *@property DEFAULT_SERVER
 *@default hornet
 **/

var DEFAULT_SERVER = "yellowjacket";

/**
 *A global property/variable that is used to store info about the different servers to which the application can be connected.
 *
 *@property URLS_TO_LMS
 *@default {"yellowjacket", "hornet", "PFP LMS", "PFP TEST"}
 **/

var URLS_TO_LMS = {"yellowjacket":  
					{
						logoImage: "resources/pfpLogo.png", 
						logoLabel: "Test Server at ISN Zurich",					
						url: "http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards",
						clientKey: ""
					},
					"hornet":  
					{
						logoImage: "resources/pfpLogo.png", 
						logoLabel: "Partnership for Peace LMS at ISN Zurich",
						url: "http://hornet.ethz.ch/scorm_editor/restservice/learningcards",
						clientKey: ""
					},
					"PFP LMS":  
					{
						logoImage: "resources/pfpLogo.png", 
						logoLabel: "Partnership for Peace LMS at ISN Zurich",
						url: "https://pfp.ethz.ch/restservice/learningcards",
						clientKey: ""
					},
					"PFPTEST":  
					{
						logoImage: "resources/pfpLogo.png", 
						logoLabel: "Partnership for Peace LMS at ISN/ETH test",
						url: "https://pfp-test.ethz.ch/restservice/learningcards",
						clientKey: ""
					}
};

/**
 *A global property/variable that activates and deactivates the display of console logs.
 *It is passed as parameter in global function moblerlog in common.js.
 *
 *@property MOBLERDEBUG
 *@default 0
 *
 **/

var MOBLERDEBUG = 0;

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
 */

function ConfigurationModel(controller) {
	this.configuration = {};
	this.urlToLMS = "";
	this.logoimage = "";
	this.logolabel = "";
	
	var self=this;
	
	// this.configuration.appAuthenticationKey = "";
	// this.configuration.userAuthenticationKey = "";
	// this.storeData();

	moblerlog("Configuration Storage: "+ localStorage.getItem("configuration"));

	this.controller = controller;

	this.loadData();

	this.selectServerData(DEFAULT_SERVER);
	
	// initialize the configuration if it does not exist
	// this.createConfiguration();
	
	$(document).bind("statisticssenttoserver", function() {
		
		self.sendLogoutToServer();
		moblerlog("user logged out");
		
		self.configuration = {
				"appAuthenticationKey": self.configuration.appAuthenticationKey,
				"userAuthenticationKey" : "",
				"learnerInformation" : {
					"userId" : 0
				},
				"statisticsLoaded": false
		};
		self.storeData();
		
		// drop statistics data table from local database
		self.controller.models['answers'].deleteDB();
	});

}

/**
 * stores the data into the local storage (key = "configuration") therefore the
 * json object is converted into a string
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
 * loads the data from the local storage (key = "configuration") therefor the
 * string is converted into a json object
 */
ConfigurationModel.prototype.loadData = function() {
	var configObject;
	try {
		configObject = JSON.parse(localStorage.getItem("configuration"));
	} catch (err) {
		moblerlog("error! while loading");
	}

	moblerlog("configObject: " + JSON.stringify(configObject));

	if (!configObject) {
		configObject = {
			loginState : "loggedOut"
			//statisticsLoaded: "false"
		};
	}

	// if (!configObject.loginState) { //if no configuration is available, a new
	// one is created
	// configObject = this.createConfiguration();
	// }

	this.configuration = configObject;

};

/**
 * loads the configuration data from the server and stores it in the local
 * storage when all data is loaded, the authenticationready event is triggered
 */
ConfigurationModel.prototype.loadFromServer = function() {
	var self = this;
	if (this.configuration.userAuthenticationKey
			&& this.configuration.userAuthenicationKey !== "") {
		$
				.ajax({
					url : self.urlToLMS + '/authentication.php',
					type : 'GET',
					dataType : 'json',
					success : function(data) {
						moblerlog("success");
                        moblerlog("JSON: " + data);
						var authenticationObject;
						try {
							authenticationObject = data;
							moblerlog("authenticationData from server");
						} catch (err) {
							moblerlog("Error: Couldn't parse JSON for authentication");
							authenticationObject = {};
						}

					    self.configuration.learnerInformation = authenticationObject.learnerInformation;
						self.configuration.globalSynchronizationState = authenticationObject.globalSynchronizationState;
                      
                      
						self.storeData();
                        self.controller.setupLanguage();

						$(document).trigger("authenticationready",
								authenticationObject.learnerInformation.userId);
					},
					error : function() {
						moblerlog("Error while authentication to server");
						$(document).trigger("authenticationfailed");
					},
                      beforeSend : function setHeader(xhr) {
                      xhr.setRequestHeader('sessionkey',
                                           self.configuration.userAuthenticationKey);
                      }
                      
				});

			}
};


//logs in user
 
ConfigurationModel.prototype.login = function(username, password) {
	moblerlog("client key: " + this.configuration.appAuthenticationKey);

	username = username.trim(); //remove leading and trailling white spaces
	
	passwordHash = faultylabs.MD5(password);
	moblerlog("md5 password: " + passwordHash);
	challenge = faultylabs.MD5(username + passwordHash.toUpperCase()
                               + this.configuration.appAuthenticationKey);
	var auth = {
		"username" : username,
		"challenge" : challenge
	};

	this.sendAuthToServer(auth);
	
};

//logs out user

ConfigurationModel.prototype.logout = function() {
	//send statistics data to server
	this.controller.models['statistics'].sendToServer();
	
	var self = this;


//	$(document).bind("statisticssenttoserver", function() {

//	self.sendLogoutToServer();
//	moblerlog("user logged out");

//	self.configuration = {
//	"appAuthenticationKey": self.configuration.appAuthenticationKey,
//	"userAuthenticationKey" : "",
//	"learnerInformation" : {
//	"userId" : 0
//	},
//	"statisticsLoaded": false
//	};
//	self.storeData();

//	// drop statistics data table from local database
//	self.controller.models['answers'].deleteDB();
//	});
	
	// remove all question pools and all pending question pool requests
	var c, courseList = this.controller.models["course"].courseList;
	if (courseList) {
		for ( c in courseList ) {
			localStorage.removeItem("questionpool_" + courseList[c].id);
			localStorage.removeItem("pendingQuestionPool_" + courseList[c].id);
		}
	}
	
	// remove course list and pending course list request
	localStorage.removeItem("pendingCourseList");
	localStorage.removeItem("courses");
	this.controller.models['course'].resetCourseList();
	

};


//sends authentication data to the server

ConfigurationModel.prototype.sendAuthToServer = function(authData) {
	var self = this;
	moblerlog("url: " + self.urlToLMS + '/authentication.php');
	$
			.ajax({
				url : self.urlToLMS + '/authentication.php',
				type : 'POST',
				dataType : 'json',
				success : function(data) {
					if (data && data['message']) {
						switch (data['message']) {
						case "invalid client key":
							moblerlog("invalid client key - reregister")
							self.register();
							$(document).trigger("authenticationfailed", "invalidclientkey");
							break;
						case "wrong user data":
							moblerlog("Wrong username or password!")
							$(document).trigger("authenticationfailed", "nouser");
							break;
						default:
							break;
						}
					} else if (data && data.userAuthenticationKey !== "") {
						moblerlog("userAuthenticationKey: "+ data.userAuthenticationKey);
						self.configuration.userAuthenticationKey = data.userAuthenticationKey;
						self.configuration.learnerInformation = data.learnerInformation;
						self.storeData();

						$(document).trigger("authenticationready",
								self.configuration.userAuthenticationKey);
						self.controller.setupLanguage();
						
						//get statistics data from server
						self.controller.models['statistics'].loadFromServer();
					} else {
						moblerlog("no error message from server and no session key received");
						$(document).trigger("authenticationfailed", "connectionerror");
					}
				},
				error : function(jqXHR, textStatus, errorThrown) {
					moblerlog("Error while authentication to server: status:" + jqXHR.status + ", " + jqXHR.responseText);
					$(document).trigger("authenticationfailed",
							"connectionerror");
				},
                  beforeSend :function setHeader(xhr) {
                  xhr.setRequestHeader('uuid', device.uuid);
                  xhr.setRequestHeader('appid', APP_ID);
                  xhr.setRequestHeader('authdata', authData.username + ":"
                                       + authData.challenge);
                  }
			});

	
};

/**
 * invalidates the specified session key or if no session key is specified the
 * current session key
 */
ConfigurationModel.prototype.sendLogoutToServer = function(
		userAuthenticationKey) {
	var sessionKey,self = this;

	if (userAuthenticationKey) {
		sessionKey = userAuthenticationKey;
	} else {
		sessionKey = self.configuration.userAuthenticationKey;
	}
	$
			.ajax({
				url : self.urlToLMS + '/authentication.php',
				type : 'DELETE',
				dataType : 'json',
				success : function() {

				},
				error : function() {
					moblerlog("Error while logging out from server");
					localStorage.setItem("pendingLogout", sessionKey);
				},
				beforeSend : setHeader
			});

	function setHeader(xhr) {
		moblerlog("session key to be invalidated: " + sessionKey);
		xhr.setRequestHeader('sessionkey', sessionKey);
	}
};


//@return true if user is logged in, otherwise false

ConfigurationModel.prototype.isLoggedIn = function() {
	return (this.configuration.userAuthenticationKey && this.configuration.userAuthenticationKey !== "") ? true
			: false;
};

//@return the full name of the user

ConfigurationModel.prototype.getDisplayName = function() {
	return this.configuration.learnerInformation.displayName;
};

//@return the username

ConfigurationModel.prototype.getUserName = function() {
	return this.configuration.learnerInformation.userName;
};

//@return the user id

ConfigurationModel.prototype.getUserId = function() {
	return this.configuration.learnerInformation.userId;
};


//@return the email address of the user

ConfigurationModel.prototype.getEmailAddress = function() {
	return this.configuration.learnerInformation.emailAddress;
};

//@return the language of the user

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

// @return the session key of the user

ConfigurationModel.prototype.getSessionKey = function() {
	return this.configuration.userAuthenticationKey;
};

//if no configuration is stored in the local storage, a new one is created

ConfigurationModel.prototype.createConfiguration = function() {
	moblerlog("create configuration");

	if (!localStorage.configuration) {
		initConfiguration();
	}

	try {
		return JSON.parse(localStorage.getItem("configuration"));
	} catch (err) {
		return {};
	}
};


//sends the registration request to the server, it is called whenever my client(app) key is empty
ConfigurationModel.prototype.register = function() {
	var self = this;
	moblerlog("enters regsitration");
	var deviceID = device.uuid;

	$
			.ajax({
				url : self.urlToLMS + '/registration.php',
				type : 'GET',
				dataType : 'json',
				success : appRegistration,
				error : function(request) {
                  moblerlog("ERROR status code is : " + request.status);
                  moblerlog("ERROR returned data is: "+ request.responseText);
                  moblerlog("Error while registering the app with the backend");
				},
				beforeSend : setHeaders
			});

	function setHeaders(xhr) {
		xhr.setRequestHeader('AppID', APP_ID);
		xhr.setRequestHeader('UUID', deviceID);
		moblerlog("register uuid:" + deviceID);
	}

	function appRegistration(data) {
		// if we don't know a user's language we try to use the phone's language.
        language = navigator.language.split("-");
        language_root = (language[0]);

		moblerlog("in app registration");
		// load server data from local storage
		var urlsToLMS;
		var urlsToLMSString = localStorage.getItem("urlsToLMS");
		moblerlog("urlToLMSString is"+urlsToLMSString);
		try {
			urlsToLMS = JSON.parse(urlsToLMSString);
			moblerlog("urls to lms parsed");
		} catch(err) {
			moblerlog("Error while parsing urlsToLMS: " + err);
		}
	
		urlsToLMS[DEFAULT_SERVER] = {};
		
		// add client key for current lms
		moblerlog("Received client key: " + data.ClientKey);
		urlsToLMS[DEFAULT_SERVER].clientKey = data.ClientKey;
		// store server data in local storage
		localStorage.setItem("urlsToLMS", JSON.stringify(urlsToLMS));
		
		self.configuration.appAuthenticationKey = data.ClientKey;
		self.configuration.defaultLanguage = data.defaultLanguage || language_root;
		self.storeData();
		// we can now safely load the user data
		self.loadFromServer();
	}

};

/**
 * selects the url to the lms and the client key depending on the 
 * specified server name
 */
ConfigurationModel.prototype.selectServerData = function(servername) {
	var urlsToLMSString = localStorage.getItem("urlsToLMS");
	var urlsToLMS;
	if (urlsToLMSString && urlsToLMSString.length > 0) {
		try {
			urlsToLMS = JSON.parse(urlsToLMSString);
		} catch(err) {
			moblerlog("Error while parsing urlsToLMS: " + err);
		}	
	} else {
		// create an empty data structure for our clientKeys
		urlsToLMS ={};
		localStorage.setItem("urlsToLMS", JSON.stringify(urlsToLMS));
//		localStorage.setItem("urlsToLMS", JSON.stringify(URLS_TO_LMS));
//		urlsToLMS = URLS_TO_LMS;
	}
	
	this.urlToLMS  = URLS_TO_LMS[servername].url;
	this.logoimage = URLS_TO_LMS[servername].logoImage;
	this.logolabel = URLS_TO_LMS[servername].logoLabel;
	
	var clientKey;
	if (urlsToLMS[servername] ) {
		moblerlog("the current lms has already a client key");
		clientKey = urlsToLMS[servername].clientKey;
	}
	
	if (!clientKey || clientKey.length === 0) {
		moblerlog("registration is done");
		this.register();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
	} else {
		this.loadFromServer();
	}
	
	
};


ConfigurationModel.prototype.getServerURL = function() {
	
	
	return this.urlToLMS;
	

};


ConfigurationModel.prototype.getServerLogoImage = function() {
	
		return this.logoimage;

};

ConfigurationModel.prototype.getServerLogoLabel = function() {

	return this.logolabel;

};

