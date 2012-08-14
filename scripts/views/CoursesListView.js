
function CoursesListView () {

    var self = this;
    
    self.tagID = 'coursesListView';
    
    $('#coursesList').click(function(){ self.clickCourseItem(item); } );
    $('#coursesListSetIcon').click(function(){ self.clickSettingsButton(); } );
    $('#span1').click(function(){ self.clickStatisticsIcon(); } );



}

CoursesListView.prototype.handleTap = doNothing;
CoursesListView.prototype.handleSwipe = doNothing;
CoursesListView.prototype.open = openView;
CoursesListView.prototype.close = closeView;

CoursesListView.prototype.clickCourseItem = function () {

        var courseList,courseId; //the course id is similar with the index field of the course model
        
    $("#span2").value = courseId
    courseId = courses.getId(courseId);
    controler.transitionToQuestion(courseId); //of which course of which     




};


CoursesListView.prototype.clickSettingsButton = function () {controler.transitionToSettings();};

CoursesListView.prototype.clickStatisticsIcon = function () { };