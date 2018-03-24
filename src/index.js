var request = require('request'),
  cheerio = require('cheerio'),
  cheerioTableparser = require('cheerio-tableparser'),
  AWS = require('aws-sdk'),
  runtimeConfig = require('cloud-functions-runtime-config');

var region = "";
var aws_access_key_id = "";
var aws_secret_access_key = "";

runtimeConfig.getVariable('aadl-talker', 'region')
  .then( (val) => region = val)
  .catch((err) => console.log(err));

runtimeConfig.getVariable('aadl-talker', 'aws_access_key_id')
  .then( (val) => aws_access_key_id = val)
  .catch((err) => console.log(err));

runtimeConfig.getVariable('aadl-talker', 'aws_secret_access_key')
  .then( (val) => aws_secret_access_key = val)
  .catch((err) => console.log(err));

exports.AADLTalker = function AADLTalker (req, res) {
  var book_index =  (req.body.book_index === undefined  ? 1     : req.body.book_index);
  var output_mode = (req.body.output_mode === undefined ? 'mp3' : req.body.output_mode);
  if (req.body.aadl_user === undefined) {
    res.status(400).send('No user defined!');
  } else if (req.body.aadl_pass === undefined) {
    res.status(400).send('No password defined!');
  } else {
    getFirstTitle(req.body.aadl_user, req.body.aadl_pass, book_index, function (title) {
      makeMP3(title, function (buffer) {
        res.writeHead(200, {
          // 'Content-disposition': 'attachment;filename=' + filename,
          'Content-Type': 'audio/mp3',
          'Content-Length': buffer.length
        });
        res.end(buffer, 'binary');
      })
    });
  }
};

function getFirstTitle(_user, _pass, _idx, _cb) {
  var login_request = {
    url: 'https://www.aadl.org/user',
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (REX64; rv:50.0) Gecko/20100101 Lukas/41.0'
    },
    form: {
      name: _user,
      pass: _pass,
      form_id: 'user_login'
    },
    followAllRedirects: true,
    jar: true
  };
  request(login_request, function(err,response,body) { 
    if (err) { console.log(err); }
    $ = cheerio.load(body);
    cheerioTableparser($);
    books = $("form table").parsetable(false,false,true);
    if ( books[1][_idx] ) {
      title = books[1][_idx];
    } else {
      title = "title not found";
    }
    typeof _cb === 'function' && _cb(title);
  });
};

function makeMP3(_text, _cb) {
  var aws_config = new AWS.Config({
    accessKeyId: aws_access_key_id,
    secretAccessKey: aws_secret_access_key,
    region: region
  });
  var polly = new AWS.Polly(aws_config);

  var speech_params = {
    OutputFormat: "mp3",
    SampleRate: "8000",
    Text: _text,
    TextType: "text",
    VoiceId: "Joanna"
  };
  polly.synthesizeSpeech(speech_params, function(err, data) {
    if (err) {
      console.log(err.code)
    } else if (data) {
      if (data.AudioStream instanceof Buffer) {
        typeof _cb === 'function' && _cb(data.AudioStream);
      } else { 
        console.log("data from Polly did not contain AudioStream Buffer");
      }
    }
  });
};
