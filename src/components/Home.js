import { Link } from 'react-router-dom'

export default function Home() {
    return  <div className='textSide'>
        <p>
            This app is used to generate questions about a history text.
        </p>
        <p>
            Please, register yourself to use it.
        </p>
        <Link to='/login' className='register-button'>
            Log in
        </Link>
        <Link to='/signup' className='register-button'>
            Sign up
        </Link>
        
        {/* <Link to='/text' className='link'>
            Let's start with the text
        </Link> */}
    </div>
}