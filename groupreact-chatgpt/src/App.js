import axios from "axios";

import {useState} from 'react';

import "./app-form.css"

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const apiUrl = "http://localhost:3000/chat";


  const handleSubmit = (e) => {
    e.preventDefault();

    // Send a request to the server with the prompt
    axios
      .post(apiUrl, { prompt })
      .then((res) => {
        // Update the response state with the server's response
        setResponse(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div class="container">
          
          <label>
            Enter the prompt:
            <textarea  className="input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={10}
              cols={50}
            />
          </label>
          <br />
          <div className="container">
            <button type="submit" className="submit-button">Submit</button>
          </div>

        </div>

        <label>
        Results:
        < textarea className="textarea"
          value = {response} wrap="hard"
          rows={10}
          cols={50}
        />
      </label>
      </form>
      
     
    </div>
  );
}
export default App;