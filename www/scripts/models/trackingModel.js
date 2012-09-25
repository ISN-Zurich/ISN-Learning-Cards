function TrackingModel(controller){
	var self = this;
	this.controller = controller;
	this.lastSendToServer;
	this.db = openDatabase('ISNLCDB', '1.0', 'ISN Learning Cards Database',
			100000);
	
	this.tracking = [];
	this.tracking['timeStamp'] = -1;
	this.tracking['eventType'] = -1;
	//if (!localStorage.getItem("db_version")) {
		// this.deleteDB();
		this.initDB();
	//}
	$(document).bind("trackingEventDetected", function(e,type) {
		console.log(" tracking event loaded ");
		self.storeTrackData((new Date()).getTime(),type);
	});		
	
};


TrackingModel.prototype.storeTrackData = function(time, type){
	
	this.db.transaction(function(transaction) {
		transaction
		.executeSql('INSERT INTO tracking(time_stamp,event_type) VALUES(?,?)',
				[ time, type ],function() {
			console.log("successfully inserted");
		}, function(tx, e) {
			console.log("error! NOT inserted: "
					+ e.message);
		});
	});

};

TrackingModel.prototype.initDB = function() {
	this.db
			.transaction(function(transaction) {
				transaction
						.executeSql(
								'CREATE TABLE IF NOT EXISTS trackings (time_stamp INTEGER NOT NULL PRIMARY KEY, event_type TEXT);',
								[]);
				
			});
	//localStorage.setItem("db_version", DB_VERSION);
};

TrackingModel.prototype.sendToServer = function(){
	var self = this;

	self.queryDB('SELECT * FROM tracking', [], function(t,r) {sendTracking(t,r);});

	function sendTracking(transation,results){
		tracking =[];
		uuid ="";
		sessionkey ="";
		for ( var i = 0; i < results.rows.length; i++) {
			row = results.rows.item(i);
			tracking.push(row);
		}
		sessionkey = self.controller.models['authentication'].getSessionKey();
		uuid = device.uuid;
	}
	
	var trackingString = JSON.stringify(tracking);
	
	
	$.ajax({
		url : 'http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards/tracking.php',
		type : 'PUT',
		data : trackingString,
		processData: false,
		success : function() {
			console
			.log("tracking data successfully send to the server");
			self.lastSendToServer =(new Date()).getTime(); 
			$(document).trigger("trackingsenttoserver");
		},
		error : function() {
			console
			.log("Error while sending tracking data to server");
			var trackingToStore = {
					sessionkey : sessionkey,
					uuid : device.uuid,
					tracking : tracking
				};
			localStorage.setItem("pendingTracking", JSON.stringify(trackingToStore));
//			$(document).trigger("statisticssenttoserver");
			
		},
		beforeSend : setHeader
	});
	
	
	function setHeader(xhr) {
		xhr.setRequestHeader('sessionkey', sessionkey);
		xhr.setRequestHeader('uuid', device.uuid);
	}
	
};