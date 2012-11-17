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

/*jslint vars: true, sloppy: true */


/**
 * @Class LogoutView
 *  View for displaying the settings which are:
 *  - name (first name and last name) of the user
 *  - email address of user
 *  - selected language
 *  @constructor
 *  - it sets the tag ID for the settings view
 *  - assigns various event handlers when taping on various elements of the view
 *    such as the close button, the final logout button 
 **/
function LogoutView() {
	var self = this;

	self.tagID = 'logoutConfirmationView';
	
	jester($('#closeIcon')[0]).tap(function(){ self.cancel(); } );  
	jester($('#logOut')[0]).tap(function(event){ self.logout(); event.stopPropagation(); } );  
} 


/**
 * tap does nothing
 * @prototype
 * @function handleTap
 **/
LogoutView.prototype.handleTap = doNothing;

/**
 * swipe does nothing
 * @prototype
 * @function handleSwipe
 **/
LogoutView.prototype.handleSwipe = doNothing;

/**
 * pinch does nothing
 * @prototype
 * @function handlePinch
 **/
LogoutView.prototype.handlePinch = function(){
    controller.transitionToSettings();
};


/**
 * opens the view
 * @prototype
 * @function open
 **/
LogoutView.prototype.open = openView;


/**
 * closes the view
 * @prototype
 * @function close
 **/
LogoutView.prototype.close = closeView;

/**
 *click on the cancel button leads to settings
 * @prototype
 * @function cancel
 **/
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