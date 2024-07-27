import "text-encoding"
import "react-native-get-random-values"
import Toast from "react-native-toast-message"
import { Routes } from "./src/routes"

export default function App() {
    return (
        <>
            <Routes />
            <Toast position="bottom" />
        </>
    )
}