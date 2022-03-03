const express = require("express");
const router = express.Router();

// The endpoint property points to the local DynamoDB instance.
const AWS = require("aws-sdk");
const awsConfig = {
  region: "ap-southeast-2"
  //use this endpoint when in development to limit use 
  //of AWS calls to keep costs down
  // endpoint: "http://localhost:8000"   
};

// Not locking the version number for DocumentClient class because
// DynamoDB class has two versions and DocumentClient has only one,
// so there is no need to lock the version number for DocumentClient
AWS.config.update(awsConfig);
const dynamodb = new AWS.DynamoDB.DocumentClient();
const table = "Thoughts";

router.get("/users", (req, res) => {
  const params = {
    TableName: table,
  };
  // Scan return all items in the table
  dynamodb.scan(params, (err, data) => {
    if (err) {
      res.status(500).json(err); // an error occurred
    } else {
      res.json(data.Items);
    }
  });
});


router.get("/users/:username", (req, res) => {
  console.log(`Querying for thought(s) from ${req.params.username}.`);

  const params = {
    TableName: table,

    //specifies the search criteria, similar to WHERE clause in SQL.
    //  #un and :user symbols are aliases that represent the attribute
    // name and value, the #un represents the attribute name username.
    // Words such as time, date, user, and data can't be used, abbreviations
    // or aliases can be used in their place as long as the symbol # precedes it.
    KeyConditionExpression: "#un = :user",
    ExpressionAttributeNames: {
      "#un": "username",
      "#ca": "createdAt",
      "#th": "thought",
    },
    ExpressionAttributeValues: {
      ":user": req.params.username,
    },
    ProjectionExpression: "#th, #ca",
    ScanIndexForward: false,
  };

  dynamodb.query(params, (err, data) => {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      res.status(500).json(err); // an error occurred
    } else {
      console.log("Query succeeded.");
      res.json(data.Items);
    }
  });
});



// Create new thought at /api/users
router.post('/users', (req, res) => {
  console.log(`Adding a new thought from ${req.params.username}.`);
  const { username, thought} = req.body;
  const params = {
    TableName: table,
    Item: {
      "username": username,
      "createdAt": Date.now(),
      "thought": thought
    }
  };
  dynamodb.put(params, (err, data) => {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
      res.status(500).json(err); // an error occurred
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
      res.json({"Added": JSON.stringify(data, null, 2)});
    }
  });
});

module.exports = router;
