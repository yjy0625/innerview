var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

// Create connection to database
var config = 
   {
     userName: 'ServerAdmin', // update me
     password: 'Hacktech!', // update me
     server: 'hacktechsql.database.windows.net', // update me
     options: 
        {
           database: 'HacktechDB' //update me
           , encrypt: true
        }
   }
var connection = new Connection(config);



//Insert Information to userData table  
function foo(tablename, dataJson) {
    var request = new Request();
    var sql = "INSERT INTO " + tablename + " (";
    for (key in dataJson){
        sql += key + ", ";

    }
    sql = sql.substring(0, sql.length - 1);
    sql += ") VALUES (";
    for (key in dataJson){
      sql += dataJson[key] + ",";
    }
    sql = sql.substring(0, sql.length - 1);
    sql += ");";
 
    request = new Request(sql, (err, rowCount, rows) => {
        console.log(rowCount + ' row(s) returned');
        process.exit();
    });
 
    connection.execSql(request);
}

//Insert Information to userData table  
function SigninToUserData(username, password, callback) {
    console.log('Reading rows from the Table...');

    // Read all rows from table
    request = new Request("select * from userData;", (err, rowCount, rows) => {
        console.log(rowCount + ' row(s) returned');
        process.exit();
    });

    request.on('row', function(columns) {
        columns.forEach(function(column) {
            console.log("%s\t%s", column.metadata.colName, column.value);
         });
    });

    connection.execSql(request); 

    
}

function signin(username, password) {
	/*var userInput = {
        "id": username,
		"password": password
	} */
	var succeed = false;
    console.log(username)
	/*var requestSql = "select * from userData where id='" + username + "';";
	console.log(requestSql); */

    request = new Request("select * from userData", (err, rowCount, rows) => {
        console.log(rowCount + ' row(s) returned' + rows);
       // callback(rowCount > 0);
    });
}




//Get All informaiton for interviewData table 
function queryInterviewDatabase() { 
    console.log('Reading rows from the Table...');

    // Read all rows from table
    request = new Request("select * from interviewData;", (err, rowCount, rows) => {
        console.log(rowCount + ' row(s) returned');
        process.exit();
    });

    request.on('row', function(columns) {
        columns.forEach(function(column) {
            console.log("%s\t%s", column.metadata.colName, column.value);
         });
    });

    connection.execSql(request);
}



//Get All name for all questions from practiceData Table 
function queryAllInterviews(callback) {

    // Read all rows from table
    var requestRowCount = -1;
    request = new Request("select name from practiceData;", (err, rowCount, rows) => {
        console.log(rowCount + ' row(s) returned');
        requestRowCount = rowCount;
        process.exit();
    });

    var practiceNames = [];

    request.on('row', function(columns) {
        var practiceName = columns[0].value;
        practiceNames.push(practiceName);
        if(requestRowCount == practiceNames.length) {
            callback(practiceNames);
        }
    });

    connection.execSql(request);
}

 
//NEED TO USE: function query questions evaluations fo specific user inside interviewData table 
//---- Get the long JSON summary for sepcific user 
function queryAllQuestionsForInterviewWithName(name, callback) {
      console.log("select * from interviewData where interviewData.name='"+ name + "';");
      request = new Request("select * from interviewData where user_id='"+ name + "';" , (err, rowCount, rows) => {
        console.log(rowCount + ' row(s) returned' + rows);
    });

    request.on('row', function(columns) {
    });

       request.on('row', function(columns) {
        columns.forEach(function(column) {
            console.log("%s\t%s", column.metadata.colName, column.value);
            callback(column.value)
         }); 
         //process.exit();
    }); 

    connection.execSql(request);

}

//NEED TO USE: function insert interview evaluation -- the long JSON summary to database 
function insertHistory(json) {
    var request = new Request();

     var input = ["'" + json.user_id + "'", "'" + json.practice_id + "'", parseFloat(json.total_time), parseFloat(json.time_per_question), parseFloat(json.prep_per_question), parseFloat(json.sentiment), "'" + json.wording + "'", parseFloat(json.expression_contempt), parseFloat(json.expression_fear), parseFloat(json.expression_happiness), parseFloat(json.expression_neutral), parseFloat(json.expression_sadness), parseFloat(json.expression_surprise), parseInt(json.evaluation)];

     var sql = "INSERT INTO interviewData (user_id, practice_id, total_time,time_per_question, prep_per_question, sentiment, wording, expression_contempt, expression_fear, expression_happiness,expression_neutral, expression_sadness, expression_surprise, evaluation) VALUES (" + input.join(',') + ')';
    console.log(sql);
   //console.log(json.evaluation); 

   request = new Request(sql, (err, rowCount, rows) => {
        console.log(rowCount + ' row(s) returned');
        process.exit();
    });
 
    connection.execSql(request); 
}

/*
function queryHistory(userId, interviewName, callback) {
    request = new Request("select * from interviewData where interviewData.name=" + interviewName + "interviewData.id=" + interviewData.user_id + ";", (err, rowCount, rows) => {
        console.log(rowCount + ' row(s) returned' + rows);
     });
    connection.execSql(request);
} */

 
