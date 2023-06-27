const fs = require('fs');

module.exports = {
    getDemoText: main
};

let demoTextPath = './restapi/demoText.txt';

async function main(res) {
    fs.readFile(demoTextPath, 'utf8', (error, text) => {
        if (error)
            console.error('Error reading demo text file: ', demoTextPath, error);
        else {
            res.send({
                demoText: text
            });
        }
    });
}