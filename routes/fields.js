var express = require('express');
var router = express.Router();
const picturesArray = require('../assets/fields.json')
const cors = require('cors')

/* GET home page. */
router.get('/', cors(), function(req, res, next) {
  res.json(picturesArray)
});

module.exports = router;
