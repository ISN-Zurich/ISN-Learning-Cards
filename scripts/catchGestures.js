function cbPinch() {
    $('#gesturereport').text('pinch');
}

function cbStretch() {
    $('#gesturereport').text('stretch');
}

function cbSwipe(e) {
    $('#gesturereport').text('swipe');
}

function cbTap() {
    $('#gesturereport').text('tap');
}

function cbFlick() {
    $('#gesturereport').text('flick');
}

function cbPinchend(t, dir) {
    if ( dir == 'widened') {
	cbStretch();
    }
    else {
	cbPinch();
    }
}

function cbSetup() {
    // set more consistent defaults on the iphone.
    var jesteroptions = { swipeDistance: 100, 
			  flickDistance: 100, 
			  flickTime: 250 };

    jester(document, jesteroptions)
	.pinchend( cbPinchend)
	.swipe(cbSwipe)
	.tap( cbTap);

    //jester(document).flick( cbFlick );

    // avoid the screen moving around on the iphone
    $(window).bind('touchmove', function(event) {
        // Prevent scrolling on this element
        event.preventDefault();
    });
}

$(document).ready(cbSetup);