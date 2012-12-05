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
 * @class LMSModel 
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
	this.controller = controller;
	//localStorage.removeItem("urlsToLMS"); // for debugging only
	this.loadData();

	this.activeRequestToken = "";
	this.defaultLanguage = "";
	
	this.lastTryToRegister = [];
	
	this.setActiveServer(this.lmsData.activeServer);
}

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
	var lmsString=localStorage.getItem("urlsToLMS") ;
	//if there is an item in the local storage with the name "configuration"
	//then get it by parsing the string and convert it into a json object
	if (lmsString && lmsString.length > 0){
		try {
			lmsObject = JSON.parse(lmsString);
		} catch (err) {
			moblerlog("error! while loading");
		}
	}
	else {
		//create a data structure for 
		// client keys, lms language and active flag
		lmsObject= {
				"activeServer": DEFAULT_SERVER,
				"ServerData"  : {} 
				};
		localStorage.setItem("urlsToLMS", JSON.stringify(lmsObject));
	}

	moblerlog("lmsObject in localstorage: " + JSON.stringify(lmsObject));

	this.lmsData = lmsObject;
};



/**
* Stores the data into the local storage (key = "urlsToLMS") therefore the
* json object is converted into a string
* @prototype
* @function storeData
*/
LMSModel.prototype.storeData = function() {
	var lmsString;
	try {
		lmsString = JSON.stringify(this.lmsData);
	} catch (err) {
		lmsString = "";
		moblerlog("error while storing");
	}
	moblerlog("lms string"+lmsString);
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
};


/**
* @prototype
* @function getActiveServerLabel  
* @return {String} logolabel, the info label of the activated server
*/
LMSModel.prototype.getActiveServerLabel = function() {
	return this.activeServerInfo.logoLabel;
};

/**
* @prototype
* @function getActiveServerURL 
* @return {String} url, the url activated server
*/

LMSModel.prototype.getActiveServerURL = function() {
	return this.activeServerInfo.url;
};


/**
* @prototype
* @function getActiveServerName  
* @return {String} servername, the name of the activated server
*/

LMSModel.prototype.getActiveServerName = function() {
	return this.activeServerInfo.servername;	
};

/**
* @prototype
* @function getActiveServerClientKey  
* @return {String} servername, the name of the activated server
*/
LMSModel.prototype.getActiveRequestToken = function() {
	
	return this.activeRequestToken;
};

// TODO: Documentation
LMSModel.prototype.getDefaultLanguage = function() {
	return this.defaultLanguage;
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
	var urlsToLMS, lmsObject;
	this.activeServerInfo = this.findServerInfo(servername);
	
	self.loadData();
	
	var requestToken, lmsObject = self.lmsData.ServerData;
	moblerlog("setActiveServer: where is the serverdata? " + lmsObject );
	// a sanity check if the selected lms exists in the local storage
	// in order to get its client key only in this case
	if (lmsObject[servername]) {
		moblerlog("the current lms has already a client key");
		// then get this client key from the local storage 
		requestToken = lmsObject[servername].requestToken;
	}
	
	 if (!requestToken || requestToken.length === 0){
		 moblerlog("registration  should be done");
		//register the app with the server in order to get an app/client key
		// CGL: this should only happen if the user select the LMS not when the LMSView draws the list. 
		if (self.controller.isOffline()){
			moblerlog("offline and cannot click and register");
			$(document).trigger("lmsOffline", servername);
		}	
		else { // we are online 
			moblerlog("will try to do a registration because we are online");

			// if we had tried to register for the specific server 
			// and we failed and if this failure took place less than 24 hours ago
			// then display to the usre the lms registation message t
			if	(self.lastTryToRegister[servername] > ((new Date()).getTime() - 24*60*60*1000)){
				moblerlog("less than 24 hours have passed");
				$(document).trigger("lmsNotRegistrableYet", servername);			
			}else {
				moblerlog("do the registration");
				self.register(servername);  //we will get a client key
			}//end of else
		}	
		
	} 
	else {
		//	if the server was not the active one
		// we do this sanity check because in the case
		// of the default server it has already the active = true in the constructor.
		if (this.lmsData.activeServer !== servername){
			this.lmsData.activeServer = servername;
		}
		
			
		this.storeData();
		
		// Christian Notes: before we finish we need to store the new active server to the localStorage
		// self.storeData(); or something like this ... 
		// Evangelia: This is already done in the registration, the only thing that was added is that
		// the active property for the specific servername was set to true
		
		this.defaultLanguage = lmsObject[servername].defaultLanguage;
		this.activeRequestToken = requestToken;
		
		$(document).trigger("activeServerReady");
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
	var activeURL = self.getActiveServerURL();

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
					self.lastTryToRegister[servername] = (new Date()).getTime();
                  moblerlog("ERROR status code is : " + request.status);
                  moblerlog("ERROR returned data is: "+ request.responseText);
                  moblerlog("Error while registering the app with the backend");
                  // remember in lmsData that the server made a booboo
                  
                  $(document).trigger("registrationfailed", servername);
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
		self.loadData();
		
		//create an empty structure for the client keys of the different servers
		self.lmsData.ServerData[servername] = {};
		// store server data in local storage
		// requestToken refers to OAuth terminology
		self.lmsData.ServerData[servername].requestToken = data.ClientKey;
		self.lmsData.ServerData[servername].defaultLanguage = data.defaultLanguage || language_root;
		//self.lmsData.servername.activeServername = servername;
		
		self.storeData();
				
		self.setActiveServer(servername);	
	}
};


