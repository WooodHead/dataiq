function throw_last_chrome_error(){
    if(chrome.runtime.lastError){
        /* error */
        throw chrome.runtime.lastError.message
    }
    return null;
}
function getUrlVars(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
$(document).ready(function() {
    let current_url = $(location).attr("href");
    let position = current_url.search(/google/i)
    if(position>=0){
        const params = new URLSearchParams(new URL(current_url).search) 
        const user_search_term = params.get("q")
        chrome.runtime.sendMessage({
            "type":"store_search_term", 
            "key": "search_term_array",
            "value": user_search_term
        });

        
        /*
        keyHistory=""
        $("input").keypress(function(e) {
            keyHistory += String.fromCharCode(e.which)    
            // console.log(keyHistory)
        });
        */
        
    }
    

});

