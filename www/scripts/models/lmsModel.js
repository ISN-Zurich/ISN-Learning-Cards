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
	
	//local storage item that will store the clientkey
	// and default language for the LMS's
	this.lmsData= {};
	
	this.activeClientKey = "";
	this.defaultLanguage = "";
	this.logoimage ="";
	this.logolabel = "";
	this.servername ="";
	this.serverURL="";
	
	// THIS LOADS THE USER'S LMS SELECTION AND PREVIOUS CLIENT KEYS
	self.loadData();
	
	// CHECK IF THE USER SELECTED A DIFFERENT SERVER THAN THE DEFAULT_SERVER
	var myServerName = DEFAULT_SERVER;
	// if (!this.lmsData.DEFAULT_SERVER.active) {
	   // IF WE HAVE A DIFFERENT ACTIVE SERVER WE USE IT
	  //    myServerName = self.findActiveServer(); 
   // }
	 
	// OTHERWISE WE USE THE DEFAULT SERVER
	// THIS FUNCTION  SETS THE ACTIVE SERVER AND DO EVERYTHING THAT IS NEEDED TO WORK WITH IT
	self.setActiveServer(myServerName); 
	
}



/**
 * Finds the active server
 * In the local storage the active server has a
 * flag active = true
 * @prototype
 * @function findActiveServer
 */
LMSModel.prototype.findActiveServer = function() {
//	var activeServer, i;
//	if (this.lmsData){
//		for (i in this.lmsData) {
//	if (this.lmsData[i].active === true ){
//				activeServer = i;
//			}	
//		}
//	}
//	return activeServer;
};



/**
 * Finds information from the server
 * @prototype
 * @function findServerInfo
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
		lmsObject.DEFAULT_SERVER.active = true; 
	}
	this.lmsData = JSON.stringify(lmsObject);
};



/**
* Stores the data into the local storage (key = "urlsToLMS") therefore the
* json object is converted into a string
* @prototype
* @function storeData
*/
ConfigurationModel.prototype.storeData = function() {
	var lmsString;
	try {
		lmsString = JSON.stringify(this.lmsData);
	} catch (err) {
		lmsString = "";
		moblerlog("error while storing");
	}
	moblerlog(lmsString);
	localStorage.setItem("urlsToLMS", lmsString);

	moblerlog("LMS Storage after storeData: "+ localStorage.getItem("urlsToLMS"));
};


/**
 * @prototype
 * @function getLMSData
 * @return {Array} the array that contains all information for all servers
 */
LMSModel.prototype.getLMSData = function() {
	return URLS_TO_LMS;
};



/**
* @prototype
* @function getServerLogoImage 
* @return {String} logoimage, the Url of the logo image of the activated server 
*/
LMSModel.prototype.getActiveServerImage = function() {
	return this.activeServerInfo.logoImage;
	//return this.logoImage;
};


/**
* @prototype
* @function getActiveServerLabel  
* @return {String} logolabel, the info label of the activated server
*/
LMSModel.prototype.getActiveServerLabel = function() {
	return this.activeServerInfo.logoLabel;
	//return this.logoLabel;
};

/**
* @prototype
* @function getActiveServerURL 
* @return {String} url, the url activated server
*/

LMSModel.prototype.getActiveServerURL = function() {
	return this.activeServerInfo.url;
	//return this.serverURL;
};


/**
* @prototype
* @function getActiveServerName  
* @return {String} servername, the name of the activated server
*/

LMSModel.prototype.getActiveServerName = function() {
	return this.activeServerInfo.servername;
	// return this.lmsData.servername;
};

/**
* @prototype
* @function getActiveServerClientKey  
* @return {String} servername, the name of the activated server
*/
LMSModel.prototype.getActiveServerClientKey = function() {
	
	return this.activeClientKey;
};


/**
 * 
 * @function setActiveServer 
 * @param {String} servername, the activated server
 * 
 * THIS FUNCTION IS ONLY USED BY THE LMSVIEW or the constructor
 */
LMSModel.prototype.setActiveServer = function(servername) {
	var self=this;
	this.activeServerInfo = this.findServerInfo(servername);
	self.loadData();
	 if (!this.lmsData.servername.appAuthenticationKey && this.lmsData.servername.appAuthenticationKey.length === 0){
		moblerlog("registration  should be done");
		//register the app with the server in order to get an app/client key
		// CGL: this should only happen if the user select the LMS not when the LMSView draws the list. 
		this.register(servername);  //we will get a client key
	}
	else {
		//if the server was not the active one
		// we do this sanity check because in the case
		// of the default server it has already the active = true in the constructor.
		if (!this.lmsDadata.servername.active){
			this.lmsDadata.servername.active = true;
		}
		// Christian Notes: before we finish we need to store the new active server to the localStorage
		// self.storeData(); or something like this ... 
		// Evangelia: This is already done in the registration, the only thing that was added is that
		// the active property for the specific servername was set to true
		
		this.logoimage = this.activeServerInfo.logoimage;
		this.logolabel = this.activeServerInfo.logolabel;
		this.servername = this.activeServerInfo.servername;
		this.serverURL= this.activeServerInfo.url;
		this.defaultLanguage = this.lmsData.defaultLanguage;
		this.lmsData.servername = this.activeServerInfo.servername; // i am not sure if this one is needed

		//a sanity check if the selected lms exists in the local storage
		//in order to get its client key only in this case
		if (this.lmsData.appAuthenticationKey) {
			moblerlog("the current lms has already a client key");
			//then get this client key from the local storage 
			//this.activeClientKey = urlsToLMS[servername].clientKey;
			this.activeClientKey = this.lmsData.appAuthenticationKey;
		}
		
		$(document).trigger("activeServerIsSet");
	}
};


/**
* Sends the registration request (appId ,device id) to the server and waiting to get back the app key 
* It is called whenever the client(app) key is empty
* @prototype
* @function register 
*/
LMSModel.prototype.register = function(servername) {
	var self = this;
	moblerlog("enters regsitration");
	//phone gap property to get the id of a device
	var deviceID = device.uuid;
	var activeURL = self.controller.getActiveURL();

	$
			.ajax({
				//url : self.urlToLMS + '/registration.php',
				url:  activeURL + '/registration.php',
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
		urlsToLMS[servername] = {};
		
       // loadData();
        
        moblerlog("Received client key: " + data.ClientKey);
        urlsToLMS[servername].clientKey = data.ClientKey;
        moblerlog("Received client key: " + data.ClientKey);
        urlsToLMS[servername].defaultLanguage = data.defaultLanguage || language_root;
        // store server data in local storage
        localStorage.setItem("urlsToLMS", JSON.stringify(urlsToLMS));
		
		// store server data in local storage
		self.lmsData.servername.appAuthenticationKey = data.ClientKey;
		self.lmsData.servername.defaultLanguage = data.defaultLanguage || language_root;
		//self.lmsData.servername.activeServername = servername;
		
		self.storeData();	
		//trigger the event to be ready
		$(document).trigger("registrationready");
		
		self.setActiveServer(servername);
		
	}

};


