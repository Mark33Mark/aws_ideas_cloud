const AWS = require('aws-sdk');

AWS.config.update({
  region: "ap-southeast-2"
  
  //use this endpoint when in development to limit use 
  //of AWS calls to keep costs down
  // endpoint: "http://localhost:8000"   
});

// Create the DynamoDB service object
// Specifying the Long-Term Support (LTS) version of the API 
// ensures the API library used is compatible with our db commands used.
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

const params = {
  TableName : "Thoughts",
  KeySchema: [       
    { AttributeName: "username", KeyType: "HASH"},  // Partition key
    { AttributeName: "createdAt", KeyType: "RANGE" }  // Sort key
  ],
  AttributeDefinitions: [       
    { AttributeName: "username", AttributeType: "S" },
    { AttributeName: "createdAt", AttributeType: "N" }
  ],
  ProvisionedThroughput: {       
    ReadCapacityUnits: 10, 
    WriteCapacityUnits: 10
  }
};

// make a call to the DynamoDB
dynamodb.createTable(params, (err, data) => {
  if (err) {
      console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
  } else {
      console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
  }
});