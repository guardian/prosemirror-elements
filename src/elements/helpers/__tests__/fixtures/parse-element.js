import fs from "fs";

const description = `
Process and sanitize fixture data, parsing out JSON and removing
data from fields that contain content we'd like to remove.

Usage: \`node parse-element.js file1.json[,file2.json,...]\`
`

const [_, __, csFileNames] = process.argv;

if (!csFileNames) {
  console.log(description);
  console.log("Incorrect arguments: no files provided.");
  process.exit(22)
}

const fileNames = csFileNames.split(",")

const processFile = (fileName) => {
  const sensitiveFields = ["caption", "description", "html", "authorName"];
  const filePath = `./${fileName}`;

  let redactCount = 0;

  const elementArr = JSON.parse(fs.readFileSync(filePath));
  const newData = elementArr.map((elementData) => {
    const newElement = JSON.parse(elementData.element);


    sensitiveFields.forEach((sensitiveField) => {
      if (newElement.fields?.[sensitiveField]) {
        redactCount++;
        newElement.fields[sensitiveField] = "<<REDACTED>>";
      }
    });

    return {
      ...elementData,
      element: newElement,
    };
  });

  console.log(`Redacted ${redactCount} fields from ${fileName}`)

  const newPath = `${filePath.split(".json")[0]}-sanitized.json`;

  console.log(`Writing to ${newPath}`);

  fs.writeFileSync(newPath, JSON.stringify(newData, null, 2));
}

fileNames.forEach(processFile);
