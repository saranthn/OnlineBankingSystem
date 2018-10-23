var express = require('express');
var router = express.Router();

router.get('/',function (req,res) {
	res.render('index');
});

router.get('/logi',function (req,res) {
	res.render('index');
});

module.exports = router;