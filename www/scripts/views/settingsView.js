function SettingsView() {
    var self = this;
    
    self.tagID = 'settingsView';
    
    jester($('#closeSettingsIcon')[0]).tap(function(){ self.closeSettings(); } );
//    jester($('#logOutSettings')[0]).tap(function(){ self.logout(); } );
    $('#logOutSettings').click(function() {
    	self.logout();
    });
    
    $(document).bind("authenticationready", function(e, userID) {
		console.log("authentication ready called " + userID);
		self.loadData();
	});
} 

SettingsView.prototype.handlePinch = function() {
    controller.transitionToCourses();
};
SettingsView.prototype.handleTap = doNothing;
SettingsView.prototype.handleSwipe = doNothing;
SettingsView.prototype.openDiv = openView;
SettingsView.prototype.open = function() {
	this.loadData();
	this.openDiv();
	
	controller.models['authentication'].loadFromServer();
	
};
SettingsView.prototype.close = closeView;

SettingsView.prototype.closeSettings = function() {
	console.log("close settings button clicked");
	controller.transitionToCourses();
};

SettingsView.prototype.logout = function() {
	controller.transitionToLogout();
};

SettingsView.prototype.loadData = function() {
	
	var config = controller.models['authentication'];
	
//	$("#settingsData").empty();
//	liName = $("<li/>", {}).appendTo("#settingsData");
//	$("<div/>", {
//		text: config.getDisplayName(),
//		"class": "text"
//	}).appendTo(liName);
//	liUserName = $("<li/>", {}).appendTo("#settingsData");
//	$("<div/>", {
//		text: config.getUserName(),
//		"class": "text"
//	}).appendTo(liUserName);
//	liEmail = $("<li/>", {}).appendTo("#settingsData");
//	$("<div/>", {
//		text: config.getEmailAddress(),
//		"class": "text"
//	}).appendTo(liEmail);
//	liLang = $("<li/>", {}).appendTo("#settingsData");
//	$("<div/>", {
//		text: jQuery.i18n.prop('msg_' + config.getLanguage() + '_title'),
//		"class": "text"
//	}).appendTo(liLang);
	
	$("#nameLabelSet").text(jQuery.i18n.prop('msg_fullname'));
	$("#nameItemSet").text(config.getDisplayName());
	$("#usernameLabelSet").text(jQuery.i18n.prop('msg_username'));
	$("#usernameItemSet").text(config.getUserName());
	$("#emailLabelSet").text(jQuery.i18n.prop('msg_email'));
	$("#emailItemSet").text(config.getEmailAddress());
	$("#languageLabelSet").text(jQuery.i18n.prop('msg_language'));
	$("#languageItemSet").text(jQuery.i18n.prop('msg_' + config.getLanguage() + '_title'));
	
};
