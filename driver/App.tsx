import "text-encoding"
import "react-native-get-random-values"
import Toast from "react-native-toast-message"
import { Provider as PaperProvider } from "react-native-paper"
import { Routes } from "./src/routes"

export default function App() {
    return (
        <PaperProvider>
            <Routes />
            <Toast position="bottom" />
        </PaperProvider>
    )
}