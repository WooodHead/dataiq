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

reward_btn=document.getElementById("reward-btn")
privacy_btn=document.getElementById("privacy-btn")



reward_btn.addEventListener("click", function(){
    on_click_mode_button(reward_btn, privacy_btn, "reward")
})
privacy_btn.addEventListener("click", function(){
    on_click_mode_button(reward_btn, privacy_btn, "privacy")
})
chrome.storag.sync.get(["mode"], function(mode_dict){
    if(!mode_dict["mode"]){
        update_mode("reward")
    }
})

    

