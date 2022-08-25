var express = require('express');
var router = express.Router();
const picturesArray = require('../assets/fields.json')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json(picturesArray)
});

module.exports = router;
