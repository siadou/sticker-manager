import './App.css'
import LeftSidebar from './components/LeftSidebar'
import CanvasContainer from './components/CanvasContainer'
import RightSidebar from './components/RightSidebar'

function App() {
  return (
    <div className="app-container">
      <LeftSidebar />
      <CanvasContainer />
      <RightSidebar />
    </div>
  )
}

export default App
