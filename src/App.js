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

import 'hypermd/core';
import 'hypermd/mode/hypermd';

//Import HyperMD addons
import 'hypermd/addon/hide-token';
import 'hypermd/addon/cursor-debounce';
import 'hypermd/addon/fold';
import 'hypermd/addon/read-link';
import 'hypermd/addon/click';
import 'hypermd/addon/hover';
import 'hypermd/addon/paste';
import 'hypermd/addon/insert-file';
import 'hypermd/addon/mode-loader';
import 'hypermd/addon/table-align';

//Import Powerpacks
import 'hypermd/powerpack/paste-with-turndown'
import 'hypermd/powerpack/fold-emoji-with-emojione'
import 'hypermd/powerpack/insert-file-with-smms'

//Import Katex powerpack and css
import 'hypermd/powerpack/fold-math-with-katex'
import 'katex/dist/katex.min.css'


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
          readOnly: false,

          //Add HyperMD-Specific Options
          hmdHideToken: true,
          hmdPaste: true,
          hmdClick: true,
          hmdHover: true,
          hmdTableAlign: true,
          //Enable folding
          hmdFold: {
            image: true,
            link: true,
            math: true,
          },
          
        
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
          //mode: "hypermd",
          //theme: "hypermd-light",
          lineNumbers: false,
          lineWrapping: true,
          smartIndent: true,
          readOnly: "nocursor"
        }}
        onBeforeChange={(editor, data, value) => {
          setContent(value);
        }}
        onChange={(editor, data, value) => {
          // Do not put second editor into HyperMD mode so raw output can be seen 
          //switchToHyperMD(editor);
        }}
      />
    </div>
  );
}

export default App;
