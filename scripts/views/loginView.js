
function LoginView() {
    var self = this;
    
    self.tagID = 'loginForm';
    
    $('#loginButton').click(function(){ self.clickLoginButton(); } );
    
} 

LoginView.prototype.handleTap = doNothing;
LoginView.prototype.handleSwipe = doNothing;

LoginView.prototype.open = openView;
LoginView.prototype.close = closeView;

LoginView.prototype.clickLoginButton = function() {
    var user, password;
    
    function cbLoginSuccess() {
        controler.transition('courseList');
    }
    
    function cbLoginFailure() {
        // show a login error message
    }
    
    if ( $("#usernameInput").value  && $("#password").value ) {
        // make it visible to the user that we are waiting for the server
        authenticationModel.login($("#usernameInput").value, 
                                  $("#password").value, 
                                  cbLoginSuccess, 
                                  cbLoginFailure);
    }
};

