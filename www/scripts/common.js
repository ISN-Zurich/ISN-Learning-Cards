//****VIEW HELPERS******

// does nothing


function doNothing() {}

//opens a view
 
function openView() {
	$(document).trigger("trackingEventDetected",[this.tagID]);
	$("#" + this.tagID).show();
}

// closes a view
 
function closeView() {
	$("#" + this.tagID).hide();
}

// shows apologize message if not question data is loaded

function doApologize() {
	$("#feedbackBody").empty();
	$("<span/>", {
		text : "Apologize, no data are loaded"
	}).appendTo($("#dataErrorMessage"));
	$("#dataErrorMessage").show();
}




/* function that activates and deactivates web console log messages in all scripts */

function moblerlog(messagestring) {
    if (MOBLERDEBUG === 1) {
        console.log(messagestring);
    }
}

//function queryDatabase(cbResult){
//	moblerlog("enter queryDatabase " + this.modelName);
//	var self = this;
//	self.superModel.db.transaction(function(transaction) {
//                                   transaction.executeSql(self.query, self.values, cbResult, function(tx,e) {moblerlog("DB Error cause: " + self.modelName); self.superModel.dbErrorFunction(tx,e);});
//	});
//}
//
//
///**
// * Each achivement, either a stackhandler or a card burner should be reached and calculated only once.
// * Check in this function if an achievement of any type (stackhandler or card burner) was already achieved
// * If an achievement has not been reached done then calculation of the value of the achievement
// * is performed as normal 
// * @function checkAchievements
// * */
//
//function checkAchievement() {
//	var self = this;
//	self.superModel.db.transaction(function(transaction) {
//		transaction.executeSql( "SELECT * FROM statistics WHERE course_id = ? AND question_id = ?", [this.courseId, this.achievementName], 
//                               function cbSuccess(t,r) {
//                               if ( r.rows.length > 0 ) {
//                                  self.achievementValue = 100;
//                                  self.superModel.allDone();
//                               } else {
//                                  self.calculateAchievementValues();
//                               }
//                               },
//                               self.superModel.dbErrorFunction);
//	});
//}
//
//function insertAchievement() {
//	var self = this;
//	var insert = 'INSERT INTO statistics(course_id, question_id, day, score, duration) VALUES (?, ?, ?, ?, ?)';
//	var insertValues = [ self.courseId, this.achievementName, (new Date()).getTime(), 100, -100];
//	self.superModel.queryDB(insert, insertValues, function() {
//				moblerlog("successfully inserted achievement");
//			});
//}
