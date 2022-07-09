const API_BASE_URL = "http://127.0.0.1:8000";
let msg_and_function_map = {
  mode: {
    reward: on_click_reward_mode,
    privacy: on_click_privacy_mode,
  },
  action: {
    "clean-up-data": clean_up_data_from_local_storage,
  },
};
function get_access_token() {
  return new Promise((resolve, reject) => {
    try {
      chrome.cookies.get(
        {
          url: API_BASE_URL,
          name: "access_token",
        },
        function (cookie) {
          if (cookie) {
            access_token = cookie.value;
            if (access_token) {
              resolve(access_token);
            } else {
              reject();
            }
          } else {
            reject();
          }
        }
      );
    } catch (err) {
      reject();
    }
  });
}
function get_email_from_cookie() {
  return new Promise((resolve, reject) => {
    chrome.cookies.get(
      {
        url: API_BASE_URL,
        name: "email",
      },
      function (cookie) {
        if (cookie) {
          email = cookie.value;
          if(email) {
            resolve(email);
          } else {
            reject("email not present")
          }
        } else {
          reject("email not present");
        }
      }
    );
  });
}
function clean_up_data_from_local_storage() {
  store_data("search_term_array", [], false);
  store_data("visited_href", [], false);
  console.log("clean_up_data_from_local_storage done!!");
}

function throw_last_chrome_error() {
  if (chrome.runtime.lastError) {
    /* error */
    throw chrome.runtime.lastError.message;
  }
  return true;
}
function save_data_in_database() {
  /*
        retrieve user_seach_data and visited href and save into the database
    */

  function inner_func(email, acc_token) {
    const keys_to_check = ["search_term_array", "visited_href"];

    chrome.storage.sync.get(keys_to_check, function (resp) {
      const user_search_terms = resp["search_term_array"]
        ? resp["search_term_array"]
        : [];
      const user_visited_hrefs = resp["visited_href"]
        ? resp["visited_href"]
        : [];
      if (!user_search_terms.length || !user_visited_hrefs.length) {
        return;
      }
      if (email) {
        const API_BASE_URL = "http://127.0.0.1:8000";
        let obj_to_save = {
          email: email,
          user_search_terms: user_search_terms,
          user_visited_hrefs: user_visited_hrefs,
        };
        (async () => {
          try {
            const rawResponse = await fetch(`${API_BASE_URL}/save_user_data/`, {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${acc_token}`,
              },
              body: JSON.stringify(obj_to_save),
            });
            const content = await rawResponse.json();
          } catch (err) {
            throw "error in saving";
          }
        })();
      } else {
        console.error("Email not present, save to database interrupted");
      }
    });
  }
  get_access_token()
    .then((acc_token) => {
      get_email_from_cookie().then(email=>{
        inner_func(email, acc_token);
      }).catch(err=>{
        throw err;
      });
    })
    .catch((err) => {
      
      throw err;
    });
}
function store_data(key, value, is_array) {
  if (!is_array) {
    mode_dict = {};
    mode_dict[key] = value;
    chrome.storage.sync.set(mode_dict, function () {
      throw_last_chrome_error();
    });
  } else {
    chrome.storage.sync.get([key], function (result) {
      if (result[key]) {
        user_data = result[key];
        if (Array.isArray(user_data)) {
          user_data.push(value);
          let obj_to_save = {};
          obj_to_save[key] = user_data;
          chrome.storage.sync.set(obj_to_save, function (resp) {
            // if there is an error then throw an error
            throw_last_chrome_error();
          });
          if (user_data && user_data.length >= 1) {
            try {
              save_data_in_database();
              console.log("save_data_in_database -- done");
            } catch (err) {
              console.error("unable to save data in database");
            } finally {
              // clean_up_data_from_local_storage();
            }
          }
        }
      } else {
        console.log("In Else");
        let obj_to_save = {};
        obj_to_save[key] = [value];
        chrome.storage.sync.set(obj_to_save, function () {
          // if there is an error then throw an error
          throw_last_chrome_error();
        });
      }
    });
  }
}
function on_click_reward_mode() {
  store_data("mode", "reward", false);
}
function on_click_privacy_mode() {
  store_data("mode", "privacy", false);
}

chrome.storage.sync.get(["mode"], function (result) {
  mode = result["mode"];
  if (!result["mode"]) {
    mode = "reward";
    store_data("mode", "reward", false);
  } else {
    msg_and_function_map["mode"][mode]();
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg["mode"]) {
    mode = msg["mode"];
    msg_and_function_map["mode"][mode]();
  } else if (msg["type"]) {
    type = msg["type"];
    if (type == "store_search_term") {
      store_data(msg["key"], msg["value"], true);
    }
  } else if (msg["action"]) {
    let action = msg["action"];
    if (action) {
      msg_and_function_map["action"][action]();
    }
  }
  return true;
});
