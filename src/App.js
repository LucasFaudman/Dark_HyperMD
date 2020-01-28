import React, { useState } from "react";

import { Controlled as CodeMirror } from "react-codemirror2";
import { switchToHyperMD } from "hypermd";
import "hypermd/mode/hypermd";
import "codemirror/mode/r/r";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";

import "./App.css";

function App() {
  const [content, setContent] = useState("");

  return (
    <div className="App">
      <CodeMirror
        value={content}
        options={{
          mode: "hypermd",
          theme: "hypermd-light",
          lineNumbers: false,
          lineWrapping: true,
          smartIndent: true,
          readOnly: false
        }}
        onBeforeChange={(editor, data, value) => {
          setContent(value);
        }}
        onChange={(editor, data, value) => {
          switchToHyperMD(editor);
        }}
      />
      <h4>The Output:</h4>
      <CodeMirror
        value={content}
        options={{
          mode: "hypermd",
          theme: "hypermd-light",
          lineNumbers: false,
          lineWrapping: true,
          smartIndent: true,
          readOnly: "nocursor"
        }}
        onBeforeChange={(editor, data, value) => {
          setContent(value);
        }}
        onChange={(editor, data, value) => {
          switchToHyperMD(editor);
        }}
      />
    </div>
  );
}

export default App;
