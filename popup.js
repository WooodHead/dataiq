function on_click_mode_button(){
    console.log("on_click_mode_button")
    return null;
    
}
window.addEventListener("DOMContentLoaded", (event)=>{
    reward_btn=document.getElementById("reward-btn")
    privacy_btn=document.getElementById("privacy-btn")
    
    reward_btn.addEventListener("click", on_click_mode_button)
    privacy_btn.addEventListener("click", on_click_mode_button)    
    console.log("DOMContentLoaded")
    
})
