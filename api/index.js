let path = require("path");
let fs = require("fs");
let express = require("express");
let app = express();
let archiver = require("archiver");

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = process.env.GOOGLE_AI_API;
  const genAI = new GoogleGenerativeAI(apiKey);

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
    systemInstruction: "Provide an array of 10 random words in random order for learning the language with 4 options each. give direct response. progress determines the amount of progress they have made in learning the language which is determined by the number of correct answers. response format {words: [{native, target, options}], progress: { '>7', '>=5', '<5' }}",
  });

let zipDir = path.join(__dirname, "..", "zipfiles");
if(!fs.existsSync(zipDir)) {
    fs.mkdirSync(zipDir, { recursive: true });
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

app.listen(5000, () => {
    console.log("started");
});