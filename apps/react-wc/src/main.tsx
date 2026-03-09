import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { registerAnalysisElement } from '@analysis'
import { registerReactAnalysisElement } from './components/AnalysisResult'

registerAnalysisElement()
registerReactAnalysisElement()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)