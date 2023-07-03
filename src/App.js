import React, {useState} from 'react'
import { HashRouter, Link, Routes, Route } from 'react-router-dom'
import './App.scss'
import Header from './components/Header'
import Home from './components/Home'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { TiTick } from 'react-icons/ti'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'

const endPoint = process.env.REACT_APP_API_URI || 'http://localhost:3001'
// const endPoint = process.env.REACT_APP_API_URI || 'https://histkey-restapi.onrender.com'
var text = ''

export default function App() {
  const [keywords, setKeywords] = useState([])
  const [questions, setQuestions] = useState([])

  const fetchData = async () => {
    try {
      text = window.document.getElementById('text').value
      const response = await fetch(endPoint + '/keywords', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
         },
        body: JSON.stringify({ 
          theText: text
        }) 
      });
      const data = await response.json();
      setKeywords(data.keywords)
    } catch (error) {
      console.log(error);
    }
  };

  const fetchQuestions = async () => {
    try {
      var repetitions = window.document.getElementsByClassName('key-repetitions')
      var keysMap = new Map()
      for (var i = 0; i < repetitions.length; i++)
        keysMap.set(keywords[i], repetitions[i].textContent)
      const response = await fetch(endPoint + '/questions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
         },
        body: JSON.stringify({ 
          theText: text,
          keywords: Array.from(keysMap.keys()),
          repetitions: Array.from(keysMap.values())
        }) 
      });
      const data = await response.json();
      setQuestions(data.questions)
    } catch (error) {
      console.log(error);
    }
  };

  const chargeDemoText = async () => {
    try {
      const response = await fetch(endPoint + '/read-demo-file', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json'
         }
      });
      const data = await response.json()
      window.document.getElementById('text').value = data.demoText
    } catch (error) {
      console.log(error);
    }
  };

  const editQuestion = async (id) => {
    try {
      // console.log('editando la q: ', id)

      var ps = window.document.getElementById(id).children[0].children
      for (var i=0; i < 5; i++) 
        ps[i].contentEditable = true

      window.document.getElementById(id).children[1].children[1].hidden = true
      window.document.getElementById(id).children[1].children[0].hidden = false
    } catch (error) {
      console.log(error);
    }
  };

  const acceptQuestion = async (id) => {
    try {
      // console.log('aceptando la q: ', id)

      var ps = window.document.getElementById(id).children[0].children
      for (var i=0; i < 5; i++) 
        ps[i].contentEditable = false

      window.document.getElementById(id).children[1].children[1].hidden = false
      window.document.getElementById(id).children[1].children[0].hidden = true
    } catch (error) {
      console.log(error);
    }
  };

  const deleteQuestion = async (id) => {
    try {
      // console.log('eliminando la q: ', id)

      var question = window.document.getElementById(id)
      const questionParent = question.parentNode
      questionParent.removeChild(question)
    } catch (error) {
      console.log(error);
    }
  };

  const less = async (id) => {
    try {
      var keyReps = parseInt(window.document.getElementById(id).textContent) - 1
      if (keyReps >= 0)
        window.document.getElementById(id).textContent = "" + keyReps
    } catch (error) {
      console.log(error);
    }
  };

  const more = async (id) => {
    try {
      var keyReps = parseInt(window.document.getElementById(id).textContent) + 1
      window.document.getElementById(id).textContent = "" + keyReps
      
    } catch (error) {
      console.log(error);
    }
  };

  const clearAll = async () => {
    try {
      setKeywords([])
      setQuestions([])
    } catch (error) {
      console.log(error);
    }
  };

  const readTxtFile = async () => {
    try {
      var file = window.document.getElementById('upload-file').files[0]
      if (file.type === 'text/plain') {
        const reader = new FileReader()
        reader.onload = function(event) {
          const content = event.target.result
          window.document.getElementById('text').value = content
        };
        reader.readAsText(file);
      } else {
        console.log('El archivo no es de tipo txt');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="App">
      <Header />
      <HashRouter>
        <main className="App-main">
          <Routes>
            <Route path='/' element={
              <Home />
            }/>
            <Route path='/text' element={
              // <Text />
              <div className='textSide'>
                <div className='fileSection'>
                  <p>Here you can upload a text file</p>
                  <input onChange={readTxtFile} type='file' id='upload-file'></input>
                </div>
                <div className='pasteSection'>
                  <p>or paste your text</p>
                  <textarea id='text' className='textArea'></textarea>
                  <div className='text-links-container'>
                    <button onClick={chargeDemoText} className='link'>Use demo text</button>
                    <Link to='/keywords' onClick={fetchData} className='link'>
                        Search Keywords
                    </Link>
                  </div>
                </div>
              </div>
            }/>
            <Route path='/keywords' element={
              // <Keywords keywords={keywords}/>
              <div className='keywords'>
                <p>Select Keywords for make questions:</p>
                <div className='keywords-container'>
                  {
                    keywords.map(key => 
                      <div key={key} className='keyword-container'>
                        <div className='key-name-container'>
                          <p
                            className='key-name'>
                              {key}
                          </p>
                        </div>
                        <div className='key-repetitions-container'>
                          <button onClick={() => less(key)} className='arrow'>
                            <IoIosArrowBack />
                          </button>
                            <p id={key} className='key-repetitions'>0</p>
                          <button onClick={() => more(key)} className='arrow'>
                            <IoIosArrowForward />
                          </button>
                        </div>
                      </div>
                    )
                  }
                </div>
                <Link to='/questions' onClick={fetchQuestions} className='link'>
                    Make Questions
                </Link>
              </div>
            }/>
            <Route path='/questions' element={
              // <Question />
              <div>
                <p>Edit Questions:</p>
                <div>
                  {
                    questions.map(q => {
                      // get a random and unique key
                      const byteArray = new Uint8Array(8)
                      crypto.getRandomValues(byteArray)
                      const key = Array.from(byteArray)
                        .map(byte => byte.toString(16).padStart(2, '0'))
                        .join('')

                      var options = q[1].split(',')
                      return <div id={key} key={key} className='question'>
                        <div>
                          <p>{q[0]}</p>
                          <p>a. {options[0]}</p>
                          <p>b. {options[1]}</p>
                          <p>c. {options[2]}</p>
                          <p>d. {options[3]}</p>
                        </div>
                        <div className='question-icons'>
                          <button hidden onClick={() => acceptQuestion(key)} className='icon-button'>
                            <TiTick size="2.5rem" color='white'/>
                          </button>
                          <button onClick={() => editQuestion(key)} className='icon-button'>
                            <FaEdit size="2.5rem" color='white'/>
                          </button>
                          <button onClick={() => deleteQuestion(key)} className='icon-button'>
                            <FaTrash size="2.5rem" color='white'/>
                          </button>
                        </div>
                      </div>
                    })
                  }
                </div>
                <Link to='/' onClick={clearAll} className='link'>
                    Finnish Process
                </Link>
              </div>
            }/>
          </Routes>
        </main>
      </HashRouter>
    </div>
  )
}