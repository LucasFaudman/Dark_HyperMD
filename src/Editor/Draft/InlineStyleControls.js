import React from 'react';

import StyleButton from './StyleButton';

var INLINE_STYLES = [
    {label: 'Bold', style: 'BOLD', iconClass: 'fas fa-bold', content: ''},
    {label: 'Italic', style: 'ITALIC', iconClass: 'fas fa-italic', content: ''},
    {label: 'Underline', style: 'UNDERLINE', iconClass: 'fas fa-underline', content: ''},
    {label: 'Inline Code', style: 'CODE', iconClass: 'fas fa-code', content: ''},
];
  
const InlineStyleControls = (props) => {
    const currentStyle = props.editorState.getCurrentInlineStyle();
    
    return (
      <span className = "RichEditor-controls">
        {INLINE_STYLES.map((type) =>
          <StyleButton
            key = {type.label}
            active = {currentStyle.has(type.style)}
            label = {type.label}
            iconClass = {type.iconClass}
            content = {type.content}
            onToggle = {props.onToggle}
            style = {type.style}
          />
        )}
      </span>
    );
};

export default InlineStyleControls;