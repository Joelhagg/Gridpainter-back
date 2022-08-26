var express = require('express');
var router = express.Router();

const fs = require("fs");

/* GET users listing. */
router.get('/', function(req, res, next) {

  fs.readFile("./assets/users.json", function(err, data){
   if(err){
    console.log("fel" + err);
   }
  let users = JSON.parse(data)
  res.send(users)
  return;
  })


  
});

module.exports = router;
