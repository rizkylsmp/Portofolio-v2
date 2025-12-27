import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Theme from '../components/tools/Theme'

const RootLayout = () => {

    return (
    <div>
        <Navbar />
        <Theme />
        <main className='bg-surface'>
            <Outlet />
        </main>
    </div>
    )
}

export default RootLayout