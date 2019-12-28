import express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import multer from 'multer';
import { Worker,isMainThread,workerData } from 'worker_threads';

require('dotenv').config();

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb){
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

const upload = multer({ dest : 'uploads',storage :storage });

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }))

app.set("views",path.join(__dirname,"views"));
app.set("view engine","hbs");


app.get("/",(req,res) => {
    res.render("index");
})

app.post("/upload-video",upload.single("ssvideo"),(req,res) => {

        if(isMainThread){

            let thread = new Worker('./threads/threaderone.js',{ workerData : { file : req.file.path,filename : req.file.filename,watermark_image_url : image_url } })
    
            thread.on('message',(data) => {
                res.download(data.file,req.file.filename);
            })
    
            thread.on("error",(err) => {
                console.error("thread",err);
    
    
            })
    
            thread.on('exit',(code) => {
                if(code != 0) 
                    console.error(`Worker stopped with exit code ${code}`)
            })   
        }     
})

const PORT = process.env.PORT;

app.listen(PORT,() => {
    console.log(`Server is running on PORT ${PORT}`);
})