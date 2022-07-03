let msg_and_function_map={
    "mode":{
        "reward": on_click_reward_mode,
        "privacy": on_click_privacy_mode
    },
    "action": {
        "login": login,
        "logout": logout
    }
    
}

function login(callback=null){
    let manifest = chrome.runtime.getManifest();
    let clientId = manifest.oauth2.client_id;
    let redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
    let nonce = Math.random().toString(36).substring(2, 15);
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'id_token');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'openid profile email');
    authUrl.searchParams.set('nonce', nonce);
    authUrl.searchParams.set('prompt', 'consent');
    chrome.identity.launchWebAuthFlow(
        {
            url: authUrl.href,
            interactive: true,
        }, (redirect_url)=>{
            if(redirect_url){
                const urlHash = redirect_url.split('#')[1];
                const params = new URLSearchParams(urlHash);
                const jwt = params.get('id_token');
                const base64Url = jwt.split('.')[1];
                const base64 = base64Url.replace('-', '+').replace('_', '/');
                const token_obj = JSON.parse(atob(base64));
                const cond = nonce == token_obj["nonce"] && (token_obj["iss"] == "https://accounts.google.com" || token_obj["iss"] == "accounts.google.com") && (token_obj["aud"] == clientId)
                if(cond){
                    const name = token_obj["name"] ? token_obj["name"]: null;
                    store_data("name", name, false);
                    store_data("auth_token", true, false);
                }
                callback();
            }
        });    
}
function logout(callback=null) {
    store_data("auth_token", false, false);
    store_data("name", null, false);
    if(callback) {
        callback();
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
    /*
        retrieve user_seach_data and visited href and save into the database
    */
   console.log("save_data_in_database")
   const keys_to_check = ["search_term_array", "visited_href"]
   chrome.storage.sync.get(keys_to_check, function(resp){
    console.log(1)
    user_search_terms = resp["search_term_array"] ? resp["search_term_array"] : []
    user_visited_hrefs = resp["visited_href"] ? resp["visited_href"] : []
    console.log(2)
    if (!user_search_terms.length || !user_visited_hrefs.length) {
        console.log(3)
        return;
    }
    console.log(4)
    const API_BASE_URL = "http://127.0.0.1:8000"
    let obj_to_save = {
        "email": "abhijeetlokhande1996@gmail.com",
        "user_search_terms": user_search_terms,
        "user_visited_hrefs": user_visited_hrefs
    }
    (async () => {
        try {
            const rawResponse = await fetch(`${API_BASE_URL}/save_user_data/`, {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(obj_to_save)
              });
              const content = await rawResponse.json();
              console.log(content);
        } catch (err) {
            console.log(err)
        }

      
        
      })();
      
   });
}
function store_data(key, value, is_array) {
    if(!is_array) {
        mode_dict={}
        mode_dict[key]=value
        chrome.storage.sync.set(mode_dict,function(){
            throw_last_chrome_error();
        });
        
    } else {
        chrome.storage.sync.get([key], function(result) {
            if (result[key]) {
                user_data = result[key]
                if (Array.isArray(user_data)) {
                    user_data.push(value)
                    let obj_to_save = {}
                    obj_to_save[key] = user_data
                    chrome.storage.sync.set(obj_to_save, function (resp) {
                        // if there is an error then throw an error
                        throw_last_chrome_error();
                    });
                    if(user_data && user_data.length >= 20) {
                        save_data_in_database()    
                    }                      
                }
            } else {
                let obj_to_save = {}
                obj_to_save[key] = [value]
                chrome.storage.sync.set(obj_to_save, function () {
                    // if there is an error then throw an error
                    throw_last_chrome_error();
                });
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

    } else if(msg["action"]){
        let action = msg["action"]
        function callback_func() {
            chrome.storage.sync.get("auth_token", function(resp){
                let err_flag_to_send = false;
                if(action=="login") {
                    err_flag_to_send = resp["auth_token"] ? false : true;
                } else if(action=="logout") {
                    err_flag_to_send = !resp["auth_token"] ? false : true;
                }
                sendResponse({"error": err_flag_to_send}); 
            })
        }
        msg_and_function_map["action"][action](callback_func)
        /*
        
        */
    }
    return true;
});




