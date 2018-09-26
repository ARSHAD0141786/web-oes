var express = require('express');
var morgan = require('morgan');
var path = require('path');
var port=process.env.PORT || 5000;
var mysql = require('mysql');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

var config = {
    connectionLimit: 50,
	host:'127.0.0.100',
	port:'3306',
	user:'root',
	database:'new_oes',
	password:''
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret: 'someRandomSecretValue',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30}
}));

function createIndexTemplate(source){
    var htmlTemplate = `
    <!DOCTYPE html>
    <html>
        <head>
            <title>Online Examination System</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href = "/ui/style.css" rel="stylesheet" />
        </head>
        <body>
            <div class = "header">
                <div class="logo">
                </div>
                <div class="title">
                    <center>Online Examination System</center>
                </div>
            </div>
            <hr><hr>
            <div class = "container" id="main_area_container">
                <center>
                        <center>Loading login status...</center>
                </center>
            </div>
            <hr><hr>
            <div class = "footer">
                <center>&copy;Copyrights reserved 2k18</center>
            </div>
            <script type="text/javascript" src="${source}"></script>
        </body>
    </html>
    `;
    return htmlTemplate;
}

app.get('/', function (req, res) {
	console.log(`This is my response arshad`);
	//res.send(`<html><head></head><body><p>Done</p></body></html>`);
  res.send(createIndexTemplate('/ui/main.js'));
});

app.get('/test-this-app',function(req,res){
	console.log(`Test is passed`);
	res.send(`<html><head></head><body><p>Done</p></body></html>`);
});

app.get('/favicon.ico',function(req,res){
  res.sendFile(path.join(__dirname,'ui','favicon.ico'));
});

var pool = mysql.createPool(config);

function hash (input, salt) {
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');
}

app.post('/create-user', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var salt = crypto.randomBytes(128).toString('hex');
    var dbString = hash(password, salt);
    pool.query('INSERT INTO user (username, password) VALUES (?,?)', [username, dbString], function (err, result) {
       if (err) {
           res.status(500).send(err.toString());
       } else {
           res.status(200).send('User successfully created: ' + username);
       }
    });
 });
 
 app.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    
    pool.query('SELECT *FROM user WHERE username = ?', [username], function (err, result) {
       if (err) {
           res.status(500).send(err.toString());
       } else {
        //    res.send(JSON.stringify(result));
           if (result.length === 0) {
               res.status(403).send('username/password is invalid');
           } else {
               // Match the password
               console.log("Done 12");
               var dbString = result[0].password;
               
               var salt = dbString.split('$')[2];
               var hashedPassword = hash(password, salt); // Creating a hash based on the password submitted and the original salt
               if (hashedPassword === dbString) {
                 
                 // Set the session
                 req.session.auth = {userId: result[0].username};
                 // set cookie with a session id
                 // internally, on the server side, it maps the session id to an object
                 // { auth: {userId }}
                 
                 res.send('credentials correct!');
                 
               } else {
                 res.status(403).send('username/password is invalid');
               }
           }
       }
    });
 });
  
app.get('/check-test-in-progress',function(req,res){
    if(req.session && req.session.auth && req.session.auth.userId){
        if(req.session.testAuth && req.session.testAuth.testID){
            var now = new Date();
            var left_time = req.session.testAuth.testID - now.getHours()*3600 - now.getMinutes()*60 - now.getSeconds()*1;
            if(left_time >= 0){
                res.send(JSON.stringify({courseID:req.session.courseAuth.courseID,time:left_time}));
            }else{
                delete req.session.testAuth;
                delete req.session.courseAuth;
                res.status(404).end(req.session.auth.userId);    
            }
        }else{
            res.status(404).end(req.session.auth.userId);
        }
    }else{
        res.status(500).send('You are not logged in');
    }
});

var setInterval_variable = null;
app.post('/begin-test',function(req,res){
    if (req.session && req.session.auth && req.session.auth.userId) {
        // Load the user object
        pool.query('SELECT * FROM user WHERE username = ?', [req.session.auth.userId], function (err, result) {
            if (err) {
               res.status(500).send(err.toString());
            } else {
                if(result.length===0)
                {
                    res.status(404).send('You are not logged in');
                }else{
                    //cerate session for begin test
                    var time = req.body.time;
                    time = time.split(":");
                    var now = new Date();
                    time = time[0]*3600 + time[1]*60 + time[2]*1 + now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds()*1;
                    console.log(time);
                    req.session.testAuth = {testID:time};
                    req.session.courseAuth = {courseID:req.body.courseID}
                    res.send('Test Started');
                }
            }
        });
    } else {
        res.status(404).send('You are not logged in');
    }
});

app.get('/stop-test',function(req,res){
    delete req.session.testAuth;
    delete req.session.courseAuth;
    res.send('Test Stopped');
});

 app.get('/check-login', function (req, res) {
    if (req.session && req.session.auth && req.session.auth.userId) {
        // Load the user object
        pool.query('SELECT * FROM user WHERE username = ?', [req.session.auth.userId], function (err, result) {
            if (err) {
               res.status(500).send(err.toString());
            } else {
                if(result.length===0)
                {
                    res.status(404).send('You are not logged in');
                }else{
                    res.send(result[0].username);
                }
            }
        });
    } else {
        res.status(404).send('You are not logged in');
    }
 });
//test Database Connection
app.get('/test-db',function(req,res){
    pool.query('SELECT *FROM user',function(err,result){
        if(err){
            res.send(err.toString());
			console.log(err);
        }else{
            res.send('Connection Success.');
        }
    });
});

// Admin Apis

//as their is only one admin so we can check authorization by this function

app.get('/admin',function(req,res){
    res.send(createIndexTemplate('/ui/admin.js'));
});

app.get('/check-admin-login',function(req,res){
    if (req.session && req.session.auth && req.session.auth.userId) {
        // Load the user object
        pool.query('SELECT * FROM admin WHERE username = ?', [req.session.auth.userId], function (err, result) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                if(result.length===0){
                    res.status(404).send('You are not logged in');
                }else{
                    res.send(result[0].username);    
                }
            }
        });
    } else {
        res.status(404).send('You are not logged in');
    }
});

app.post('/create-admin', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var salt = crypto.randomBytes(128).toString('hex');
    var dbString = hash(password, salt);
    pool.query('INSERT INTO admin (username, password) VALUES (?,?)', [username, dbString], function (err, result) {
        if (err) {
            res.status(500).send(err.toString());
        } else {
            res.status(200).send('Admin successfully created: ' + username);
        }
    });
});

app.post('/login-admin', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    pool.query('SELECT *FROM admin WHERE username = ?', [username], function (err, result) {
        if (err) {
            res.status(500).send(err.toString());
        } else {
        //    res.send(JSON.stringify(result));
            if (result.length === 0) {
                res.status(403).send('username/password is invalid');
            } else {
                // Match the password
                var dbString = result[0].password;
                
                var salt = dbString.split('$')[2];
                var hashedPassword = hash(password, salt); // Creating a hash based on the password submitted and the original salt
                if (hashedPassword === dbString) {
                    
                    // Set the session
                    req.session.auth = {userId: result[0].username};
                    // set cookie with a session id
                    // internally, on the server side, it maps the session id to an object
                    // { auth: {userId }}
                    
                    res.send('credentials correct!');
                    
                } else {
                    res.status(403).send('username/password is invalid');
                }
            }
        }
    });
});

app.get('/fetch-courses-user',function(req,res){
    if (req.session && req.session.auth && req.session.auth.userId) {
        // Load the user object
        pool.query('SELECT * FROM user WHERE username = ?', [req.session.auth.userId], function (err, result) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                if(result.length===0)
                {
                    res.status(404).send('Sorry no user found');
                }else{
                    pool.query('SELECT * FROM courses WHERE is_hidden = 0',function(err,result){
                        if(err){
                            res.status(500).send(err.toString());
                        }else{
                            res.send(JSON.stringify(result));
                        }
                    });
                }
            }
        });
    } else {
        res.status(404).send('You are not logged in');
    }
});

app.post('/fetch-questions-user',function(req,res){
    if (req.session && req.session.auth && req.session.auth.userId) {
        // Load the user object
        pool.query('SELECT * FROM user WHERE username = ?', [req.session.auth.userId], function (err, result) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                if(result.length===0)
                {
                    res.status(404).send('Sorry no user found');
                }else{
                    var course_name = req.body.courseName;
                    pool.query('SELECT q_id,question_statement,option_1,option_2,option_3,option_4 FROM questions WHERE course_name = ?',[course_name],function(err,result){
                        if(err){
                            res.status(500).send(err.toString());
                        }else{
                            res.send(JSON.stringify(result));
                        }
                    });
                }
            }
        });
    } else {
        res.status(404).send('You are not logged in');
    }
});

app.post('/calculate-result',function(req,res){
    if (req.session && req.session.auth && req.session.auth.userId) {
        // Load the user object
        pool.query('SELECT * FROM user WHERE username = ?', [req.session.auth.userId], function (err, result) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                if(result.length===0)
                {
                    res.status(404).send('Sorry no user found');
                }else{
                    var responseSheet = req.body.responseSheet;
                    var courseName = req.body.courseName;
                    var username = req.body.username;
                    var time_taken = req.body.time_taken;
                    console.log(courseName);
                    pool.query('SELECT q_id,correct_option FROM questions WHERE course_name = ?',[courseName],function(err,result){
                        if(err){
                            res.status(404).send(err.toString());
                        }else{
                            var response = JSON.parse(calculateResult(JSON.stringify(result),responseSheet)); 
                            pool.query('SELECT total_questions,each_mark FROM courses WHERE course_name = ?',[courseName],function(err,result){
                                if(err){
                                    res.status(500).send(err.toString());
                                }else{
                                    var each_mark = result[0].each_mark;
                                    var obtained_marks = each_mark * response.correct_questions;
                                    var total_questions = result[0].total_questions;
                                    var total_marks = each_mark * total_questions;
                                    var percentage = (obtained_marks/total_marks)*100;
                                    console.log(response.attempted_questions);
                                    pool.query('INSERT INTO result(username,course_name,time_taken,correct_questions,attempted_questions,obtained_marks,percentage) VALUES(?,?,?,?,?,?,?)',[username,courseName,time_taken,response.correct_questions,response.attempted_questions,obtained_marks,percentage],function(err,result){
                                        if(err){
                                            res.status(500).send(err.toString());
                                        }else{
                                            res.send(JSON.stringify({total_questions:total_questions,attempted_questions:response.attempted_questions,correct_questions:response.correct_questions,wrong_questions:(response.attempted_questions-response.correct_questions),obtained_marks:obtained_marks,percentage:percentage}));
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    } else {
        res.status(404).send('You are not logged in');
    }
});

function calculateResult(correctResult,responseSheet){
    var correctAnswer = 0;
    var attempted_question = 0;
    correctResult  = JSON.parse(correctResult);
    for(x in responseSheet){
        var index = -1;
        if(responseSheet[x].response != -1)
            attempted_question++;
        correctResult.find(function(item,i){
            if(item.q_id === responseSheet[x].q_id){
                index = i;
                return true;
            }
        });
        var data = correctResult.splice(index,1)[0];
        console.log(data);
        if(responseSheet[x].response === parseInt(data.correct_option)){
            correctAnswer++;
        }
    }
    var result = {attempted_questions:attempted_question,correct_questions:correctAnswer};
    return JSON.stringify(result);
}

app.get('/logout-admin', function (req, res) {
    delete req.session.auth;
    res.send('<html><body>Logged out!<br/><br/><a href="/">Back to home</a></body></html>');
});

app.get('/ui/js/:fileName', function (req, res) {
    res.sendFile(path.join(__dirname, 'ui/js', req.params.fileName));
});
// Admin Apis over  
//Courses Api

app.get('/manage-courses',function(req,res){
    if (req.session && req.session.auth && req.session.auth.userId) {
        // Load the user object
        pool.query('SELECT * FROM admin WHERE username = ?', [req.session.auth.userId], function (err, result) {
            if (err) {
               res.status(500).send(err.toString());
            } else {
                if(result.length===0){
                    res.status(404).send('You are not logged in');
                }else{
                    res.send(createIndexTemplate('/ui/manage_courses.js'));
                }
            }
        });
    } else {
        res.status(404).send('You are not logged in');
    }
});

app.get('/course-results',function(req,res){
    if (req.session && req.session.auth && req.session.auth.userId) {
        // Load the user object
        pool.query('SELECT * FROM admin WHERE username = ?', [req.session.auth.userId], function (err, result) {
            if (err) {
               res.status(500).send(err.toString());
            } else {
                if(result.length===0){
                    res.status(404).send('You are not logged in');
                }else{
                    res.send(createIndexTemplate('/ui/course_results.js'));
                }
            }
        });
    } else {
        res.status(404).send('You are not logged in');
    }
});

app.post('/fetch-course-result',function(req,res){
    if (req.session && req.session.auth && req.session.auth.userId) {
        // Load the user object
        pool.query('SELECT * FROM admin WHERE username = ?', [req.session.auth.userId], function (err, result) {
            if (err) {
               res.status(500).send(err.toString());
            } else {
                if(result.length===0){
                    res.status(404).send('You are not logged in');
                }else{
                    var course = req.body.courseName;
                    pool.query('SELECT *FROM result where course_name = ? ORDER BY percentage desc,time_taken asc',[course],function(err,result){
                        if(err){
                            res.status(500).send(err.toString());
                        }else{
                            res.send(JSON.stringify(result));
                        }
                    });
                }
            }
        });
    } else {
        res.status(404).send('You are not logged in');
    }
});

app.post('/add-new-course',function(req,res){
    if (req.session && req.session.auth && req.session.auth.userId) {
        // Load the user object
        pool.query('SELECT * FROM admin WHERE username = ?', [req.session.auth.userId], function (err, result) {
            if (err) {
               res.status(500).send(err.toString());
            } else {
                if(result.length===0){
                    res.status(404).send('You are not logged in');
                }else{
                    var course_name = req.body.courseName;
                    var time_duration = req.body.timeDuration;
                    var each_mark = req.body.eachMark;

                    pool.query('INSERT INTO courses(course_name,time_duration,each_mark) VALUES (?,?,?)',[course_name,time_duration,each_mark],function(err,result){
                        if(err){
                            res.status(500).send(err.toString());
                        }else{
                            res.send('Course Added Successfully');
                        }
                    });
                }
            }
        });
    } else {
        res.status(404).send('You are not logged in');
    }
});

app.get('/fetch-courses',function(req,res){
    if(req.session && req.session.auth && req.session.auth.userId){
        pool.query('SELECT *FROM admin WHERE username = ?',[req.session.auth.userId],function(err,result){
            if(err){
                res.status(500).send(err.toString());
            }else{
                if(result.length===0){
                    res.status(404).send('You are not logged in');
                }else{
                    pool.query('SELECT course_name FROM courses',function(err,result){
                        if(err){
                            res.status(500).send(err.toString());
                        }else{
                            res.send(JSON.stringify(result));
                        }
                    });
                }
            }
        });
    }else{
        res.status(404).send('You are not logged in');
    }
});

app.post('/remove-course',function(req,res){
    if(req.session && req.session.auth && req.session.auth.userId){
        pool.query('SELECT *FROM admin WHERE username = ?',[req.session.auth.userId],function(err,result){
            if(err){
                res.status(500).send(err.toString());
            }else{
                var course_name = req.body.courseName;
                pool.query('DELETE FROM courses WHERE course_name = ?',[course_name],function(err,result){
                    if(err){
                        res.status(500).send(err.toString());
                    }else{
                        res.send('Course removed successfully');
                    }
                });
            }
        });
    }else{
        res.status(404).send('You are not logged in');
    }
});

app.post('/fetch-course-details',function(req,res){
    if(req.session && req.session.auth && req.session.auth.userId){
        pool.query('SELECT *FROM admin WHERE username = ?',[req.session.auth.userId],function(err,result){
            if(err){
                res.status(500).send(err.toString());
            }else{
                var courseName = req.body.courseName;
                pool.query('SELECT *from courses WHERE courses.course_name = ?',[courseName],function(err,result){
                    if(err){
                        res.status(500).send(err.toString());
                    }else{
                        res.send(JSON.stringify(result));
                    }
                });
            }
        });
    }else{
        res.status(404).send('You are not logged in');
    }
});

app.post('/fetch-questions-admin',function(req,res){
    if(req.session && req.session.auth && req.session.auth.userId){
        pool.query('SELECT *FROM admin WHERE username = ?',[req.session.auth.userId],function(err,result){
            if(err){
                res.status(500).send(err.toString());
            }else{
                var course_name = req.body.courseName;
                pool.query('SELECT questions.* FROM questions WHERE course_name = ?',[course_name],function(err,result){
                    if(err){
                        res.status(404).send(err.toString());
                    }else{
                        res.send(JSON.stringify(result));
                    }
                });
           }
        });
    }else{
        res.status(404).send('You are not logged in');
    }
});

app.post('/add-new-question',function(req,res){
    if(req.session && req.session.auth && req.session.auth.userId){
        pool.query('SELECT *FROM admin WHERE username = ?',[req.session.auth.userId],function(err,result){
            if(err){
                res.status(500).send(err.toString());
            }else{
                var course_name = req.body.courseName;
                var question_statement = req.body.question_statement;
                var option1 = req.body.option1;
                var option2 = req.body.option2;
                var option3 = req.body.option3;
                var option4 = req.body.option4;
                var correctOption = req.body.correct_option;
                pool.query('INSERT INTO questions(question_statement,option_1,option_2,option_3,option_4,correct_option,course_name) VALUES(?,?,?,?,?,?,?)',[question_statement,option1,option2,option3,option4,correctOption,course_name],function(err,result){
                    if(err){
                        res.status(500).send(err.toString());
                    }else{
                        pool.query('UPDATE courses set total_questions = total_questions+1 where course_name = ?',[course_name],function(err,result){
                            if(err){
                                res.status(500).send(err.toString());
                            }else{
                                res.send('Question successfully added to course '+course_name);
                            }
                        });
                    }
                });
           }
        });
    }else{
        res.status(404).send('You are not logged in');
    }
});

app.post('/update-question',function(req,res){
    if(req.session && req.session.auth && req.session.auth.userId){
        pool.query('SELECT *FROM admin WHERE username = ?',[req.session.auth.userId],function(err,result){
            if(err){
                res.status(500).send(err.toString());
            }else{
               var questionid = req.body.question_id;
               var questionStatement = req.body.question_statement;
               var option1 = req.body.option_1;
               var option2 = req.body.option_2;
               var option3 = req.body.option_3;
               var option4 = req.body.option_4;
               var correct = req.body.correct_option;
               pool.query('UPDATE questions SET question_statement = ?,option_1 = ?,option_2 = ?,option_3 = ?,option_4 = ?,correct_option = ? WHERE q_id = ?',[questionStatement,option1,option2,option3,option4,correct,questionid],function(err,result){
                   if(err){
                       res.status(404).send(err.toString());
                   }else{
                       res.send('Successfully updated');
                   }
               });
           }
        });
    }else{
        res.status(404).send('You are not logged in');
    }
});

app.post('/remove-question',function(req,res){
    if(req.session && req.session.auth && req.session.auth.userId){
        pool.query('SELECT *FROM admin WHERE username = ?',[req.session.auth.userId],function(err,result){
            if(err){
                res.status(500).send(err.toString());
            }else{
               var questionid = req.body.question_id;
               var courseName = req.body.course_name;
               pool.query('DELETE FROM questions WHERE q_id = ?',[questionid],function(err,result){
                   if(err){
                       res.status(404).send(err.toString());
                   }else{
                       pool.query('UPDATE courses SET total_questions = total_questions-1 WHERE course_name = ?',[courseName],function(err,result){
                           if(err){
                               res.status(500).send(err.toString());
                           }else{
                               res.send('Successfully deleted');
                           }
                       });
                   }
               });
           }
        });
    }else{
        res.status(404).send('You are not logged in');
    }
});

app.post('/save-changes-in-course',function(req,res){
    if(req.session && req.session.auth && req.session.auth.userId){
        pool.query('SELECT *FROM admin WHERE username = ?',[req.session.auth.userId],function(err,result){
            if(err){
                res.status(500).send(err.toString());
            }else{
               var course_name = req.body.courseName;
               var time_duration = req.body.time_duration;
               var each_mark = req.body.each_mark;
               var isHidden = req.body.is_hidden;
               pool.query('UPDATE courses SET time_duration = ?,each_mark = ?,is_hidden = ? WHERE course_name = ?',[time_duration,each_mark,isHidden,course_name],function(err,result){
                   if(err){
                       res.status(500).send(err.toString());
                   }else{
                       res.send('Course updated successfully');
                   }
               });
           }
        });
    }else{
        res.status(404).send('You are not logged in');
    }
});

app.get('/logout', function (req, res) {
    delete req.session.auth;
    res.send('<html><body>Logged out!<br/><br/><a href="/">Back to home</a></body></html>');
});

app.get('/ui/:fileName', function (req, res) {
    res.sendFile(path.join(__dirname, 'ui', req.params.fileName));
});
  
app.get('/hash/:input', function(req, res) {
   var hashedString = hash(req.params.input, 'this-is-some-random-string');
   res.send(hashedString);
});

//var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});
