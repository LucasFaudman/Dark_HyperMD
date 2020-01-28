import React, { Component } from "react";

import ReactTooltip from "react-tooltip";

import {
  CompositeDecorator,
  ContentState,
  EditorState,
  RichUtils,
  getDefaultKeyBinding,
  convertFromHTML
} from "draft-js";

import Editor, { composeDecorators } from "draft-js-plugins-editor";
import createImagePlugin from "draft-js-image-plugin";
import createFocusPlugin from "draft-js-focus-plugin";
import createResizeablePlugin from "draft-js-resizeable-plugin";
import createBlockDndPlugin from "draft-js-drag-n-drop-plugin";
import createCodeEditorPlugin from "draft-js-code-editor-plugin";

import { stateToHTML } from "draft-js-export-html";

import Prism from "prismjs";
import createPrismPlugin from "draft-js-prism-plugin";
import "prismjs/themes/prism.css"; // add prism.css to add highlights

import InlineStyleControls from "./InlineStyleControls";
import BlockStyleControls from "./BlockStyleControls";

import "./DraftStyleDefault.css";
import "./Draft.css";
import "draft-js-image-plugin/lib/plugin.css";

const focusPlugin = createFocusPlugin();
const resizeablePlugin = createResizeablePlugin();
const blockDndPlugin = createBlockDndPlugin();

const decorator = composeDecorators(
  resizeablePlugin.decorator,
  focusPlugin.decorator,
  blockDndPlugin.decorator
);

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2
  }
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case "blockquote":
      return "RichEditor-blockquote";
    default:
      return null;
  }
}

const imagePlugin = createImagePlugin({ decorator });

const prismPlugin = createPrismPlugin({
  // It's required to provide your own instance of Prism
  prism: Prism
});

const plugins = [
  blockDndPlugin,
  focusPlugin,
  resizeablePlugin,
  imagePlugin,
  prismPlugin,
  createCodeEditorPlugin()
];

function findLinkEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === "LINK"
    );
  }, callback);
}
const Link = props => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  return <a href={url}>{props.children}</a>;
};
function findImageEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === "IMAGE"
    );
  }, callback);
}
const Image = props => {
  const { height, src, width } = props.contentState
    .getEntity(props.entityKey)
    .getData();
  return <img src={src} height={height} width={width} />;
};

export default class Draft extends Component {
  constructor(props) {
    super(props);

    let decoratorInner = null;
    if (props.stylable) {
      decoratorInner = new CompositeDecorator([
        {
          strategy: findLinkEntities,
          component: Link
        },
        {
          strategy: findImageEntities,
          component: Image
        }
      ]);
    } else {
      decoratorInner = new CompositeDecorator([
        {
          strategy: findImageEntities,
          component: Image
        }
      ]);
    }
    const initialValue = props.content;
    // props.content || localStorage.getItem("content" + props.node_id);
    if (initialValue !== null && initialValue !== "") {
      const blocksFromHTML = convertFromHTML(initialValue);
      const state = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      this.state = {
        editorState: EditorState.createWithContent(state, decoratorInner)
      };
    } else {
      this.state = { editorState: EditorState.createEmpty() };
    }
    if (props.stylable) {
      this.handleKeyCommand = this._handleKeyCommand.bind(this);
      this.mapKeyToEditorCommand = this._mapKeyToEditorCommand.bind(this);
      this.toggleBlockType = this._toggleBlockType.bind(this);
      this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
      this.getImageURL = this._getImageURL.bind(this);
    }
  }

  focus = () => {
    this.refs.editor.focus();
  };

  onChange = editorState => {
    const content = stateToHTML(editorState.getCurrentContent());
    this.props.onChange(content);
    this.setState({ editorState });
  };

  _handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _mapKeyToEditorCommand(e) {
    if (e.keyCode === 9 /* TAB */) {
      const newEditorState = RichUtils.onTab(
        e,
        this.state.editorState,
        4 /* maxDepth */
      );
      if (newEditorState !== this.state.editorState) {
        this.onChange(newEditorState);
      }
      return;
    }
    return getDefaultKeyBinding(e);
  }

  _toggleBlockType(blockType, language = "") {
    if (blockType !== "code-block") {
      this.onChange(
        RichUtils.toggleBlockType(this.state.editorState, blockType)
      );
      return;
    }

    // Replace the code block with a new one with the data.language changed to "javascript"
    const contentState = this.state.editorState.getCurrentContent();
    const blockMap = contentState.getBlockMap();
    const block = blockMap.first();
    const key = block.getKey();
    const data = block.getData().merge({ language: language });
    const newBlock = block.merge({ data });
    const newContentState = contentState.merge({
      blockMap: blockMap.set(key, newBlock),
      selectionAfter: this.state.editorState.getSelection()
    });

    // Now that code block will be highlighted as JavaScript!
    this.onChange(
      RichUtils.toggleBlockType(
        EditorState.push(
          this.state.editorState,
          newContentState,
          "change-block-data"
        ),
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle)
    );
  }

  _getImageURL() {
    var url = prompt("Please enter an image URL:", "");
    if (url !== null && url !== "") {
      this.onChange(imagePlugin.addImage(this.state.editorState, url));
    }
  }

  componentDidMount() {}

  componentDidUpdate() {
    const content = stateToHTML(this.state.editorState.getCurrentContent());
    this.props.onChange(content);
  }

  render() {
    const { editorState } = this.state;
    if (this.props.stylable) {
      // If the user changes block type before entering any text, we can
      // either style the placeholder or hide it. Let's just hide it now.
      let className = "RichEditor-editor";
      var contentState = editorState.getCurrentContent();
      if (!contentState.hasText()) {
        if (
          contentState
            .getBlockMap()
            .first()
            .getType() !== "unstyled"
        ) {
          className += " RichEditor-hidePlaceholder";
        }
      }
      return (
        <div className="RichEditor-root">
          <InlineStyleControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
          />
          <BlockStyleControls
            editorState={editorState}
            onToggle={this.toggleBlockType}
          />
          <span className="RichEditor-controls">
            <span
              className="RichEditor-styleButton"
              data-tip
              data-for="DraftImageTipID"
              onClick={this.getImageURL}
              style={{
                fontSize: "19px"
              }}
            >
              <i className="far fa-image" />
            </span>
            <ReactTooltip
              place="bottom"
              type="info"
              effect="solid"
              id="DraftImageTipID"
            >
              <span>"Image"</span>
            </ReactTooltip>
          </span>
          <div className={className} onClick={this.focus}>
            <Editor
              editorState={editorState}
              onChange={this.onChange}
              spellCheck={true}
              blockStyleFn={getBlockStyle}
              customStyleMap={styleMap}
              keyBindingFn={this.mapKeyToEditorCommand}
              handleKeyCommand={this.handleKeyCommand}
              placeholder={this.props.placeholder}
              plugins={plugins}
              ref="editor"
            />
          </div>
        </div>
      );
    }
    return (
      <div>
        <Editor
          editorState={editorState}
          onChange={this.onChange}
          ref="editor"
        />
      </div>
    );
  }
}
