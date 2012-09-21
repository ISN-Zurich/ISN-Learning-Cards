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
AchievementsView.prototype.handleSwipe = function() {
	controller.transitionToStatistics();
};

AchievementsView.prototype.openDiv = openView;
AchievementsView.prototype.open = function() {
	this.showAchievementsBody();
	this.openDiv();	
};

AchievementsView.prototype.close = closeView;

AchievementsView.prototype.closeAchievements = function() {
	console.log("close Achievements button clicked");
	controller.transitionToStatistics();
};

AchievementsView.prototype.showAchievementsBody = function() {


	var statisticsModel = controller.models['statistics'];
	var statistics = statisticsModel.getStatistics();

	$("#valueStackHandler").text(statistics['stackHandler']+"%");
//checkMaxEfficiency(statistics['stackHandler']);
	if (statistics['stackHandler'] = "100"){
			$("#stackHandlerIcon").addClass("blue");			
	}
	$("#valueCardBurner").text(statistics['cardBurner']+"%");

	if (statistics['cardBurner'] == "100"){
			$("#cardBurnerIcon").addClass("blue");			
	}
	
//	function checkMaxEfficiency(efficiencyValue){
//
//		if (efficiencyValue == "100"){
//			return "blue";
//		}
//
//	}

}