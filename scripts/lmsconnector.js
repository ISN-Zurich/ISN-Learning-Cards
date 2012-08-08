function sendData(address, data, method) {
	var connection = new ConnectionState();
	if (connection.isOffline()) {
		alert("Sending data is not possible! You are not connected to the internet!");
	} else { 	//is connected to internet
		var jsonString = JSON.stringify(data);
		
		//Send data to PHP
	}
};

