import '../css/App.css'
import { useState } from 'react'

function Home() {
    const [count, setCount] = useState(0)

    return (
        <>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-4xl font-bold text-cyan-300 mb-6 drop-shadow-[0_0_10px_cyan]">La paroisse de la Sainte DATABASE</h1>
            <div className="card p-8">
              <button
                className="bg-cyan-600 hover:bg-cyan-400 text-white px-6 py-2 rounded-lg shadow-cyan-400/30 shadow transition"
                onClick={() => setCount(count + 1)}
              >
                Clique ici pour tuer un randome
              </button>
              <div className="mt-4 text-lg">
                Nombre de randome tués : <span className="font-bold">{count}</span>
              </div>
            </div>
          </div>
      </>
    )
  }

export default Home