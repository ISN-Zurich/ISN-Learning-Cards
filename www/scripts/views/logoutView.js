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

/** @author Isabella Nake
 * @author Evangelia Mitsopoulou
 *
 * View for displaying the logout confimation
 */

function LogoutView() {
    var self = this;
    
    self.tagID = 'logoutConfirmationView';
    
    jester($('#closeIcon')[0]).tap(function(){ self.cancel(); } );
    $('#logOut').click(function(event){ self.logout(); event.stopPropagation(); } );
} 


// tap, swipe and pinch do nothing

LogoutView.prototype.handleTap = doNothing;
LogoutView.prototype.handleSwipe = doNothing;
LogoutView.prototype.handlePinch = function(){
    controller.transitionToSettings();
};


//opens the view

LogoutView.prototype.open = openView;


//closes the view

LogoutView.prototype.close = closeView;

//click on the cancle button leads to settings

LogoutView.prototype.cancel = function() {
	controller.transitionToSettings();
};

/**
 * click on the logout button logs the user out and
 * shows the login view
 */
LogoutView.prototype.logout = function() {
	var config = controller.models['authentication'];
	config.logout();
	controller.transitionToLogin();
};