/* Achievements View 
 * 
 * Stackhandler
 * Card burner
 * */

function AchievementsView(){
	
	 var self = this;
	    
	 self.tagID = 'achievementsView';
	
	 jester($('#closeAchievementsIcon')[0]).tap(function(){ self.closeAchievements(); } );
	
}; 

AchievementsView.prototype.handlePinch = doNothing;
AchievementsView.prototype.handleTap = doNothing;
AchievementsView.prototype.handleSwipe = doNothing;
AchievementsView.prototype.openDiv = openView;
AchievementsView.prototype.open = function() {
	this.showAchievementsBody();
	this.openDiv();	
};

AchievementsView.prototype.close = closeView;

AchievementsView.prototype.closeAchievements = function() {
	console.log("close Achievements button clicked");
	controller.transitionToCourses();
};

AchievementsView.prototype.showAchievementsBody = function() {
	
	
	
	
	
	
}