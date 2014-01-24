/**
 *A global property/variable that is used to set the default server with which the application will be connected
 *in order to exchange data.
 *
 *@property DEFAULT_SERVER
 *@default hornet
 **/

var DEFAULT_SERVER = "PFPLMS";

//A global property/variable that activates and deactivates the display of console logs.
/**
 *A global property/variable that is used to set the default server with which the application will be connected
 *in order to exchange data.
 * 
 *@property DEFAULT_SERVER 
 *@default hornet
 **/
 
var MOBLERDEBUG = 0;

/**
 * A global property/variable that is used to describe the status of the activation or
 * deactivation of Mobler Cards app on Ilias LMS.
 *
 *@property MOBLERDEBUG
 *@return boolean
 **/
 
 var DEACTIVATE = false;

 /**
  * A global property/variable that is used to track the (de)-activation status 
  * of the back-end service for a specific server.
  *
  *@property URLS_TO_LMS
  *@default false
  **/
 
var URLS_TO_LMS = [ 
					{
						servername: "yellowjacket",
						logoImage: "resources/pfpLogo.png",
						backgroundImage: "",
						logoLabel: "Yellowjacket",					
						url: "http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards",
						url2: "http://yellowjacket.ethz.ch/ilias_4_2/restservice",
						debug:"1",
						clientKey: "",
						API:"v2",
						// API: "v1" == old mobler cards backend, "v2" == powerTLA
					},
					{
						servername: "hornet",
						logoImage: "resources/pfpLogo.png", 
						backgroundImage: "",
						logoLabel: "Authoring LMS at ISN Zurich",
						url: "http://hornet.ethz.ch/scorm_editor/restservice/learningcards",
						debug:"0",
						clientKey: "",
						API: "v1"
					},
					
					{
						servername: "PFPTEST",
						logoImage: "resources/pfpLogo.png",
						backgroundImage: "",
						logoLabel: "PfP test LMS at ETH",
						url: "https://pfp-test.ethz.ch/restservice/learningcards",
						debug:"1",
						clientKey: "",
						API: "v1"
					},
					{
						servername: "PFPLMS",
						logoImage: "resources/pfpLogo.png",
						backgroundImage: "",
						logoLabel: "PfP LMS at ISN Zurich",
						url: "https://pfp.ethz.ch/restservice/learningcards",
						debug:"0",
						clientKey: "",
						API: "v1"
					},
					{
						servername: "JukuLabTest",
						logoImage: "resources/esthonia.jpg",
						backgroundImage: "",
						logoLabel: "JukuLab Test Server",
						url: "http://ilias.jukulab.ee/restservice/learningcards",
						debug: "1",
						clientKey: "",
						API: "v1"
					},
					{
						servername: "EsthonianCollege",
						logoImage: "resources/EstonianForces3.png",
						backgroundImage: "",
						logoLabel: "Estonian Defense College",
						url: "https://eope.ksk.edu.ee/ilias/restservice/learningcards",
						debug: "0",
						clientKey: "",
						API: "v1"
					},
					{
						servername: "ADLRomania",
						logoImage: "resources/adlromania.png",
						backgroundImage: "",
						logoLabel: "Romanian Didad LMS",
						url: "http://lms.adlunap.ro/restservice/learningcards",
						debug: "0",
						clientKey: "",
						API: "v1"
					},
					{
						servername: "TestADLRomania",
						logoImage: "resources/adlromania.png",
						backgroundImage: "",
						logoLabel: "Test Romanian LMS",
						url: "http://test.adlunap.ro/restservice/learningcards",
						debug: "1",
						clientKey: "",
						API: "v1"
					}
					
//					{
//						servername: "LocalTests",
//						logoImage: "resources/adlromania.png",
//						backgroundImage: "",
//						logoLabel: "Local Tests",
//						url: "",
//						//url:"",
//						debug: "1",
//						clientKey: ""
//          }
];



/**Global way of switching on or off the console log messages in all scripts of the front end. 
 * @function moblerlog
 * @param {String}messagestring, the text message to be displayed in the console
 * */
function moblerlog(messagestring) {
	var MOBLERDEBUG = 0;
	
   if (MOBLERDEBUG === 1) {
        console.log(messagestring);
	}
}

/**Global way of switching on or off the console log messages in all scripts of the front end. 
 * @function getActiveServer
 * @param {String}messagestring, the text message to be displayed in the console
 * */
function getActiveServer(){
	var MOBLERDEBUG=0;
	if (MOBLERDEBUG === 1) {
		DEFAULT_SERVER = "yellowjacket";
	}else {
		DEFAULT_SERVER = DEFAULT_SERVER;
	}
	moblerlog("DEFAULT SERVER IS"+DEFAULT_SERVER);
	return DEFAULT_SERVER;
}

/**
 * When launching the app live, this function deactivates the testing servers (yellowjacket, pfplms)
 * as long as the global variable MOBLERDEBUG has been assigned an 1 value 
 * at the beginning of the document.
 * @function debugActivate
 * * */
function debugActivate() {
	var MOBLERDEBUG = 0;
	moblerlog("debug Activate and the value of MOBLERDEBUG IS"+MOBLERDEBUG);
	
	if (MOBLERDEBUG === 0){
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
		transaction.executeSql( "SELECT * FROM statistics WHERE course_id = ? AND question_id = ?", [self.courseId, self.achievementName], 
                               function cbSuccess(t,r) {
                               if ( r.rows.length > 0 ) {
                            	   moblerlog("found " + self.achievementName + " in the local database");
                                  self.achievementValue = 100;
                                  self.superModel.allDone();
                               } else {
                            	   moblerlog("no " + self.achievementName + " in the local database");
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

function setLabelContainer() {}

/**
 * jQuery.contents(): bad stuff cos jquery fails big time
 *	TODO:write comments 
 * * @param element
 * @returns {Array}
 */
// elementContents(jqElement[0]);
function elementContents(element) {
	var x=element.getElementsByTagName('*');
	var retval = [];
	var p = x.parentNode;

	for (i=0;i<x.length;i++)
	{
		if (  p !== x[i].parentNode ) {
			p = x[i].parentNode;
			if ( x[i].previousSibling ) {
				var s = x[i].previousSibling;
				while (s && (s.nodeType === 3 || s.nodeType === 8 ) ) {
					retval.push(s);
					s = s.previousSibling;
				}
			}
		}
		
		retval.push(x[i]);
		
		if ( x[i].nextSibling ) {
			s = x[i].nextSibling;
			while (s && (s.nodeType === 3 || s.nodeType === 8 ) ) {
				retval.push(s);
				s = s.nextSibling;
			}
		}
	}
	return retval;
}

<<<<<<< HEAD
=======

function turnOffDeactivate(){
	moblerlog("enter turn off deactivate");
	var DEACTIVATE=false;
	var lmsModel=self.controller.models['lms'];
	var servername=lmsModel.lmsData.activeServer;
	lmsModel.lmsData.ServerData[servername].deactivateFlag=false;
	lmsModel.storeData();
}

function turnOnDeactivate(){
	DEACTIVATE=true;	//set the general deactivate status to true. 
	var lmsModel=self.controller.models['lms'];
	var servername=lmsModel.lmsData.activeServer;
	lmsModel.lmsData.ServerData[servername] = {};
	lmsModel.lmsData.ServerData[servername].deactivateFlag=true; //store and set the deactivate status to true
	lmsModel.storeData();
}


function showErrorResponses(request){
	console.log("ERROR status text: "+ request.statusText); 
	console.log("ERROR status code: "+ request.statusCode()); 
	console.log("ERROR status code is : " + request.status);
	console.log("ERROR responsetext: "+ request.responseText);
}
>>>>>>> refs/remotes/Evangelia/master
