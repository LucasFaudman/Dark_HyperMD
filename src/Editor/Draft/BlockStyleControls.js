import React from 'react';

import StyleButton from './StyleButton';

const BLOCK_TYPES = [
    // {label: 'H1', style: 'header-one'},
    // {label: 'H2', style: 'header-two'},
    // {label: 'H3', style: 'header-three'},
    // {label: 'H4', style: 'header-four'},
    // {label: 'H5', style: 'header-five'},
    // {label: 'H6', style: 'header-six'},
    {label: 'Code Block', style: 'code-block', iconClass: 'fas fa-code'},
    {label: 'Blockquote', style: 'blockquote', iconClass: 'fas fa-quote-right'},
    {label: 'UL', style: 'unordered-list-item', iconClass: 'fas fa-list-ul'},
    {label: 'OL', style: 'ordered-list-item', iconClass: 'fas fa-list-ol'},
];
  
const BlockStyleControls = (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
    return (
      <span className = "RichEditor-controls">
        {BLOCK_TYPES.map((type) =>
          <StyleButton
            key = {type.label}
            active = {type.style === blockType}
            label = {type.label}
            iconClass = {type.iconClass}
            onToggle = {props.onToggle}
            style = {type.style}
          />
        )}
      </span>
    );
};

export default BlockStyleControls;
  