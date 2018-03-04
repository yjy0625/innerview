;(function ( $, window, document, undefined ) {

	var module;

    function PracticeQuestion( options ) {
        this.options = options;

        this.init();

        module = this;

        return this;
    }

    PracticeQuestion.prototype = {

        init: function() {
        	this.startTime = 0;
        	this.totalTime = 0;
        	this.audioContent = '';
            this.recognizer = RecognizerSetup(SDK,"Dictation","en-US","Simple","5bb3040a9c564c68a868be4038872ed3");
        },

        startRecording: function() {
            RecognizerStart(SDK, this.recognizer, this.handleRecordingEvent);
        },

        stopRecording: function() {
            RecognizerStop(SDK, this.recognizer);
        },

        handleRecordingEvent: function(event) {
            const eventType = event['RecognitionStatus'];
            if(eventType === "Success") {
                console.log("Audio: New audio content '" + event.DisplayText + "'.");
                if(module.audioContent === '') {
                    module.startTime = event.Offset / 10000000;
                    console.log("Audio: Start at " + module.startTime + " seconds.");
                }
                module.audioContent += event.DisplayText;
            }
            else { // end dictation
                module.totalTime = event.Offset / 10000000;
                console.log("Audio: Finish at " + module.totalTime + " seconds.");
            }
        },

        getData: function() {
            return {
                "timing": {
                    "startTime": module.startTime,
                    "totalTime": module.totalTime
                },
                "audioContent": module.audioContent,
                "index": module.options.questionIndex,
                "isFollowup": module.options.isFollowup,
                "questionString": module.options.questionString
            };
        }

    };

    window.PracticeQuestion = PracticeQuestion;

})( jQuery, window, document );