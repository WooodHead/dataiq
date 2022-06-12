function on_click_mode_button(reward_btn, privacy_btn, mode){
    if (mode == "reward"){
        MODE="REWARD"
    } else if(mode == "privacy"){
        MODE="PRIVACY"
    }


    return null;
    
}

reward_btn=document.getElementById("reward-btn")
privacy_btn=document.getElementById("privacy-btn")

MODE="REWARD"

reward_btn.addEventListener("click", function(){
    on_click_mode_button(reward_btn, privacy_btn, "reward")
})


console.log("DOMContentLoaded")
    

