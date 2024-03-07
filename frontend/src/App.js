import "./App.css";
import { Route } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import ChatPage from "./Pages/ChatPage";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  return (
    <div className="App">
      <GoogleOAuthProvider clientId="397815192562-iioovmqukivia9g7htterp1oe9kgi20s.apps.googleusercontent.com">
        <Route path="/" component={Homepage} exact />
        <Route path="/chats" component={ChatPage} />
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;
