function LoginView() {
    var self = this;
    
    self.tagID = 'splashScreen';
    
    $('#loginButton').click(function(){ self.clickLoginButton(); } );
    
} 

LoginView.prototype.handleTap = doNothing;
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