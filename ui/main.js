var host = "https://arshad-oes.herokuapp.com:8080";
//var host = "http://localhost:8080";
// var host = "http://10.10.16.26:8080";
function loadLoginForm () {
    var loginHtml = `
        <center>
        <h3>Login/Register</h3>
        <input type="text" id="username" placeholder="username" maxlength="20" required/>
        <br/><br/>
        <input type="password" id="password" placeholder="password" />
        <br/><br/>
        <input type="button" id="login_btn" value="Login" />
        <input type="button" id="register_btn" value="Register" />
        <br/><br/>
        </center>
        `;
    document.getElementById('main_area_container').innerHTML = loginHtml;
    
    // Submit username/password to login
    var submit = document.getElementById('login_btn');
    submit.onclick = function () {
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;    
        if(username.length >= 1 && password.length >=1){
            // Create a request object
            var request = new XMLHttpRequest();
            
            // Capture the response and store it in a variable
            request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                // Take some action
                if (request.status === 200) {
                    submit.value = 'Please wait...';
                } else if (request.status === 403) {
                    alert('Invalind username/password. Try again?');
                    submit.value = 'Login';
                } else if (request.status === 500) {
                    alert('Something went wrong on the server'+this.responseText);
                    submit.value = 'Login';
                } else {
                    alert('Something went wrong on the server'+this.responseText);
                    submit.value = 'Login';
                }
                loadLogin();
            }  
            // Not done yet
            };
            // Make the request
            request.open('POST',host + '/login', true);
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify({username: username, password: password}));  
            submit.value = 'Logging in...';
        }else{
            alert('Invalid credentials');
        }
    };
    
    var register = document.getElementById('register_btn');
    register.onclick = function () {
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;    
        if(username.length >=1 && password.length >=1){
            // Create a request object
            var request = new XMLHttpRequest();
            
            // Capture the response and store it in a variable
            request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                // Take some action
                if (request.status === 200) {
                    alert('User created successfully');
                    register.value = 'Registered!';
                } else {
                    alert('Could not register the user');
                    register.value = 'Register';
                }
            }
            };
            // Make the request
            request.open('POST', host + '/create-user', true);
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify({username: username, password: password}));  
            register.value = 'Registering...';
        }else{
            alert('Username/Password cannot be empty.');
        }
    };
}

function loadLoggedInUser (username) {
    var loginArea = document.getElementById('main_area_container');
    loginArea.innerHTML = `
        <div id="user_area">
        <h3> Hi <i id="logined_username">${username}</i></h3>
        <input type="submit" id="logout_btn" value="Logout"/>
        </div>
        <div id="dynamic_area">
            <center>
            <h2>Select Course</h2>
            <table id="course_area">
                <tr>   
                    <td>Loading courses...</td>
                </tr>
            </table>
            </center>
            <div id="instructions">
            </div>
        </div>
           `;
    var logout_btn = document.getElementById('logout_btn');
    logout_btn.onclick = function(){
        // Create a request object
        var request = new XMLHttpRequest();
        
        // Capture the response and store it in a variable
        request.onreadystatechange = function () {
          if (request.readyState === XMLHttpRequest.DONE) {
              // Take some action
              if (request.status === 200) {
                  logout_btn.value = 'Logout';
                  loadLoginForm();
              } else {
                  alert('Could not logout the user');
                  logout_btn.value = 'Logout';
              }
          }
        };
        // Make the request
        request.open('GET', host + '/logout', true);
        request.send(null);  
        logout_btn.value = 'Logging out...';
    };
}

function loadTest(){
    // Check if the user is already logged in
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                // continueTest(this.responseText);
                // console.log(this.responseText);
                var result = JSON.parse(this.responseText);
                prepareTest(result.courseID,convertTime(result.time));
            } else if(request.status === 404){
                loadLoggedInUser(this.responseText);
                fetchCourses();
            }else{
                loadLoginForm();
            }
        }
    };
    request.open('GET', host + '/check-test-in-progress', true);
    request.send(null);
}
function loadLogin () {
    // Check if the user is already logged in
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                loadTest();
            } else {
                loadLoginForm();
            }
        }
    };
    request.open('GET', host + '/check-login', true);
    request.send(null);
}
var courseData = null;
function fetchCourses(){
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                // console.log(this.responseText);
                var content = '<tr><td>';
                courseData = JSON.parse(this.responseText);
                if(courseData.length != 0){
                    content += '<select id="courses"><option value="-1">Select course</option>';
                    for(var i=0;i<courseData.length;i++){
                        content += `<option value="${i}">${courseData[i].course_name}</option>`;
                    }
                    content += `</select></td><td><input type="button" id="show_btn" value="Show"/></td></tr>`;
                    document.getElementById('course_area').innerHTML = content;
                    var show_btn = document.getElementById('show_btn');
                    show_btn.onclick = function(){
                        if(document.getElementById('courses').value != -1){
                            displayInstruction(document.getElementById('courses').value);
                        }else{
                            alert('Select course first');
                        }
                    }
                }else{
                    alert('No courses available.Contact to admin.');
                    content += 'No course available. Contact to ADMIN.</td></tr>';
                    document.getElementById('course_area').innerHTML = content;
                }
            } else {
                alert('Something went wrong on server');
            }
        }
    };
    request.open('GET', host + '/fetch-courses-user', true);
    request.send(null);
}


function displayInstruction(courseID){
    document.getElementById('instructions').innerHTML = `
    <h4>Instructions for ${courseData[courseID].course_name}</h4><hr/>
    <p>1. This course contains ${courseData[courseID].total_questions} questions.</p>
    <p>2. Each question is of ${courseData[courseID].each_mark} marks.</p>
    <p>3. Total time duration is ${courseData[courseID].time_duration}.</p>
    <p>4. Clock will automatically start and after time up you will automatically exit from test.</p>
    <p>5. User cannot logout while test is in progress.</p>
    <p>6. Result will be calculated by the no. of correct answers ,if same then priority will be given to that candidate who completes test in lesser time.</p>
    <p>6. Do not refresh the page once test has been started.</p><br/><br/>
    <center><input type="button" id="start_test_btn" onclick="startTest('${courseID}');" value="Start Test"/></center>
    `;
}

function startTest(courseID){
    if(confirm('Are you prepared for '+courseData[courseID].course_name+' test')){
        document.getElementById('logout_btn').disabled = true;
        document.getElementById('dynamic_area').innerHTML = `<center><p>Fetching questions...</p></center>`;
        fetchQuestions(courseID);
    }
}

var questions = null;

function fetchQuestions(courseID){
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                questions = JSON.parse(this.responseText);
                if(questions.length > 0){
                    document.getElementById('dynamic_area').innerHTML = `<center><p>Preparing test...</p></center>`;
                    beginTest(courseID);
                }else{
                    alert('Sorry !,No questions available.Contact to ADMIN.');
                    loadLogin();
                }
            }else{
                alert('Something went wrong in fetching questions.'+this.responseText);
                //redirect to first page
                loadLogin();
            }
        }
    };
    request.open('POST', host + '/fetch-questions-user', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({courseName:courseData[courseID].course_name}));
}

function beginTest(courseID){
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                initializeResponseSheet();
                prepareTest(courseID,courseData[courseID].time_duration.toString());
            }else{
                alert(this.responseText);
                loadLogin();
            }
        }
    };
    request.open('POST', host + '/begin-test', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({time:courseData[courseID].time_duration,courseID:courseID}));
}

function prepareTest(courseID,time_duration_for_test){
    document.getElementById('dynamic_area').innerHTML = `
    <div id="course_details"><p>COURSE : <span id="course_name_test">${courseData[courseID].course_name}</span></p></div>
    <div id="clock_counter" ><p><strong>Time Left</strong> : ${time_duration_for_test}</p></div>
    <div id="response_area">
        <table>
            <tr>
                <td>Total questions :</td>
                <td>${courseData[courseID].total_questions}</td>
            </tr>
            <tr>
                <td>Attempted questions :</td>
                <td id="attempted_questions">0</td>
            </tr>
            <tr>
                <td>Remaining questions :</td>
                <td id="remaining_questions">${courseData[courseID].total_questions}</td>
            </tr>
        </table>
    </div>
    <div id="question_area"></div>
    <div id="flow_control_btn">
        <input type="button" align="left" id="prev_question_btn" value="Previous"/>
        <input type="button" align="right" id="next_question_btn" value="Next"/><br/><br/>
        <input type="button" align="center" id="submit_test_btn" value="Submit"/>
    </div>
    `;
    //load first question
    var question_no = 1;
    document.getElementById('question_area').innerHTML = questionTemplate(question_no-1);
    if(responseSheet[question_no-1].response != -1){
        document.getElementsByName('option_choose')[responseSheet[question_no-1].response - 1].checked = true;
    }
    var course_name = courseData[courseID].course_name;
    var username = document.getElementById('logined_username').innerHTML;
    
    // show running time
    var time = time_duration_for_test.split(':');
    var total_time = time[0]*3600 + time[1]*60 + time[2]*1; 
    var counter = total_time;
    function timer(){
        counter--;
        document.getElementById('clock_counter').innerHTML = `<p><strong>Time Left</strong> : ${convertTime(counter)}</p>`;
        if(counter <= 0){
            alert('Time up');
            stopTest(username,course_name, total_time-counter);
        }
    }
    setInterval_variable =  setInterval(timer,1000);
    
    var prev_question_btn = document.getElementById('prev_question_btn');
    prev_question_btn.disabled = true;
    var next_question_btn = document.getElementById('next_question_btn');
    var submit_btn = document.getElementById('submit_test_btn');
    if(question_no === courseData[courseID].total_questions){
        next_question_btn.disabled = true;
    }
    prev_question_btn.onclick = function(){
        setResponseSheet(question_no);
        showQuestionsStatus();
        document.getElementById('question_area').innerHTML = questionTemplate(--question_no - 1);
        if(responseSheet[question_no-1].response != -1){
            document.getElementsByName('option_choose')[responseSheet[question_no-1].response - 1].checked = true;
        }
        next_question_btn.disabled = false;
        if(question_no === 1){
            prev_question_btn.disabled = true;
        }
    }
    next_question_btn.onclick = function(){
        setResponseSheet(question_no);
        showQuestionsStatus();
        document.getElementById('question_area').innerHTML = questionTemplate(++question_no - 1);
        if(responseSheet[question_no-1].response != -1){
            document.getElementsByName('option_choose')[responseSheet[question_no-1].response - 1].checked = true;
        }
        prev_question_btn.disabled = false;
        if(question_no === courseData[courseID].total_questions){
            next_question_btn.disabled = true;
        }
    }
    submit_btn.onclick = function(){
        setResponseSheet(question_no);
        showQuestionsStatus();
        // if(confirm('Are you sure you want to submit test. You have '+ convertTime(counter) +' more time.')){
        //     stopTest(username,course_name,total_time-counter);
        // }
        confirmSubmit(username,course_name,counter,courseID,total_time);
        clearInterval(setInterval_variable);
        // if(counter>=60){
            
        // }else{
        //     stopTest(username,course_name,total_time-counter);
        // }
    }
}

function confirmSubmit(username,course_name,counter,courseID,total_time){
    document.getElementById('dynamic_area').innerHTML = `
    <center>
        <p>You have <span id="time_left_confirm_submit">${convertTime(counter)}</span> time left</p>
        <p>Are you sure to submit test</p>
        <input type="button" id="back_to_test" value="Back to test"/>
        <input type="button" id="confirm_submit_btn" value="Submit"/>
    </center>
    `;
    var counter2 = counter;
    function timer2(){
        counter2--;
        document.getElementById('time_left_confirm_submit').innerHTML = `${convertTime(counter2)}`;
        if(counter2 <= 0){
            stopTest(username,course_name,total_time-counter2);    
        }
    }
    var setInterval_variable2 = setInterval(timer2,1000);
    var confirm_submit_btn = document.getElementById('confirm_submit_btn');
    var back_to_test_btn = document.getElementById('back_to_test');
    confirm_submit_btn.onclick = function(){
        stopTest(username,course_name,total_time-counter);
        clearInterval(setInterval_variable2);
    }
    back_to_test_btn.onclick = function(){
        prepareTest(courseID,convertTime(counter2));
        clearInterval(setInterval_variable2);
    }
}

var setInterval_variable;
var attempted_questions = 0;
function showQuestionsStatus(){
    document.getElementById('attempted_questions').innerHTML = `${attempted_questions}`;
    document.getElementById('remaining_questions').innerHTML = `${responseSheet.length-attempted_questions}`;
}

function convertTime(time){
    var s = time % 60;
    var m = ((time-s)/60)%60;
    var h = (time - s - m*60)/3600;
    if(h<10)
        h = '0'+h;
    if(m<10)
        m = '0'+m;
    if(s<10)
        s = '0'+s;
    return `${h}:${m}:${s}`;
}

function questionTemplate(questionID){
    var inner = `
    <p><strong>Q No.${questionID+1}</strong>  ${questions[questionID].question_statement}</p>
    <div id="options" margin-left="20px">
    <input type="radio" name="option_choose" value="1" id="option_1"><label for="option_1">${questions[questionID].option_1}</label><br/>
    <input type="radio" name="option_choose" value="2" id="option_2"><label for="option_2">${questions[questionID].option_2}</label><br/>
    <input type="radio" name="option_choose" value="3" id="option_3"><label for="option_3">${questions[questionID].option_3}</label><br/>
    <input type="radio" name="option_choose" value="4" id="option_4"><label for="option_4">${questions[questionID].option_4}</label><br/><br/>
    </div>
    `;
    return inner;
}

// responseSheet is a sheet of responses made by user
var responseSheet=[];
// correct option can be 1,2,3,4 and -1 if not attempted question
// question_id = q_id in database
function initializeResponseSheet(){
    if(responseSheet.length === 0){
        for(var i=0;i<questions.length;i++){
            responseSheet.push({q_id:questions[i].q_id,response:-1});
        }
    }
}

function setResponseSheet(question_no){
    var x = document.getElementsByName('option_choose');
    for(var i=0;i<4;i++){
        if(x[i].checked){
            if(responseSheet[question_no - 1].response === -1){
                attempted_questions++;
            }
            responseSheet[question_no - 1].response = i+1;
        }
    }
}
function stopTest(username,courseName,time_taken){
    var request =new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState === XMLHttpRequest.DONE){
            if(request.status === 200){
                calculateResult(username,courseName,time_taken);
            }
        }
    }
    request.open('GET', host + '/stop-test', true);
    request.send(null);  
}
function calculateResult(username,courseName,time_taken){
    clearInterval(setInterval_variable);
    document.getElementById('dynamic_area').innerHTML = `
    <center><h3><u>RESULT</u></h3>
    <p id="result_status">Loading Result...</p></center>
    `;

     // Create a request object
     var request = new XMLHttpRequest();
        
     // Capture the response and store it in a variable
     request.onreadystatechange = function () {
       if (request.readyState === XMLHttpRequest.DONE) {
           // Take some action
           if (request.status === 200) {
            //    console.log(this.responseText);
               result = JSON.parse(this.responseText);
               document.getElementById('logout_btn').disabled = false;
               document.getElementById('result_status').innerHTML = `
               <table>
                    <tr>
                        <td>Total questions</td>
                        <td>:</td>
                        <td>${result.total_questions}</td>
                    </tr>
                    <tr>
                        <td>Attempted questions</td>
                        <td>:</td>
                        <td>${result.attempted_questions}</td>
                    </tr>
                    <tr>
                        <td>Correct</td>
                        <td>:</td>
                        <td>${result.correct_questions}</td>
                    </tr>
                    <tr>
                        <td>Wrong</td>
                        <td>:</td>
                        <td>${result.wrong_questions}</td>
                    </tr>
                    <tr>
                        <td>Percentage</td>
                        <td>:</td>
                        <td>${result.percentage}</td>
                        <td>%</td>
                    </tr>
               </table>
               <br/><br/>
               <a href='/'>Back</a>
               `;
           } else {
               if(confirm(this.responseText + ' Resubmit test(Recommended)')){
                    stopTest(username,courseName,time_taken);
               }
           }
       }
     };
     // Make the request
     request.open('POST', host + '/calculate-result', true);
     request.setRequestHeader('Content-Type', 'application/json');
     request.send(JSON.stringify({responseSheet:responseSheet,username:username,courseName:courseName,time_taken:convertTime(time_taken)}));  
}

// The first thing to do is to check if the user is logged in!
loadLogin();