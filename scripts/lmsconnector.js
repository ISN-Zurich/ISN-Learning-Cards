function sendData(url, data, method, callback) {
	var connection = new ConnectionState();
	if (connection.isOffline()) {
		alert("Sending data is not possible! You are not connected to the internet!");
	} else { 	//is connected to internet
		
		var json = {
				url: url,
				data: data,
				method: method
		};
		
		var jsonString = JSON.stringify(json);
		jQuery.post(urlToPHPService, jsonString, function(data, textStatus, jqXHR) {
														callback(data, textStatus);
												}, "json");
	}
};




//		if (method == "POST") {
//			var jsonString = JSON.stringify(data);
//			jQuery.post(url, jsonString, sendSuccess(data, textStatus, jqXHR), "json");
//		} else if (method == "GET") {
//			jQuery.getJSON(url, sendSuccess(data, textStatus, jqXHR));
//		} else if (method == "PUT") {
//			$.ajax({
//				  url: url,
//				  type: 'PUT',
//				  data: "data",
//				  success: sendSuccess(data, textStatus, jqXHR)
//				});
//		} else if (method == "DELETE") {
//			$.ajax({
//				  url: url,
//				  type: 'DELETE',
//				  data: "data",
//				  success: sendSuccess(data, textStatus, jqXHR)
//				});
//		}
		


