const express = require("express")
const os = require("os")
const path = require("path")
const NodeRSA = require("node-rsa")
const multer = require("multer");
const wordExtractor = require("word-extractor")
const fs = require("fs")
const bodyParse = require("body-parser");
const { json } = require("express");
const mongoose = require("mongoose");
const { Console, error } = require("console");
const validator = require("validator")
const usermodel = require("./models/UserModel")
const keydisModel = require("./models/KeyDistriModel");
const KeyModel = require("./models/KeyModel");
const CipherTextModel = require("./models/CipherTextModel")
const SubmitModel = require("./models/SubmitedModel")
const AdminModel = require("./models/AdminModel");
const { find } = require("./models/UserModel");
const StatusModel = require("./models/StatusModel")
const  base64topdf  = require("base64topdf");
const pdfPares = require("pdf-parse");
const PdfParse = require("pdf-parse");
const { image } = require("pdfkit");
const sg = require("any-steganography")
const nodemailer = require('nodemailer')
require('dotenv').config();
// var LocalStorage = require('node-localstorage').LocalStorage,
// localStorage = new LocalStorage('./scratch');


mongoose.connect("mongodb://localhost:27017/transcript", (error)=>{
   if(error){
    console.log(`error=>${error}`)
   }else{
     console.log("Okay ");
   }
})


const app = express()

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/uploaded");
    },
    filename: (req, file, cb) => {
      // const ext = file.mimetype.split("/")[1];
      const ext = file.originalname.split(".")[1];
  
      cb(null, Date.now() + "." + ext);
    },
  });
  
  const upload = multer({
    storage: diskStorage,
  });

  
  app.use(bodyParse.urlencoded({
    extended: true,
    limit: "50mb", 
    parameterLimit:50000
  }));
  app.use(bodyParse.json({limit: "50mb"}))


app.use("/public",express.static("public"))

app.get("/", (req,res)=>{
    //  res.sendFile(path.resolve(__dirname,"pages/index.html"))
    res.sendFile(path.resolve(__dirname,"pages/lecturerhomepage.html"))
})

app.get("/examinerhomepage", (req,res)=>{
  res.sendFile(path.resolve(__dirname,"pages/mainpage.html"))
})

app.get("/addlecturer", (req,res)=>{
  res.sendFile(path.resolve(__dirname,"pages/addlecturer.html"))
})


app.get("/adminlogin", (req,res)=>{
  res.sendFile(path.resolve(__dirname,"pages/adminlogin.html"))
})

app.get("/admindashboard", (req, res)=>{
  res.sendFile(path.resolve(__dirname,"pages/admindashboard.html"))
})


app.get("/generate_trans", (req,res)=>{
  res.sendFile(path.resolve(__dirname, "pages/generate_trans.html"))
})

app.get("/display_trans", (req, res)=>{
 res.sendFile(path.resolve(__dirname, "pages/display_trans.html"))
})

app.get("/secure_trans", (req, res)=>{
  res.sendFile(path.resolve(__dirname, "pages/encrypt_file.html"))
})

app.get("/unlock_trans", (req, res)=>{
  res.sendFile(path.resolve(__dirname, "pages/decrypt_cipher.html"))
})

app.post("/lock_via_rsa",upload.single("fileChoosed") ,(req, res)=>{
  // console.log(req.file)
  let globalvalue = req.file.filename
  console.log(globalvalue)
  let fileName = req.file.filename
  res.json({filename:fileName}) 
  
})


app.post("/fetch_cipher_trans",upload.single("fileChoosed"),(req, res)=>{

  fs.readFile(path.resolve(__dirname,`./public/uploaded/${req.file.filename}`),"utf8",(error, doc)=>{

    const ciphertext = doc
    res.json({ciphertext:ciphertext, filename:req.file.filename})
    
 })
  
})

app.get("/reject_for",(req,res)=>{
  res.sendFile(path.resolve(__dirname, "pages/reject_trans.html"))
  // res.send("<h1>Hello</h1>")
})

app.post("/getTrans", async (req,res)=>{
  let uid = req.body.uid
  // console.log(uid)
  try {
    let filesSubmitted = await SubmitModel.findOne({student_matno:uid})
    res.json({path:filesSubmitted.path_to_upload, mat:filesSubmitted.student_matno})
  } catch (error) {
    res.json({issue:error})
  }
  // res.send("<h1>Hello</h1>")
})

app.get("/trans_requser",(req,res)=>{
  res.sendFile(path.resolve(__dirname, "pages/transcript_req.html"))
})

app.get("/stega",(req,res)=>{
  res.sendFile(path.resolve(__dirname, "pages/stega.html"))
})


app.get("/stega_unlock",(req,res)=>{
  res.sendFile(path.resolve(__dirname, "pages/stega_unlock.html"))
})

app.get("/fetch_requests", async(req, res)=>{
   let submittedFile = await SubmitModel.find({})
  res.json({result:submittedFile})
})

app.post("/decrypt_trans", (req,res)=>{
    let privatekey = req.body.privatekey 
    let ciphertext = req.body.ciphertext

    fs.readFile(path.resolve(__dirname,`./public/uploaded/${req.body.filename}`),"base64url",(error, doc)=>{
    let key_private = new NodeRSA(privatekey)
    let decryted_text = key_private.decrypt(ciphertext,"utf8")
    let date = Date.now()
    let convert = base64topdf.base64Decode(decryted_text, `./public/uploaded/${date}.pdf`)
    res.json({generatedURL:`./public/uploaded/${date}.pdf`})

    
  })
  
})



app.get("/checkrequest",(req, res)=>{
  res.sendFile(path.resolve(__dirname, "pages/checkrequest.html"))
})

app.get("/bringupphoto",(req, res)=>{
  console.log(req.body)
})

app.post("/generate_imagePath",upload.single("file_image") ,(req,res)=>{
    res.json({imagepath:req.file.path})
   
})


// ******************
   
// ******************

// this is for getting the uploaded image 
app.post("/generate_base64Readable", upload.single("file") ,async(req,res)=>{

   res.json({filepath:req.file.path})
  
})

// app.post("/convertExtract",upload.single(""),(req,res)=>{
//     let pdf = req.file
// //     console.log(extractbase64)
//     let date = Date.now()
// //     let private_key = "-----BEGIN RSA PRIVATE KEY-----"+
// //     "MIICXgIBAAKBgQCyulTWaqG8pqv+mFn02nlOkCrnUQKV3Q0eMJ3XaAckgkfZtRM+\n"+
// //     "suxoNzFPeSJygq0Z615ClUo35wp8xhk7gIjMq263Ya3EwGqiPV2orjvhLn515ig5\n"+
// //     "Dv7M6PUZaFmPTbtBUD75PQ2NVXJTu0+en3K+Qq3QuDJst6GjzEO3oRM0dwIDAQAB\n"+
// //     "AoGANCw2dbz857ATxyc8I0DfZnKpQ4sfYRX9LVHt0aKZayvow4GbU5MxdZ6e818e\n"+
// //     "EiVZWJaflno0ByuXoSLG3NrBk9f0uIi5BqEjjHocpvNydNqsZ1UGZTLGVMS9UvEn\n"+
// //     "y+nueQEr2pvBCNcy6mQwHo9eidaLssVmmgpm9O72LBqMJrkCQQDsvG0PhQgshEnY\n"+
// //     "9EzbMcj50+76klWP1XIvq4gC8clrX16o5BX0cjbSa20RFoAzAosYws/GZd/brjBx\n"+
// //     "gI7hLB5FAkEAwUWBlIzdd5GlYU4qsyjQc+qqA5UAo6HYygooW+GcI0fJjhDnprWw\n"+
// //     "/m8HAaaHWqqbY/kJXDCSCal10VxILEaBiwJBAImFoDlOx4PMyXVt3aPL1PtEIWSQ\n"+
// //     "U4H9tZp5o8ZKHP7x5PRpo1NgcfZkj3RIxOpdBN66dKbFEXj1RJD65IVr8p0CQQC0\n"+
// //     "P5+fLFTry6DChEUce+cVBHj1CETlVu85VonXTyzwVmYqoad5+h+M231cU7QOoeh0\n"+
// //     "L3FEUmQQsMOZswf4ivULAkEAxqNGfnCPDhLVzxo2NS7g0hKhyYWYvzOuJDmJUdC9\n"+
// //     "31v3g8+x22MSOTqB4xPwW9WLwFTeBWQmiHmNqehfbd3hhg==\n"+
// //    " -----END RSA PRIVATE KEY-----"
// //     let key_private = new NodeRSA(private_key)
// //     let decrypt = key_private.decrypt(extractbase64,'utf8')

//     // base64topdf.base64Decode(extractbase64, `./public/uploaded/stegax${date}.pdf`)
// // })


app.post("/get_userdetails", async (req,res)=>{
  let uid = req.body.matric_no
  // console.log(uid)
  if(uid !=="" ){
    let uid_details = await usermodel.findOne({matric_no:uid})
    res.json({status:true, details:uid_details})
    // 2019/12890cs
  }else{
    res.json({status:false})
  }
})

app.post("/deleteFile",async (req, res)=>{
   let matno = req.body.matric
   let restructured = {
    matno: req.body.matric,
    state: "deleted",
    reason:req.body.reason
   };
   let deletedFile = await SubmitModel.findOneAndDelete({student_matno:matno})
   let test = new StatusModel(restructured)
   await test.save((error, doc)=>{
      if(error){
        console.log(error)
      }else{
        console.log(doc)
      }
   })

})
 
 //This code is for hidding text inside image
app.post("/hidetext", (req, res)=>{
  let sp = req.body.file.split("\\")
  // let image = 
  let rand = Date.now()
  const file = path.join(__dirname, `./public/uploaded/${sp[2]}`);
  let exSplit  = sp[2].split(".") 
  let ext = exSplit[1]
  let newImageExt = req.body.image.split("\\")
  let extSplited = newImageExt[2].split(".")
  let extImage = extSplited[1]
  const output = path.join(__dirname, `./public/uploaded/obj${rand}.${extImage}`);
  let newTargetPath = `./public/uploaded/obj${rand}.${extImage}`
  const hexCollected = '48a482f7410381a8e9a28ed8302746fa2a5878a6831ebbfb7e52fee690b6a3a8'
  // const Securitykey = Buffer.from(hexCollected, 'hex')
  let imageFile = req.body.image.split("\\")
  let actualFile = imageFile[2]
  const key = Buffer.from(hexCollected, 'hex');
  let filetobeHidden = path.resolve(__dirname, `${file}`)
  let imgPath = path.resolve(__dirname, `./public/uploaded/${actualFile}`)

 
  fs.readFile(filetobeHidden, 'base64url', (error, doc)=>{
 
  const buffer = sg.default.write(imgPath, doc, key);
 
      fs.writeFile(output, buffer, (err) => {
        if (err) {
          res.json({status:false, errorMsg:error})
          return;
        }else{
          res.json({status:true, successMsg:"File successfully hidden", filepath:newTargetPath})
        }
      });
  })
  
  
})


app.post('/sendEmailMessage', upload.single('emailFile'), async (req, res)=>{
 
    let filetobeSent = req.file.filename
    let emailAddress = req.body.emailgoingTo
   

  let transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
      user:process.env.EMAIL,
      pass:process.env.PASSWORD
    }
  })
  let filepathtest = path.resolve(__dirname, `./public/uploaded/${filetobeSent}`)
  let mailOptions = {
    from:'jokpo2565@gmail.com',
    to:'masterj6525@gmail.com',
    subject:'Testing Testing 12',
    text:'IT works',
    attachments:[
      { filename:`${req.file.filename}`, path:`${filepathtest}` }
    ]
  }

  transporter.sendMail(mailOptions, (err,data)=>{
    if(err)
    {
      console.log(err);
    }
    else{
      res.json({ status:true, message:'email sent'});
    }
  })
})

//Code is retriving pdf from images 
app.post("/retrievtext",upload.single('steno'),(req, res)=>{
   let steno_obj = `${req.file.destination}/${req.file.filename}`
  const hexCollected = '48a482f7410381a8e9a28ed8302746fa2a5878a6831ebbfb7e52fee690b6a3a8'
  const key = Buffer.from(hexCollected, 'hex');
  let type = req.file.mimetype
  let ext = type.substring(6)
  
  try{

    // console.log(ext)
      if(ext === 'png')
      {
        buffer = fs.readFileSync(path.resolve(__dirname,steno_obj));
        const message = sg.default.decode(buffer, 'png', key)

        let retrivedFile = Date.now()
        let retrievedName = `${retrivedFile}.pdf`
        let file_retrievedpath = `./public/uploaded/retrieved_${retrievedName}`
        base64topdf.base64Decode(message, file_retrievedpath)
        res.json({result:true, newfilepath:file_retrievedpath})
      }
      else if(ext ==='jpg')
      {
        buffer = fs.readFileSync(path.resolve(__dirname,steno_obj));
        const message = sg.default.decode(buffer, 'jpg', key)

        let retrivedFile = Date.now()
        let retrievedName = `${retrivedFile}.pdf`
        let file_retrievedpath = `./public/uploaded/retrieved_${retrievedName}`
        base64topdf.base64Decode(message, file_retrievedpath)
        res.json({result:true, newfilepath:file_retrievedpath})
      }

      else if(ext ==='jpeg')
      {
        buffer = fs.readFileSync(path.resolve(__dirname,steno_obj));
        const message = sg.default.decode(buffer, 'jpeg', key)

        let retrivedFile = Date.now()
        let retrievedName = `${retrivedFile}.pdf`
        let file_retrievedpath = `./public/uploaded/retrieved_${retrievedName}`
        base64topdf.base64Decode(message, file_retrievedpath)
        res.json({result:true, newfilepath:file_retrievedpath})
      }

  }catch(error){
    res.json({result:false, msg:"No object is hidden in this picture"})
  }

})

app.get('/sendmail', (req,res)=>{
  res.sendFile(path.resolve(__dirname, "pages/sendmail.html")) 
})

app.post('/sendEmailTo', upload.single('emailFile'),(req,res)=>{
   console.log({
    file:req.file,
    email:req.body.emailgoingTo
   })
})

app.get("/autopopulateEmail", async (req, res)=>{
  let emails = await SubmitModel.find({})
  let arrayEmails = []
  emails.map(element => {
    arrayEmails.push(element.email)
  });
  res.json({email:arrayEmails})
  
  
})


app.post("/encrypt", (req,res)=>{
  let key_public = new NodeRSA(req.body.publickey)
  
  console.log(`${req.body.path}`)
  fs.readFile(path.resolve(__dirname,`./uploaded/${req.body.path}`),"base64url",(error, doc)=>{
    let encryptedString = key_public.encrypt(doc, "base64");
    res.json({ciphertext:encryptedString})
  })
  // const pdf = fs.readFileSync(path.resolve(__dirname,`./uploaded/${req.body.path}`))

  // PdfParse(pdf).then((data)=>{
  //   let encryptedString = key_public.encrypt(data.text, "base64");
  //    res.json({ciphertext:encryptedString})
    
  // }) 
    
    //const plaintext = doc
     // console.log(key_public)
     //let encryptedString = key_public.encrypt(plaintext, "base64");
     //res.json({ciphertext:encryptedString})
     
  

  
  // const plaintext = req.body.plaintext
  // let encryptedString = key_public.encrypt(plaintext, "base64");
  // res.json({result:encryptedString})
})




app.post("/enc_style", (req, res)=>{
    // console.log(req.body)
   fs.readFile(path.resolve(__dirname,`uploaded/1658234589984.pdf`),"base64url",(error, doc)=>{
    let public_key = "-----BEGIN PUBLIC KEY-----"+
    "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCyulTWaqG8pqv+mFn02nlOkCrn\n"+
    "UQKV3Q0eMJ3XaAckgkfZtRM+suxoNzFPeSJygq0Z615ClUo35wp8xhk7gIjMq263\n"+
   " Ya3EwGqiPV2orjvhLn515ig5Dv7M6PUZaFmPTbtBUD75PQ2NVXJTu0+en3K+Qq3Q\n"+
   " uDJst6GjzEO3oRM0dwIDAQAB"+
    "-----END PUBLIC KEY-----"

    let private_key = "-----BEGIN RSA PRIVATE KEY-----"+
    "MIICXgIBAAKBgQCyulTWaqG8pqv+mFn02nlOkCrnUQKV3Q0eMJ3XaAckgkfZtRM+\n"+
    "suxoNzFPeSJygq0Z615ClUo35wp8xhk7gIjMq263Ya3EwGqiPV2orjvhLn515ig5\n"+
    "Dv7M6PUZaFmPTbtBUD75PQ2NVXJTu0+en3K+Qq3QuDJst6GjzEO3oRM0dwIDAQAB\n"+
    "AoGANCw2dbz857ATxyc8I0DfZnKpQ4sfYRX9LVHt0aKZayvow4GbU5MxdZ6e818e\n"+
    "EiVZWJaflno0ByuXoSLG3NrBk9f0uIi5BqEjjHocpvNydNqsZ1UGZTLGVMS9UvEn\n"+
    "y+nueQEr2pvBCNcy6mQwHo9eidaLssVmmgpm9O72LBqMJrkCQQDsvG0PhQgshEnY\n"+
    "9EzbMcj50+76klWP1XIvq4gC8clrX16o5BX0cjbSa20RFoAzAosYws/GZd/brjBx\n"+
    "gI7hLB5FAkEAwUWBlIzdd5GlYU4qsyjQc+qqA5UAo6HYygooW+GcI0fJjhDnprWw\n"+
    "/m8HAaaHWqqbY/kJXDCSCal10VxILEaBiwJBAImFoDlOx4PMyXVt3aPL1PtEIWSQ\n"+
    "U4H9tZp5o8ZKHP7x5PRpo1NgcfZkj3RIxOpdBN66dKbFEXj1RJD65IVr8p0CQQC0\n"+
    "P5+fLFTry6DChEUce+cVBHj1CETlVu85VonXTyzwVmYqoad5+h+M231cU7QOoeh0\n"+
    "L3FEUmQQsMOZswf4ivULAkEAxqNGfnCPDhLVzxo2NS7g0hKhyYWYvzOuJDmJUdC9\n"+
    "31v3g8+x22MSOTqB4xPwW9WLwFTeBWQmiHmNqehfbd3hhg==\n"+
   " -----END RSA PRIVATE KEY-----"
    let key_public = new NodeRSA(public_key)
    let key_private = new NodeRSA(private_key)

    
    

    const plaintext = doc
    console.log(doc)
    let encryptedString = key_public.encrypt(plaintext, "base64");
    // console.log(encryptedString)
    let decryted_text = key_private.decrypt(encryptedString,"utf8")
    
    base64topdf.base64Decode(decryted_text, 'testpdf.pdf')
    // var buf = Buffer.from(exFile, 'base64');
// Your code to handle buffer

    console.log("ended successfully")
   })
   
})


app.get("/keyrepoadmin",async(req,res)=>{ 
  res.sendFile(path.resolve(__dirname,"pages/adminkeyrepo.html"))
})

app.get("/viewlectures",async(req,res)=>{ 
  res.sendFile(path.resolve(__dirname,"pages/lectuers.html"))
})

app.get("/fetchusers",async(req,res)=>{
  let allUsers = await usermodel.find({role:{$ne:"examiner"}})
  allUsers.map(result=>{
    res.json({result})
  })
})


app.get("/secured", (req,res)=>{
  
  res.sendFile(path.resolve(__dirname,"pages/securedquestions.html"))
})


app.get("/student", (req,res)=>{
  
  res.sendFile(path.resolve(__dirname,"pages/studentdashboard.html"))
})


app.post("/student_trans_login", async(req, res)=>{
   let student_matno =  req.body.matric.toLowerCase()
   let user = await usermodel.findOne({matric_no:student_matno})

   if(user.matric_no === student_matno)
   {
     res.json({status:true})
   }
   else
   {
     res.json({status:false})
   }
})



app.get("/fetchciphers", async(req, res)=>{
    let allciphers = await CipherTextModel.find({})
    res.json(allciphers)
    // allciphers.map(result=>{
    //   res.json({result})
    // })
})

app.post("/deleteuser",async(req,res)=>{
  let uid = req.body.uid
  let deleted = await usermodel.deleteOne({_id:uid})
  console.log(deleted)
})

app.get("/fetchkeys", async(req,res)=>{
  let allKeys = await KeyModel.find({})
  allKeys.map(result=>{
    res.json({result})
  })
})


app.post("/adminsignin",async(req,res)=>{
   let password = req.body.password.toLowerCase()
   let username = req.body.username.toLowerCase()

   if(password !=="" && username !== ""){
     
      let findUser = await AdminModel.findOne({password:password,username:username})
      try {
        if(findUser.username === username && findUser.password === password)
      {
        res.json({status:true, succMsg:"Login was successfull, please wait........"})
      }
      else{
        res.json({status:false, errorIncorrect:true, errorMsg:"Incorrect Usename/Password"})
      }
      } catch (error) {
        res.json({status:false, errorIncorrect:true, errorMsg:"Incorrect Usename/Password"})
      }
   }
   else{
    res.json({status:false, errorEmpty:true, errorMsg:"Please fill all the fields"})
   }
})



app.post("/distribute",async(req, res)=>{

  let public_key = req.body.public_k
  let private_key = req.body.private_k

  let date = new Date()
  let getAllUsers = await usermodel.find({role: {$ne:"examiner"}});
  getAllUsers.map(value =>{
    const sharedTo = {
                      first_name:value.first_name,
                      last_name:value.last_name,
                      date_of_dis: date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear(),
                      public_key:public_key,
                      user_confirmed:0
                    }

    const saveKeyPair = {
      public_key,
      private_key,
      date_of_gen:date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear(),
    }

   const fillKeyDistTable = new keydisModel(sharedTo)
   fillKeyDistTable.save((error, doc)=>{
     if(!error){
      const fillRepo = new KeyModel(saveKeyPair)
      fillRepo.save((error, doc)=>{
        if(!error){
          res.json({status:true})
        }else{
          console.log(error)
        }
      })

      
     }else{
      console.log(error)
     }
   })

  })
})
    


app.get("/key", (req,res)=>{
     res.sendFile(path.resolve(__dirname,"pages/generate.html"))
})

app.get("/reg", (req,res)=>{
    res.sendFile(path.resolve(__dirname,"pages/reg.html"))
})

app.get("/login", (req,res)=>{
  res.sendFile(path.resolve(__dirname,"pages/index.html"))
})

app.get("/apply",(req, res)=>{
  res.sendFile(path.resolve(__dirname,"pages/trans_application_form.html"))
})

app.post("/fetch_and_populate",async(req,res)=>{
  let matno = req.body.matric_no
    if(matno)
    {
      let userFetched = await  usermodel.findOne({matric_no:matno})

      try {
        if(userFetched.length !== 0){
          // console.log(userFetched)
          res.json({status:true, record:userFetched})
          
        }
      } catch (error) {
        console.log(error)
        console.log(matno)
        console.log(userFetched)
      }
    }
})

app.post("/submitfile",upload.single("paymentproof"), (req,res)=>{

 if(req.file.fieldname !=="" && req.file.filename)
 {
   let path_to_upload = `${req.file.destination}/${req.file.filename}`
   let date = new Date()
   const userInfo = {
        
         date_of_upload:`${date.getHours()}:${date.getMinutes()}`,
         path_to_upload:path_to_upload,
         first_name:req.body.first_name,
         last_name:req.body.last_name,
         email:req.body.email,
         student_matno:req.body.matric,
         department:req.body.department,
         program:req.body.program


   }
   
   const upFile = new SubmitModel(userInfo)
   upFile.save((error, doc)=>{
       if(!error)
       {
        res.json({status:true})
       }
       else
       {
        res.json({status:false})
       }
   })

 }
 else
 {

 }
 
})


app.post("/signupuser",async(req,res)=>{
 let newUser = new usermodel(req.body)
 newUser.save((error, doc)=>{
   if(!error)
   {
    res.json({status:true, msg:"Registration was successful"})
   }
   else
   {
    res.json({status:false, msg:error.message})
   }
 })
})



app.get("/decryptquestion",(req,res)=>{
  res.sendFile(path.resolve(__dirname,"pages/decryption.html"))
})

app.post("/deletecipher", async(req, res)=>{
  let id = req.body.uid
  let deleted = await CipherTextModel.deleteOne({_id:id})
  if(deleted.acknowledged){
    res.json({status:true})
  }else{
    res.json({status:false})
  }
})

app.get("/logout",(req,res)=>{
  res.redirect("/")
})

app.post("/fetchsinglepersonkeys",async(req, res)=>{
  let email = req.body.email
  // console.log(email)
  let getUser = await usermodel.findOne({email:email})
  let dbFirstname = getUser.first_name
  let dbLastname = getUser.last_name
  // console.log(dbFirstname)
  // console.log(dbLastname)

  let keys = await keydisModel.find({first_name:dbFirstname, last_name:dbLastname})
  
  if(keys.length > 0)
  {
    res.json({status:true, info:keys})
  }
  else
  {
   res.json({status:false})
  }
  

})

app.post("/deletekeyformoneuser",async(req, res)=>{
  let remove = await keydisModel.deleteOne({_id:req.body.id})
  if(remove.acknowledged){
    res.json({deleted:true})
  }
  else{
    res.json({deleted:false})
  }
})


app.get("/lecturerhomepage",(req,res)=>{
  res.sendFile(path.resolve(__dirname,"pages/lecturerhomepage.html"))
})


app.post("/sendcipher", async (req, res)=>{
  let userEmail = req.body.user_email
  let ciphertext = req.body.cipher
  let date = new Date();
  let date_sent = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`
  let time_sent = `${date.toLocaleString('en-US',{hour:'numeric', minute:'numeric', hour12:true})} `
  let getUser = await usermodel.findOne({email:userEmail})
  let first_name = getUser.first_name
  let last_name = getUser.last_name
  
  
  const addCipher = {
    first_name,
    last_name,
    date_sent,
    time_sent,
    ciphertext
  }

  const insertCipher = new CipherTextModel(addCipher)
  insertCipher.save((error, doc)=>{
   if(!error){
     res.json({status:true})
   }else{
    res.json({status:false})
   }
  })
  
})

app.get("/key_gen",(req, res)=>{
    const key = new NodeRSA({b:1024})
    var public_key = key.exportKey("public")
    var private_key = key.exportKey("private")
    
    res.json({private_key, public_key})
})



app.get("/keygen",(req, res)=>{
  res.sendFile(path.resolve(__dirname,"pages/keygen.html"))
})





app.post("/plaintext",upload.single("file"),(req, res)=>{

    //console.log(req.file.filename)
    var data = ""
    const extractor = new wordExtractor()
    const extracted = extractor.extract(`uploaded/${req.file.filename}`)
    extracted
    .then(doc=>{
       data = doc._body
       res.json({data})
    })
    .catch(error=>{
        console.log(error)
    })
    
   
})


app.post("/deletekey", async(req,res)=>{
   let key = req.body.key
   let deleted = await KeyModel.deleteOne({public_key:key})
   console.log(deleted)

})


app.post("/signin", async(req, res)=>{

//    console.log(req.body)

   let option = req.body.option
   let password = req.body.password
   let email = req.body.email
   let user = await usermodel.findOne({email,email});
   console.log(option.toLowerCase())
   
      if(user){
           
          //  console.log(email, result.email)
          //  console.log(password, result.password)
          if(user.email === email && user.password === password)
          {
            if(option.toLowerCase() === "examiner"){
               res.json({redirect_to:"examiner"}) 
            }else if (option.toLowerCase() === "lecturer"){
              res.json({redirect_to:"lecturer"})
            }else if(option.toLowerCase() === ""){
              res.json({redirect_to:"empty"})
            }
          }

        }else{
          res.json({status:false})
        }
 
                  

   

})


app.get("/keyrepolecturer",(req, res)=>{
  res.sendFile(path.resolve(__dirname,"pages/lectuerskeyrepo.html"))
})


app.post("/adminadduser", (req,res)=>{
  // console.log(req.body)
  let first_name = req.body.first_name 
  let last_name = req.body.last_name
  let email = req.body.email 
  let role = req.body.role 
  let password = req.body.password

  
  if(
      first_name.toLowerCase() !== "" 
      && last_name.toLowerCase() !== "" 
      && role.toLowerCase() !== ""
      && password.toLowerCase() !== ""
   )
  {
    if(validator.isEmail(email)){

      // ##### Add new user
        let newUser = new usermodel({first_name,last_name, email,role,password})
        newUser.save((error, doc)=>{
            if(error){
              res.json({internalError:true})
            }else{
              res.json({success:true})
            }
        })

      // ##end

      
    }else{
      res.json({emailError:true})
    }
  }
  else
  {
   res.json({incomplete:true})
  }

  // if(
  //   validator.isEmpty(first_name.toLowerCase()) &&
  //   validator.isEmpty(last_name.toLowerCase()) 
  //   ){
  //   console.log("yes")
  // }else{
  //   console.log("xsc")
  // }
  
})


app.post("/uploadPublicKey",upload.single("publickey"), (req, res)=>{
    //console.log(req.file.filename)
    const file = path.resolve(__dirname,`./public/uploaded/${req.file.filename}`)
    fs.readFile(file,'utf-8',(err, data)=>{
        if(!err){
            res.json({publickey:data})
            // console.log(data)
        }else{
            console.log(err)
        }
    })

    // fs.unlink(file,(err)=>{
    //     if(err){throw err}
    //  })
    

})




// Decryption Section
app.post("/uploadPrivateKey",upload.single("privatekey"),(req, res)=>{
    const privateKeyPath = path.resolve(__dirname,`./public/uploaded/${req.file.filename}`)
    fs.readFile(privateKeyPath,"utf-8",(error, doc)=>{
       if(!error){
         res.json({privatekey:doc})
       }
    })
    
    // fs.unlink(privateKeyPath,(err)=>{
    //     if(err){throw err}
    //  })
  
})

app.post("/decrypt",(req, res)=>{

    let privatekey = req.body.privateKey 
    let ciphertext = req.body.ciphertext

    let key_private = new NodeRSA(privatekey)
    let decryted_text = key_private.decrypt(ciphertext,"utf8")

    if(decryted_text){
        res.json({decrypted:decryted_text, status:true})
    }else{
     res.json({status:false})
    }
})

app.post("/uploadCiphertext", upload.single("cipherfile"),(req, res)=>{
//   console.log({cipher:req.file})
   const cipherFile = path.resolve(__dirname,`uploaded/${req.file.filename}`)
   fs.readFile(cipherFile, "utf-8", (error, data)=>{
     if(!error)
     {
       res.json({"cipher":data});
     }
   })

   fs.unlink(cipherFile,(err)=>{
      if(err){throw err}
   })
})




app.listen(3000, ()=>{
    console.log("App is currently running on port 3000");
})