/**
 * View for displaying the achievements
 */
function AchievementsView(){
	
	 var self = this;
	    
	 self.tagID = 'achievementsView';
	
	 jester($('#closeAchievementsIcon')[0]).tap(function(){ self.closeAchievements(); } );
	
}; 

/**
 * pinch leads to statistics view
 */
AchievementsView.prototype.handlePinch = function(){
    controller.transitionToStatistics();
};

/**
 * tap does nothing
 */
AchievementsView.prototype.handleTap = doNothing;

/**
 * swipe leads to statistics view
 */
AchievementsView.prototype.handleSwipe = function() {
	controller.transitionToStatistics();
};

/**
 * opens the view
 */
AchievementsView.prototype.openDiv = openView;

/**
 * shows the achievements body
 */
AchievementsView.prototype.open = function() {
	this.showAchievementsBody();
	this.openDiv();	
};

/**
 * closes the view
 */
AchievementsView.prototype.close = closeView;

/**
 * leads to statistics view
 */
AchievementsView.prototype.closeAchievements = function() {
	console.log("close Achievements button clicked");
	controller.transitionToStatistics();
};

/**
 * shows the achievements
 */
AchievementsView.prototype.showAchievementsBody = function() {
	var statisticsModel = controller.models['statistics'];
	var statistics = statisticsModel.getStatistics();
	$("#stackHandlerIcon").removeClass("blue");
	$("#cardBurnerIcon").removeClass("blue");

	$("#valueStackHandler").text(statistics['stackHandler']+"%");
//checkMaxEfficiency(statistics['stackHandler']);
	if (statistics['stackHandler'] == 100){
			$("#stackHandlerIcon").addClass("blue");			
	};
	$("#valueCardBurner").text(statistics['cardBurner']+"%");
	if (statistics['cardBurner'] == 100){
			$("#cardBurnerIcon").addClass("blue");			
	};
	
//	function checkMaxEfficiency(efficiencyValue){
//
//		if (efficiencyValue == "100"){
//			return "blue";
//		}
//
//	}

}