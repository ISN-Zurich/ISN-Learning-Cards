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


//View for displaying the settings

function AboutView() {
    var self = this;
    
    self.tagID = 'aboutView';
    
    jester($('#closeAboutIcon')[0]).tap(function(){ self.closeAbout(); } );
    
   
    
//    $(document).bind("authenticationready", function(e, userID) {
//		console.log("authentication ready called " + userID);
//		self.loadData();
//	});
} 

//pinch leads to course list

AboutView.prototype.handlePinch = function() {
    controller.transitionToSettings();
};

//tap does nothing

AboutView.prototype.handleTap = doNothing;

//swipe does nothing

AboutView.prototype.handleSwipe = doNothing;

//opens the view
 
AboutView.prototype.openDiv = openView;

//shows the settings data
 
AboutView.prototype.open = function() {
	this.loadData();
	this.openDiv();
	
	controller.models['authentication'].loadFromServer();	
};

//closes the view

AboutView.prototype.close = closeView;

//leads to course list
 
AboutView.prototype.closeAbout = function() {
	console.log("close settings button clicked");
	controller.transitionToSettings();
};


//leads to logout confirmation view

AboutView.prototype.logout = function() {
	controller.transitionToLogout();
};

//loads the statistics data

AboutView.prototype.loadData = function() {
var config = controller.models['authentication'];
	
$("#logos").show();



};
