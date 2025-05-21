import { BrowserRouter} from 'react-router-dom'
import '../css/App.css'
import Navbar from '../Navbar'

function App() {

  return (
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  )
}

export default App
