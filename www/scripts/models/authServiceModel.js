/*jslint vars: true, sloppy: true */

function AuthServiceModel(controller){
	var self=this;
	this.controller = controller;
	
	var lmsModel= this.controller.models.lms;
	var servername= lmsModel.getActiveServerName();
	var self.consumerKey= lmsModel.lmsData.ServerData[servername].consumerKey;
	var self.consumerSecret= lmsModel.lmsData.ServerData[servername].consumerSecret;
	var self.request_token=null;
	var self.request_token_secret=null;
	var self.verificationCode_code=null;
	
	var featuredContent_id = FEATURED_CONTENT_ID;
	//initialization of model's variables
	this.configuration = {};
	this.urlToLMS = "";
	this.logoimage = "";
	this.logolabel = "";
		
	// load data from the local storage if any
	this.loadData();
	
	/**It is triggered after the consumer key and consumer secret and 
	 * @event consumerReady
	 * @param:a callback function that sends a request to the server to calculate the request token
	 *
	 */
	$(document).bind("consumerReady", function() {
		self.getRequestToken();
	}
	
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
		moblerlog("statistics sent to server is binded");
		moblerlog("self.controller.appLoaded is "+self.controller.appLoaded);
		moblerlog("self.configuration.loginState is"+self.configuration.loginState);
		if (self.controller.appLoaded && self.configuration.loginState === "loggedOut") {
			moblerlog("before call sendLogoutToServer");
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
AuthServiceModel.prototype.storeData = function() {
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
AuthServiceModel.prototype.loadData = function() {
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
 	moblerlog("configuration login state in load data " +this.configuration.loginState);

};


AuthServiceModel.prototype.setInitParameters=function(){
    var self=this;
       
        var accessor={
        consumerKey: self.consumerKey,
        consumerSecret :self.consumerSecret,
        tokenSecret: ""
    };
    var message={
        method:"GET",
        action: "http://yellowjacket.ethz.ch/ilias_4_2/restservice/oauth.php/request_token",
        parameters: [
            ["oauth_signature_method","HMAC-SHA1"],
            ["oauth_version","1.0"]
        ]
    };

    OAuth.completeRequest(message, accessor);

    var parameters=message.parameters;
    var header_request= OAuth.getAuthorizationHeader("http://yellowjacket.ethz.ch/ilias_4_2/restservice/", parameters);
    console.log("request header is "+header_request);
    self.requestToken_header=header_request;
};



AuthServiceModel.prototype.getRequestToken=function(){
	moblerlog("enters getRequestToken in Auth Service Model");
    var self=this;
    var activeURL = lmsModel.getActiveServerURL();
    var method = "GET";
    
    
    $.ajax({
        url:  activeURL+'/oauth.php/request_token',
        type : 'GET',
        dataType : 'json',
        success : getAuthenticationInitData,
        error : function(request) {
            console.log("Error while getting request token");
            showErrorResponses(request);
            // REMINDER: tell the user that he/she it cannot get a request token
            // we must not show the login view
        },
        beforeSend : setHeaderR
    });

    function getAuthenticationInitData(data){
        console.log("success in initializing authentication and data are "+JSON.stringify(data));
               
      //store request token and request secret in the variables of the lms model
     
        lmsModel.lmsData.ServerData[servername].request_token=data.oauth_token;
        self.request_token=lmsModel.lmsData.ServerData[servername].request_token;
        
        lmsModel.lmsData.ServerData[servername].request_secret=data.oauth_token_secret;
        self.request_token_secret= lmsModel.lmsData.ServerData[servername].request_secret;
        console.log("request token is "+self.request_token);
        console.log("request token secret "+self.request_token_secret);

        // store the request token and request secret in the local storage??
        lmsModel.storeData();
        
        //try to get a verification code
        self.obtainAuthorization();
    }

    function setHeaderR(xhr) {
        self.setInitParameters();
        xhr.setRequestHeader('Authorization', self.requestToken_header);
    }
};

AuthServiceModel.prototype.obtainAuthorization = function(){
    var self=this;
    var activeURL = lmsModel.getActiveServerURL();
    
    var method="GET";
    $.ajax({
        url: activeURL+'/oauth.php/authorize',
        type : method,
        //optionally i can send in the body of the request as data the request_token
        dataType : 'json',
        success : getVerificationCode,
        error : function(request) {
        	//we usually run into this part
            console.log("Error while getting verification code");
            showErrorResponses(request);

            self.controller.transition("login");
        },
        beforeSend : setHeaderO
    });

    function getVerificationCode(data){
        console.log("get successfully verification code");
        self.verificationCode_code=data.verificationCode; 
        //since we got a verification code, we request as next step the access token
        self.requestAccessToken();
    }

    function setHeaderO(xhr,S){
        var accessor={
        	consumerKey: self.consumerKey,
        	consumerSecret : self.consumerSecret,
            tokenSecret: self.request_token_secret,
            token:self.request_token
        };
        var message={
            'method':method,
            'action': url,
            'parameters': [
                ["oauth_signature_method","HMAC-SHA1"],
                ["oauth_version","1.0"], ["oauth_token",self.request_token]
            ]
        };

        OAuth.completeRequest(message, accessor);
        var parameters=message.parameters;
        var header_request= OAuth.getAuthorizationHeader("http://yellowjacket.ethz.ch/ilias_4_2/restservice/", parameters);

        console.log('set obtainAccessToken authorization header ' + header_request);
        //create the new header the will contain also the request token
        xhr.setRequestHeader('Authorization', header_request);

        console.log('obtain header set!');
    }
};



AuthServiceModel.prototype.login = function(username,password){

	var self=this;
	var hash1= hex_sha1(email+password);
	console.log(" hash1 "+hash1);

	var string=self.token_secret +self.authentication.consumerSecret + hash1;
	var hash_pswd=hex_sha1(string);
	console.log("credentials: " + hash_pswd);
	var data= {
			"email":email,
			"credentials":hash_pswd
	};


	this.authenticateUser(data);
}



AuthServiceModel.prototype.authenticateUser = function(data){
	
	moblerlog("enter authenticate user");
	var self=this;
	var activeURL = lmsModel.getActiveServerURL();
	
    var method="POST";

    $.ajax({
        url:  activeURL+'/oauth.php/authorize',
        type : method,
        data:data,
        dataType : 'json',
        success : success,
        error : function(request) {
            console.log("Error while authenticating user");
            showErrorResponses(request);
            self.controller.transition("login");
            
           
            
            if (request.status === 403) {
				var lmsModel=self.controller.models['lms'];
				var servername=lmsModel.lmsData.activeServer;
				if (lmsModel.lmsData.ServerData[servername].deactivateFlag==false){
				turnOnDeactivate();
				showErrorResponses(request);
				moblerlog("Error while authentication to server");
				}
				$(document).trigger("authenticationTemporaryfailed");
			}else{
				moblerlog("Error while authentication to server: status:" + request.status + ", " + request.responseText);
				/**
				 * When the authentication to the server fails for any unknown reason that is independent from validity of the received data
				 * but related with any internet connectivity or server issue, the authenticationfailed and connectionerror events are triggered
				 * @event authenticationfailed
				 * @event connectionerror
				 */   
				$(document).trigger("authenticationfailed","connectionerror");
			}
            
        },
        beforeSend : setHeader
    });

    function setHeader(xhr){

        console.log("what token do we insert? " + self.getRequestquest_token);
        var accessor={
            consumerKey: self.authentication.consumerKey,
            consumerSecret : self.authentication.consumerSecret,
            tokenSecret: self.token_secret,
            token: self.request_token
        };
        console.log("consumer Secret issssss "+self.authentication.consumerSecret);
        console.log("token Secret issssss "+self.token_secret);

        var message={
            method:method,
            action: url,
            parameters: [
                ["oauth_signature_method","HMAC-SHA1"],
                ["email", email],
                ["credentials",hash_pswd ]
            ]
        };

        OAuth.completeRequest(message, accessor);
        console.log(OAuth.SignatureMethod.getBaseString(message));
        var parameters=message.parameters;
        var header_request= OAuth.getAuthorizationHeader("http://yellowjacket.ethz.ch/tools/", parameters);

        //use the Authorization header that contains also the request token and token secret
        console.log( 'set authorization header ' + header_request);
        xhr.setRequestHeader('Authorization', header_request);
    }

    function success(data){
        //get the verification code
        self.verificationCode=data.oauth_verifier;
        console.log("verificaiton code is   "+self.verificationCode);
        //grant accessToken
        self.requestAccessToken();
    }
};






AuthServiceModel.prototype.requestAccessToken = function() {
    console.log("enter request access token");
    var self=this;

    var accessor={
        consumerKey: self.authentication.consumerKey,
        consumerSecret : self.authentication.consumerSecret,
        tokenSecret: self.token_secret,
        token: self.request_token
    };

    var message={
        method:"GET",
        action: "http://yellowjacket.ethz.ch/tools/service/authentication.php/access_token",
        parameters: [
            ["oauth_signature_method","HMAC-SHA1"],
            ["oauth_verifier", self.verificationCode]
        ]
    };

    OAuth.completeRequest(message, accessor);

//	OAuth.setTimestampAndNonce(message);
//	console.log("set timestamp and nonce");
//	OAuth.SignatureMethod.sign(message, accessor);
    var parameters=message.parameters;
    var header_request= OAuth.getAuthorizationHeader("http://yellowjacket.ethz.ch/tools/", parameters);

    $.ajax({
        url:  'http://yellowjacket.ethz.ch/tools/service/authentication.php/access_token',
        type : 'GET',
        dataType : 'json',
        success : success,
        error : function(request) {
            self.controller.transition("login");
            console.log("Error while getting access token");
            showErrorResponses(request);
                       
            if (request.status === 403) {
				var lmsModel=self.controller.models['lms'];
				var servername=lmsModel.lmsData.activeServer;
				if (lmsModel.lmsData.ServerData[servername].deactivateFlag==false){
				turnOnDeactivate();
				showErrorResponses(request);
				moblerlog("Error while authentication to server");
				}
				$(document).trigger("authenticationTemporaryfailed");
			}else{
				moblerlog("Error while authentication to server: status:" + request.status + ", " + request.responseText);
				/**
				 * When the authentication to the server fails for any unknown reason that is independent from validity of the received data
				 * but related with any internet connectivity or server issue, the authenticationfailed and connectionerror events are triggered
				 * @event authenticationfailed
				 * @event connectionerror
				 */   
				$(document).trigger("authenticationfailed","connectionerror");
			}
        },
        beforeSend : setHeader
    });

    function success(data){
        //get back from request the access_token and access_secret
        console.log("success in granting access token");
        console.log("access_token is "+self.accesstoken);
        self.authentication.accessToken=data.oauth_token;
        self.authentication.accessSecret=data.oauth_token_secret;
        self.storeData();
        self.controller.initOAuth();
        self.controller.models.user.getUserProfile();
        self.controller.updateUserData();
    }

    function setHeader(xhr){
        xhr.setRequestHeader('Authorization', header_request);
    }
};

