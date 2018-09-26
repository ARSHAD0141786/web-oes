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
    <input type="button" id="check_course_result" value="Check Result"/><br/></br>
    <a href="/admin">Back</a>
    </center>
    `;
document.getElementById('main_area_container').innerHTML = innerHtml;

var check_course_result_btn = document.getElementById('check_course_result');
check_course_result_btn.onclick = function(){
    var course = document.getElementById('courses').value;
    document.getElementById('main_area_container').innerHTML = `
    <a href="/course-results">Back</a>
    <p>Course : <strong>${course}</strong></p>
    <center>
    <h3><u>RESULT</u></h3>
    <div id="result">Fetching result...</div>
    </center>
    `;

    var request = new XMLHttpRequest();
    // Capture the response and store it in a variable
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            var coursesTag = document.getElementById('courses');
            // Take some action
            if (request.status === 200) {
                console.log(JSON.parse(this.responseText));
                var result = JSON.parse(this.responseText);
                var content = `
                <table cellspacing="20px">
                    <tr>
                        <th>Rank</th>
                        <th>Username</th>
                        <th>Percentage</th>
                        <th>Time Taken</th>
                        <th>test_date</th>
                    </tr>    
                `;
                if(result.length >= 1){
                    for(var i=0;i<result.length ;i++){
                        content += `
                        <tr>
                            <td>${i+1}</td>
                            <td>${result[i].username}</td>
                            <td>${result[i].percentage}</td>
                            <td>${result[i].time_taken}</td>
                            <td>${result[i].test_date}</td>
                        </tr>
                        `;
                    }
                    content += `</table>`;
                    document.getElementById('result').innerHTML = content;
                }else{
                    document.getElementById('result').innerHTML = `No result Found for this course.`;
                }
            } else {
                console.log(this.responseText);
                document.getElementById('result').innerHTML = `Cannot fetch result for this course.`;
            }
        }
    };
    // Make the request
    request.open('POST', host + '/fetch-course-result', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({courseName:course}));
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
