import React, { Component } from "react";

import M from "materialize-css";

export default class StyleButton extends Component {
  constructor(props) {
    super(props);

    this.selectOptions = null;
  }

  state = { codeLanguage: "Code Block" };

  onToggle = event => {
    event.preventDefault();
    this.props.onToggle(this.props.style);
  };

  chooseLanguage = event => {
    this.props.onToggle(this.props.style, event.target.value);
  };

  componentDidMount() {
    M.FormSelect.init(this.selectOptions, {});
  }

  render() {
    let className = "RichEditor-styleButton";
    if (this.props.active) {
      className += " RichEditor-activeButton";
    }
    if (this.props.iconClass.includes("material-icons")) {
      className += " material-icons";
    }
    if (this.props.label === "Code Block") {
      return (
        <span className={className} data-tip={this.props.label}>
          <select
            value={this.state.codeLanguage}
            ref={selectOptions => {
              this.selectOptions = selectOptions;
            }}
            onChange={this.chooseLanguage}
          >
            <option value="Code Block" disabled>
              Code Block
            </option>
            <optgroup label="Front-end">
              <option value="javascript">JavaScript</option>
              <option value="jsx">React JSX</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </optgroup>
            <optgroup label="Back-end">
              <option value="python">Python</option>
            </optgroup>
          </select>
        </span>
      );
    }
    return (
      <span
        className={className}
        data-tip={this.props.label}
        onMouseDown={this.onToggle}
      >
        {this.props.iconClass.includes("material-icons") ? (
          this.props.content
        ) : (
          <i className={this.props.iconClass} />
        )}
      </span>
    );
  }
}
