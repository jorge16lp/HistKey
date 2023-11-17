import React, {useState} from 'react'
import { HashRouter, Link, Routes, Route } from 'react-router-dom'
import './App.scss'
import Header from './components/Header'
import Home from './components/Home'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { TiTick } from 'react-icons/ti'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'
import { Card, notification } from 'antd';

// const endPoint = process.env.REACT_APP_API_URI || 'http://localhost:3001'
const endPoint = process.env.REACT_APP_API_URI || 'https://histkey-restapi.onrender.com'
var text = ''

export default function App() {
  const [api, contextHolder] = notification.useNotification()

  const [keywords, setKeywords] = useState([])
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])

  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      text = window.document.getElementById('text').value
      if (text !== "") {
        const response = await fetch(endPoint + '/keywords', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
            theText: text
          }) 
        })
        const data = await response.json()
        setKeywords(data.keywords)
      } else {
        openNotification("top", "Text introduced was empty", "error")
      }
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      var repetitions = window.document.getElementsByClassName('key-repetitions')
      var keysMap = new Map()
      var numberOfQuestions = 0
      for (var i = 0; i < repetitions.length; i++) {
        keysMap.set(keywords[i], repetitions[i].textContent)
        if (repetitions[i].textContent !== "0") numberOfQuestions += 1
      }
      // console.log(numberOfQuestions)
      if (numberOfQuestions !== 0) {
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
      }  else {
        openNotification("top", "Any keyword was selected to generate questions", "error")
      }
      setLoading(false)
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
      var allOk = true
      // console.log(ps)
      for (var i=0; i < 5; i++) {
        // console.log(ps[i].textContent)
        if (ps[i].textContent !== "")
          ps[i].contentEditable = false
        else {
          allOk = false
          openNotification("top", "A question part can not be empty", "error")
        }
      }

      if (allOk) {
        window.document.getElementById(id).children[1].children[1].hidden = false
        window.document.getElementById(id).children[1].children[0].hidden = true
      }
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
        openNotification("top", "Is not a txt file", "error")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const generateTxtToDownload = async () => {
    try {
      var lastLink = document.getElementById("link-to-download")
      if (lastLink)
        lastLink.remove()

      var contenidoTexto = ``
      var webQuestions = window.document.getElementsByClassName('question')
      console.log(webQuestions.length)
      for (var q = 0; q < webQuestions.length; q++) {
        // console.log(questions[q])
        // var opciones = questions[q][1].split(',')
        var opciones = []
        for (var i=1; i < webQuestions[q].children[0].children.length; i++) 
          opciones.push(webQuestions[q].children[0].children[i].textContent.substring(3))
        var respuesta = questions[q][2]
        var answer = ""
        if (respuesta === opciones[0])
          answer = "A"
        else if (respuesta === opciones[1])
          answer = "B"
        else if (respuesta === opciones[2])
          answer = "C"
        else if (respuesta === opciones[3])
          answer = "D"
        var question = webQuestions[q].children[0].children[0].textContent
        contenidoTexto += `${question}
A. ${opciones[0]}
B. ${opciones[1]}
C. ${opciones[2]}
D. ${opciones[3]}
ANSWER: ${answer}\n`
      }

      var blob = new Blob([contenidoTexto], { type: "text/plain" })
      var urlArchivo = URL.createObjectURL(blob)

      var enlaceDescarga = document.createElement("a")
      enlaceDescarga.href = urlArchivo;
      enlaceDescarga.download = "exam.txt"
      enlaceDescarga.textContent = "Click to download"
      enlaceDescarga.id = "link-to-download"

      document.getElementById('download-questions-container').appendChild(enlaceDescarga)
    } catch (error) {
      console.log(error)
    }
  }

  const saveExamInDB = async () => {
    try {
      var contenidoTexto = ``
      var webQuestions = window.document.getElementsByClassName('question')
      // console.log(webQuestions)
      console.log(webQuestions.length)
      for (var q = 0; q < webQuestions.length; q++) {
        // console.log(questions[q])
        var opciones = []
        for (var i=1; i < webQuestions[q].children[0].children.length; i++) 
          opciones.push(webQuestions[q].children[0].children[i].textContent.substring(3))
        // console.log(opciones)
        var respuesta = questions[q][2]
        var answer = ""
        if (respuesta === opciones[0])
          answer = "A"
        else if (respuesta === opciones[1])
          answer = "B"
        else if (respuesta === opciones[2])
          answer = "C"
        else if (respuesta === opciones[3])
          answer = "D"
        var question = webQuestions[q].children[0].children[0].textContent
        // console.log(question)
        contenidoTexto += `${question}:${opciones[0]},${opciones[1]},${opciones[2]},${opciones[3]},${answer}
----------\n`
      }
      // console.log(contenidoTexto)
      var id = prompt("Please, introduce the public id for the exam.\nAfter saving it, it cannot be overwritten. Make sure you don't want to make any more changes.", "exam100")
      // console.log(id)
      const response = await fetch(endPoint + '/exam', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
         },
        body: JSON.stringify({
          public_id: id,
          questions: contenidoTexto
        }) 
      });
      const data = await response.json()
      // console.log(data)
      if (data.exam === '11000')
        openNotification("top", "The public id is already in use", "error")
      else if (data.exam === null)
        openNotification("top", "There is a problem with the exam saving", "error")
      else if (id !== null)
        document.getElementById('save-exam-button').style.display = "none"
    } catch (error) {
      console.log(error)
    }
  }

  const addKeyword = async () => {
    try {
      var key = window.document.getElementById('new-key').value
      if (key === '')
        openNotification("top", "New word is empty", "error")
      else {
        setKeywords((prevKeywords) => {
          if (!prevKeywords.includes(key))
            return [...prevKeywords, key]
          else
            openNotification("top", "Word is already in the list", "error")
          return prevKeywords
        })
      }
      window.document.getElementById('new-key').value = ""
    } catch (error) {
      console.log(error);
    }
  }

  const checkLogin = async () => {
    try {
      // validación de campos
      if (!window.document.getElementById('login-teacher').checked
          && !window.document.getElementById('login-student').checked)
          openNotification("top", "No user type selected", "error")
      else {
        var formEmail = window.document.getElementById('login-email').value
        var password = window.document.getElementById('login-pass').value
        if (window.document.getElementById('login-teacher').checked) {
          const response = await fetch(endPoint + `/teacher?email=${formEmail}&pass=${password}`, {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json()
          // console.log(data)
          if (data.user === null)
            openNotification("top", "Data introduced is incorrect", "error")
          else {
            window.document.getElementById('log-to-text').style.display = 'block'
            window.document.getElementById('check-login').style.display = 'none' 
            window.document.getElementById('login-success').style.display = 'block' 
          }    
        } else {
          const response = await fetch(endPoint + `/student?email=${formEmail}&pass=${password}`, {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json()
          // console.log(data)
          if (data.user === null)
            openNotification("top", "Data introduced is incorrect", "error")
          else {
            window.document.getElementById('log-to-exams').style.display = 'block' 
            window.document.getElementById('check-login').style.display = 'none' 
            window.document.getElementById('login-success').style.display = 'block' 
          } 
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
        openNotification("top", "No user type selected", "error")
      else if (formName === '')
        openNotification("top", "No name inserted", "error")
      else if (formSurname === '')
        openNotification("top", "No surname inserted", "error")
      else if (formEmail === '')
        openNotification("top", "No email inserted", "error")
      else if (password === '')
        openNotification("top", "No password inserted", "error")
      else if (passwordRep === '')
        openNotification("top", "no password repeated inserted", "error")
      else if (password !== passwordRep)
        openNotification("top", "Password and password repeated must be the same", "error")
      else { // insertar nuevo usuario en la bd
        // obtener el tipo de usuario a insertar
        var user = window.document.getElementById('signup-teacher').checked ? 'teacher' : 'student'
        const response = await fetch(endPoint + '/user', {
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
        // console.log(data)
        if (data.user === '11000')
          openNotification("top", "The email is already signed up", "error")
        else if (data.user === null)
          openNotification("top", "There is a problem with de user sign up", "error")
        else {
          if (teacherChecked)
            window.document.getElementById('sign-to-text').style.display = 'block'
          else
            window.document.getElementById('sign-to-exams').style.display = 'block'
          window.document.getElementById('check-signup').style.display = 'none'
          window.document.getElementById('signup-success').style.display = 'block'
        }
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

  const deselectAllKeywords = async () => {
    try {
      var key_repetitions = window.document.getElementsByClassName('key-repetitions')
      key_repetitions = Array.from(key_repetitions)
      key_repetitions.forEach(function (elemento) {
        if (elemento.textContent !== '0')
          elemento.textContent = '0'
      })

      var key_containers = window.document.getElementsByClassName('key-name-container')
      key_containers = Array.from(key_containers)
      key_containers.forEach(function (elemento) {
        elemento.style.backgroundColor = 'white'
      })
      
    } catch (error) {
      console.log(error);
    }
  }

  const findExamByPublicId = async () => {
    setLoading(true)
    try {
      var p_id = window.document.getElementById('exam-id-txt').value
      // console.log(p_id)

      const response = await fetch(endPoint + `/exam/${p_id}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json()
      console.log(data)

      var answersArray = []
      if (data.exam !== null) {
        var bigQuestions = data.exam.questions.split('\n----------\n')
        // console.log(bigQuestions)
        for (var i=0; i < bigQuestions.length; i++) {
          if (bigQuestions[i] !== "") {
            var questionParts = bigQuestions[i].split(':')
            if (questionParts.length > 2) {
              for (var k = 1; k <= questionParts.length - 2; k++)
                questionParts[0] += ": " + questionParts[k]
              questionParts[1] = questionParts[questionParts.length-1]
            }
            // console.log(questionParts)
            var question = questionParts[0]
            var options = questionParts[1].split(',')
            var answer = ""
            if (options[4] === "A") answer = options[0]
            else if (options[4] === "B") answer = options[1]
            else if (options[4] === "C") answer = options[2]
            else answer = options[3]
            answersArray.push(answer)
            options.pop()
            // console.log(question)
            // console.log(options)
            // console.log(answer)

            var questionsContainer = window.document.getElementById('exam-questions-container')
            var questionContainer = window.document.createElement('div')
            questionContainer.className = 'exam-question'
            questionContainer.style.display = 'flex'
            questionContainer.style.flexDirection = 'column'
            questionContainer.style.border = '2px solid white'
            questionContainer.style.borderRadius = '0.5rem'
            questionContainer.style.padding = '1rem'
            questionContainer.style.margin = '1rem'
            // colocar el enunciado de la pregunta
            var questionText = window.document.createElement('p')
            questionText.textContent = question
            questionContainer.appendChild(questionText)
            // colocar las opciones
            for (var o=0; o < options.length; o++) {
              var optionContainer = window.document.createElement('div')
              var radioInput = window.document.createElement('input')
              radioInput.style.margin = '1rem'
              radioInput.type = 'radio'
              radioInput.name = `option_Q${i}`

              var label = window.document.createElement('label')
              label.textContent = options[o]

              optionContainer.appendChild(radioInput)
              optionContainer.appendChild(label)
              questionContainer.appendChild(optionContainer)
            }

            questionsContainer.appendChild(questionContainer)          
          }
        }
        // console.log("array",answersArray)
      }
      setAnswers(answersArray)
      setLoading(false)
      // console.log("state: ",answers)
    } catch (error) {
      console.log(error)
    }
  }

  const checkExamAnswers = async () => {
    try {
      var examQuestions = window.document.getElementsByClassName('exam-question')
      for (var i=0; i < examQuestions.length; i++) {
        var radioButtons = examQuestions[i].querySelectorAll('input[type="radio"]')
        var selectedOption = null
        for (var rb=0; rb < radioButtons.length; rb++) {
          if (radioButtons[rb].checked) {
            var label = radioButtons[rb].nextElementSibling        
            selectedOption = label.textContent
          }
        }
        // console.log(selectedOption)
        if (selectedOption === answers[i]) {
          var correctAnswer = window.document.createElement('p')
          correctAnswer.textContent = 'CORRECT'
          correctAnswer.style.backgroundColor = '#28d857'
          correctAnswer.style.color = 'black'
          correctAnswer.style.borderRadius = '1rem'
          examQuestions[i].appendChild(correctAnswer)
        } else {
          var incorrectAnswer = window.document.createElement('p')
          incorrectAnswer.textContent = 'WRONG, the correct answer was: ' + answers[i]
          incorrectAnswer.style.backgroundColor = '#ff644c'
          incorrectAnswer.style.color = 'black'
          incorrectAnswer.style.borderRadius = '1rem'
          examQuestions[i].appendChild(incorrectAnswer)
        }
      }
      window.document.getElementById('check-answers-button').style.display = 'none'
      window.document.getElementById('fin-exam-link').style.display = 'block'
    } catch (error) {
      console.log(error);
    }
  }

  const clearDoneExam = async () => {
    try {
      var exam_questions = window.document.getElementById('exam-questions-container')
      for (var i=0; i < answers.length; i++)
        if (exam_questions && exam_questions.firstElementChild)
          exam_questions.removeChild(exam_questions.firstChild)
    } catch (error) {
      console.log(error)
    }
  }

  const openNotification = (placement, text, type) => {
    api[type]({
        message: '  -  ',
        description: text,
        placement,
    });
  }

  return (
    <div className="App">
      {contextHolder}
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
                <label className='form-label'>
                  User type:
                  <div className='log-text'>
                    <input id='login-teacher' type='radio' checked name='user' value='Teacher' className='log-radio'></input>
                    Teacher
                    <input id='login-student' type='radio' name='user' value='Student' className='log-radio'></input>
                    Student
                  </div>
                </label>
                <label className='form-label'>
                  Email: 
                  <input id='login-email' type='text' className='log-text'></input>
                </label>
                <label className='form-label'>
                  Password:
                  <input id='login-pass' type='password' className='log-text'></input>
                </label>
                <button id='check-login' onClick={checkLogin} className='check-login'>Check log in</button>
                <p id='login-success' className='login-success'>Log in successful, please click in the next link to continue</p>
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
                <label className='form-label'>
                  User type:
                  <div className='sign-text'>
                    <input id='signup-teacher' type='radio' checked name='user' value='Teacher' className='sign-radio'></input>
                    Teacher
                    <input id='signup-student' type='radio' name='user' value='Student' className='sign-radio'></input>
                    Student
                  </div>
                </label>
                <label className='form-label'>
                  Name:
                  <input id='signup-name' type='text' className='sign-text'></input>
                </label>
                <label className='form-label'>
                  Surname: 
                  <input id='signup-surname' type='text' className='sign-text'></input>
                </label>
                <label className='form-label'>
                  Email: 
                  <input id='signup-email' type='text' className='sign-text'></input>
                </label>
                <label className='form-label'>
                  Password:
                  <input id='signup-pass' type='password' className='sign-text'></input>
                </label>
                <label className='form-label'>
                  Repeat password:
                  <input id='signup-pass-repeat' type='password' className='sign-text'></input>
                </label>
                <button id='check-signup' onClick={checkSignup} className='check-login'>Check sign up</button>
                <p id='signup-success' className='signup-success'>Sign up successful, please click in the next link to continue</p>
                <Link to='/text' id='sign-to-text' className='log-link'>
                  Sign up
                </Link>
                <Link to='/exams' id='sign-to-exams' className='log-link'>
                  Sign up
                </Link>
              </div>
            }/>
            <Route path='/exams' element={
              <div className='examsIdSide'>
                <Link to='/' onClick={clearAll} className='logout-link'>
                  Log out
                </Link>
                <div className='exams-id-container'>
                  <p>Use a public exam id to find it</p>
                  <input id='exam-id-txt' placeholder='exam id' type='text' className='exam-id-txt'></input>
                  <Link to='/exam' onClick={findExamByPublicId} className='link'>
                    Search exam
                  </Link>
                </div>
              </div>
            }/>
            <Route path='/exam' element={
              <div className='examSide'>
                <Link to='/' onClick={clearAll} className='logout-link'>
                  Log out
                </Link>
                { loading && (
                  <div>
                    <p>Loading exam</p>
                    <Card loading></Card>
                  </div>
                )}
                { !loading && answers.length == 0 && (
                  <p>No exam found with this public id...</p>
                )}
                <div id='exam-questions-container' className='exam-questions-container'>
                </div>
                { answers.length == 0 ?
                  <Link to='/exams' onClick={clearDoneExam} id='back-exam-link' className='back-exam-link'>
                    Go Back
                  </Link>
                  :
                  <button id='check-answers-button' onClick={checkExamAnswers} className='link'>Check answers</button>
                }
                <Link to='/exams' onClick={clearDoneExam} id='fin-exam-link' className='fin-exam-link'>
                  Finnish exam
                </Link>
              </div>
            }/>
            <Route path='/text' element={
              <div className='textSide'>
                <Link to='/' onClick={clearAll} className='logout-link'>
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
                  <div className='selection-keywords-container'>
                    <button onClick={selectAllKeywords} className='selection-keywords-button'>Select All</button>
                    <button onClick={deselectAllKeywords} className='selection-keywords-button'>Deselect All</button>
                  </div>
                  <Link to='/' onClick={clearAll} className='logout-link'>
                    Log out
                  </Link>
                </div>
                <p>Select Keywords for make questions:</p>
                { loading && (
                  <div>
                    <p>Generating keywords</p>
                    <Card loading></Card>
                  </div>
                )}
                { !loading && keywords.length == 0 && (
                  <p>No keywords found for this text...</p>
                )}
                <div id='keywords-container' className='keywords-container'>
                  { keywords.map(key => 
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
                            0
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
                <Link to='/' onClick={clearAll} className='logout-link'>
                  Log out
                </Link>
                <p>Edit Questions:</p>
                { loading && (
                  <div>
                    <p>Generating questions</p>
                    <Card loading></Card>
                  </div>
                )}
                { !loading && questions.length == 0 && (
                  <p>No questions generated...</p>
                )}
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
                  <div id='download-questions-container' className='download-questions-container'>
                    <button id='save-exam-button' onClick={saveExamInDB} className='link'>Save exam</button>
                    <button onClick={generateTxtToDownload} className='link'>Make link to download</button>
                  </div>
                  <Link to='/text' onClick={clearAll} className='link'>
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