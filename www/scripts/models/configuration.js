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
 * @param {String} controller 
 */

function ConfigurationModel(controller) {
	var self=this;
	this.controller = controller;
	//initialization of model's variables
	this.configuration = {};
	this.urlToLMS = "";
	this.logoimage = "";
	this.logolabel = "";
		
	// load data from the local storage if any
	this.loadData();
	
	//proceed by selecting the data of the default server such as url, image, logo, label
	//store in its url in local storage item
	//register if there is no client key otherwise load data from server
	this.selectServerData(DEFAULT_SERVER);

	/**It is triggered after the successful all statistics data are sent to the server. This happens when the user logsout.
	 * @event statisticssenttoserver
	 * @param:a callback function that sends pending data to the server and clears all information from the local storage.
	 * Only the application key remains in the local storage, because it is unique for a specific device for a specific application.
	*/
	
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
		
		//after clearing data from the local storage, save the changes to the local storage item
		self.storeData();
		
		// drop statistics data table from local database
		self.controller.models['answers'].deleteDB();
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
 * @function loadData
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
			loginState : "loggedOut"
			//statisticsLoaded: "false"
		};
	}

	this.configuration = configObject;

};

/**
 * Loads the configuration data from the server such as learner information and synchronization state
 * and stores it in the local storage. When all data is loaded, the authenticationready event is triggered
 * @prototype
 * @function loadFromServer
 */

ConfigurationModel.prototype.loadFromServer = function() {
	var self = this;
	
	//if the user is not authenticated yet
	if (this.configuration.userAuthenticationKey
			&& this.configuration.userAuthenicationKey !== "") {
		// authenticate the user by "GETing" his data/learner information from the server
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
*sent to the server.
* @prototype
* @function login
*/
 
ConfigurationModel.prototype.login = function(username, password) {
	moblerlog("client key: " + this.configuration.appAuthenticationKey);
	//remove leading and trailing white spaces
	username = username.trim(); 
	//password is encrypted by an MD5 hash
	passwordHash = faultylabs.MD5(password);
	moblerlog("md5 password: " + passwordHash);
	//challenge is computed by applying an MD5 faulty labs function on username and hashed password
	challenge = faultylabs.MD5(username + passwordHash.toUpperCase()
                               + this.configuration.appAuthenticationKey);
	var auth = {
		"username" : username,
		"challenge" : challenge
	};
	
	//send username and challenge to the server
	this.sendAuthToServer(auth);
	
};

/**
* Logs out user. When logging out the statistics are sent to the server and the local storage is cleared
* @prototype
* @function logout
*/

ConfigurationModel.prototype.logout = function() {
	//send statistics data to server
	this.controller.models['statistics'].sendToServer();
	
	var self = this;

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




/**
* Sends authentication data (username, challenge) to the server
* @prototype
* @function sendAuthToServer
*/

ConfigurationModel.prototype.sendAuthToServer = function(authData) {
	var self = this;
	moblerlog("url: " + self.urlToLMS + '/authentication.php');
	$
			.ajax({
				url : self.urlToLMS + '/authentication.php',
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
							self.register();
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
* Invalidates the specified session key or if no session key is specified the
* current session key
* @prototype
* @function sendLogoutToServer
* @param userAuthenticationKey
*/


ConfigurationModel.prototype.sendLogoutToServer = function(userAuthenticationKey) {
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
				//the logout from the server was done successfully
				success : function() {

				},
				//there was an error while logging out
				//it could be loss of internet connection or any other error that stoped the process
				error : function() {
					moblerlog("Error while logging out from server");
					//adding in the local storage the session key of the pending
					localStorage.setItem("pendingLogout", sessionKey);
				},
				//sends via header the session key in order it to be validated
				beforeSend : setHeader
			});

	function setHeader(xhr) {
		moblerlog("session key to be invalidated: " + sessionKey);
		xhr.setRequestHeader('sessionkey', sessionKey);
	}
};



/**
* Invalidates the specified session key or if no session key is specified the
* current session key
* @prototype
* @function isLoggedIn
* @return true if user is logged in, otherwise false
*/

ConfigurationModel.prototype.isLoggedIn = function() {
	return (this.configuration.userAuthenticationKey && this.configuration.userAuthenticationKey !== "") ? true
			: false;
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


/**
 * if no configuration is stored in the local storage, a new one is created
* @prototype
* @function getSessionKey 
*/

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

/**
* Sends the registration request to the server and waiting to get back the app key 
* It is called whenever the client(app) key is empty
* @prototype
* @function register 
*/

ConfigurationModel.prototype.register = function() {
	var self = this;
	moblerlog("enters regsitration");
	//phone gap property to get the id of a device
	var deviceID = device.uuid;

	$
			.ajax({
				url : self.urlToLMS + '/registration.php',
				type : 'GET',
				dataType : 'json',
				success : appRegistration,
				// if no registration is done, then use the request parameter
				// to display the error that created the problem in the console
				error : function(request) {
                  moblerlog("ERROR status code is : " + request.status);
                  moblerlog("ERROR returned data is: "+ request.responseText);
                  moblerlog("Error while registering the app with the backend");
				},
				//during the registration we send via headers the app id and the device id
				beforeSend : setHeaders
			});

	function setHeaders(xhr) {
		xhr.setRequestHeader('AppID', APP_ID);
		xhr.setRequestHeader('UUID', deviceID);
		moblerlog("register uuid:" + deviceID);
	}

	
	/**
	 * In case of a successful registration we store in the local storage the client/app key
	 * that we received from the server. Additionally we store locally 
	 * the language for the interface of the app.
	 * @prototype
	 * @function appRegistration
	 * @param {String} data, the data exchanged with the server during the registration
	 */
	
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
	
		//create an empty structure for the client keys of the different servers
		urlsToLMS[DEFAULT_SERVER] = {};
		
		// add client key for current lms
		moblerlog("Received client key: " + data.ClientKey);
		urlsToLMS[DEFAULT_SERVER].clientKey = data.ClientKey;
		// store server data in local storage
		localStorage.setItem("urlsToLMS", JSON.stringify(urlsToLMS));
		// store in local storage the app Key or else client key
		// that we received during the registration from the server
		self.configuration.appAuthenticationKey = data.ClientKey;
		// store in local storage the default language for the interface logic of the app
		// if no default language is set then use the mobile device's language
		self.configuration.defaultLanguage = data.defaultLanguage || language_root;
		self.storeData();
		// we can now safely load the user data (learner information, synchronization state)
		self.loadFromServer();
	}

};

/**
 * Selects the url to the lms and the client key depending on the 
 * specified server name
 * @prototype
 * @function selectServerData
 * @param {String} servername, the name of the activated server
 */

ConfigurationModel.prototype.selectServerData = function(servername) {
	var urlsToLMSString = localStorage.getItem("urlsToLMS");
	var urlsToLMS;
	//check if exists in the local storage an object with the name "urlToLMS"
	//that stores the client keys for the various servers
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
	}
	//
	this.urlToLMS  = URLS_TO_LMS[servername].url;
	this.logoimage = URLS_TO_LMS[servername].logoImage;
	this.logolabel = URLS_TO_LMS[servername].logoLabel;

	var clientKey;
	// a sanity check if the selected lms exists in the local storage
	// in order to get its client key only in this case
	if (urlsToLMS[servername] ) {
		moblerlog("the current lms has already a client key");
		// then get this client key from the local storage 
		clientKey = urlsToLMS[servername].clientKey;
	}

	//if there is no client key for the selected server
	if (!clientKey || clientKey.length === 0) {
		moblerlog("registration is done");
		//register the app with the server in order to get an app/client key
		this.register();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
	} else {
		//if there is an app/cliet key load data of the user from the server
		this.loadFromServer();
	}
};


/**
* @prototype
* @function getServerURL 
* @return {String} urlToLMS, the Url of the activated server 
*/


ConfigurationModel.prototype.getServerURL = function() {
	return this.urlToLMS;

};

/**
* @prototype
* @function getServerLogoImage 
* @return {String} logoimage, the Url of the logo image of the activated server 
*/

ConfigurationModel.prototype.getServerLogoImage = function() {
	return this.logoimage;
};


/**
* @prototype
* @function getServerLogoLabel 
* @return {String} logolabel, the info label of the activated server
*/

ConfigurationModel.prototype.getServerLogoLabel = function() {
	return this.logolabel;
};

