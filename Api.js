const express = require("express");
const app = express();
const fs = require("fs");
const bodyP = require("body-parser");
const compiler = require("compilex");
const path = require("path");

const options = { stats: true };
compiler.init(options);

app.use(bodyP.json());
app.use(
  "/codemirror-5.65.17",
  express.static("C:/Users/Karan/Desktop/Compiler/codemirror-5.65.17")
);

app.get("/", function (req, res) {
  compiler.flush(function () {
    console.log("Deleted the Files");
  });
  res.sendFile("C:/Users/Karan/Desktop/Compiler/index.html");
});

app.post("/compile", function (req, res) {
  const { code, input, lang } = req.body;

  const tempFolder = "C:/Users/Karan/Desktop/Compiler/temp";
  let envData;
  if (lang === "Python") {
    envData = { OS: "windows" };
    compiler.compilePythonWithInput(envData, code, input, function (data) {
      handleResponse(data, res, tempFolder);
    });
  } else if (lang === "Java") {
    envData = { OS: "windows" };
    compiler.compileJavaWithInput(envData, code, input, function (data) {
      handleResponse(data, res, tempFolder);
    });
  } else if (lang === "C++") {
    envData = {
      OS: "windows",
      cmd: "g++",
    };
    compiler.compileCPPWithInput(envData, code, input, function (data) {
      handleResponse(data, res, tempFolder);
    });
  } else {
    res.send({ error: "Unsupported language!" });
  }
});

function handleResponse(data, res, tempFolder) {
  res.send(data);

  if (data.output) {
    setTimeout(() => {
      fs.readdir(tempFolder, (err, files) => {
        if (err) {
          console.log("Error reading temp directory:", err);
        } else {
          files.forEach((file) => {
            const filePath = path.join(tempFolder, file);

            fs.unlink(filePath, (err) => {
              if (err) {
                console.log("Error deleting file:", err);
              } else {
                console.log(`Successfully deleted file: ${filePath}`);
              }
            });
          });
        }
      });
    }, 500);
  }
}

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
