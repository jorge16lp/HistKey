const fs = require('fs');

module.exports = {
    getQuestions: main
};

var paragraph = ""
var prevKeywords = []
var keysRepetitions = []
var blank = '__________'

async function main(res, text, keywords, repetitions) {
    paragraph = text
    prevKeywords = []
    prevKeywords.push(...keywords)
    keysRepetitions = []
    keysRepetitions.push(...repetitions)
    var final = new Map()

    final = generateQuestions()
    res.send({
        questions: Array.from(final)
    });
}


//_______________________________________________________________ Questions ________________________________________________________________


function generateQuestions() {
    const sentences = paragraph.split('.');
    const questions = new Map();
    var questionsForActualKey = 0;

    for (var word in prevKeywords) {
        questionsForActualKey = 0;
        if (keysRepetitions[word] > 0) {
            for (let i = 0; i < sentences.length; i++) {
                var initialSentence = sentences[i].trim();
                var sentence = procesado(initialSentence);
                const words = sentence.split(' ');
    
                if (words.includes(prevKeywords[word]) && questionsForActualKey < keysRepetitions[word]) {
                    var finalSentence = initialSentence.replace(prevKeywords[word], blank)
    
                    questions.set(finalSentence, getOptionsWithPOS(prevKeywords[word]))
                    questionsForActualKey++;
                }
            }
        }
    }

    return questions;
}


//__________________________________________________________ Preprocesado ________________________________________________________________


function procesado(paragraph) {
    //paragraph = paragraph.toLowerCase();
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
    paragraph = paragraph.replace(/@/gi, ' '); // todas las @ por  .
    paragraph = paragraph.replace(/["'()?]/g, "");
    paragraph = paragraph.replace(/ +/g, ' '); // quitar dobles espacios

    return paragraph;
}


//_____________________________________________________________ POS ___________________________________________________________________


function getOptionsWithPOS(w) {
    var pos = require('pos')
    var word = new pos.Lexer().lex(w)
    var tagger = new pos.Tagger()
    var taggedWord = tagger.tag(word) // obtenemos el tipo de la palabra

    var text = new pos.Lexer().lex(procesado(paragraph))
    var taggerText = new pos.Tagger()
    var taggedWords = taggerText.tag(text)

    var NNPlist = []
    var NNPSlist = []
    var NNlist = []
    var NNSlist = []
    var options = w

    let stopWordsPath = './restapi/stopWords.txt';
    var stopWords = []
    fs.readFile(stopWordsPath, 'utf8', (error, dataStop) => {
        if (error)
            console.error('Error en la lectura del archivo de stopWords: ', stopWordsPath, error);
        else {
            stopWords = dataStop.split('\n');
        }
    });

    console.log(taggedWord[0][0], taggedWord[0][1])
    for (var i in taggedWords) {
        if (!stopWords.includes(taggedWords[i][0].toLowerCase()) && taggedWords[i][0][0] === taggedWords[i][0][0].toUpperCase()) {
            if (taggedWords[i][1] === 'NNP')
                NNPlist.push(taggedWords[i])
            if (taggedWords[i][1] === 'NNPS')
                NNPSlist.push(taggedWords[i])
            if (taggedWords[i][1] === 'NN')
                NNlist.push(taggedWords[i])
            if (taggedWords[i][1] === 'NNS')
                NNSlist.push(taggedWords[i])
        }
    }

    var arrayOptions = [options]
    const min = 0;
    if (taggedWord[0][1] === 'NNP') {
        while (arrayOptions.length < 4) {
            const max = NNPlist.length - 1
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min
            if (!arrayOptions.includes(NNPlist[randomNumber][0]))
                arrayOptions.push(NNPlist[randomNumber][0])
        }
    } else if (taggedWord[0][1] === 'NNPS') {
        while (arrayOptions.length < 4) {
            const max = NNPSlist.length - 1
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min
            if (!arrayOptions.includes(NNPSlist[randomNumber][0]))
                arrayOptions.push(NNPSlist[randomNumber][0])
        }
    } else if (taggedWord[0][1] === 'NN') {
        while (arrayOptions.length < 4) {
            const max = NNlist.length - 1
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min
            if (!arrayOptions.includes(NNlist[randomNumber][0]))
                arrayOptions.push(NNlist[randomNumber][0])
        }
    } else if (taggedWord[0][1] === 'NNS') {
        while (arrayOptions.length < 4) {
            const max = NNSlist.length - 1
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min
            if (!arrayOptions.includes(NNSlist[randomNumber][0]))
                arrayOptions.push(NNSlist[randomNumber][0])
        }
    } else {
        console.log(taggedWord[0][0], taggedWord[0][1])
    }

    var randomArrayOptions = []
    while (randomArrayOptions.length < 4) {
        const max = arrayOptions.length - 1
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min
        if (!randomArrayOptions.includes(arrayOptions[randomNumber]))
            randomArrayOptions.push(arrayOptions[randomNumber])
    }
    return randomArrayOptions[0] + ',' + randomArrayOptions[1] + ',' + randomArrayOptions[2] + ',' + randomArrayOptions[3]
}