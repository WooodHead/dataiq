function update_mode(mode) {
    chrome.runtime.sendMessage({"mode": mode}, response=>{});    
}
function on_click_mode_button(reward_btn, privacy_btn, mode){
    if (mode == "reward"){
        MODE = "reward"
        reward_btn.className="btn btn-primary"
        privacy_btn.className="btn btn-outline-primary"
        // Reward mode
        // track all user activity and store it in the 
        // database, what to track and what not to track 
        // is yet to be decide
        /* 
            reward mode: need to call function in content script
            and store use track data in cookies 
        */
        update_mode("reward")

        
    } else if(mode == "privacy"){
        MODE = "privacy"
        privacy_btn.className="btn btn-primary"
        reward_btn.className="btn btn-outline-primary"
        // Call function for privacy mode
        // privacy mode is nothing but ad blocker
        update_mode("privacy")
                

    }
    
    return null;
    
}

function toggle_enable_dataiq_button(){
    /*
    enable_dataiq_button_flag = MODE == "reward" ? true : false;
    if(enable_dataiq_button_flag) {
        enable_dataIQ.className = button_classname_and_state_mapping["enable_dataiq_button"]["active"]
    } else if (!enable_dataiq_button_flag) {
        enable_dataIQ.className = button_classname_and_state_mapping["enable_dataiq_button"]["deactive"]
    }
    */
}
MODE = "reward";
let reward_btn=document.getElementById("reward-btn")
let privacy_btn=document.getElementById("privacy-btn")
let get_google_search_btn=document.getElementById("get-google-search")
let enable_dataIQ = document.getElementById("btn-enable-dataiq");
let btn_login = document.getElementById("btn-login")
let btn_logout = document.getElementById("btn-logout")
let enable_dataiq_button_flag = null;
let button_classname_and_state_mapping = {
    "enable_dataiq_button": {
        "active": "btn btn-primary btn-lg btn-block",
        "deactive": "btn btn-warning btn-lg btn-block"
    }
}

function login() {
    chrome.runtime.sendMessage({"action": "login"}, (response)=>{
        
        if("error" in response) {
            if(!response["error"]){
                get_user_info();
            }else {
                alert("Login Failed");
            }
        } 
    });
}
function logout() {
    chrome.runtime.sendMessage({"action": "logout"}, response=>{
        if(chrome.runtime.lastError){
            alert("Error")
        } else {
            if(!response["error"]) {
                document.getElementById("email_id_p").innerText = "";
                btn_login.style = "block";
            }
        }
        
    })
}
function get_user_info() {
    chrome.storage.sync.get(["name"], function(resp){
        const  name = resp["name"]; 
        if (name){
            document.getElementById("email_id_p").innerText = name;
            btn_login.removeEventListener("click", login);
            btn_login.style.display="none";
        } else {
            btn_login.style.display="block";
            btn_login.addEventListener("click", login);
        }
        
    });
    chrome.identity.getProfileUserInfo({accountStatus: "ANY"}, function(user_info){
        email = user_info["email"]
        if (email){
            document.getElementById("email_id_p").innerText = email;
            btn_login.removeEventListener("click", login);
            btn_login.style.display="none";
        } else {
            btn_login.style.display="block";
            btn_login.addEventListener("click", login);
        }
        
        
    });
}
function calc_points() {
    function update_points_in_html(points) {
        document.getElementById("points_h2").innerText = `Points: ${Math.round(points)}`;
    }
    chrome.storage.sync.get(['search_term_array', 'visited_href'], function(resp){
        let points=0;
        points = resp["search_term_array"] ? resp["search_term_array"].length : 0; 
        points += resp["visited_href"] ? resp["visited_href"].length : 0; 
        points /= 100;
        update_points_in_html(points);
    });
}
function on_click_preferences(){
    window.open("./preferences.html");
}
function on_click_marketplace(){
    window.open("./market_place.html");
}
document.getElementById("btn-show-data").addEventListener("click", function(){
    chrome.storage.sync.get(["email", "search_term_array", 
    "visited_href"], function(resp){
        console.log(resp);
    })
});
reward_btn.addEventListener("click", function(){
    on_click_mode_button(reward_btn, privacy_btn, "reward")
    toggle_enable_dataiq_button()
    
})
privacy_btn.addEventListener("click", function(){
    on_click_mode_button(reward_btn, privacy_btn, "privacy")
    toggle_enable_dataiq_button()
})
enable_dataIQ.addEventListener("click", function(){
    enable_dataiq_button_flag = !enable_dataiq_button_flag
    enable_dataIQ.className = enable_dataiq_button_flag ? button_classname_and_state_mapping["enable_dataiq_button"]["active"] :button_classname_and_state_mapping["enable_dataiq_button"]["deactive"] 
    // toggle_enable_dataiq_button()
});
btn_login.addEventListener("click", function(){
    login();
})
btn_logout.addEventListener("click", logout);
document.getElementById("btn-preferences").addEventListener("click", on_click_preferences);
document.getElementById("btn-marketplace").addEventListener("click", on_click_marketplace);
document.getElementById("btn-clean-up-data").addEventListener("click", function(){
    chrome.runtime.sendMessage({"action": "clean-up-data"}, response=>{});
})


window.onload = function() {
    chrome.storage.sync.get(["mode"], function(mode_dict){
        mode_dict = mode_dict =! null ? mode_dict : {}
        if(!mode_dict["mode"]){
            update_mode("reward")
        }
        if(mode_dict["mode"]=="reward") {
            enable_dataiq_button_flag = true;
            enable_dataIQ.className = button_classname_and_state_mapping["enable_dataiq_button"]["active"]
            on_click_mode_button(reward_btn, privacy_btn, "active")
        } else if (mode_dict["mode"] == "privacy") {
            enable_dataiq_button_flag = false;       
            enable_dataIQ.className = button_classname_and_state_mapping["enable_dataiq_button"]["deactive"]
            on_click_mode_button(reward_btn, privacy_btn, "privacy")
        } else{
            ;
        }
    });
    chrome.storage.sync.get(["auth_token"], function(resp){
        resp["auth_token"] ? function(){
            get_user_info(); calc_points();
        }() : btn_login.click();
    });
    
}


