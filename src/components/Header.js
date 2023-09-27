import logo from '../history.svg'

export default function Header() {
    return  <header className='App-header'>
        <div>
            <img src={logo} className="App-logo" alt="logo" />
            <h1>HistKey</h1>                    
        </div>
        <div className='header-right'>
            
        </div>
    </header> 
}