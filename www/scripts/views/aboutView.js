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
 * @Class AboutView
 * View for displaying general information about the app such as:
 * - Copyright
 * - License
 * - URL to project's site on Github, where the code is documented
 *  @constructor
 *  - it sets the tag ID for the settings view
 *  - assigns event handlers when taping on close button
 * 
 **/
function AboutView() {
    var self = this;
    
    self.tagID = 'aboutView';
    
    jester($('#closeAboutIcon')[0]).tap(function(){ self.closeAbout(); } );
    
} 


/**
 * Pinch leads to course list
 * @prototype
 * @function handlePinch
 **/
AboutView.prototype.handlePinch = function() {
    controller.transitionToSettings();
};


/**
 * Tap does nothing
 * @prototype
 * @function handleTap
 **/
AboutView.prototype.handleTap = doNothing;


/**
 * swipe does nothing
 * @prototype
 * @function handleSwipe
 **/
AboutView.prototype.handleSwipe = doNothing;


/**
 * opens the view
 * @prototype
 * @function openDiv
 **/ 
AboutView.prototype.openDiv = openView;

/**
 * Opens the view after firstly
 * loading the data
 * @prototype
 * @function open
 **/ 
 AboutView.prototype.open = function() {
	this.loadData();
	this.openDiv();
	controller.models['authentication'].loadFromServer();	
};


/**
 * closes the view
 * @prototype
 * @function close
 **/ 
AboutView.prototype.close = closeView;


/**
 * When user clicks on the close button
 * it leads to the courses list
 * @prototype
 * @function closeAbout
 **/  
AboutView.prototype.closeAbout = function() {
	moblerlog("close settings button clicked");
	controller.transitionToSettings();
};



/**
 * leads to logout confirmation view
 * @prototype
 * @function logout
 **/
AboutView.prototype.logout = function() {
	controller.transitionToLogout();
};


/**
 * Loads the data of the about view. Most of its 
 * content has been initialized in the localization in 
 * the controller. 	In this function, the data  that are
 * loaded are the logos.
 * @prototype
 * @function loadData
 **/
AboutView.prototype.loadData = function() {
	var config = controller.models['authentication'];

	$("#logos").show();
};
