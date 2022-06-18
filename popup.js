function update_mode() {
    chrome.runtime.sendMessage({"mode": MODE}, response=>{
        console.log("Response: ", response)
    })    
}
function on_click_mode_button(reward_btn, privacy_btn, mode){
    if (mode == "reward"){
        MODE="reward"
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
        update_mode()

        
    } else if(mode == "privacy"){
        MODE="privacy"
        privacy_btn.className="btn btn-primary"
        reward_btn.className="btn btn-outline-primary"
        // Call function for privacy mode
        // privacy mode is nothing but ad blocker
        update_mode()
                

    }
    
    return null;
    
}

reward_btn=document.getElementById("reward-btn")
privacy_btn=document.getElementById("privacy-btn")

let MODE="reward"

reward_btn.addEventListener("click", function(){
    on_click_mode_button(reward_btn, privacy_btn, "reward")
})
privacy_btn.addEventListener("click", function(){
    on_click_mode_button(reward_btn, privacy_btn, "privacy")
})


    

