'use strict';  // always start with this 

/* Set default date in forms to current date */
document.getElementById('pAct-date').valueAsDate = newUTCDate()
document.getElementById('fAct-date').valueAsDate = newUTCDate()


/* Past Activity 'Add New Activity' Button - Show Form */
let add_past_activity_button = document.getElementById("addPastActivityButton")
add_past_activity_button.addEventListener("click", add_past_activity_onclick);


/* Future Activity 'Add New Activity' Button - Show Form */
let add_future_activity_button = document.getElementById("addFutureActivityButton")
add_future_activity_button.addEventListener("click", add_future_activity_onclick);


/* Past Activity Form Dropdown */
let past_activity_dropdown = document.getElementById("pAct-activity")
past_activity_dropdown.addEventListener("change", past_activity_dropdown_onchange);


/* Past Activity 'Submit' Button - Submit Form */
let submit_past_activity_button = document.getElementById("submitPastActivityButton")
submit_past_activity_button.addEventListener("click", submit_past_activity_onclick);

let reminder_div = document.getElementById("reminder");
let question_div = document.getElementById("question");

// Here 

let yes_div = document.getElementById("yes");
let no_div = document.getElementById("no");

yes_div.addEventListener("click", function() {
  reminder_div.style.display = "none";
});

no_div.addEventListener("click", function() {
  reminder_div.style.display = "none";
});

let progress_button = document.getElementById("progress");
let overlay_bg = document.getElementById("overlay-bg");
let overlay_fg = document.getElementById("overlay-fg");

overlay_bg.style.display = "none";
overlay_fg.style.display = "none";

progress_button.addEventListener("click", function(e) {
  overlay_bg.style.display = "block";
  overlay_fg.style.display = "block";
  let activity = controls_select.value;
  controls_input.value = format_date1(new Date());
  let date = new Date(controls_input.value).getTime();
  doGraph(date, activity);
});

let exit_img = document.getElementById("overlay-exit-img");

exit_img.addEventListener("click", function(e) {
  overlay_bg.style.display = "none";
  overlay_fg.style.display = "none";
});

let chart_container = document.getElementById("chart-anchor-container");
renderGraph();

//

function format_date(dateObj) {
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();
  return year + "/" + month + "/" + day;
}

function format_date1(dateObj) {
  let x = new Date(dateObj);
  console.log(dateObj.getTimezoneOffset() * 60 * 1000);
  x.setTime(dateObj.getTime() - dateObj.getTimezoneOffset() * 60 * 1000);
  x.setDate(x.getDate() - 1);
  return x.toISOString().substr(0, 10);
}

function to_reminder(date) {
  date.setDate(date.getDate() + 1);
  let today = new Date();
  if (today - date < (1000 * 60 * 60 * 24)) {
    return "yesterday";
  }
  else {
    return `on ${[
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ][date.getDay()]}`;
  }
}

window.addEventListener("DOMContentLoaded", function() {
  reminder_div.style.display = "none";
  fetch(`/reminder`, {
    method: 'GET'
  })
  .then(response => response.json())
  .then(data => {
    if (data != null) {
      let date = new Date();
      date.setTime(data.date);
      let msg = `Did you remember to ${data.activity} ${to_reminder(date)}?`;
      question_div.textContent = msg;
      reminder_div.style.display = "flex";
    }
  })
  .catch((error) => {
    console.error('Reminder Error:', error);
  });
});

/* Future Activity 'Submit' Button - Submit Form */
let submit_future_activity_button = document.getElementById("submitFutureActivityButton")
submit_future_activity_button.addEventListener("click", submit_future_activity_onclick)

//

let controls_select = document.getElementById("controls-i1-select");
let controls_input = document.getElementById("controls-i2-input");
let controls_button = document.getElementById("controls-i3-button");

function setGraphLabel(a) {
  switch (a) {
    case "Walk":
      barchart.setLabel("Kilometers Walked");
      return;
    case "Run":
      barchart.setLabel("Kilometers Ran");
      return;
    case "Swim":
      barchart.setLabel("Laps Swam");
      return;
    case "Yoga":
      barchart.setLabel("Minutes Yoga");
      return;
    case "Soccer":
      barchart.setLabel("Minutes Soccer");
      return;
    case "Basketball":
      barchart.setLabel("Minutes Basketball");
      return;
    case "Bike":
      barchart.setLabel("Kilometers Biked");
      return;
    default:
      barchart.setLabel("Error");
      return;
  }
}

function doGraph(date, activity) {
  if (activity === undefined) {
    fetch(`/week?date=${date}`, {
      method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
      setGraphLabel(data.activity);
      renderGraph(data.week);
    });
  }
  else {
    fetch(`/week?date=${date}&activity=${activity}`, {
      method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
      setGraphLabel(data.activity);
      renderGraph(data.week);
    });
  }
}

doGraph(new Date().getTime());

controls_button.addEventListener("click", (e) => {
  let activity = controls_select.value;
  let date = new Date(controls_input.value).getTime();
  doGraph(date, activity);
});

//

/**
 * ONCLICK - Hide 'Add New Activity' Button under the Past Section and Show
 * Form to Add a Past Activity
 */
function add_past_activity_onclick() {
  /* Connect to Past Activity Sections */
  let pActAdd = document.getElementById("pAct-Add");
  let pActForm = document.getElementById("pAct-Form");

  /* Show Form, Hide 'Add New Activity' Button */
  pActAdd.classList.add("hide");
  pActForm.classList.remove("hide");
}


/**
 * ONCLICK - Hide 'Add New Activity' Button under the Future Section and Show
 * Form to Add a Future Activity
 */
function add_future_activity_onclick() {
  /* Connect to Past Activity Sections */
  let fActAdd = document.getElementById("fAct-Add");
  let fActForm = document.getElementById("fAct-Form");

  /* Show Form, Hide 'Add New Activity' Button */
  fActAdd.classList.add("hide");
  fActForm.classList.remove("hide");
}


/**
 * ONCHANGE - Automatically Change Units in Past Activty Form to accomodate the
 * selected Activity from the dropdown menu
 */
function past_activity_dropdown_onchange() {
  /* Connect to Past Activity Unit Input */
  let pActUnit = document.getElementById("pAct-unit");

  /* Show Form, Hide 'Add New Activity' Button */
  switch (past_activity_dropdown.value) {
    case 'Walk': case 'Run': case 'Bike':
      pActUnit.value = 'km';
      break;
    case 'Swim':
      pActUnit.value = 'laps';
      break;
    case 'Yoga': case 'Soccer': case 'Basketball':
      pActUnit.value = 'minutes';
      break;
    default:
      pActUnit.value = 'units';
  }
}


/**
 * ONCLICK - Validate Past Activity Form Contents, Send Data to Server, Remove
 * Form, and Display 'Add ...' Button with confirmation text above
 */
function submit_past_activity_onclick() {
  /* Connect to Past Activity Sections */
  let pActAdd = document.getElementById("pAct-Add");
  let pActForm = document.getElementById("pAct-Form");
  
  /* Activity Data to Send to Server */
  let data = {
    date: document.getElementById('pAct-date').value,
    activity: document.getElementById('pAct-activity').value,
    scalar: document.getElementById('pAct-scalar').value,
    units: document.getElementById('pAct-unit').value
  }

  if (!past_activity_form_is_valid(data)) {  
    alert("Invalid Past Activity. Please fill in the entire form.");
    return
  }

  /* Hide Form, Show 'Add New Activity' Button */
  pActAdd.classList.remove("hide");
  pActForm.classList.add("hide");
  
  /* Add 'p' tag above 'Add New Activity' Button */
  let newActivity = create_submission_success_element(   
    "Got it! ",
    `${data.activity} for ${data.scalar} ${data.units}. `,
    "Keep it up!"
  )
  insert_latest_response(pActAdd, newActivity)

  console.log('Past Activity Sending:', data);

  /* Post Activity Data to Server */
  fetch(`/store`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data), // post body
  })
  .then(response => response.json())
  .then(data => {
    console.log('Past Activity Success:', data);
  })
  .catch((error) => {
    console.error('Past Activity Error:', error);
  });
 
  /* Reset Form */
  document.getElementById('pAct-date').valueAsDate = newUTCDate()
  document.getElementById('pAct-activity').value = "Walk"
  document.getElementById('pAct-scalar').value = ""
  document.getElementById('pAct-unit').value = "km"
}


/**
 * ONCLICK - Validate Future Activity Form Contents, Send Data to Server, Remove
 * Form, and Display 'Add ...' Button with confirmation text above
 */
function submit_future_activity_onclick() {
  /* Connect to Future Activity Sections */
  let fActAdd = document.getElementById("fAct-Add");
  let fActForm = document.getElementById("fAct-Form");
  
  /* Activity Data to Send to Server */
  let data = {
    date: document.getElementById('fAct-date').value,
    activity: document.getElementById('fAct-activity').value
  }
  
  /* Form Validation */
  if (!future_activity_form_is_valid(data)) {  
    alert("Invalid Future Plan. Please fill in the entire form.");
    return
  }

  /* Hide Form, Show 'Add New Activity' Button */
  fActAdd.classList.remove("hide");
  fActForm.classList.add("hide");

  /* Add 'p' tag above 'Add New Activity' Button  */
  let newActivity = create_submission_success_element(
    "Sounds good! Don't forget to come back to update your session for ",
    `${data.activity} on ${reformat_date(data.date)}`,
    "!"
  )
  insert_latest_response(fActAdd, newActivity)

  console.log('Future Plans Sending:', data);

  /* Post Activity Data to Server */
  fetch(`/store`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data), // post body
  })
  .then(response => response.json())
  .then(data => {
    console.log('Future Plans Success:', data);
  })
  .catch((error) => {
    console.error('Future Plans Error:', error);
  });

  /* Reset Form */
  document.getElementById('fAct-date').valueAsDate = newUTCDate()
  document.getElementById('fAct-activity').value = "Walk"
}


/**
 * Create DOM element for acknowledgment message to send to user for submitting a form
 * @param {string} beg - regular starting section
 * @param {string} mid - bolded middle section
 * @param {string} end - regular trailing text
 * @returns {HTMLElement} DOM element combining beg, mid, end
 */
function create_submission_success_element(beg, mid, end) {
  /* Create all HTML elements to add */
  let newMessage = document.createElement('p')
  let baseText = document.createElement('span')
  let dynamicText = document.createElement('strong')
  let exclamationText = document.createElement('span')
  
  /* Update textContent of all generated DOM elements */
  baseText.textContent = beg
  dynamicText.textContent = mid
  exclamationText.textContent = end
  
  /* Append all text contents back to back in wrapper 'p' tag */
  newMessage.appendChild(baseText)
  newMessage.appendChild(dynamicText)
  newMessage.appendChild(exclamationText)

  return newMessage  
}


/**
 * Checks if past activity data is valid
 * @param {Object} data
 * @param {string} data.date - format 'mm-dd-yyyy'
 * @param {string} data.activity
 * @param {string} data.scalar - time or distance integer or float
 * @param {string} data.units - units for scalar value
 * @returns {boolean} Boolean represents if data is valid
 */
function past_activity_form_is_valid(data) {
  let date = new Date(data.date.replace('-','/'))
  if ( date != "Invalid Date" && date > newUTCDate()) {
    return false
  }

  return !(data.date == "" || data.activity == "" || data.scalar == "" || data.units == "" )
}


/**
 * Checks if future activity data is valid
 * @param {Object} data
 * @param {string} data.date
 * @param {string} data.activity
 * @returns {boolean} Boolean represents if data is valid
 */
function future_activity_form_is_valid(data) {
  let date = new Date(data.date.replace('-','/'))
  if ( date != "Invalid Date" && date < newUTCDate()) {
    return false
  }

  return !(data.date == "" || data.activity == "")
}


/**
 * Insert Prompt at the top of parent and remove old prompts
 * @param {HTMLElement} parent - DOM element 
 * @param {HTMLElement} child - DOM element
 */
function insert_latest_response(parent, child) {
  if(parent.children.length > 1) {
    parent.removeChild(parent.children[0])
  }
  parent.insertBefore(child, parent.childNodes[0])
}


/**
 * Convert 'yyyy-mm-dd' to 'mm/dd/yy'
 * @param {string} date 
 * @returns {string} same date, but reformated
 */
function reformat_date(date) {
  let [yyyy, mm, dd] = date.split("-");
  return `${mm}/${dd}/${yyyy.substring(2,4)}`
}


/**
 * Convert GMT date to UTC
 * @returns {Date} current date, but converts GMT date to UTC date
 */
function newUTCDate() {
  let gmtDate = new Date();
  return new Date(gmtDate.toLocaleDateString())
}
