function Initialize(onComplete) {
    if (!!window.SDK) {
        document.getElementById('content').style.display = 'block';
        document.getElementById('warning').style.display = 'none';
        onComplete(window.SDK);
    }
}

// Setup the recognizer
function RecognizerSetup(SDK, recognitionMode, language, format, subscriptionKey) {

    switch (recognitionMode) {
        case "Interactive" :
            recognitionMode = SDK.RecognitionMode.Interactive;
            break;
        case "Conversation" :
            recognitionMode = SDK.RecognitionMode.Conversation;
            break;
        case "Dictation" :
            recognitionMode = SDK.RecognitionMode.Dictation;
            break;
        default:
            recognitionMode = SDK.RecognitionMode.Interactive;
    }

    var recognizerConfig = new SDK.RecognizerConfig(
        new SDK.SpeechConfig(
            new SDK.Context(
                new SDK.OS(navigator.userAgent, "Browser", null),
                new SDK.Device("SpeechSample", "SpeechSample", "1.0.00000"))),
        recognitionMode,
        language, // Supported languages are specific to each recognition mode. Refer to docs.
        format); // SDK.SpeechResultFormat.Simple (Options - Simple/Detailed)


    var useTokenAuth = false;

    var authentication = function() {
        if (!useTokenAuth)
            return new SDK.CognitiveSubscriptionKeyAuthentication(subscriptionKey);

        var callback = function() {
            var tokenDeferral = new SDK.Deferred();
            try {
                var xhr = new(XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
                xhr.open('GET', '/token', 1);
                xhr.onload = function () {
                    if (xhr.status === 200)  {
                        tokenDeferral.Resolve(xhr.responseText);
                    } else {
                        tokenDeferral.Reject('Issue token request failed.');
                    }
                };
                xhr.send();
            } catch (e) {
                window.console && console.log(e);
                tokenDeferral.Reject(e.message);
            }
            return tokenDeferral.Promise();
        }

        return new SDK.CognitiveTokenAuthentication(callback, callback);
    }();

    return SDK.CreateRecognizer(recognizerConfig, authentication);
}

// Start the recognition
function RecognizerStart(SDK, recognizer, callback) {
    recognizer.Recognize((event) => {
        /*
         Alternative syntax for typescript devs.
         if (event instanceof SDK.RecognitionTriggeredEvent)
        */
        switch (event.Name) {
            case "RecognitionTriggeredEvent" :
                console.log("Initializing");
                break;
            case "ListeningStartedEvent" :
                console.log("Listening");
                break;
            case "RecognitionStartedEvent" :
                console.log("Listening_Recognizing");
                break;
            // case "SpeechStartDetectedEvent" :
                // console.log("Listening_DetectedSpeech_Recognizing");
                // console.log(JSON.stringify(event.Result)); // check console for other information in result
                // break;
            case "SpeechHypothesisEvent" :
                // console.log(JSON.stringify(event.Result)); // check console for other information in result
                break;
            case "SpeechFragmentEvent" :
                // console.log(JSON.stringify(event.Result)); // check console for other information in result
                break;
            case "SpeechEndDetectedEvent" :
                // console.log("Processing_Adding_Final_Touches");
                // console.log(JSON.stringify(event.Result)); // check console for other information in result
                callback(event.Result);
                break;
            case "SpeechSimplePhraseEvent" :
                // console.log(JSON.stringify(event.Result, null, 3));
                break;
            case "SpeechDetailedPhraseEvent" :
                // console.log(JSON.stringify(event.Result, null, 3));

                // Get display text
                if(event.Result.DisplayText != null) {
                    callback(event.Result);
                }
                break;
            case "RecognitionEndedEvent" :
                break;
            default:
                // console.log(JSON.stringify(event)); // Debug information
                break;
        }
    })
    .On(() => {
        // The request succeeded. Nothing to do here.
    },
    (error) => {
        console.error(error);
    });
}

// Stop the Recognition.
function RecognizerStop(SDK, recognizer) {
    // recognizer.AudioSource.Detach(audioNodeId) can be also used here. (audioNodeId is part of ListeningStartedEvent)
    recognizer.AudioSource.TurnOff();
}
