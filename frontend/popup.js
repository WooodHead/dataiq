const API_BASE_URL = "http://127.0.0.1:8000"
let MODE = "reward";
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

function update_mode(mode) {
    chrome.runtime.sendMessage({"mode": mode}, response=>{});    
}
function on_click_mode_button(reward_btn, privacy_btn, mode){
    if (mode == "reward"){
        MODE = "reward"
        reward_btn.className="btn btn-primary"
        privacy_btn.className="btn btn-outline-primary"
        document.getElementById("points_row").style.display="block";
        update_mode("reward")

        
    } else if(mode == "privacy"){
        MODE = "privacy"
        privacy_btn.className="btn btn-primary"
        reward_btn.className="btn btn-outline-primary"
        document.getElementById("points_row").style.display="none";
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
function login() {
    window.open(`${API_BASE_URL}/login`);
}
function logout() {
    window.open(`${API_BASE_URL}/logout`)
}
function get_user_info() {
    chrome.cookies.get(
        {
            "url": API_BASE_URL,
            "name": "name"
        }, function(cookie){
            if(cookie) {
                const name = cookie.value;
                document.getElementById("email_id_p").innerText = name;
                btn_login.removeEventListener("click", login);
                btn_login.style.display="none";                
            } else {
                btn_login.style.display="block";
                document.getElementById("email_id_p").innerText = null;
                btn_login.addEventListener("click", login);
            }
            
        });    
}
function calc_points() {
    function update_points_in_html(points) {
        document.getElementById("points_h2").innerText = `Points: ${Math.round(points)}`;
        document.getElementById("points_h2").style.display="block"
    }
    chrome.runtime.sendMessage({"action": "calculate_points"}, response=>{
        if(response) {
            if("points" in response) {
                update_points_in_html(response["points"]);
            }
        }
    });
    /*chrome.storage.sync.get(['search_term_array', 'visited_href'], function(resp){
        let points=0;
        points = resp["search_term_array"] ? resp["search_term_array"].length : 0; 
        points += resp["visited_href"] ? resp["visited_href"].length : 0; 
        // update_points_in_html(points);
    });*/ 
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
        let obj_to_show = {
            "email": resp["email"],
            "search_term_array_len": resp["search_term_array"].length,
            "visited_href_len": resp["visited_href"].length
        }
        alert(JSON.stringify(obj_to_show));
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
            on_click_mode_button(reward_btn, privacy_btn, "reward")
        } else if (mode_dict["mode"] == "privacy") {
            enable_dataiq_button_flag = false;       
            enable_dataIQ.className = button_classname_and_state_mapping["enable_dataiq_button"]["deactive"]
            on_click_mode_button(reward_btn, privacy_btn, "privacy")
        } else{
            ;
        }
    });
    chrome.cookies.get(
        {
            "url": API_BASE_URL,
            "name": "access_token"
        }, function(cookie){
            if(cookie) {
                access_token = cookie.value;
                if(access_token) {
                    
                    get_user_info(); 
                    calc_points();                    
                } else {
                    // access token blank need to login
                    // need to login
                    btn_login.style.display="block";
                }

            } else {
                btn_login.style.display="block";
                
                
            }
            
        });    


    
}


