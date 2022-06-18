let msg_and_function_map={
    "mode":{
        "reward": on_click_reward_mode,
        "privacy": on_click_privacy_mode
    }
    
}
function throw_last_chrome_error(){
    if(chrome.runtime.lastError){
        /* error */
        throw chrome.runtime.lastError.message
    }
    return null;
}
function set_MODE_key(mode){
    if(!mode) {
        throw "MODE is none";
    }
    mode = mode.toLowerCase();
    chrome.storage.sync.set({"MODE": mode}, function() {
        // if there is an error then throw an error
        throw_last_chrome_error();
    });
    
}
function on_click_reward_mode() {
    console.log("on_click_reward_mode")
}  
function on_click_privacy_mode() {
    console.log("on_click_privacy_mode")
}
chrome.storage.sync.get(['MODE'], function(result) {
    MODE = result.key
    if(!MODE) {
        MODE = "reward"
        set_MODE_key("reward")
        msg_and_function_map["mode"]["reward"]()
    }
    
});


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if(msg["mode"]){
        mode = msg["mode"]
        msg_and_function_map["mode"][mode]()
    }
    
    return true;
  });

// chrome.tabs.onActivated.addListener((active_info) => {
//     chrome.tabs.get(active_info.tabId, function (tab) {
        
//     });
// });



