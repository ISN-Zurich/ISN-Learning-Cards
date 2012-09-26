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
	
}


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
	var self = this;
	this.db
			.transaction(function(transaction) {
				transaction
						.executeSql(
								'CREATE TABLE IF NOT EXISTS tracking (time_stamp INTEGER NOT NULL PRIMARY KEY, event_type TEXT);',
								[], function() {
									self.db
									.transaction(function(transaction) {
										transaction
												.executeSql(
														'DROP TABLE trackings',
														[]);});
									
								});
				
			});
	//localStorage.setItem("db_version", DB_VERSION);
};

TrackingModel.prototype.sendToServer = function(){
	var self = this;

	var sessionkey = self.controller.models['authentication'].getSessionKey();
	var url = self.controller.models['authentication'].configuration.urlToLMS + '/tracking.php';
	console.log("url tracking: " + url);
	
	this.db
	.transaction(function(transaction) {
		transaction
				.executeSql('SELECT * FROM tracking', [], function(t,r) {sendTracking(t,r);});
	});

	
	function sendTracking(transaction, results) {
		tracking = [];
		uuid = "";
		if (localStorage.getItem("pendingTracking")) {
			var pendingTracking= {};
			try {
				pendingTracking = JSON.parse(localStorage.getItem("pendingTracking"));
			} catch (err) {
				console.log("error! while loading pending tracking");
			}
			
			sessionkey = pendingTracking.sessionkey;
			uuid = pendingTracking.uuid;
			tracking = pendingTracking.tracking;
		}else {
			console.log("results length: " + results.rows.length);
			for ( var i = 0; i < results.rows.length; i++) {
				row = results.rows.item(i);
				tracking.push(row);
//				console.log("sending " + i + ": " + JSON.stringify(row));
			}
			uuid = device.uuid;
		}
		
		console.log("count tracking=" + tracking.length);
		var trackingString = JSON.stringify(tracking);
		
		//processData has to be set to false!
		$.ajax({
			url : url,
			type : 'PUT',
			data : trackingString,
			processData: false,
			success : function() {
				console
				.log("tracking data successfully send to the server");
				localStorage.removeItem("pendingTracking");
				self.lastSendToServer = (new Date()).getTime();
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
			},
			beforeSend : setHeader
		});

		function setHeader(xhr) {
			xhr.setRequestHeader('sessionkey', sessionkey);
			xhr.setRequestHeader('uuid', device.uuid);
		}
	}	
};