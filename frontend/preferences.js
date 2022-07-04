document.addEventListener("DOMContentLoaded", function () {
    const API_BASE_URL = "http://127.0.0.1:8000";
    function update_pref_setting_in_db(pref_text_state_mapping){
        (async () => {
            const rawResponse = await fetch(`${API_BASE_URL}/save_user_data/`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "email": "abhijeetlokhande1996@gmail.com",
                    "preferences": pref_text_state_mapping
                })
            });
            const content = await rawResponse.json();
            console.log(content);
        })();
        
    }
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
        update_pref_setting_in_db(pref_text_state_mapping);
    });

    document.getElementById("btn-save-details").addEventListener("click", function(){
        let age_range = document.getElementById("age_range_dropdown").value;
        let dob = document.getElementById("date-birth").value;
        let profession = document.getElementById("profession_dropdown").value;
        let gender = document.getElementById("gender_dropdown").value;
        const cond = age_range || dob || profession || gender;
        if(!cond) {
            console.error("at least one field in personal details should present");
            return
        }
        
        const obj_to_save = {
            "age_range": !age_range || age_range=="null" ?  null: age_range,
            "dob": !dob || dob=="null" ?  null: dob,
            "profession": !profession || profession=="null" ? null: profession,
            "gender": !gender || gender=="null" ?  null: gender
        };
        (async () => {
            const rawResponse = await fetch(`${API_BASE_URL}/save_user_data/`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "email": "abhijeetlokhande1996@gmail.com",
                    "personal_details": obj_to_save
                })
            });
            const content = await rawResponse.json();
            console.log(content);
        })();        
    });
});