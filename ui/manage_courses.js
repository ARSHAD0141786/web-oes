var host = "https://arshad-oes.herokuapp.com:8080";
//var host = "http://localhost:8080";
// var host = "http://10.10.16.26:8080";
fetchCourses();
var innerHtml = `
    <center>
    <h3>Select Courses</h3>
    <select id="courses">
        <option>Please wait...</option>
    </select>
    <input type="submit" id="edit_course" value="Edit"/>
    <input type="submit" id="remove_course" value="Remove"/><br/><br/>
    <input type="submit" id="add_new_course" value="Add New Course"/><br/><br/>
    <a href="/admin">Back</a>
    </center>
    `;
document.getElementById('main_area_container').innerHTML = innerHtml;

var addNewCourse_btn = document.getElementById('add_new_course');
addNewCourse_btn.onclick = function(){
    displayAddNewCourse();
}
var edit_btn = document.getElementById('edit_course');
edit_btn.onclick = function(){
    var course = document.getElementById('courses').value;
    gotoEditCourse(course);
}

var remove_course_btn = document.getElementById('remove_course');
remove_course_btn.onclick = function(){
    var course_name = document.getElementById('courses').value;
    var retVal = confirm("Do you want to remove "+course_name+" course ?");
    if( retVal == true ){
        var request = new XMLHttpRequest();
        // Capture the response and store it in a variable
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                // Take some action
                if (request.status === 200) {
                    alert('Course removed successfully');
                    remove_course_btn.value = 'Remove';
                    fetchCourses();
                } else {
                    alert(this.responseText);
                    remove_course_btn.value = 'Remove';
                }
            }
        };
        // Make the request
        request.open('POST', host + '/remove-course', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({courseName:course_name}));  
        remove_course_btn.value = 'Please wait...';
    }
}

function gotoEditCourse(course_name){
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            var coursesTag = document.getElementById('courses');
            // Take some action
            if (request.status === 200) {
                var courseData = JSON.parse(this.responseText);
                edit_btn.value = 'Edit';
                // only one row will come in response
                displayEditCourse(courseData[0]);
                fetchQuestions(course_name);
                // console.log(courseData);
            } else {
                alert(this.responseText);
                edit_btn.value = 'Edit';
            }
        }
    };
    // Make the request
    request.open('POST', host + '/fetch-course-details', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({courseName:course_name}));
    edit_btn.value = 'Please wait...';
}

function fetchCourses(){
    var request = new XMLHttpRequest();
    // Capture the response and store it in a variable
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            var coursesTag = document.getElementById('courses');
            // Take some action
            if (request.status === 200) {
                var content = '';
                var courses = JSON.parse(this.responseText);
                if(courses.length>0){
                    for(var i=0 ;i<courses.length;i++){
                        content+=`<option value="${courses[i].course_name}">${courses[i].course_name}</option>`;
                    }
                }else{
                    content = `<option>No course found</option>`;
                }
                coursesTag.innerHTML = content;
            } else {
                coursesTag.innerHTML = 'Could not load courses.';
            }
        }
    };
    // Make the request
    request.open('GET', host + '/fetch-courses', true);
    request.send(null);
}

function displayAddNewCourse(){
    var innerHtml = `
    <center>
    <input type="text" id="course_name" placeholder="Enter course name"/><br/><br/>
    <input type="text" id="time_duration" placeholder="Time duration(hh:mm:ss)"/><br/><br/>
    <input type="text" id="each_marks" placeholder="Each marks"/><br/><br/>
    <input type="submit" id="add_course_btn" value="ADD"/>
    <a href="/manage-courses">Back</a>
    </center>
    `;
    document.getElementById('main_area_container').innerHTML = innerHtml;

    var addCourseBtn = document.getElementById('add_course_btn');
    addCourseBtn.onclick = function(){
        var request = new XMLHttpRequest();
        
        // Capture the response and store it in a variable
        request.onreadystatechange = function () {
          if (request.readyState === XMLHttpRequest.DONE) {
              // Take some action
              if (request.status === 200) {
                  alert('Course added successfully');
                  addCourseBtn.value = 'ADD';
                  displayAddNewCourse();
              } else {
                  alert(this.responseText);
                  addCourseBtn.value = 'ADD';
              }
          }
        };
        // Make the request
        var course_name = document.getElementById('course_name').value;
        var time_duration = document.getElementById('time_duration').value;
        var each_marks = document.getElementById('each_marks').value;
        request.open('POST', host + '/add-new-course', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({courseName:course_name,timeDuration:time_duration,eachMark:each_marks}));  
        addCourseBtn.value = 'Please wait...';
    }
}

var questions=null;
function fetchQuestions(courseName){
    var request = new XMLHttpRequest();
        // Capture the response and store it in a variable
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                // Take some action
                if (request.status === 200) {
                    var content = `<table border="1px solid black">
                                    <tr>
                                        <th>Q no.</th>
                                        <th>Question</th>
                                        <th>Operation</th>
                                    </tr>`;
                    questions = JSON.parse(this.responseText);
                    if(questions.length>0){
                        for(var i=0;i<questions.length;i++){
                            content += `
                            <tr>
                                <td><center>${i+1}.</center></td>
                                <td>${questions[i].question_statement}</td>
                                <td>
                                <button type="button" onclick="viewQuestion(${i})" href="#container">View</button>
                                <button type="button" onclick="editQuestion(${i})" href="#container">Edit</button>
                                <button type="button" onclick="removeQuestion(${i})">Remove</button>                            
                                </td>
                            </tr>`;
                        }
                    }else{
                        content += `
                        <tr>
                            <td colspan="3" >No questions available</td>
                        </tr>
                        `;
                    }
                    content += `
                    </table>
                    `;
                    document.getElementById('questions').innerHTML = content;
                } else {
                    alert(this.responseText);
                    document.getElementById('questions').innerHTML = 'Sorry!, Something went wrong';
                }
                // return response;
            }
        };
        // Make the request
        request.open('POST', host + '/fetch-questions-admin', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({courseName:courseName}));  
}

function viewQuestion(question_id){
    console.log(questions[question_id]);
    var inner = `
    <h4>Q no. ${question_id+1}<input type="button" id="cancel_view_question" value="Cancel"/></h4>
    <table border="1px solid black">
    <tr><td>${questions[question_id].question_statement}</td></tr>
    <tr><td>1. ${questions[question_id].option_1}</td></tr>
    <tr><td>2. ${questions[question_id].option_2}</td></tr>
    <tr><td>3. ${questions[question_id].option_3}</td></tr>
    <tr><td>4. ${questions[question_id].option_4}</td></tr>
    </table>
    Correct option : ${questions[question_id].correct_option}
    `;
    document.getElementById('question_area').innerHTML = inner;
    var cancel_view_question = document.getElementById('cancel_view_question');
    cancel_view_question.onclick = function(){
        document.getElementById('question_area').innerHTML = ``;
    }
}

function editQuestion(question_id){
    var inner = `
    <strong>Qno. ${question_id + 1}</strong><br/>
    <form>
    <textarea rows="5" cols="100" id="question_text" required>${questions[question_id].question_statement}</textarea><br/>
    <textarea rows="1" cols="100" id="option_1" required>${questions[question_id].option_1}</textarea><br/>
    <textarea rows="1" cols="100" id="option_2" required>${questions[question_id].option_2}</textarea><br/>
    <textarea rows="1" cols="100" id="option_3" required>${questions[question_id].option_3}</textarea><br/>
    <textarea rows="1" cols="100" id="option_4" required>${questions[question_id].option_4}</textarea><br/><br/>
    Correct option : 
    <select id="correct_option">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
    </select><br/><br/>
    <input type="button" id="update_question" value="Update" />
    <input type="button" id="cancel_update_question" value="Cancel"/>
    </form>
    `;
    document.getElementById('question_area').innerHTML = inner;
    document.getElementById('correct_option').value = questions[question_id].correct_option;
    var updateBtn = document.getElementById('update_question');
    var cancel_update_question = document.getElementById('cancel_update_question');
    updateBtn.onclick = function(){
        var questionStatement = document.getElementById('question_text').value;
        var option1 = document.getElementById('option_1').value;
        var option2 = document.getElementById('option_2').value;
        var option3 = document.getElementById('option_3').value;
        var option4 = document.getElementById('option_4').value;
        
        if(questionStatement != "" && option1 != "" && option2 != "" && option3 != "" && option4 != "" ){
            var request = new XMLHttpRequest();
            // Capture the response and store it in a variable
            request.onreadystatechange = function () {
                if (request.readyState === XMLHttpRequest.DONE) {
                    // Take some action
                    if (request.status === 200) {
                        alert(this.responseText);
                        updateBtn.value = 'Update';
                        gotoEditCourse(questions[question_id].course_name);
                    } else {
                        alert(this.responseText);
                        updateBtn.value = 'Update';
                    }
                }
            };
            // Make the request
            var correctOption = document.getElementById('correct_option').value;
            request.open('POST', host + '/update-question', true);
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify({question_id:questions[question_id].q_id,question_statement:questionStatement,option_1:option1,option_2:option2,option_3:option3,option_4:option4,correct_option:correctOption}));  
            updateBtn.value = 'updating...';
        }else{
            alert('Please fill all required fields');
        }
    }
    cancel_update_question.onclick = function(){
        document.getElementById('question_area').innerHTML = ``;
    }
}

function removeQuestion(question_id){
    var question_no = question_id+1;
    if(confirm('Do you want to remove question '+question_no)){
        var request = new XMLHttpRequest();
        // Capture the response and store it in a variable
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                // Take some action
                if (request.status === 200) {
                    // alert(this.responseText);
                    gotoEditCourse(questions[question_id].course_name);
                } else {
                    alert(this.responseText);
                }
            }
        };
        // Make the request
        request.open('POST', host + '/remove-question', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({question_id:questions[question_id].q_id,course_name:questions[question_id].course_name}));  
    }
}

//only one row will come in course data courseData = {course_name : "ENGLISH" ,..}
function displayEditCourse(courseData){
    var innerHtml = `
    <p>Course : ${courseData.course_name}</p>
    <a href="/manage-courses">Back</a><br/><br/>
    <table border="1px solid black">
        <tr>
            <td>Time Duration</td>
            <td id="course_duration">${courseData.time_duration}</td>
            <td><input type="button" id="change_time_duration" value="change"/></td>
        </tr>
        <tr>
            <td>Each mark</td>
            <td id="each_mark">${courseData.each_mark}</td>
            <td><input type="button" id="change_each_mark" value="change"/></td>
        </tr>
        <tr>
            <td>Hide</td>
            <td colspan="2"><input type="checkbox" id="is_hidden"/></td>
        </tr>
        <tr>
            <td>Total questions :</td>
            <td colspan="2" >${courseData.total_questions}</td>
        </tr>
    </table><br/>
    <input type="button" id="save_course" value="Save" disabled="true"/><br/><br/>
    <input type="button" id="addNewQuestionBtn" value="Add new question"/><br/><br/>
    <div id="question_area">
    </div>
    <center>
    <label>Available questions : </label>
    <div id="questions">Fetching questions...
    </div>
    </center>
    `;
    document.getElementById('main_area_container').innerHTML = innerHtml;
    var change_time_duration = document.getElementById('change_time_duration');
    var change_each_mark = document.getElementById('change_each_mark');
    change_time_duration.onclick = function(){
        if(change_time_duration.value === "Done"){
            var time_duration_changed = document.getElementById('changed_time').value;
            document.getElementById('course_duration').innerHTML = `${time_duration_changed}`;
            change_time_duration.value = 'change';
            if(change_each_mark.value === "change")
            document.getElementById('save_course').disabled = false;
            return;
        }
        var current_time_duration = document.getElementById('course_duration').innerHTML;
        document.getElementById('save_course').disabled = true;
        document.getElementById('course_duration').innerHTML = `<input id="changed_time" type="text" value="${current_time_duration}" />`;
        change_time_duration.value = 'Done';
    };

    change_each_mark.onclick = function(){
        if(change_each_mark.value === "Done"){
            var each_mark_changed = document.getElementById('changed_mark').value;
            document.getElementById('each_mark').innerHTML = `${each_mark_changed}`;
            change_each_mark.value = 'change';
            if(change_time_duration.value === "change")
            document.getElementById('save_course').disabled = false;
            return;
        }
        var current_mark = document.getElementById('each_mark').innerHTML;
        document.getElementById('save_course').disabled = true;
        document.getElementById('each_mark').innerHTML = `<input id="changed_mark" type="text" value="${current_mark}" />`;
        change_each_mark.value = 'Done';
    };

    document.getElementById('is_hidden').onclick = function(){
        if(change_each_mark.value==="change" && change_time_duration.value === "change"){
            document.getElementById('save_course').disabled = false;
        }      
    };

    var saveCourseBtn = document.getElementById('save_course');
    saveCourseBtn.onclick = function(){
        var request = new XMLHttpRequest();
        // Capture the response and store it in a variable
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                // Take some action
                if (request.status === 200) {
                    alert('Save course successfully');
                    saveCourseBtn.value = 'Save';
                    gotoEditCourse(courseData.course_name);
                } else {
                    alert(this.responseText);
                    saveCourseBtn.value = 'Save';
                }
            }
        };
        // Make the request
        var changed_time = document.getElementById('course_duration').innerHTML;
        var changed_mark = document.getElementById('each_mark').innerHTML;
        var course_name = courseData.course_name;
        var hide = 0;
        if(document.getElementById('is_hidden').checked){
            hide = 1;
        }
        request.open('POST', host + '/save-changes-in-course', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({courseName:course_name,time_duration:changed_time,each_mark:changed_mark,is_hidden:hide}));  
        saveCourseBtn.value = 'Saving...';
    };

    var addNewQuestionBtn = document.getElementById('addNewQuestionBtn');
    addNewQuestionBtn.onclick = function(){
        if(addNewQuestionBtn.value == 'Add new question'){
            addNewQuestionBtn.value = "Cancel";
            addNewQuestion(courseData.course_name);
        }else{
            addNewQuestionBtn.value = "Add new question";
            document.getElementById('question_area').innerHTML = ``;
        }
    }
    if(courseData.is_hidden === 0){
        document.getElementById("is_hidden").checked = false;
    }else{
        document.getElementById("is_hidden").checked = true;
    }
}

function addNewQuestion(courseName){
    document.getElementById('question_area').innerHTML = `
    <textarea id="question_statement" rows="5" cols="100" placeholder="Enter question here" required></textarea><br/>
    <textarea id="option_1" rows="1" cols="100" placeholder="Option 1" required></textarea><br/>
    <textarea id="option_2" rows="1" cols="100" placeholder="Option 2" required></textarea><br/>
    <textarea id="option_3" rows="1" cols="100" placeholder="Option 3" required></textarea><br/>
    <textarea id="option_4" rows="1" cols="100" placeholder="Option 4" required></textarea><br/>
    Correct Option : 
    <select id="correct_answer">
        <option value="1" selected>1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
    </select><br/><br/>
    <input type="button" id="add_question" value="Add"/>
    `;
    var addBtn = document.getElementById('add_question');
    addBtn.onclick = function(){
        var questionStatement = document.getElementById('question_statement').value;
        var option1 = document.getElementById('option_1').value;
        var option2 = document.getElementById('option_2').value;
        var option3 = document.getElementById('option_3').value;
        var option4 = document.getElementById('option_4').value;
        
        if(questionStatement != "" && option1 != "" && option2 != "" && option3 != "" && option4 != ""){
            var request = new XMLHttpRequest();
            // Capture the response and store it in a variable
            request.onreadystatechange = function () {
                if (request.readyState === XMLHttpRequest.DONE) {
                    // Take some action
                    if (request.status === 200) {
                        addBtn.value = 'Add';
                        alert(this.responseText);
                        gotoEditCourse(courseName);
                    }
                }
            };
            // Make the request
            var correctOption = document.getElementById('correct_answer').value;
            var dataSent = JSON.stringify({courseName:courseName,
                question_statement:questionStatement,
                option1:option1,
                option2:option2,
                option3:option3,
                option4:option4,
                correct_option:correctOption});
            console.log(dataSent);
            request.abort();
            request.open('POST', host + '/add-new-question', true);
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(dataSent);  
            addBtn.value = 'Adding...'; 
        }else{
            alert('Please fill all required fields');
        }
    }
}