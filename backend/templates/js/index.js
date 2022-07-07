const API_BASE_URL = "http://127.0.0.1:8000"
$(document).ready(function(){
    $("#btn_login").click(function(){
        
        window.location.replace(API_BASE_URL + "/login")
        
    })
})