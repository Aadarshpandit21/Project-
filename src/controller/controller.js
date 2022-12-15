const urlModel = require('../models/urlModel');
const shortId = require('shortid');
const isValidUrl = require('valid-url')

const redis = require("redis");

const { promisify } = require("util");

//1. Connect to the redis server
const redisClient = redis.createClient(
    10485,
  "redis-10485.c1.asia-northeast1-1.gce.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("UvW6GPbmplPJSyddB3QdhH5MjP9ETD00", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});



//2. Prepare the functions for each command

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


let createUrl = async function(req,res){
   try{
    const data = req.body;//
    if(Object.keys(data).length===0){
        res.status(400).send({status:false,msg:'body is empty'})
    }
    if(!data.longUrl){
      res.status(400).send({status:false,msg:'please provide long url'})
    }
    if (!isValidUrl.isUri(data.longUrl)){
        res.status(400).send({status:false,msg:'Url must be Valid Url'})
    }
    let url = shortId.generate().toLowerCase();
    data.urlCode = url;
    let baseUrl = 'https://localhost:3000/' ;
    data.shortUrl = baseUrl + url ;
    let oldData = await urlModel.findOne({longUrl:data.longUrl}).select({longUrl:1,shortUrl:1,urlCode:1,_id:0});
    if(oldData){
        res.status(200).send({status:true,data:oldData})
    }
    let createData = await urlModel.create(data);
    const finalUrl = {
      longUrl: createData.longUrl,
      shortUrl: createData.shortUrl,
      urlCode: createData.urlCode
  }
     res.status(201).send({ status:true , data:finalUrl})
   }catch(error){
      res.status(500).send({status:false,msg:error.message})
   }
}

const fetchUrl = async function (req, res) {

  //3. Start using the redis commad
  try{
    let urlCode=req.params.urlCode;
    let catchedUrl=await GET_ASYNC(`${urlCode}`)
    if(!urlCode){
      return res.status(400).send({status:false, message:"url code must be present"});
    }
    if(catchedUrl){
      return res.status(302).redirect(catchedUrl);
    }
    let getUrl=await urlModel.findOne({urlCode:urlCode})
    if(getUrl){
      return res.status(302).redirect(getUrl.longUrl)
    }else{
      await SET_ASYNC(`${catchedUrl}`,JSON.stringify(getUrl))
      return res.status(400).send({status:false, msg:"shortUrl is not found"});
    }
  
  }catch(err){
    return res.status(500).send({status:false, msg:err.message});
  }
};

// let getUrl = async function(req,res){
//     try{
//         let url = req.params.urlCode;
//         let findUrl = await urlModel.findOne({urlCode:url})
//         if(!findUrl){
//             res.status(404).send({status:false,msg:'No url found'})
//         }   
//         res.status(302).redirect(findUrl.longUrl)
//     }catch(error){
//         res.status(500).send({msg:error.message})
//     }
// }



module.exports.createUrl = createUrl;
//module.exports.getUrl = getUrl;
module.exports.fetchUrl = fetchUrl;