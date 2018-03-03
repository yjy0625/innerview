;(function ( $, window, document, undefined ) {

	var defaults = {
        defaultProperty: "defaultPropertyValue"
    };

    function PracticeQuestion( element, options ) {
    	this.element = element;

        this.options = $.extend( {}, defaults, options);

        this._defaults = defaults;

        this.init();

        return this;
    }

    PracticeQuestion.prototype = {

        init: function() {
        	this.isRecording = false;
        	this.startTime = null;
        	this.prepTime = 0;
        	this.totalTime = 0;
        	this.images = [];
        	this.responseString = '';
        },

        startRecording: function() {
           	this.isRecording = true;
           	this.startTime = Date.now();

        },

        stopRecording: function() {
        	this.isRecording = false;
        	this.totalTime = (Date.now() - this.startTime) / 1000;

        }

    };

    window.PracticeQuestion = PracticeQuestion;

})( jQuery, window, document );