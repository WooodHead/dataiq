function throw_last_chrome_error(){
    if(chrome.runtime.lastError){
        /* error */
        throw chrome.runtime.lastError.message
    }
    return null;
}

$(document).ready(function() {

    let current_url = window.location.href
    let position = current_url.search(/google/i)
    if(position>=0){
        const params = new URLSearchParams(new URL(current_url).search) 
        const user_search_term = params.get("q")
        chrome.runtime.sendMessage({
            "type":"store_search_term", 
            "key": "search_term_array",
            "value": user_search_term
        });        
    } else {
        chrome.runtime.sendMessage({
            "type":"store_search_term",
            "key": "visited_href",
            "value": current_url
        })
    }
    /*
    let ads = `<div style="height:50px;; width:100%;">
        <p>Data IQ Advertisement</p>
    </div>`;
    $("body").prepend(ads);
    */

});

