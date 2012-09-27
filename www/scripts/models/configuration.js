var APP_ID = "ch.ethz.isn.learningcards";
var DEFAULT_SERVER = "hornet";
var URLS_TO_LMS = {"yellowjacket":  
					{
						url: "http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards",
						clientKey: ""
					},
					"hornet":  
					{
						url: "http://hornet.ethz.ch/scorm_editor/restservice/learningcards",
						clientKey: ""
					},
					"PFP LMS":  
					{
						url: "https://pfp.ethz.ch/restservice/learningcards",
						clientKey: ""
					}
};

/**
 * This model holds the data about the current configuration
 */
function ConfigurationModel(controller) {
	this.configuration = {};
	
	// this.configuration.appAuthenticationKey = "";
	// this.configuration.userAuthenticationKey = "";
	// this.storeData();

	console.log("Configuration Storage: "
			+ localStorage.getItem("configuration"));

	this.controller = controller;

	this.loadData();

	this.selectServerData(DEFAULT_SERVER);
	
	// initialize the configuration if it does not exist
	// this.createConfiguration();

}

/**
 * stores the data into the local storage (key = "configuration") therefor the
 * json object is converted into a string
 */
ConfigurationModel.prototype.storeData = function() {
	var configString;
	try {
		configString = JSON.stringify(this.configuration);
	} catch (err) {
		configString = "";
		console.log("error while storing");
	}
	console.log(configString);
	localStorage.setItem("configuration", configString);

	console.log("Configuration Storage after storeData: "
			+ localStorage.getItem("configuration"));
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
		console.log("error! while loading");
	}

	console.log("configObject: " + JSON.stringify(configObject));

	if (!configObject) {
		configObject = {
			loginState : "loggedOut"
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
			&& this.configuration.userAuthenicationKey != "") {
		$
				.ajax({
					url : self.configuration.urlToLMS + '/authentication.php',
					type : 'GET',
					dataType : 'json',
					success : function(data) {
						console.log("success");
//						console.log("JSON: " + data);
						var authenticationObject;
						try {
							authenticationObject = data;
							console.log("authenticationData from server");
						} catch (err) {
							console
									.log("Error: Couldn't parse JSON for authentication");
							authenticationObject = {};
						}

						// if (!questionPoolObject[0]) { // if no courses are
						// available, new ones are created
						// console.log("no questionpool loaded");
						// questionPoolObject = self.createPool(data.courseID);
						// }

//						console.log("Object: " + authenticationObject);
						// authenticationObject.loginState =
						// self.configuration.loginState;
						// check if configuration in local storage is the same
						// as the one from the server
						// change local data only if there are contradictions
						// with the backend
						self.configuration.learnerInformation = authenticationObject.learnerInformation;
						self.configuration.globalSynchronizationState = authenticationObject.globalSynchronizationState;
						self.storeData();

						$(document).trigger("authenticationready",
								authenticationObject.learnerInformation.userId);
					},
					error : function() {
						console.log("Error while authentication to server");
						$(document).trigger("authenticationfailed");
					},
					beforeSend : setHeader
				});

		function setHeader(xhr) {
			xhr.setRequestHeader('sessionkey',
					self.configuration.userAuthenticationKey);
		}

	}
};

/**
 * logs in user
 */
ConfigurationModel.prototype.login = function(username, password) {
	console.log("client key: " + this.configuration.appAuthenticationKey);

	username = username.trim(); //remove leading and trailling white spaces
	
	passwordHash = faultylabs.MD5(password);
	console.log("md5 password: " + passwordHash);
	challenge = faultylabs.MD5(username + passwordHash.toUpperCase()
			+ this.configuration.appAuthenticationKey)
	var auth = {
		"username" : username,
		"challenge" : challenge
	};

	this.sendAuthToServer(auth);
	
};

/**
 * logs out user
 */
ConfigurationModel.prototype.logout = function() {
	//send statistics data to server
	this.controller.models['statistics'].sendToServer();
	
	var self = this;
	$(document).bind("statisticssenttoserver", function() {
		self.sendLogoutToServer();
		console.log("user logged out");
		
		self.configuration = {
				"appAuthenticationKey": self.configuration.appAuthenticationKey,
				"userAuthenticationKey" : "",
				"learnerInformation" : {
					"userId" : 0
				},
				"urlToLMS" : ""
		};
		self.storeData();
		
		// drop statistics data table from local database
		self.controller.models['answers'].deleteDB();
	});

	// remove all question pools and all pending question pool requests
	var courseList = this.controller.models["course"].courseList;
	if (courseList) {
		for ( var c in courseList) {
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
 * sends authentication data to the server
 */
ConfigurationModel.prototype.sendAuthToServer = function(authData) {
	var self = this;
	$
			.ajax({
				url : self.configuration.urlToLMS + '/authentication.php',
				type : 'POST',
				dataType : 'json',
				success : function(data) {
					if (data && data['message']) {
						switch (data['message']) {
						case "invalid client key":
							console.log("invalid client key - reregister")
							self.register();
							$(document).trigger("authenticationfailed", "invalidclientkey");
							break;
						case "wrong user data":
							console.log("Wrong username or password!")
							$(document).trigger("authenticationfailed", "nouser");
							break;
						default:
							break;
						}
					} else if (data && data.userAuthenticationKey != "") {
						console.log("userAuthenticationKey: "
									+ data.userAuthenticationKey);
						self.configuration.userAuthenticationKey = data.userAuthenticationKey;
						self.configuration.learnerInformation = data.learnerInformation;
						self.storeData();

						$(document).trigger("authenticationready",
								self.configuration.userAuthenticationKey);
						self.controller.setupLanguage();
						
						//get statistics data from server
						self.controller.models['statistics'].loadFromServer();
					} else {
						console.log("Wrong username or password!")
						$(document).trigger("authenticationfailed", "nouser");
					}
				},
				error : function() {
					console.log("Error while authentication to server");
					$(document).trigger("authenticationfailed",
							"connectionerror");
				},
				beforeSend : setHeader
			});

	function setHeader(xhr) {
		xhr.setRequestHeader('uuid', device.uuid);
		xhr.setRequestHeader('appid', APP_ID);
		xhr.setRequestHeader('authdata', authData.username + ":"
				+ authData.challenge);
	}
}

/**
 * invalidates the specified session key or if no session key is specified the
 * current session key
 */
ConfigurationModel.prototype.sendLogoutToServer = function(
		userAuthenticationKey) {
	var self = this;
	var sessionKey;
	if (userAuthenticationKey) {
		sessionKey = userAuthenticationKey;
	} else {
		sessionKey = self.configuration.userAuthenticationKey;
	}
	$
			.ajax({
				url : self.configuration.urlToLMS + '/authentication.php',
				type : 'DELETE',
				dataType : 'json',
				success : function() {

				},
				error : function() {
					console.log("Error while logging out from server");
					localStorage.setItem("pendingLogout", sessionKey);
				},
				beforeSend : setHeader
			});

	function setHeader(xhr) {
		console.log("session key to be invalidated: " + sessionKey);
		xhr.setRequestHeader('sessionkey', sessionKey);
	}
}

/**
 * @return true if user is logged in, otherwise false
 */
ConfigurationModel.prototype.isLoggedIn = function() {
	return (this.configuration.userAuthenticationKey && this.configuration.userAuthenticationKey != "") ? true
			: false;
};

/**
 * @return the full name of the user
 */
ConfigurationModel.prototype.getDisplayName = function() {
	return this.configuration.learnerInformation.displayName;
};

/**
 * @return the username
 */
ConfigurationModel.prototype.getUserName = function() {
	return this.configuration.learnerInformation.userName;
};

/**
 * @return the user id
 */
ConfigurationModel.prototype.getUserId = function() {
	return this.configuration.learnerInformation.userId;
};

/**
 * @return the email address of the user
 */
ConfigurationModel.prototype.getEmailAddress = function() {
	return this.configuration.learnerInformation.emailAddress;
};

/**
 * @return the language of the user
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
 * @return the session key of the user
 */
ConfigurationModel.prototype.getSessionKey = function() {
	return this.configuration.userAuthenticationKey;
};

/**
 * if no configuration is stored in the local storage, a new one is created
 */
ConfigurationModel.prototype.createConfiguration = function() {
	console.log("create configuration");

	if (!localStorage.configuration) {
		initConfiguration();
	}

	try {
		return JSON.parse(localStorage.getItem("configuration"));
	} catch (err) {
		return {};
	}
};

// it is called whenever my client(app) key is empty
ConfigurationModel.prototype.register = function() {
	var self = this;
	var deviceID = device.uuid;

	$
			.ajax({
				url : self.configuration.urlToLMS + '/registration.php',
				type : 'GET',
				dataType : 'json',
				success : appRegistration,
				error : function(request) {
                  console.log("ERROR status code is : " + request.status);
                  console.log("ERROR returned data is: "+ request.responseText);
					console
							.log("Error while registering the app with the backend");
				},
				beforeSend : setHeaders
			});

	function setHeaders(xhr) {
		xhr.setRequestHeader('AppID', APP_ID);
		xhr.setRequestHeader('UUID', deviceID);
		console.log("register uuid:" + deviceID);
	}

	function appRegistration(data) {
		// localStorage.setItem(data.ClientKey);
        // if we don't know a user's language we try to use the phone's language.
        language = navigator.language.split("-");
        language_root = (language[0]);

		console.log("in app registration");
		// load server data from local storage
		var urlsToLMS;
		var urlsToLMSString = localStorage.getItem("urlsToLMS");
		try {
			urlsToLMS = JSON.parse(urlsToLMSString);
			console.log("urls to lms parsed");
		} catch(err) {
			console.log("Error while parsing urlsToLMS: " + err);
		}
		// add client key for current lms
		console.log("Received client key: " + data.ClientKey);
		urlsToLMS[DEFAULT_SERVER].clientKey = data.ClientKey;
		// store server data in local storage
		localStorage.setItem("urlsToLMS", JSON.stringify(URLS_TO_LMS));
		
		self.configuration.appAuthenticationKey = data.ClientKey;
		self.configuration.defaultLanguage = data.defaultLanguage || language_root;
		self.storeData();
		// we can now savely load the user data
		self.loadFromServer();
	}

};

ConfigurationModel.prototype.selectServerData = function(servername) {
	var urlsToLMSString = localStorage.getItem("urlsToLMS");
	var urlsToLMS;
	if (urlsToLMSString && urlsToLMSString.length > 0) {
		try {
			urlsToLMS = JSON.parse(urlsToLMSString);
		} catch(err) {
			console.log("Error while parsing urlsToLMS: " + err);
		}	
	} else {
		localStorage.setItem("urlsToLMS", JSON.stringify(URLS_TO_LMS));
		urlsToLMS = URLS_TO_LMS;
	}
	
	this.configuration.urlToLMS = urlsToLMS[servername].url;
	
	var clientKey = urlsToLMS[servername].clientKey;
	//var clientKey = this.configuration.appAuthenticationKey;
	// this.clientKey = localStorage.getItem("ClientKey");
	if (!clientKey || clientKey.length == 0) {
		console.log("registration is done");
		this.register();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
	} else {
		this.loadFromServer();
	}
};
