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

/**
 *  @author Evangelia Mitsopoulou
*/

/*jslint vars: true, sloppy: true */




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

function LMSModel(controller) {
	var self=this;
	this.controller = controller;
	//1. initialization of model's variables
	
	//local storage item that will store the data for the LMS's
	// image, label, url
	//taken from the global property above
	this.lmsDataString=[];
	this.urlToLMS = "";
	this.logoimage = "";
	this.logolabel = "";
	self.setLMSData();	
	//proceed by selecting the data of the default server such as url, image, logo, label
	//store in its url in local storage item
	//register if there is no client key otherwise load data from server
	//self.selectServerData(DEFAULT_SERVER);
	
	// load data from the local storage if any
	//self.loadData();
	self.setActiveLMS(DEFAULT_SERVER);
}

/**
 * TODO: DOCUMENT findServerInfo
 */
LMSModel.prototype.findServerInfo = function(servername) {
	var serverinfo = {}, i;
	
	for ( i=0; i < URLS_TO_LMS.length; i++ ) {
		if (URLS_TO_LMS[i].servername === servername ){
			serverinfo =  URLS_TO_LMS[i];
		}	
	}
	
	return serverinfo;
};


/**
 * Loads the data from the local storage (key = "configuration") therefore the
 * string is converted into a json object
 * @prototype
 * @function loadData
 */
LMSModel.prototype.loadData = function() {
	var lmsObject;
	//if there is an item in the local storage with the name "configuration"
	//then get it by parsing the string and convert it into a json object
	try {
		lmsObject = JSON.parse(localStorage.getItem("urlsToLMS"));
	} catch (err) {
		moblerlog("error! while loading");
	}

	moblerlog("lmsObject: " + JSON.stringify(lmsObject));
	
	// when the app is launched and before the user logs in there is no local storage 
	// in this case there is no configuration object and it is stated in one of its properties
	// that its login status is set to "loggedOut".
	if (!lmsObject) {
		lmsObject = {};
	}
	
 	//this.lmsDataString = JSON.stringify(lmsObject);
 
};

/**
 * @prototype
 * @function setLMSData
 * @return {Array} answer, the answer of the current active question in an array format which consists of answer items
 */
LMSModel.prototype.setLMSData = function() {
   // this is history ;-)
};



/**
 * @prototype
 * @function getLMSData
 * @return {Array} answer, the answer of the current active question in an array format which consists of answer items
 */
LMSModel.prototype.getLMSData = function() {
	return URLS_TO_LMS;
};



/**
 * Selects the data (url, image, label, clientkey) of the selected lms that are stored in a global variable.
 * It stores the image, label and url of the lms in the constructor's variables.
 * It creates a data structure for storing the client keys of the lms's in local storage. 
 * @prototype
 * @function selectServerData
 * @param {String} servername, the name of the activated server
 */
LMSModel.prototype.selectServerData = function(servername) {
	var self=this;
	var serverinfo = this.findServerInfo(servername);
	
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
	
	this.urlToLMS  = serverinfo.url;
	this.logoimage = serverinfo.logoImage;
	this.logolabel = serverinfo.logoLabel;

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
		 self.controller.models['authentication'].register();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
	} else {
		//if there is an app/cliet key load data of the user from the server
		self.controller.models['authentication'].loadFromServer();
	}
};

/**
* @prototype
* @function getServerURL 
* @return {String} urlToLMS, the Url of the activated server 
*/
LMSModel.prototype.getServerURL = function(servername) {
	return this.findServerInfo(servername).url;
};

/**
* @prototype
* @function getServerLogoImage 
* @return {String} logoimage, the Url of the logo image of the activated server 
*/
LMSModel.prototype.getServerLogoImage = function(servername) {
	//return this.logoimage;
	return  this.findServerInfo(servername).logoImage;
};


/**
* @prototype
* @function getServerLogoLabel 
* @return {String} logolabel, the info label of the activated server
*/
LMSModel.prototype.getServerLogoLabel = function(servername) {
	//return this.logolabel;
	return this.findServerInfo(servername).logoLabel;	
};

// TODO: Documentation
LMSModel.prototype.getActiveServerInfo = function(servername) {
	this.activeServerInfo = this.findServerInfo(servername);
	//TODO:	 we need to register if we have no key yet
	// this.activeClientKey = "";
    if (!this.activeServerInfo.clientKey || this.activeServerInfo.clientKey.length === 0){
		moblerlog("registration is should be done");
		//register the app with the server in order to get an app/client key
		this.register();  //we will get a client key
		//this.activeServerInfo.clientKey =data.ClientKey;
	}
	
	return this.activeServerInfo;
};

LMSModel.prototype.getActiveServerURL = function() {
	return this.activeServerInfo.url;
};

LMSModel.prototype.getActiveServerClientKey = function(servername) {
	
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
	
	var clientKey;
	//a sanity check if the selected lms exists in the local storage
	//in order to get its client key only in this case
	if (urlsToLMS[servername] ) {
		moblerlog("the current lms has already a client key");
		//then get this client key from the local storage 
		clientKey = urlsToLMS[servername].clientKey;
	}
	
	return this.activeServerInfo.clientKey;
	return this.activeClientKey;
};


/**
* Sends the registration request (appId ,device id) to the server and waiting to get back the app key 
* It is called whenever the client(app) key is empty
* @prototype
* @function register 
*/
LMSModel.prototype.register = function() {
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
 * Selects the data (url, image, label, clientkey) of the selected lms that are stored in a global variable.
 * It stores the image, label and url of the lms in the constructor's variables.
 * It creates a data structure for storing the client keys of the lms's in local storage. 
 * @prototype
 * @function selectServerData
 * @param {String} servername, the name of the activated server
 */
LMSModel.prototype.selectServerData = function(servername) {
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
	this.urlToLMS  = findServerInfo(servername).url;
	this.logoimage = findServerInfo(servername).logoImage;
	this.logolabel = findServerInfo(servername).logoLabel;

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
