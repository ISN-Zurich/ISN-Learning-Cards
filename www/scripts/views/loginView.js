function LoginView() {
    var self = this;
    
    self.tagID = 'splashScreen';
    
    jester($('#loginButton')[0]).tap(function(){ self.clickLoginButton(); } );

    $("#usernameInput")[0].addEventListener("focus", focusLogos);
    
    $("#password")[0].addEventListener("focus", focusLogos);
  
    $("#usernameInput")[0].addEventListener("blur",unfocusLogos);
    
    $("#password")[0].addEventListener("blur" ,unfocusLogos);
    
//    $("#usernameInput").focus(toggleLogos);
//    
//    $("#password").focus(toggleLogos);
//  
//    $("#usernameInput").blur(toggleLogos);
//    
//    $("#password").blur(toggleLogos);
    
    function focusLogos(e) {
    	console.log("focus logos " + e.currentTarget.id);
    	$("#logos").removeClass("bottom");
    	$("#logos").addClass("static");
    }
    
    function unfocusLogos(e) {
    	console.log("unfocus logos " + e.currentTarget.id);
    	$("#logos").addClass("bottom");
    	$("#logos").removeClass("static");
    }
   
} 



LoginView.prototype.handleTap = doNothing;
LoginView.prototype.handlePinch = doNothing;
LoginView.prototype.handleSwipe = doNothing;
LoginView.prototype.openDiv = openView;
LoginView.prototype.open = function() {
    this.showForm();
    this.openDiv();
};    

LoginView.prototype.close = closeView;

LoginView.prototype.clickLoginButton = function() {
    var user, password;
    
    function cbLoginSuccess() {
            console.log("is logIn");
        $("#password").blur();
        $("#usernameInput").blur();
            controller.transition('coursesList');
    }
    
    function cbLoginFailure() {
        // show a login error message
    }
    
    console.log("check logIn data"); 
    if ( $("#usernameInput").val()  && $("#password").val() ) {
            console.log("has logIn data");

        // make it visible to the user that we are waiting for the server
        controller.models['authentication'].login($("#usernameInput").val(), 
                                  $("#password").val(), 
                                  cbLoginSuccess, 
                                  cbLoginFailure);
        $("#usernameInput").val("");
        $("#password").val("");
    }
};

LoginView.prototype.showForm = function() {
    $("#loginForm").show();
};

