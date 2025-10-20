import { Routes, Route } from 'react-router-dom'

import MainPage from './pages/MainPage.jsx'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'

export default function Router() {
    return (
        <div className="PageContainer">
            <Nav />
            <Routes>
                <Route
                    path='/'
                    element={<MainPage />}
                />
            </Routes>
            <Footer />
        </div>
    )
}