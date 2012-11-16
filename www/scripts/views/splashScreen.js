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

*/
 
/*jslint vars: true, sloppy: true */


/**
 * @class SplashScreen
 * View for displaying the splash screen
 * @constructor 
 * it sets the tag ID for the splash screen view
 * @param {String} controller
 */
function SplashScreen(controller) {

    var self = this;
    self.controller = controller;
    self.tagID = 'splashScreen';

}

/**
 * Nothing is executed if the user pinches on the splash screen
 * @prototype
 * @function handlePinch.
 **/
SplashScreen.prototype.handlePinch = doNothing;

 
/**
 * Nothing is executed if the user taps on the splash screen
 * @prototype
 * @function handleTap.
 **/
SplashScreen.prototype.handleTap = doNothing;


/**
 * Nothing is executed if the user swipes on the splash screen
 * @prototype
 * @function handleSwipe
 **/
SplashScreen.prototype.handleSwipe = doNothing;




/**
 *Open the view does nothing, the controller handles the transition to login view
 * @prototype
 * @function open
 **/
SplashScreen.prototype.open = doNothing;



/**
 * Closes the view
 * @prototype
 * @function closeDiv
 **/
SplashScreen.prototype.closeDiv = closeView;


 
/**
 * hides the loading icon
 * closes the view if the user is already logged in
 * @prototype
 * @function close
 **/
SplashScreen.prototype.close = function() {
     $("#loading").remove();
    if( this.controller.models["authentication"].isLoggedIn() ) {
        this.closeDiv();
    }
};


/**
 * shows the user that he/she has no internet connection
 * @prototype
 * @function showNoConnectionMessage
 **/ 
SplashScreen.prototype.showNoConnectionMessage = function() {
	$("#loginForm").text("Sorry, you need to be online to connect to your LMS");
}

