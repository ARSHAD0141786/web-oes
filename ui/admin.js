var host = "https://arshad-oes.herokuapp.com";
//var host = "http://localhost:8080";
// var host = "http://10.10.16.26:8080";
function loadLoginForm () {
    var loginHtml = `
        <center>
        <h3>ADMIN</h3>
        <input type="text" id="username" placeholder="username" />
        <br/><br/>
        <input type="password" id="password" placeholder="password" />
        <br/><br/>
        <input type="submit" id="login_btn" value="Login" />
        <br/><br/>
        
        <a href="/" >Not admin</a1>
        </center>
        `;
    document.getElementById('main_area_container').innerHTML = loginHtml;
    
    // Submit username/password to login
    var submit = document.getElementById('login_btn');
    submit.onclick = function () {
        // Create a request object
        var request = new XMLHttpRequest();
        
        // Capture the response and store it in a variable
        request.onreadystatechange = function () {
          if (request.readyState === XMLHttpRequest.DONE) {
              // Take some action
              if (request.status === 200) {
                  submit.value = 'Please wait...';
              } else if (request.status === 403) {
                  alert('Invalid username/password. Try again?');
                  submit.value = 'Invalid credentials. Try again?';
              } else if (request.status === 500) {
                  alert('Something went wrong on the server');
                  submit.value = 'Login';
              } else {
                  alert('Something went wrong on the server');
                  submit.value = 'Login';
              }
              loadLogin();
          }  
          // Not done yet
        };
        
        // Make the request
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        request.open('POST',host + '/login-admin', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({username: username, password: password}));  
        submit.value = 'Logging in...';
        
    };

/* line after login button <input type="submit" id="register_btn" value="Register" />
    var register = document.getElementById('register_btn');
    register.onclick = function () {
        // Create a request object
        var request = new XMLHttpRequest();
        
        // Capture the response and store it in a variable
        request.onreadystatechange = function () {
          if (request.readyState === XMLHttpRequest.DONE) {
              // Take some action
              if (request.status === 200) {
                  alert('Admin created successfully');
                  register.value = 'Registered!';
              } else {
                  alert('Could not register the admin');
                  register.value = 'Register';
              }
          }
        };
        // Make the request
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        request.open('POST', host + '/create-admin', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({username: username, password: password}));  
        register.value = 'Registering...';
    };
*/
}

function loadLoggedInUser (username) {
    var loginArea = document.getElementById('main_area_container');
    loginArea.innerHTML = `
        <h3> Hi <i>${username}</i></h3>
        <input type="submit" id="logout_btn" value="Logout"/><br/><br/>
        <a href="/manage-courses">Manage Courses</a><br/><br/>
        <a href="/course-results">Course results</a><br/><br/>
        <a href="/users">Users</a>
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
                  alert('Logout Successfully.');
              } else {
                  alert(this.responseText);
                  logout_btn.value = 'Logout';
              }
          }
        };
        // Make the request
        request.open('GET', host + '/logout-admin', true);
        request.send(null);  
        logout_btn.value = 'Logging out...';
    };

}


function loadLogin () {
    // Check if the user is already logged in
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                loadLoggedInUser(this.responseText);
            } else {
                loadLoginForm();
            }
        }
    };
    request.open('GET', host + '/check-admin-login', true);
    request.send(null);
}

// The first thing to do is to check if the user is logged in!
loadLogin();