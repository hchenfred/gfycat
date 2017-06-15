const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const Promise = require("bluebird");
//const fs = require('fs-extra');
const fs = Promise.promisifyAll(require("fs-extra"));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/../react-client/dist'));
const rp = require('request-promise');
const Gfycat = require('gfycat-sdk');
const assert = require('assert');
const concat = require("concat-stream")
const FormData = require('form-data');
const fd = new FormData();
const axios = require('axios');

app.post('/gifs', (req, res) => {
  // gfycat.authenticate().then(res => {
  //   gfycat.token = res.access_token;
  //   console.log('token is ', gfycat.token);
  //   let options = {
  //     userId: 'hchen424'
  //   };
    
  //   gfycat.getUserDetails(options).then(data => {
  //     console.log(data);
  //   });
  // });
  
  fs.writeFile(req.body.title, req.body.binaryData, 'base64', (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
    var options = {
      method: 'POST',
      uri: 'https://api.gfycat.com/v1/gfycats',
      headers: {
        Authorization: req.body.token,
      },
      json: true // Automatically stringifies the body to JSON
    }
    
    rp(options)
    .then(body => {
      fs.renameAsync('whatever.gif',  `${body.gfyname}`)
      return body.gfyname;
    })
    .then(res => {
      console.log('renaming file is successful!');
      console.log(res);
      //fd.append("hello", "world");
      fd.append("file", fs.createReadStream(res));
      fd.pipe(concat({encoding: 'buffer'}, data => {
        axios.post("https://filedrop.gfycat.com", data, {
          headers: fd.getHeaders()
        })
      })) 
    })
    .then(data => {
      console.log(data);
      res.send('done');
     }
    )
    .catch(function (err) {
        // POST failed...
        console.error('failed');
    });
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log('listening on port 3000!');
});

