/* Achievements View 
 * 
 * Stackhandler
 * Card burner
 * */

function AchievementsView(){
	
	 var self = this;
	    
	 self.tagID = 'achievementsView';
	
	
	
}; 

AchievementsView.prototype.handlePinch = doNothing;
AchievementsView.prototype.handleTap = doNothing;
AchievementsView.prototype.handleSwipe = doNothing;
AchievementsView.prototype.openDiv = openView;
AchievementsView.prototype.open = function() {
		this.openDiv();	
};

AchievementsView.prototype.close = closeView;