// /url/shorten
const express = require('express');
const Router = express.Router();
const urlController = require('../controller/controller')

Router.post('/url/shorten',urlController.createUrl);
//Router.get('/:urlCode',urlController.getUrl)
Router.get('/:urlCode',urlController.fetchUrl)
Router.all("/*", function (req, res) {
    return res.status(404).send({ status: false, message: "Page Not Found" })  
})
module.exports = Router;