var express = require('express');
var router = express.Router();
const colorsArray = require('../assets/colorPicker.json')
const cors = require('cors')

/* GET home page. */
router.get('/', cors(), function(req, res, next) {
  res.json(colorsArray)
});

module.exports = router;
