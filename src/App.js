import React, { useState, useEffect, Component } from "react";
import { fromTextArea } from "hypermd";
import { getHyperMDOptions, getRequiredPackageScripts } from "./HyperMDParser";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "./App.css";

import "codemirror/mode/r/r";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/xml/xml";
import "codemirror/mode/htmlmixed/htmlmixed";

import "hypermd/core";
import "hypermd/mode/hypermd";

//Import HyperMD addons
import "hypermd/addon/hide-token";
import "hypermd/addon/cursor-debounce";
import "hypermd/addon/fold";
import "hypermd/addon/fold-link";
import "hypermd/addon/fold-image";
import "hypermd/addon/fold-math";
import "hypermd/addon/fold-html";
import "hypermd/addon/fold-emoji";
import "hypermd/addon/read-link";
import "hypermd/addon/click";
import "hypermd/addon/hover";
import "hypermd/addon/paste";
import "hypermd/addon/insert-file";
import "hypermd/addon/mode-loader";
import "hypermd/addon/table-align";

//Import Powerpacks
import "hypermd/powerpack/paste-with-turndown";
import "hypermd/powerpack/fold-emoji-with-emojione";

//Import Katex powerpack and css
import "hypermd/powerpack/fold-math-with-katex";
import "katex/dist/katex.min.css";



const TEST_NODE_DATA = [
  { id: "plain_text_test", content: "test string with no MD" },
  {
    id: "gfm_test",
    content: "# title\n ~~strike~~ **bold** *italics* **~~combo**~~"
  },
  {
    id: "tabel_test",
    content: "| header| header2 |\n|----|----|\n| data1|data2 |"
  },
  {
    id: "code_test",
    content:
      "`simple codeblock` \n```js\n function js_func(num){\n\tvar num1 = num+1\n\treturn 0\n}\n```"
  },
  { id: "emoji_test", content: ":gift: :fire: :smile:" },
  { id: "math_test", content: "$f{x}=123$ $$e_{x}=456$$" },
  {
    id: "html_test",
    content:
      "<button>HTML Test Button</button> <iframe src='https://google.com'></iframe><img src='https://laobubu.net/HyperMD/demo/logo.png'/>"
  },
  { id: "link_test", content: "[test_link](https://laobubu.net/HyperMD)" },
  {
    id: "image_test",
    content: "![test_img](https://laobubu.net/HyperMD/demo/logo.png)"
  },
  {
    id: "hover_test",
    content:
      "arbitrary text to make space for popup\n\nfootnote[^1]\n[note]\n[^1]: Ctrl+Click works too, but will jump to the footnote if exists.\n[note]: example"
  },
  { id: "hashtag_test", content: "#test #test two#" },
];

function App() {
  const [nodes, setNodes] = useState(TEST_NODE_DATA);
  const [codeMirrors, setCodeMirrors] = useState({});
  const requiredPackages = {essentials:true, default_addons:true}
  const importedPackages = [];
  
  function renderTextAreas(nodes) {
    return nodes.map(node => (
      <>
        <h6 className="DEBUG">
          {node.id}
          <button className="DEBUG"
            onClick={() => {
              console.log(
                codeMirrors[node.id]
                  ? codeMirrors[node.id].options
                  : "No CodeMirror"
              );
            }}
          >
            Console.log current options
          </button>
        </h6>
            
        <textarea
          id={node.id}
          key={node.id}
          defaultValue={node.content + " "}
          onChange={event => {
            nodes[nodes.indexOf(node)] = {
              id: node.id,
              content: event.target.value
            };
          }}
        />
      </>
    ));
  }

  function convertTextAreasToCodeMirrors(nodes) {
    if (Object.keys(codeMirrors).length === 0) {
      for (let node of nodes) {
        let textarea = document.getElementById(node.id);
        let [hmdOptions, foundMD] = getHyperMDOptions(node.content, requiredPackages);
        if (foundMD) {
          let cm = fromTextArea(textarea, hmdOptions);
          cm.setCursor({ line: cm.doc.size, ch: node.content.length });
          codeMirrors[node.id] = cm;
        }
      }
    }
    getRequiredPackageScripts(requiredPackages, importedPackages)
  }

  function convertCodeMirrorsToTextAreas(codeMirrors) {
    for (let cm of Object.values(codeMirrors)) {
      cm.toTextArea();
    }
    setCodeMirrors({});
  }


  
  return (
    <div className="App">
      <h5>
        <button
          onClick={() => {
            convertTextAreasToCodeMirrors(nodes);
          }}
        >
          Convert to HyperMD
        </button>
        <button
          onClick={() => {
            convertCodeMirrorsToTextAreas(codeMirrors);
          }}
        >
          Revert back to Normal Textareas
        </button>
      </h5>
      {renderTextAreas(nodes)}
    </div>
  );
}

export default App;
