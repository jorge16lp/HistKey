import React, {
  useEffect,
  useState
} from 'react'
import logo from './logo.svg'
import './App.css'

const list1 = ['keroro', 'digimon']

const list2 = ['inazuma eleven', 'doraemon']

export default function App() {
  const [lists, setList] = useState(list1)

  useEffect(function () {
    setTimeout(function () {
      setList(list2)
    }, 2000)
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <header>HistKey</header>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
           Aquí comienza una nueva era, la de keroro
        </p>
        {
          lists.map(name => <p>{name}</p>)
        }
      </header>
    </div>
  )
}