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
      clearAll()
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
  }

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

      // eliminar posibles keywords añadidas a mano
      var questions = window.document.getElementById('questions-container');
      if (questions && questions.firstElementChild)
        questions.removeChild(questions.firstChild)
    } catch (error) {
      console.log(error);
    }
  }

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
  }

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
  }

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
  }

  const deleteQuestion = async (id) => {
    try {
      // console.log('eliminando la q: ', id)

      var question = window.document.getElementById(id)
      const questionParent = question.parentNode
      questionParent.removeChild(question)
    } catch (error) {
      console.log(error);
    }
  }

  const less = async (id) => {
    try {
      var keyReps = parseInt(window.document.getElementById(id).textContent) - 1
      if (keyReps >= 0)
        window.document.getElementById(id).textContent = "" + keyReps
      if (keyReps === 0) {
        var keyword = id.split('_')[0]
        window.document.getElementById(keyword).style.backgroundColor = 'white'
      }
    } catch (error) {
      console.log(error);
    }
  }

  const more = async (id) => {
    try {
      var keyReps = parseInt(window.document.getElementById(id).textContent) + 1
      window.document.getElementById(id).textContent = "" + keyReps
      var keyword = id.split('_')[0]
      window.document.getElementById(keyword).style.backgroundColor = 'greenyellow'
    } catch (error) {
      console.log(error);
    }
  }

  const clearAll = async () => {
    try {
      setKeywords([])
      setQuestions([])
    } catch (error) {
      console.log(error);
    }
  }

  const readTxtFile = async () => {
    try {
      var file = window.document.getElementById('upload-file').files[0]
      console.log(file)
      if (file && file.type === 'text/plain') {
        const reader = new FileReader()
        reader.onload = function(event) {
          const content = event.target.result
          window.document.getElementById('text').value = content
        }
        reader.readAsText(file);
      } else {
        alert('El archivo no es de tipo txt')
      }
    } catch (error) {
      console.log(error);
    }
  }

  const generateTxtToDownload = async () => {
    try {
      var preguntasFinales = ''
      for (var q in questions) {
        console.log(questions[q])
        var enunciado = questions[q][0]
        var opciones = questions[q][1].split(',')
        var preguntaFinal = enunciado + '\nA. ' + opciones[0] + '\nB. ' + opciones[1] +
          '\nC. ' + opciones[2] + '\nD. ' + opciones[3] + '\nANSWER: '
      } 
      preguntasFinales += preguntaFinal
      return preguntasFinales
    } catch (error) {
      console.log(error);
    }
  }

  const addKeyword = async () => {
    try {
      var key = window.document.getElementById('new-key').value
      if (key === '')
        alert('New word is empty')
      else {
        var keywordsContainer = window.document.getElementById('keywords-container');
      
        // Crear un nuevo elemento div
        var newDiv = document.createElement('div');
        newDiv.class = 'keyword-container';
        newDiv.innerHTML = `
          <div key=${key} class='keyword-container'>
            <div id=${key} class='key-name-container'>
              <p class='key-name'>
                ${key}
              </p>
            </div>
            <div class='key-repetitions-container'>
              <button id='${key}_less' class="arrow">
                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M217.9 256L345 129c9.4-9.4 9.4-24.6 0-33.9-9.4-9.4-24.6-9.3-34 0L167 239c-9.1 9.1-9.3 23.7-.7 33.1L310.9 417c4.7 4.7 10.9 7 17 7s12.3-2.3 17-7c9.4-9.4 9.4-24.6 0-33.9L217.9 256z">
                  </path>
                </svg>
              </button>
              <p id='${key}_repetitions' class='key-repetitions'>
                1
              </p>
              <button id='${key}_more' class="arrow">
              <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z">
                </path>
              </svg>
              </button>
            </div>
          </div>`;
        
        // meter el elemento div en su lugar
        keywordsContainer.appendChild(newDiv);
        // vaciar el campo de texto
        window.document.getElementById('new-key').value = '';
          
        // añadir funcion al boton de disminuir
        var less_button = window.document.getElementById(key+'_less')      
        less_button.onclick = function() {
          less(key+'_repetitions')
        }
        // añadir funcion al boton de aumentar
        var more_button = window.document.getElementById(key+'_more')
        more_button.onclick = function() {
          more(key+'_repetitions')
        }

        // darle color de seleccionada a la nueva key
        window.document.getElementById(key).style.backgroundColor = 'greenyellow'

        var newKeywords = []
        newKeywords = keywords
        newKeywords.push(key)
        setKeywords(newKeywords)
      }
    } catch (error) {
      console.log(error);
    }
  }

  const checkLogin = async () => {
    try {
      // validación de campos
      if (!window.document.getElementById('login-teacher').checked
          && !window.document.getElementById('login-student').checked)
          alert('No user type selected')
      else {
        var formEmail = window.document.getElementById('login-email').value
        var password = window.document.getElementById('login-pass').value
        if (window.document.getElementById('login-teacher').checked) {
          const response = await fetch(endPoint + '/find-teacher-by-email', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              email: formEmail,
              pass: password
            }) 
          });
          const data = await response.json()
          console.log(data)
          if (data.user === null)
            alert('Data introduced is incorrect')
          else
            window.document.getElementById('log-to-text').style.display = 'block'      
        } else {
          const response = await fetch(endPoint + '/find-student-by-email', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              email: formEmail,
              pass: password
            }) 
          });
          const data = await response.json()
          console.log(data)
          if (data.user === null)
            alert('Data introduced is incorrect')
          else
            window.document.getElementById('log-to-exams').style.display = 'block'  
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  const checkSignup = async () => {
    try {
      // validación de campos
      var teacherChecked = window.document.getElementById('signup-teacher').checked 
      var studentChecked = window.document.getElementById('signup-student').checked
      var formName = window.document.getElementById('signup-name').value
      var formSurname = window.document.getElementById('signup-surname').value
      var formEmail = window.document.getElementById('signup-email').value
      var password = window.document.getElementById('signup-pass').value
      var passwordRep = window.document.getElementById('signup-pass-repeat').value
      if (!teacherChecked && !studentChecked)
        alert('No user type selected')
      else if (formName === '')
        alert('No name inserted')
      else if (formSurname === '')
        alert('No surname inserted')
      else if (formEmail === '')
        alert('No email inserted')
      else if (password === '')
        alert('No password inserted')
      else if (passwordRep === '')
        alert('No password repeated inserted')
      else if (password !== passwordRep)
        alert('Password and password repeated must be the same')
      else { // insertar nuevo usuario en la bd
        // obtener el tipo de usuario a insertar
        var user = window.document.getElementById('signup-teacher').checked ? 'teacher' : 'student'
        const response = await fetch(endPoint + '/add-user', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
           },
          body: JSON.stringify({
            type: user,
            name: formName,
            surname: formSurname,
            email: formEmail,
            pass: password
          }) 
        });
        const data = await response.json()
        console.log(data)
        if (data.user === '11000')
          alert('The email inserted is already signed up')
        else if (data.user === null)
          alert('There is a problem with de user sign up')
        else if (teacherChecked)
          window.document.getElementById('sign-to-text').style.display = 'block'
        else
          window.document.getElementById('sign-to-exams').style.display = 'block'
      }
    } catch (error) {
      console.log(error);
    }
  }

  const selectAllKeywords = async () => {
    try {
      var key_repetitions = window.document.getElementsByClassName('key-repetitions')
      key_repetitions = Array.from(key_repetitions)
      key_repetitions.forEach(function (elemento) {
        if (elemento.textContent === '0')
          elemento.textContent = '1'
      })

      var key_containers = window.document.getElementsByClassName('key-name-container')
      key_containers = Array.from(key_containers)
      key_containers.forEach(function (elemento) {
        elemento.style.backgroundColor = 'greenyellow'
      })
      
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="App">
      <Header />
      <HashRouter>
        <main className="App-main">
          <Routes>
            <Route path='/' element={
              <Home />
            }/>
            <Route path='/login' element={
              <div className='register-form'>
                <p>
                  Here you can log in the application
                </p>
                <label>
                  User type:
                  <input id='login-teacher' type='radio' name='user' value='Teacher' className='log-radio'></input>
                  Teacher
                  <input id='login-student' type='radio' name='user' value='Student' className='log-radio'></input>
                  Student
                </label>
                <label>
                  Email: 
                  <input id='login-email' type='text' className='log-text'></input>
                </label>
                <label>
                  Password:
                  <input id='login-pass' type='password' className='log-text'></input>
                </label>
                <button onClick={checkLogin} className='check-login'>Check log in</button>
                <Link to='/text' id='log-to-text' className='log-link'>
                  Log in
                </Link>
                <Link to='/exams' id='log-to-exams' className='log-link'>
                  Log in
                </Link>
              </div>
            }/>
            <Route path='/signup' element={
              <div className='register-form'>
              <p>
                Here you can sign up the application
              </p>
              <label>
                User type:
                <input id='signup-teacher' type='radio' name='user' value='Teacher' className='sign-radio'></input>
                Teacher
                <input id='signup-student' type='radio' name='user' value='Student' className='sign-radio'></input>
                Student
              </label>
              <label>
                Name:
                <input id='signup-name' type='text' className='sign-text'></input>
              </label>
              <label>
                Surname: 
                <input id='signup-surname' type='text' className='sign-text'></input>
              </label>
              <label>
                Email: 
                <input id='signup-email' type='text' className='sign-text'></input>
              </label>
              <label>
                Password:
                <input id='signup-pass' type='password' className='sign-text'></input>
              </label>
              <label>
                Repeat password:
                <input id='signup-pass-repeat' type='password' className='sign-text'></input>
              </label>
              <button onClick={checkSignup}>Check sign up</button>
              <Link to='/text' id='sign-to-text' className='log-user'>
                Sign up
              </Link>
              <Link to='/exams' id='sign-to-exams' className='log-user'>
                Sign up
              </Link>
            </div>
            }/>
            <Route path='/exams' element={
              <div className='examsSide'>
                <Link to='/' className='logout-link'>
                  Log out
                </Link>
                manera de buscar exámenes por id pública
              </div>
            }/>
            <Route path='/text' element={
              <div className='textSide'>
                <Link to='/' className='logout-link'>
                  Log out
                </Link>
                <div className='fileSection'>
                  <p>Here you can upload a text file</p>
                  <input onChange={readTxtFile} type='file' id='upload-file'></input>
                </div>
                <div className='pasteSection'>
                  <p>or directly paste your text</p>
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
              <div className='keywords'>
                <div className='keywords-header'>
                  <button onClick={selectAllKeywords} className='selectAll-button'>Select All</button>
                  <Link to='/' className='logout-link'>
                    Log out
                  </Link>
                </div>
                <p>Select Keywords for make questions:</p>
                <div id='keywords-container' className='keywords-container'>
                  {
                    keywords.map(key => 
                      <div key={key} className='keyword-container'>
                        <div id={key} className='key-name-container'>
                          <p
                            className='key-name'>
                              {key}
                          </p>
                        </div>
                        <div className='key-repetitions-container'>
                          <button onClick={() => less(key+'_repetitions')} className='arrow'>
                            <IoIosArrowBack />
                          </button>
                          <p id={key+'_repetitions'} className='key-repetitions'>
                            {/* {first15Keys(key) ? '1' : '0'} */}
                            0
                            {/* 1 */}
                          </p>
                          <button onClick={() => more(key+'_repetitions')} className='arrow'>
                            <IoIosArrowForward />
                          </button>
                        </div>
                      </div>
                    )
                  }
                </div>
                <div className='footer'>
                  <div className='add-container'>
                  <p>Add here a new word of the text:</p>
                    <input type='text' id='new-key' className='input-add-keyword'></input>
                    <button onClick={addKeyword} className='button-add-keyword'>+</button>
                  </div>
                  <Link to='/questions' onClick={fetchQuestions} className='link'>
                      Make Questions
                  </Link>
                </div>
              </div>
            }/>
            <Route path='/questions' element={
              <div className='questions'>
                <Link to='/' className='logout-link'>
                  Log out
                </Link>
                <p>Edit Questions:</p>
                <div id='questions-container'>
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
                <div className='saveORcontinue'>
                  <button onClick={generateTxtToDownload} className='link'>Save as...</button>
                  <Link to='/' onClick={clearAll} className='link'>
                      Finnish Process
                  </Link>
                </div>
              </div>
            }/>
          </Routes>
        </main>
      </HashRouter>
    </div>
  )
}