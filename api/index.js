let path = require("path");
let fs = require("fs");
let express = require("express");
let app = express();
let archiver = require("archiver");
const multer = require('multer');

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  const { GoogleAIFileManager } = require("@google/generative-ai/server");
  
  const apiKey = process.env.GOOGLE_AI_API;
  const genAI = new GoogleGenerativeAI(apiKey);
  const fileManager = new GoogleAIFileManager(apiKey);

  const ralpha_generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };
  
  const random_alpha_model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: ralpha_generationConfig,
    systemInstruction: "Provide an array of 10 random alphabets in random order for learning the language with 4 options each. give direct response. response format {letters: [{native, target, options}]}",
  });

  const random_word_model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: ralpha_generationConfig,
    systemInstruction: "Provide an array of 10 random words in random order for learning the language with 4 options each. give direct response. response format {words: [{native, target, options}]}",
  });

  const sentence_model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: ralpha_generationConfig,
    systemInstruction: "Provide an array of 10 random sentences in random order for learning the language with 4 options each. give direct response. response format {sentences: [{native, target, options}]}",
  });

  const trace_model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "detect the character in the image with respect to the target language. give direct answer. format {letter: string}",
  });

  const info_model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: ralpha_generationConfig,
    systemInstruction: "provide an array of 10 elements to teach the alphabets, words, and phrases related to the target language in the native language based on the user's experience. give direct answer. format {data: [sentence, sentence, ...]}",
  });

let zipDir = path.join(__dirname, "..", "zipfiles");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
});
var upload = multer({ storage: storage });

if(process.env['PRODUCTION']) {
    zipDir = path.join("/tmp", "zipfiles");
    
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, '/tmp/uploads')
        },
        filename: function (req, file, cb) {
          cb(null, file.originalname)
        }
    });
    upload = multer({ storage: storage });
}

function zipFile(source_dir, dest) {
    return new Promise((resolve, reject) => {
        var output = fs.createWriteStream(dest);
        var archive = archiver('zip');
        
        output.on('close', function () {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            resolve();
        });
        
        archive.on('error', function(err){
            reject(err);
        });
        
        archive.pipe(output);
        
        archive.directory(source_dir, false);
        
        archive.finalize();
    });
}

app.use(express.static(path.join(__dirname, "..")));
app.use(express.json());
// app.use(express.urlencoded());

app.route("/")
.get((req, res) => {
    res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.route("/service-worker.js")
.get((req, res) => {
    res.sendFile(path.join(__dirname, "..", "service-worker.js"));
});

app.route(`/folder`)
.get(async (req, res) => {
    if(req.headers['sec-fetch-site'] === "same-origin") {
        if(!fs.existsSync(zipDir)) {
            fs.mkdirSync(zipDir);
        }

        let fpath = decodeURIComponent(req.query.path);
        let folder = path.join(__dirname, "..", "assets", "game-assets", fpath);

        if(fs.existsSync(folder)) {
            let data = fs.statSync(folder);
            if(data.isDirectory()) {
                let zipName = fpath.split("/").join("_");

                let zipPath = path.join(zipDir, `${zipName}.zip`);
                if(!fs.existsSync(zipPath)) {
                    await zipFile(folder, zipPath);
                }

                let data = fs.readFileSync(zipPath, { encoding: "base64" });

                res.json({
                    status: 200,
                    data: data
                });
            } else {
                res.json({
                    status: 500
                });
            }
        } else {
            res.json({
                status: 404
            })
        }
    } else {
        res.status(404).end();
    }
});

app.route("/ai/random-alpha")
.post(async (req, res) => {
    let data = req.body;

    try {
        let response = await random_alpha_model.generateContent(JSON.stringify(data));
        res.send({
            status: 200,
            content: response.response.text()
        })
    } catch(e) {
        res.send({
            status:500
        });
    }
});

app.route("/ai/random-word")
.post(async (req, res) => {
    let data = req.body;

    try {
        let response = await random_word_model.generateContent(JSON.stringify(data));
        res.send({
            status: 200,
            content: response.response.text()
        })
    } catch(e) {
        res.send({
            status:500
        });
    }
});

app.route("/ai/random-sentence")
.post(async (req, res) => {
    let data = req.body;

    try {
        let response = await sentence_model.generateContent(JSON.stringify(data));
        res.send({
            status: 200,
            content: response.response.text()
        })
    } catch(e) {
        res.send({
            status:500
        });
    }
});

app.route("/ai/info-time")
.post(async (req, res) => {
    let data = req.body;

    try {
        let response = await info_model.generateContent(JSON.stringify(data));
        res.send({
            status: 200,
            content: response.response.text()
        })
    } catch(e) {
        res.send({
            status:500
        });
    }
});

async function uploadToGemini(path, mimeType) {
    const uploadResult = await fileManager.uploadFile(path, {
      mimeType,
      displayName: path,
    });
    const file = uploadResult.file;
    return file;
}

app.post("/ai/trace", upload.single('file'), async (req, res) => {
    let data = req.body.text;
    try {
        let file = req.file;
        let uploadResponse = await uploadToGemini(file.path, file.mimetype);
        let response = await trace_model.generateContent([
            {
              fileData: {
                mimeType: uploadResponse.mimeType,
                fileUri: uploadResponse.uri,
              },
            },
            { text: JSON.stringify(data) },
          ]);
        res.send({
            status: 200,
            content: response.response.text()
        })
    } catch(e) {
        res.send({
            status:500
        });
    }
});

app.listen(5000, () => {
    console.log("started");
});