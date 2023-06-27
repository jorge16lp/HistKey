const fs = require('fs');

module.exports = {
    getKeyWords: main
};

let stopWordsPath = './restapi/stopWords.txt';
var paragraph = "";
var finalParagraphSimple = "";
var stopWords = [];

// main(); // start execution

async function main(res, text) {
    paragraph = text;
    fs.readFile(stopWordsPath, 'utf8', (error, dataStop) => {
        if (error)
            console.error('Error en la lectura del archivo de stopWords: ', stopWordsPath, error);
        else {
            stopWords = dataStop.split('\n');
            //__________ Procesado ________
            procesado();
            //____________ POS ____________
            POS();
            //___________ TF-IDF __________
            var final = tf_idf();
            res.send({
                keywords: final
            });
        }
    });
}


//______________________________________________________ Preprocesado ________________________________________________________________


function procesado() {
    paragraph = paragraph.replace(/\n/g, ' ');
    paragraph = paragraph.replace(/\t/g, ' ');
    paragraph = paragraph.replace(/,/gi, '.'); // todas las , por  .
    paragraph = paragraph.replace(/[.]/gi, ' '); // todas las . por  .
    paragraph = paragraph.replace(/•/gi, ' '); // todas las · por  .
    paragraph = paragraph.replace(/:/gi, ' '); // todas las : por  .
    paragraph = paragraph.replace(/–/gi, ' '); // todas las – por  .
    paragraph = paragraph.replace(/—/gi, ' '); // todas las — por  .
    paragraph = paragraph.replace(/\*/gi, ' '); // todas las * por  .
    paragraph = paragraph.replace(/;/gi, ' '); // todas las ; por  .
    paragraph = paragraph.replace(/'/gi, ' '); // todas las ' por  .
    paragraph = paragraph.replace(/“/gi, ' '); // todas las “ por  .
    paragraph = paragraph.replace(/”/gi, ' '); // todas las ” por  .
    paragraph = paragraph.replace(/\[/gi, ' '); // todas las [ por  .
    paragraph = paragraph.replace(/\]/gi, ' '); // todas las ] por  .
    paragraph = paragraph.replace(/["'()?]/g, "");
    paragraph = paragraph.replace(/ +/g, ' '); // quitar dobles espacios

    initialParagraph = paragraph;
}


//____________________________________________________________ POS ________________________________________________________________


async function POS() {
    var pos = require('pos');
    var words = new pos.Lexer().lex(paragraph);

    var tagger = new pos.Tagger();
    var taggedWords = tagger.tag(words);

    // coger sólamente words de estos tipos 
    var onlyFromText = [
        "NNP", "NNPS", "NN", "NNS"
    ];

    var paragraphSimple = "";
    for (i in taggedWords) {
        var taggedWord = taggedWords[i];
        var word = taggedWord[0];
        var tag = taggedWord[1];

        // cogiendo solo palabras en mayusculas y de los tipos indicados
        if (word[0] == word[0].toUpperCase() && onlyFromText.includes(tag) || word == 'I')
            paragraphSimple += word + " ";

    }

    var arrayWords = paragraphSimple.split(' ');
    for (var k = 0; k < arrayWords.length; k++) {
        if (!stopWords.includes(arrayWords[k].toLowerCase()))
            finalParagraphSimple += arrayWords[k] + " ";
    }
}


//__________________________________________________________ TF-IDF ________________________________________________________________


function tf_idf() {
    paragraph = finalParagraphSimple;

    var mapTodasLasPalabras = new Map();

    paragraphArray = paragraph.split(' ');
    for (i = 0; i < paragraphArray.length; i++) {
        mapTodasLasPalabras.set(paragraphArray[i], 0);
    }

    var i = paragraphArray.indexOf('');
    if (i != -1)
        paragraphArray.splice(i, 1);

    var natural = require('natural');
    var TfIdf = natural.TfIdf;
    var tfidf = new TfIdf();

    //Incluir todos los parrafos
    tfidf.addDocument(paragraph);

    // aqui guarda las palabras
    var map = new Map();
    var con = false;

    for (var i = 0; i < paragraphArray.length; i++) {
        con = false;
        /* console.log(i + " " + paragraphArray[i]); */

        tfidf.tfidfs(paragraphArray[i], function (r, measure) {
            // console.log(paragraphArray[i] + ' is ' + measure);

            /* console.log("----------------- agregar al map " + map.entries().len) */
            map.set(paragraphArray[i], measure);
            con = true;
        });
        while (con == false) {}
    }

    var finalWords = [];

    for (const [key, value] of map.entries()) {
        if (value > 0.3) { // mejor valor de momento: 0.3
            if (!finalWords.includes(key)) { // para que no se repitan iguales o con espacios de más
                // console.log(key, value);
                finalWords.push(key); // añadir palabra 'importante'
            }
        }
    }

    // console.log(map); // todas las palabras 'importantes'

    // var file = fs.openSync('salida.txt', 'w'); // abrir fichero
    // for (key in finalWords) {
    //     fs.appendFileSync(file, finalWords[key] + '\n', 'utf8', (error) => { // escribir las palabras encontradas en un fichero de salida
    //         if (error) {
    //             console.error('Error al escribir en el archivo:', error);
    //             return;
    //         }
    //     });
    // }
    // fs.closeSync(file); // cerrar fichero

    for (var w in finalWords)
        console.log(finalWords[w])

    console.log("Nº Palabras: " + finalWords.length)

    return finalWords.sort();
}