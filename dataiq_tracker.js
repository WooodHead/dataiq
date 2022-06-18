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
        console.log(current_url)
        const params = new URLSearchParams(new URL(current_url).search) 
        const user_search_term = params.get("q")
        
        /*
        keyHistory=""
        $("input").keypress(function(e) {
            keyHistory += String.fromCharCode(e.which)    
            // console.log(keyHistory)
        });
        */
        
    }
    

});

