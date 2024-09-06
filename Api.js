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
  express.static(path.join(__dirname, "codemirror-5.65.17"))
);

// Serve the main HTML file
app.get("/", function (req, res) {
  compiler.flush(function () {
    console.log("Deleted the Files");
  });
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/compile", function (req, res) {
  const { code, input, lang } = req.body;

  const tempFolder = path.join(__dirname, "temp");
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
  } else if (lang === "Cpp") {
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

            fs.stat(filePath, (err, stats) => {
              if (err) {
                console.log("Error getting file stats:", err);
              } else {
                if (stats.isFile()) {
                  fs.unlink(filePath, (err) => {
                    if (err) {
                      console.log("Error deleting file:", err);
                    } else {
                      console.log(`Successfully deleted file: ${filePath}`);
                    }
                  });
                } else if (stats.isDirectory()) {
                  fs.rmdir(filePath, (err) => {
                    if (err) {
                      console.log("Error deleting directory:", err);
                    } else {
                      console.log(
                        `Successfully deleted directory: ${filePath}`
                      );
                    }
                  });
                }
              }
            });
          });
        }
      });
    }, 500);
  }
}

const server = app.listen(process.env.PORT || 8080, "0.0.0.0", () => {
  console.log("Server running on port", process.env.PORT || 8080);
});

server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;
