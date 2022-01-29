'use strict'

// A server that uses a database. 

// express provides basic server functions
const express = require("express");

// our database operations
const dbo = require('./databaseOps');
const db = require('./sqlWrap');

const url = require('url');
const querystring = require('querystring');

// object that provides interface for express
const app = express();

// use this instead of the older body-parser
app.use(express.json());

// make all the files in 'public' available on the Web
app.use(express.static('public'))

// when there is nothing following the slash in the url, return the main page of the app.
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/index.html");
});


function storePast(request, response, next) {
  console.log("Server recieved a post request at", request.url);
  console.log("Past Activity:",JSON.stringify(request.body));
  let userData = request.body;

  db.run(
    "insert into ActivityTable (activity, date, amount) values (?,?,?)",
    [ userData.activity, new Date(userData.date).getTime(), userData.scalar ]
    ).then(() => {
      response.send("I got your POST request (pastActivity)");
    }).catch((err) => {
      response.send("Sorry, there was an error.");
    });
}

function storeFuture(request, response, next) {
  console.log("Server recieved a post request at", request.url);
  console.log("Future Activity:",JSON.stringify(request.body));
  let userData = request.body;
 
  db.run(
    "insert into ActivityTable (activity, date, amount) values (?,?,?)",
    [ userData.activity, new Date(userData.date).getTime(), -1 ]
    ).then(() => {
      response.send("I got your POST request (futureActivity)");
    }).catch((err) => {
      response.send("Sorry, there was an error.");
    });
}

app.post('/store', function(request, response, next) {
  if ("units" in request.body) {
    storePast(request, response, next);
  }
  else {
    storeFuture(request, response, next);
  }
});


function diffDays(date1, date2) {
  const diffInMs = Math.abs(date2 - date1);
  return diffInMs / (1000 * 60 * 60 * 24);
}

app.get("/reminder", (request, response, next) => {
  console.log("Server recieved a get request at", request.url);
  db.all(
    "select * from ActivityTable where amount = ?",
    [ -1 ]
    ).then((res) => {
      console.log(JSON.stringify(res));
      let now = new Date();
      now.setDate(now.getDate() - 1);
      now = now.getTime();
      let closest = undefined;
      for (let i = 0; i < res.length; ++i) {
        let cur = res[i];
        if (cur.date < now) {
          if (closest === undefined || (now - cur.date) < (now - closest.date)) {
            closest = cur;
          }
        }
      }
      if (closest === undefined) {
        response.send("null");
        return;
      }
      if (diffDays(closest.date, now) > 7) {
        response.send("null");
        return;
      }
      db.run(
        "delete from ActivityTable where amount = -1 and date < ?",
        [now]
        ).then((res1) => {
          response.send(JSON.stringify(closest));
        }).catch((err1) => {
          response.send("Sorry, an error occurred.");
        });
    }).catch((err) => {
      response.send("Sorry, an error occurred.");
    });
});

var toWeek = (end) => {
  let d = new Date();
  d.setTime(end);
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  let res = [];
  d.setDate(d.getDate()-6);
  do {
    res.push(d.getTime());
    d.setDate(d.getDate()+1);
  } while (res.length < 7);
  return res;
};

var createWeek = (end) => {
  let d = toWeek(end);
  let res = [];
  for (let i = 0; i < d.length; ++i) {
    res.push({ "date": d[i], "value": 0 });
  }
  return res;
};

var doWeek = (request, response, activity, date) => {
  let res = createWeek(date);
  let n = 0;
  console.log(activity, date);
  for (let i = 0; i < res.length; ++i) {
    db.all("select * from ActivityTable where date = ? and activity = ?", [ res[i].date, activity ]).then((x)=> {
      for (let j = 0; j < x.length; ++j) {
        if (x[j].amount > 0)
          res[i].value += x[j].amount;
      }
      if (++n == res.length) {
        response.send(JSON.stringify({ "activity": activity, "week": res }));
      }
    });
  }
};

app.get("/week", (request, response, next) => {
  console.log("Server recieved a get request at", request.url);
  let query = querystring.parse(url.parse(request.url).query);
  let date = query.date;
  if (!Object.hasOwnProperty.bind(query)("activity")) {
    db.all("select * from ActivityTable order by date desc").then((x)=> {
      if (x.length == 0) {
        response.send(JSON.stringify({"activity": null, "week": createWeek(date)}));
        return;
      }
      else {
        doWeek(request, response, x[0].activity, date);
      }
    });
  }
  else {
    doWeek(request, response, query.activity, date);
  }
});

// listen for requests :)
const listener = app.listen(3000, () => {
  console.log("The static server is listening on port " + listener.address().port);
});




