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
    return true;
}
function save_data_in_database(user_data) {
    console.log(user_data)
}
function store_data(key, value, is_array) {
    console.log("-- store_data --");
    if(!is_array) {
        mode_dict={}
        mode_dict[key]=value
        chrome.storage.sync.set(mode_dict,function(){
            throw_last_chrome_error();
        });
        
    } else {
        let user_data = []
        chrome.storage.sync.get([key], function(result) {
            if (result[key]) {
                arr = result[key]
                if (Array.isArray(arr)) {
                    arr.push(value)
                    let obj_to_save = {}
                    obj_to_save[key] = arr
                    chrome.storage.sync.set(obj_to_save, function (resp) {
                        // if there is an error then throw an error
                        throw_last_chrome_error();
                    });
                    user_data = arr;
                }
            } else {
                let obj_to_save = {}
                obj_to_save[key] = [value]
                chrome.storage.sync.set(obj_to_save, function () {
                    // if there is an error then throw an error
                    throw_last_chrome_error();
                });
                user_data = [value]
            }
            if(user_data && user_data >= 20) {
                save_data_in_database(user_data)    
            }            
        });

        
    }
    

    
}
function on_click_reward_mode() {
    store_data("mode", "reward", false)
}  
function on_click_privacy_mode() {
    store_data("mode", "privacy", false)
    console.log("in privacy")
}

chrome.storage.sync.get(['mode'], function(result) {
    mode = result["mode"]
    if(!result["mode"]){
        mode="reward"
        store_data("mode", "reward", false)
    } else {
        msg_and_function_map["mode"][mode]()
    }
});


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if(msg["mode"]){
        mode = msg["mode"]
        msg_and_function_map["mode"][mode]()
    } else if(msg["type"]){
        type = msg["type"]
        if(type == "store_search_term"){
            store_data(msg["key"], msg["value"], true)
        }

    }
    
    sendResponse();
    return true;
  });




