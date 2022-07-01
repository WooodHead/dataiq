function update_mode(mode) {
    chrome.runtime.sendMessage({"mode": mode}, response=>{})    
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
function on_click_preferences(){
    window.open("https://www.google.com/")
    return;
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
btn_logout.addEventListener("click", logout)


function login() {
    chrome.runtime.sendMessage({"action": "login"}, response=>{})
    get_user_info();
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
    })
    
    chrome.storage.sync.get(["auth_token"], function(resp){
        resp["auth_token"] ? null : btn_login.click();
        get_user_info()
    });
    
}


