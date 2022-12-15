const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    urlCode: { type:String , unique:true, required: true,lowercase:true,trim:true },
     longUrl: {type:String ,required:true,trim:true}, 
     shortUrl: {type:String , unique:true,required:true,trim:true} 
});



module.exports = mongoose.model('url', urlSchema)
