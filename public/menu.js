document.getElementById("sidebar").style.left = "0";
document.getElementById("main").style.marginLeft = "250px";

        $(document).ready(function () {
            $.get("/gettoken", function(data) {
                if(data != "null") {
                    const Logout = $('<a></a>')
                    .attr('href', '/logout')
                    .text('Logout')
                    $("#sidebar").append(Logout);
                }else {
                    const Me = $('<a></a>')
                    .attr('href', '/login.html')
                    .text('Login')
                    $("#sidebar").append(Me);
                    const Mee = $('<a></a>')
                    .attr('href', '/register.html')
                    .text('Register')
                    $("#sidebar").append(Mee);
                }
            })
        });