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
 * This model holds the data about the different servers of the various lms's.
 * @constructor 
 * It loads data from the local storage. In the first time there are no data in the local storage and sets 
 * as active server the default server. 
 * It initializes:
 *   - the last time an unsuccessful attempt was made in order an lms to be registered
 * It sets the active server. During the initialization of the app, the call of this function will 
 * register the default server and will do the setting of the rest variables
 * It stores the last unsuccesfful date when a registration attempt failed for a server in order to accordingly visualize this to the user. 
 * @param {String} controller 
 */

function LMSModel(controller) {
	this.controller = controller;
	this.selectedLMSList = [];
	this.previousLMS= "";
	//localStorage.removeItem("urlsToLMS"); // for debugging only
	this.loadData();
	this.lastTryToRegister = [];
	this.temporaryFailure="";
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
		//create a data structure for storing lms info in the local storage
		// ServerData will store clientkey and default language for each server
		lmsObject= {
				//"activeServer": DEFAULT_SERVER,
				"activeServer": getActiveServer(),
				"previousServer": "",
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
 * This function makes use of the static variable URLS_TO_LMS 
 * that stores information for all servers
 * @prototype
 * @function getLMSData
 * @return {Array} the array that contains the content of the global URLS_TO_LMS variable
 */
LMSModel.prototype.getLMSData = function() {
	return debugActivate();
};



/**
* @prototype
* @function getActiveServerImage 
* @return {String} logoimage, the Url of the logo image of the active server 
*/
LMSModel.prototype.getActiveServerImage = function() {
	return this.activeServerInfo.logoImage;
};


/**
* @prototypegetActiveServerLabel
* @function getActiveServerLabel  
* @return {String} logolabel, the info label of the active server
*/
LMSModel.prototype.getActiveServerLabel = function() {
	return this.activeServerInfo.logoLabel;
};

/**
* @prototype
* @function getActiveServerURL 
* @return {String} url, the url  of the active server
*/

LMSModel.prototype.getActiveServerURL = function() {
	//http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards
	var api= this.getActiveServerAPI();
	if (api == "v1"){
		return this.activeServerInfo.url;
	}else{
		//http://yellowjacket.ethz.ch/ilias_4_2/restservice/
		return this.activeServerInfo.url.substring(0,49);
	}
};


/**
* @prototype
* @function getActiveServerName  
* @return {String} servername, the name of the active server
*/
LMSModel.prototype.getActiveServerName = function() {
	return this.activeServerInfo.servername;	
};


/**
* @prototype
* @function getActiveServerAPI   
* @return {String} serverapi, the version of API of the backend on which the lms is running
* */
LMSModel.prototype.getActiveServerAPI = function() {
	return this.activeServerInfo.API;	
};


/**
* @prototype
* @function getActiveRequestToken  
* @return {String} activeRequestToken, the client key of the active server
*/
LMSModel.prototype.getActiveRequestToken = function() {
	
	return this.activeRequestToken;
};

/**
* @prototype
* @function getDefaultLanguage  
* @return {String} defaultLanguage, the default language of the active/selected server
*/
LMSModel.prototype.getDefaultLanguage = function() {
	return this.defaultLanguage;
};


/**
 * This function is executed when we click on an item on the lms list view
 *	the selected server is set by
 *- registering itself if has not been previously registered
 *- by setting itself as the active server and store this info in the local storage
 *- by storing its client key (request token) in the local storage
 *- by storing its default language in the local storage
 * It triggers 3 events depending on internet connectivity status, on the successful or not
 * registration to the server and on the recent failed attempt to register to the server.
 * @function setActiveServer 
 * @param {String} servername, the activated server
 * 
 * THIS FUNCTION IS ONLY USED BY THE LMSVIEW or the constructor
 */
LMSModel.prototype.setActiveServer = function(servername) {
	//moblerlog("just enter setActive Server, previousLMS is "+previousLMS);
	var self=this;
	var urlsToLMS, lmsObject;
	this.activeServerInfo = this.findServerInfo(servername);
	
	self.loadData();
	
	var requestToken;
	var lastRegister; 
	var deactivate;
	var lmsObject = self.lmsData.ServerData;
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
		if (self.controller.isOffline()){
			moblerlog("offline and cannot click and register");
			$(document).trigger("lmsOffline", servername);
		}	
		else { // we are online 
			moblerlog("will try to do a registration because we are online");
			if (lmsObject[servername]){
				lastRegister=lmsObject[servername].lastRegister;
			}
			// if we had tried to register for the specific server 
			// and we failed and if this failure took place less than 24 hours ago
			// then display to the user the lms registation message 
			//if	(self.lastTryToRegister[servername] > ((new Date()).getTime() - 24*60*60*1000)){
			if (lastRegister > ((new Date()).getTime() - 60*60*1000) && DEACTIVATE){	//it was 24*60*60*1000 once every day
				moblerlog("less than 24 hours have passed for server"+servername);
				
				$(document).trigger("lmsNotRegistrableYet",[servername]);	
			}else {
				moblerlog("do the registration for server"+servername);
				$(document).trigger("registrationIsStarted", servername);
				var api=this.getActiveServerAPI(servername);
				//TODO:based on the value of the API of the lms run either the (old) register function of this model
				// or run a the new register function that will call the new backend. This new function will be created here, in the lms model.
				if (api == "v1"){
					self.register(servername); 
					//we will get a client key
				} else {
					self.registerApi2(servername);
				}
				
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
		this.defaultLanguage = lmsObject[servername].defaultLanguage;
		this.activeRequestToken = requestToken;	
		$(document).trigger("activeServerReady");
	}
};



/**
* Stores in the local storage the active server
* This step is executed within the set active server function above.
* However it is need in cases we just want the storing of the active server to take place
* without any further registration and transition to login view. This is happening in the cases where
* a server cannot be registered  and automatically the previously selected lms should be stored as 
* the active server before we close the view.
* @prototype
* @function storeActiveServer 
* @param {string} servername, the name of the previously selected lms 
*/
LMSModel.prototype.storeActiveServer = function(servername){

this.loadData();
this.activeServerInfo = this.findServerInfo(servername);
this.lmsData.activeServer=servername;
moblerlog("active server set ");
this.storeData();
	
}

/**
* 
* @prototype
* @function getActiveServer 
* @param {string} servername, the name of the active server 
*/
LMSModel.prototype.getActiveServer = function(servername){

//this.activeServerInfo = this.findServerInfo(servername);
//this.lmsData.activeServer=servername;
return this.activerServer;
	
}
/**
* Stores in the local storage the previous selected lms
* @prototype
* @function storePreviousServer 
* @param {string} servername, the name of the previously selected lms
*/
LMSModel.prototype.storePreviousServer = function(servername){

this.loadData();
this.lmsData.previousServer=servername;
moblerlog("previous server ");
this.storeData();
	
}

/**
* Returns the previously selected LMS
* @prototype
* @function getPreviousServer 
* @return {string} servername, the name of the previously selected lms
*/
LMSModel.prototype.getPreviousServer = function(){

return this.lmsData.previousServer;
	
}

/**
* Sends the registration request (appId ,device id) to the server and waiting to get back the app key 
* It is called whenever the client(app) key is empty
* @prototype
* @function register 
* @param {string, string} servername, previousLMS, the name of the currently selected lms and the name of the previously selected lms
*/
LMSModel.prototype.register = function(servername) {
	var self = this;
	moblerlog("enters regsitration");
	//phone gap property to get the id of a device
	var deviceID = device.uuid;
	var activeURL = self.getActiveServerURL();
	moblerlog("active url in register function is "+activeURL);

	$
			.ajax({
				url:  activeURL + '/registration.php',
				type : 'GET',
				dataType : 'json',
				success : appRegistration,
				// if no registration is done, then use the request parameter
				// to display the error that created the problem in the console
				error : function(request) {
                 
                  // remember in lmsData that the server made a booboo
                  
                  //***************DEACTIVATE CHECK******************************
					//if we get an error because of a probable error on the server i.e. deactivation of backend
					if (request.status === 403) { 
						if (!DEACTIVATE){
							DEACTIVATE=true;	//set the general deactivate status to true. 
							self.lmsData.ServerData[servername] = {};
							self.lmsData.ServerData[servername].deactivateFlag=true; //store and set the deactivate status to true
							self.storeData();
							var previousLMS=self.lmsData.ServerData[servername].previousServer;
						showErrorResponses(request);
						moblerlog("Error while registering the app with the backend");
						}
						$(document).trigger("registrationTemporaryfailed", [servername,previousLMS]);
					}
                  if (request.status=== 404){
                	  	self.lastTryToRegister[servername] = (new Date()).getTime();
  						self.lmsData.ServerData[servername] = {};
  						self.lmsData.ServerData[servername].lastRegister = self.lastTryToRegister[servername];
  						self.storeData();
  						$(document).trigger("registrationfailed", [servername,previousLMS]);
                  }
                  
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
				
		var DEACTIVATE=false;
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
		moblerlog("data in register is "+data);
		self.lmsData.ServerData[servername].requestToken = data.ClientKey;
		self.lmsData.ServerData[servername].defaultLanguage = data.defaultLanguage || language_root;
		self.lmsData.ServerData[servername].deactivateFlag=false;
		//self.lmsData.servername.activeServername = servername;
		self.storeData();		
		self.setActiveServer(servername);
	}
};



LMSModel.prototype.registerApi2 = function(servername) {
	var self = this;
	moblerlog("enters regsitration in API 2");
	//phone gap property to get the id of a device
	var deviceID = device.uuid;
	var activeURL = self.getActiveServerURL();
	moblerlog("active url in register 2 function is "+activeURL)
	
	$
	.ajax({
		url:  activeURL + '/oauth.php/register',
		type : 'GET',
		dataType : 'json',
		success : appRegistration,
		// if no registration is done, then use the request parameter
		// to display the error that created the problem in the console
		error : function(request) {
         
          // remember in lmsData that the server made a booboo
          
          //***************DEACTIVATE CHECK******************************
			//if we get an error because of a probable error on the server i.e. deactivation of backend
			if (request.status === 403) { 
				if (!DEACTIVATE){
					DEACTIVATE=true;	//set the general deactivate status to true. 
					self.lmsData.ServerData[servername] = {};
					self.lmsData.ServerData[servername].deactivateFlag=true; //store and set the deactivate status to true
					self.storeData();
					var previousLMS=self.lmsData.ServerData[servername].previousServer;
				showErrorResponses(request);
				moblerlog("Error while registering the app with the backend");
				}
				$(document).trigger("registrationTemporaryfailed", [servername,previousLMS]);
			}
          if (request.status=== 404){
        	  	self.lastTryToRegister[servername] = (new Date()).getTime();
					self.lmsData.ServerData[servername] = {};
					self.lmsData.ServerData[servername].lastRegister = self.lastTryToRegister[servername];
					self.storeData();
					$(document).trigger("registrationfailed", [servername,previousLMS]);
          }
          
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
				
		var DEACTIVATE=false;
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
		moblerlog("data in register is "+data);
		self.lmsData.ServerData[servername].requestToken = data.ClientKey;
		self.lmsData.ServerData[servername].defaultLanguage = data.defaultLanguage || language_root;
		self.lmsData.ServerData[servername].deactivateFlag=false;
		//self.lmsData.servername.activeServername = servername;
		self.storeData();		
		self.setActiveServer(servername);
	}
};

/**
* sets the list with the selected lms
* (it will contain one lms)
* @prototype
* @function setSelectedLMS 
* @param {string} servername, the name of the currently selected lms
*/
LMSModel.prototype.setSelectedLMS=function(selectedLMS){
	moblerlog("set selected lms");
	this.selectedLMSList = selectedLMS;
};

/**
* gets the selected lms
* @prototype
* @function getSelectedLMS 
*/
LMSModel.prototype.getSelectedLMS=function(){
	return this.selectedLMSList;
};

/**
 * check if an lms has tried to register in order to display when the lms view opens, either the 
 * deactivated mode(red cross, light grey) or the normal mode(image, text font)
 * @prototype
 * @function isRegistrable 
 * @param{string} servername, the name of the activated server
 */
LMSModel.prototype.isRegistrable = function(servername){
	moblerlog("enterisRegistrable for server"+servername);
	var self=this;
	self.loadData();
	var lastRegister; 
	var lmsObject = self.lmsData.ServerData;
	if (lmsObject[servername]){
		lastRegister=lmsObject[servername].lastRegister;
	}
	for ( i=0; i < URLS_TO_LMS.length; i++) {
		moblerlog("enter in for loop");
		if (lmsObject[servername] && lmsObject[servername].lastRegister){
		if (lastRegister > (new Date()).getTime() - 24*60*60*1000){	
			moblerlog("lms is not registrable yet");
			return false;
		//}else if (lastRegister < (new Date()).getTime() - 24*60*60*1000 || (lmsObject[servername] && !lmsObject[servername].deactivateFlag)){
		}else{
			$("#selectLMSitem"+servername).prop("disabled",false);	
			moblerlog("lms is registrable for server"+servername);
			return true;
		}}
				
		if (lmsObject[servername] && lmsObject[servername].deactivateFlag){ //if the specific lms item was inactive because of an 403 error
			moblerlog("already 403 for server"+servername);
			//try to send a registration request
			self.controller.models['lms'].storeActiveServer(servername);
			self.register(servername);
			
			// this case should be handled in the success handler of the register request.
			if (!lmsObject[servername].deactivateFlag) {
				$("#selectLMSitem"+servername).prop("disabled",false);	
				moblerlog("specific lms is active again ");
				return true;
			}
			
			moblerlog("specific lms is still deactivate");	
			return false;
		}	
		return true;
	}//end for
	
};



