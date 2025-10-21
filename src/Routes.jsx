import {Routes, Route, Navigate} from 'react-router-dom'

import MainPage from './pages/MainPage.jsx'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import ChatPage from './pages/ChatPage.jsx'
import ChatWindow from './components/ChatWindow.jsx'

export default function Router() {
    return (
        <div className="PageContainer">
            <Nav />
            <Routes>
                <Route
                    path='/'
                    element={<MainPage />}
                />
                <Route path="/chat" element={<ChatPage />}>
                    <Route index element={<Navigate to="1" replace />} />
                    <Route path=":chatId" element={<ChatWindow />} />
                </Route>
            </Routes>
            <Footer />
        </div>
    )
}