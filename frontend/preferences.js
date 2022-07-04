document.addEventListener("DOMContentLoaded", function () {
    function on_click_pref_text(id, pref_text_state_mapping){
        // bg-primary text-white
        pref_text_state_mapping[id] = !pref_text_state_mapping[id];
        if(pref_text_state_mapping[id]) {
            document.getElementById(id).className="card text-white bg-primary";
        } else if(!pref_text_state_mapping[id]){
            document.getElementById(id).className="card";
        }
        
    }

    let pref_array = [
        "Fashion", "Technology", "Travel", "Food & Drink",
        "Gaming", "Lifestyle", "Sports", "Business", "Politics"
    ];
    let card_arr = []
    const pref_text_state_mapping = {}
    for(let i=0; i < pref_array.length; i++) {
        const pref_text = pref_array[i];
        pref_text_state_mapping[pref_text] = false;
        const card = `
        <div class="card" style="cursor:grab;" id="${pref_text}">
            <div class="card-body">
                <h5 class="card-title">${pref_text}</h5>
                <p class="card-text">With supporting text below as a natural lead-in to additional content.</p>        
            </div>
        </div>
        `;
        card_arr.push(card)
        if (card_arr.length == 3){
            let row =`<div class="row mt-2 text-center">`
            card_arr.forEach((card_html)=>{
                row+=`<div class="col">`
                row+=`${card_html}`    
                row+=`</div>`
            });
            row += "</div>";
            $("#preferences_div").append(row);
            card_arr = [];
        }
    
    }
    if(card_arr) {
        let row =`<div class="row mt-2 text-center" style="cursor:grab;">`
        card_arr.forEach((card_html)=>{
            row+=`<div class="col">`
            row+=`<div class="col">${card_html}</div>`    
            row+=`</div>`
        });
        row += "</div> <hr/>";   
         
        $("#preferences_div").append(row);    
    }
    pref_array.forEach((pref_text)=>{
        document.getElementById(pref_text).addEventListener("click", function(){
            on_click_pref_text(pref_text, pref_text_state_mapping);
        });    
    });
    $("body").append(`
    <div class="row mt-2">
        <div class="col"></div>
        <div class="col">
            <button type="btn" class="btn btn-primary" id="btn-save-preferences">Save Preferences</button>
        </div>
        <div class="col"></div>
    </div>`);

    document.getElementById("btn-save-preferences").addEventListener("click", function(){
        console.log(pref_text_state_mapping);
    });
});