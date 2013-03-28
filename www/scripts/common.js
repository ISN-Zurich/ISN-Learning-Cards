/**
 *A global property/variable that is used to set the default server with which the application will be connected
 *in order to exchange data.
 *
 *@property DEFAULT_SERVER
 *@default hornet
 **/

var DEFAULT_SERVER = "hornet";
/**
 *A global property/variable that is used to store info about the different servers to which the application can be connected.
 *
 *@property URLS_TO_LMS
 *@default {"yellowjacket", "hornet", "PFP LMS", "PFP TEST"}
 **/
var URLS_TO_LMS = [ 
					{
						servername: "yellowjacket",
						logoImage: "resources/pfpLogo.png",
						backgroundImage: "",
						logoLabel: "Yellowjacket",					
						url: "http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards",
						debug:"1",
						clientKey: ""
					},
					{
						servername: "hornet",
						logoImage: "resources/pfpLogo.png", 
						backgroundImage: "",
						logoLabel: "Authoring LMS at ISN Zurich",
						url: "http://hornet.ethz.ch/scorm_editor/restservice/learningcards",
						debug:"0",
						clientKey: ""
					},
					
					{
						servername: "PFPTEST",
						logoImage: "resources/pfpLogo.png",
						backgroundImage: "",
						logoLabel: "PfP test LMS at ETH",
						url: "https://pfp-test.ethz.ch/restservice/learningcards",
						debug:"1",
						clientKey: ""
					},
					{
						servername: "PFPLMS",
						logoImage: "resources/pfpLogo.png",
						backgroundImage: "",
						logoLabel: "PfP LMS at ISN Zurich",
						url: "https://pfp.ethz.ch/restservice/learningcards",
						debug:"0",
						clientKey: ""
					}
];

/** Does nothing
 * @function doNothing
 * */
function doNothing() {}



/**opens a view
 * @function openView 
 * */ 
function openView() {
	$(document).trigger("trackingEventDetected",[this.tagID]);
	$("#" + this.tagID).show();
}

 

/**closes  a view
 * @function closeView  
 * */
function closeView() {
	$("#" + this.tagID).hide();
}

/**shows apologize message if not question data is loaded 
 * @function doApologize   
 * */
function doApologize() {
	$("#feedbackBody").empty();
	$("<span/>", {
		text : "Apologize, no data are loaded"
	}).appendTo($("#dataErrorMessage"));
	$("#dataErrorMessage").show();
}


/**Global way of switching on or off the console log messages in all scripts of the front end. 
 * @function moblerlog
 * @param {String}messagestring, the text message to be displayed in the console
 * */
function moblerlog(messagestring) {
	
	//A global property/variable that activates and deactivates the display of console logs.
	var MOBLERDEBUG = 1;
	
   if (MOBLERDEBUG === 1) {
        console.log(messagestring);
    
	}
}

function debugActivate() {
	var LMSDEBUG = 1;
	moblerlog("debug Activate");
	if (LMSDEBUG === 1){
		var lmsData = [];
		for ( i=0; i < URLS_TO_LMS.length; i++ ) {
			if (URLS_TO_LMS[i].debug === "0"){
				lmsData.push(URLS_TO_LMS[i]);
			}	
		}
		moblerlog("return lms data");
		return lmsData;
	}else {
		moblerlog("return the urlsto lms");
		return URLS_TO_LMS;
	}
}
/**Query the database. It is used in all statistics submodels.
 * @function queryDatabase
 * @param cbResult
 * */
function queryDatabase(cbResult){
	moblerlog("enter queryDatabase " + this.modelName);
	var self = this;
	self.superModel.db.transaction(function(transaction) {
                                   transaction.executeSql(self.query, self.values, cbResult, function(tx,e) {moblerlog("DB Error cause: " + self.modelName); self.superModel.dbErrorFunction(tx,e);});
	});
}


/**
 * Each achievement, either a stackhandler or a card burner, should be reached and calculated only once.
 * Check in this function if an achievement of any type (stackhandler or card burner) was already achieved
 * If an achievement has not been reached then the value of the achievement is calculated as normal 
 * @function checkAchievements
 * */
function checkAchievement() {
	var self = this;
	self.superModel.db.transaction(function(transaction) {
		transaction.executeSql( "SELECT * FROM statistics WHERE course_id = ? AND question_id = ?", [this.courseId, this.achievementName], 
                               function cbSuccess(t,r) {
                               if ( r.rows.length > 0 ) {
                                  self.achievementValue = 100;
                                  self.superModel.allDone();
                               } else {
                                  self.calculateAchievementValues();
                               }
                               },
                               self.superModel.dbErrorFunction);
	});
}


/**
 * When an achievement is reached (score =100), it is inserted in the database of the server
 * by assigning the following values for a specific course.
 * - an 100 value to the score
 * - an -100 value to the duration
 * - the achievements name as id for the question
 * * @function insertAchievement
 * */
function insertAchievement() {
	var self = this;
	var insert = 'INSERT INTO statistics(course_id, question_id, day, score, duration) VALUES (?, ?, ?, ?, ?)';
	var insertValues = [ self.courseId, this.achievementName, (new Date()).getTime(), 100, -100];
	self.superModel.queryDB(insert, insertValues, function() {
				moblerlog("successfully inserted achievement");
			});
}


//helper functions

function checkImprovement(improvementValue) {
    var retval = msg_neutralImprovement_icon + " green stats";
    if (improvementValue > 0) {
        retval = msg_positiveImprovement_icon + " green stats";
    } else if (improvementValue < 0) {
        retval = msg_negativeImprovement_icon + " red stats";
    }
    return retval;
}

function checkSpeedImprovement(improvementValue){
    var retval = msg_neutralImprovement_icon + " green stats";
    if (improvementValue > 0) {
        retval = msg_positiveImprovement_icon + " red stats";
    } else if (improvementValue < 0) {
        retval = msg_negativeImprovement_icon + " green stats";
    }
    return retval;
}

/**
 * Calculates the width of an lms item on login view and lms list view.
 * Additionally it calculates the width of the label container in landing view.
 * Generally, this function calculates the width of the label container when it is
 * on the same row with a side dash and the image container on the left along with the separator.
 * * @function calculateLabelWidth
 * */
function calculateLabelWidth(){
	moblerlog("enters landing view form");
	w1=$(".imageContainer").width();
	w2=$(".separator").width();
	w3=$(".selectItemContainer").width();
	width = $(window).width() - (w1 + w2 + w3 + w3 + w1) ;	
	$(".labelContainer").width(width);
};

/**
 * 	Calculates the answers width for single and multiple choice questions
 *  @function setAnswerWidth
 * 	@ param{string,number,number} orientationLayout,w, h
 * */
function setAnswerWidth(orientationLayout, w, h){
	var twidth = w-65;
	twidth = twidth + "px";
	$("#cardAnswerBody ul li").each(function() {
		$(this).find(".text").css("width", twidth );
		var height = $(this).height()-18;
		$(this).find(".separatorContainerCourses").css("height", height + "px");
		$(this).find(".radial").css("height", height + "px");
	});
};

/**
 * 	Calculates feedback width for single and multiple choice questions
 *  @function setFeedbackWidth
 * 	@ param{string,number,number} orientationLayout,w, h
 * */
function setFeedbackWidth(orientationLayout,w, h){
	var twidth = w-65;
	twidth = twidth + "px";
	$("#feedbackBody ul li").each(function() {
		$(this).find(".text").css("width", twidth );
		var height = $(this).height()-18;
		$(this).find(".separatorContainerCourses").css("height", height + "px");
		$(this).find(".radial").css("height", height + "px");
	});
};


/**
 * 	Calculates and returns an array that contains
 *  the correct gaps for the gap with the specified index (=gapIndex).
 *  @function getCorrectGaps
 * 	@ param{number}, index, index of the current gap
 * */
function getCorrectGaps(gapIndex) {
	var questionpoolModel = controller.models['questionpool'];
	var gapsObject=questionpoolModel.getAnswer(); //the object that is returned as an answer from the server
	var items=gapsObject["correctGaps"][gapIndex]["items"]; //the items sub-array for the specific gap index
	var correctGaps=new Array();
	for(k=0; k<jQuery(items).size();k++){
		correctGaps.push(items[k]["answertext"]);
		moblerlog("item of correct gaps array is "+correctGaps[k]);
	}
	moblerlog("correct gaps array is "+correctGaps);
	return correctGaps;
}