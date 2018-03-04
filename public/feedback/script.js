$(document).ready(function(){
  var g1, g2, g3, g4;
  $('.back').click(function() {
    window.location.href = "/list"
  })
  getData(main);
});

function main(data) {
  var questions = data.questions;
  var score_speaking = getEvaluationForSpeaking(questions);
  var g3 = new JustGage({
    id: "g3",
    value: parseInt(score_speaking),
    min: 0,
    max: 100,
    title: "Your Speaking Score",
    label: "/100",
    relativeGaugeSize: true,
    donut: true,
    valueFontColor: "white",
    titleFontColor: "white",
    labelFontColor: "white",
    shadowOpacity: 0.5,
    shadowSize: 2,
    shadowVerticalOffset: 1
  });
  // get for behavior
  var score_behavior = getEvaluationForBehavior(data.snapshots);
  var g4 = new JustGage({
    id: "g4",
    value: score_behavior,
    min: 0,
    max: 100,
    title: "Your Behavioral Score",
    label: "/100",
    relativeGaugeSize: true,
    donut: true,
    valueFontColor: "white",
    titleFontColor: "white",
    labelFontColor: "white",
    shadowOpacity: 0.5,
    shadowSize: 2,
    shadowVerticalOffset: 1
  });
  // get for timing
  var score_timing = getEvaluationForTiming(questions);
  var g2 = new JustGage({
    id: "g2",
    value: score_timing,
    min: 0,
    max: 100,
    title: "Your Timing Score",
    label: "/100",
    relativeGaugeSize: true,
    donut: true,
    valueFontColor: "white",
    titleFontColor: "white",
    labelFontColor: "white",
    shadowOpacity: 0.5,
    shadowSize: 2,
    shadowVerticalOffset: 1
  });
  var g1 = new JustGage({
    id: "g1",
    value: getGeneral(score_speaking,score_behavior,score_timing),
    min: 0,
    max: 100,
    title: "Your Overall Score",
    label: "/100",
    relativeGaugeSize: true,
    donut: true,
    valueFontColor: "white",
    titleFontColor: "white",
    labelFontColor: "white",
    shadowOpacity: 0.5,
    shadowSize: 2,
    shadowVerticalOffset: 1
  });
}

function getEvaluationForSpeaking(questions){
  var total_sentiment = 0.0;
  var ave_sentiment = 0.0;
  var max_sentiment_index = 0;
  var num_reps = 0;
  var reps = [];

  for (var i = 0; i < questions.length; i++) {
    total_sentiment+=questions[i].sentiment;
    if (questions[i].wording.split(",")!="") {
      reps = reps.concat(questions[i].wording.split(","));
    }
    $(".content .detail_content").append("<div></div>");
    if (questions[i].sentiment>questions[max_sentiment_index].sentiment) {
      max_sentiment_index = i;
    }
  }
  num_reps = reps.length;
  ave_sentiment = Math.round(total_sentiment/questions.length*100)/100;
  $(".content .value").get(0).innerHTML = num_reps;
  $(".content .value")[1].innerHTML = ave_sentiment;
  if (num_reps>0) {
    $(".content .conclude li")[0].innerHTML="You should avoid saying words repetitively like "+reps[0]+", etc";
  } else {
    $(".content .conclude li")[0].innerHTML="You did great in making no repetitive phrases and words";
  }
  if (ave_sentiment>=0.5) {
    $(".content .conclude li")[1].innerHTML="You showed adequate amound of passion in describing your personal experiences";
  } else {
    $(".content .conclude li")[1].innerHTML="You would better show a bit more passion in describing your personal experiences";
  }
  return ave_sentiment*100-num_reps*10;
}
function getEvaluationForBehavior(snapshots){
  var contempts = [];
  var total_contempts = 0.0;
  var neutrals = [];
  var total_neutrals = 0.0;
  var surprises = [];
  var total_surprises = 0.0;
  for (var i = 0; i < snapshots.length; i++) {
    contempts.concat(snapshots[i].expression_contempt);
    total_contempts+=snapshots[i].expression_contempt;
    neutrals.concat(snapshots[i].expression_neutral);
    total_neutrals+=snapshots[i].expression_neutral
    surprises.concat(snapshots[i].expression_surprise);
    total_surprises+=snapshots[i].expression_surprise;
  }
  var ave_contempt = Math.round(total_contempts/snapshots.length*100)/100;
  var ave_neutral = Math.round(total_neutrals/snapshots.length*100)/100;
  var ave_surprise = Math.round(total_surprises/snapshots.length*100)/100;
  $(".behavioral .value")[0].innerHTML = ave_contempt;
  $(".behavioral .value")[1].innerHTML = ave_neutral;
  $(".behavioral .value")[2].innerHTML = ave_surprise;
  // conclude
  if (ave_contempt>0.1) {
    $(".behavioral .conclude li")[0].innerHTML = "Your level of contempt is higher than average and might affect your interview negatively";
  } else {
    $(".behavioral .conclude li")[0].innerHTML = "You did a great job in being decorous during the interview";
  }
  if (ave_neutral<0.55) {
    $(".behavioral .conclude li")[1].innerHTML = "Your level of calmness is a bit lower than average, telling you are sometimes nervous";
  } else {
    $(".behavioral .conclude li")[1].innerHTML = "You did a great job in keeping calm during the interview";
  }
  if (ave_surprise>0.2) {
    $(".behavioral .conclude li")[2].innerHTML = "You might be shocked to see one of the questions, so you should practice that one particularly";
  } else {
    $(".behavioral .conclude li")[2].innerHTML = "Great job in being consistently focused and undisturbed";
  }
  return ave_neutral*150-ave_contempt*100-ave_surprise*30;
}
function getEvaluationForTiming(questions){
  var totalPrepTime = 0.0;
  var max_prep_time_index = 0;
  var min_prep_time_index = 0;
  var totalTime = 0.0;
  var min_total_time_index = 0;
  var max_total_time_index = 0;
  for (var i = 0; i < questions.length; i++) {
    totalPrepTime+=parseFloat(questions[i].prepTime);
    totalTime+=parseFloat(questions[i].totalTime);
    if (questions[i].prepTime>questions[max_prep_time_index].prepTime) {
      max_prep_time_index = i;
    }
    if (questions[i].prepTime<questions[min_prep_time_index].prepTime) {
      min_prep_time_index = i;
    }
    if (questions[i].totalTime>questions[max_prep_time_index].prepTime) {
      max_total_time_index = i;
    }
    if (questions[i].totalTime<questions[min_prep_time_index].prepTime) {
      min_total_time_index = i;
    }
  }
  var ave_prep = Math.round(totalPrepTime/questions.length*100)/100;
  var ave_total = Math.round(totalTime/questions.length*100)/100;
  var ave_answer = ave_total-ave_prep;
  $(".timing .value")[0].innerHTML = ave_prep;
  $(".timing .value")[1].innerHTML = ave_answer;
  if (questions[max_prep_time_index]>=10) {
    $(".timing .conclude li")[0].innerHTML = "You spend more than 10 seconds on questioin "+max_prep_time_index+" and thus should prepare better for that one";
  } else {
    $(".timing .conclude li")[0].innerHTML = "Your time spent on preparation is just right";
  }
  if (questions[max_total_time_index]>=90) {
    $(".timing .conclude li")[1].innerHTML = "You spent a bit too much time overall on question "+max_total_time_index+". Hope you can manage the time better next time";
  } else {
    $(".timing .conclude li")[1].innerHTML = "You did great in keeping your answers to each question as concise as possible.";
  }
  if (questions[min_total_time_index]<=15) {
    $(".timing .conclude li")[2].innerHTML = "You might want to spend more time on preparation for question "+min_total_time_index+" rather than rushing answering";
  } else {
    $(".timing .conclude li")[2].innerHTML = "You did great in being comprehensive as you can in every questions, but rememeber Be Concise as Well";
  }
  if (ave_total<20) {
    return getRandomInt(50,65);
  } else if (ave_total<45||ave_total>90) {
    return getRandomInt(65,80);
  }
  return getRandomInt(80, 100);
}
function getGeneral(score1,score2,score3){
  var max = score1;
  var min = score1;
  if (max<score2) {
    max = score2;
  }
  if (score2<min) {
    min = score2;
  }
  if (score3>max) {
    max = score3;
  }
  if (score3<min) {
    min = score3;
  }
  if (max==score1) {
    $(".general .label")[0].innerHTML = "Speaking Part of Interview";
  } else if (max==score2) {
    $(".general .label")[0].innerHTML = "Behavioral Part of Interview";
  } else {
    $(".general .label")[0].innerHTML = "Timing Part of Interview";
  }
  if (min==score1) {
    $(".general .label")[1].innerHTML = "Speaking Part of Interview";
    $(".general .conclude li")[0].innerHTML = "Spend some time organizing your answers for some general questions";
    $(".general .conclude li")[1].innerHTML = "Pracice a bit to achiech some level of confidence before taking the InnerView";
  } else if (min==score2) {
    $(".general .label")[1].innerHTML = "Behavioral Part of Interview";
    $(".general .conclude li")[0].innerHTML = "Always keep eye contact with the interviewer";
    $(".general .conclude li")[1].innerHTML = "Practice smiling when interviewing";
  } else {
    $(".general .label")[1].innerHTML = "Timing Part of Interview";
    $(".general .conclude li")[0].innerHTML = "Adjust your content of answers to each question so that each takes about 1 minute";
    $(".general .conclude li")[1].innerHTML = "If your answers are bit long and you don't want to cut them, practice until you achieve confidence";
  }
  return (score1+score2+score3)/3;
}
function getData(callback) {
  var interviewId = $.urlParam('id');
  $.ajax({
    method: 'GET',
    url: '/api/feedback/interview_id/' + interviewId
  }).done(json => {
    console.log(json);
    callback(JSON.parse(json));
  });
}

/*
* Helpers
*/

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return decodeURI(results[1]) || 0;
    }
}
