function update_mode(mode) {
    chrome.runtime.sendMessage({"mode": mode}, response=>{})    
}
function on_click_mode_button(reward_btn, privacy_btn, mode){
    if (mode == "reward"){
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
        MODE="privacy"
        privacy_btn.className="btn btn-primary"
        reward_btn.className="btn btn-outline-primary"
        // Call function for privacy mode
        // privacy mode is nothing but ad blocker
        
                

    }
    
    return null;
    
}
function on_click_preferences(){
    window.open("https://www.google.com/")
    return;
}

reward_btn=document.getElementById("reward-btn")
privacy_btn=document.getElementById("privacy-btn")
get_google_search_btn=document.getElementById("get-google-search")
preferences_btn=document.getElementById("btn-preferences")
show_points_btn=document.getElementById("btn-show-points")

show_points_btn.addEventListener("click", function(){
    // search_term_array
    chrome.storage.sync.get(["search_term_array"], function(resp){
        search_term_array = resp["search_term_array"]
        points =   search_term_array ? Math.round(search_term_array.length / 100) : 0
        document.getElementById("point-span").innerText = points
    })
})
preferences_btn.addEventListener("click", function(){
    on_click_preferences()
})
get_google_search_btn.addEventListener("click", function (){
    // chrome.storage.sync.get(["search_term_array"], function(result) {
    //     alert(JSON.stringify(result))
    // })
    chrome.storage.sync.get(["visited_href"], function(result) {
        alert(JSON.stringify(result))
    })
})
reward_btn.addEventListener("click", function(){
    on_click_mode_button(reward_btn, privacy_btn, "reward")
})
privacy_btn.addEventListener("click", function(){
    on_click_mode_button(reward_btn, privacy_btn, "privacy")
})
chrome.storage.sync.get(["mode"], function(mode_dict){
    if(!mode_dict["mode"]){
        update_mode("reward")
    }
})

    

