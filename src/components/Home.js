import { Link } from 'react-router-dom'

export default function Home() {
    return  <div className='textSide'>
        <p>
            This app is used to generate questions about a history text
        </p>
        <Link to='/text' className='link'>
            Let's start with the text
        </Link>
    </div>
}