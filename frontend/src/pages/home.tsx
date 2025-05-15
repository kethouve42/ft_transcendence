import '../css/App.css'
import { useState } from 'react'

function Home() {
    const [count, setCount] = useState(0)

    return (
        <>
        <div >
          <h1>La paroisse de la Sainte DATABASE</h1>
        </div>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            clicle ici pour tuer un randome
          </button>
        </div>
        <div>
          <a>nombre de randome tuer {count}</a>
        </div>
      </>
    )
  }

export default Home