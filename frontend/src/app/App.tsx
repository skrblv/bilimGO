import { AppRouter } from "./providers/router";
import { TransitionScreen } from "../widgets/TransitionScreen/ui/TransitionScreen";

function App() {
  return (
    <div className="min-h-screen">
      <AppRouter />
      <TransitionScreen />
    </div>
  )
}

export default App