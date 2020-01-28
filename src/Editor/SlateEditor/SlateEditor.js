import React from 'react';

import { Editor, getEventRange, getEventTransfer } from 'slate-react';
import { Block, Value } from 'slate';
import Html from 'slate-html-serializer';
import Prism from 'prismjs';

import { isKeyHotkey } from 'is-hotkey';
import imageExtensions from 'image-extensions';
import isUrl from 'is-url';

import "prismjs/themes/prism.css"; // add prism.css to add highlights  

import { Button, Icon, Toolbar, Image } from './components';

/**
 * Define the default node type.
 *
 * @type {String}
 */

const DEFAULT_NODE = 'paragraph';

/**
 * Define hotkey matchers.
 *
 * @type {Function}
 */

const isBoldHotkey = isKeyHotkey('mod+b');
const isItalicHotkey = isKeyHotkey('mod+i');
const isUnderlinedHotkey = isKeyHotkey('mod+u');
const isCodeHotkey = isKeyHotkey('mod+`');

const BLOCK_TAGS = {
    blockquote: 'block-quote',
    p: 'paragraph',
    pre: 'code_block',
    ul: 'bulleted-list',
    ol: 'numbered-list',
    li: 'list-item',
    img: 'image'
};

// Add a dictionary of mark tags.
const MARK_TAGS = {
    em: 'italic',
    strong: 'bold',
    u: 'underline',
    del: 'strikethrough',
    code: 'code',
};

const rules = [
  {
    deserialize(el, next) {
      const type = BLOCK_TAGS[el.tagName.toLowerCase()];
      if (type) {
        if (type == "image") {
          return {
            object: 'block',
            type: type,
            data: {
              className: el.getAttribute('class'),
              src: el.getAttribute('src'),
            },
            nodes: next(el.childNodes),
          };  
        }
        return {
          object: 'block',
          type: type,
          data: {
            className: el.getAttribute('class'),
          },
          nodes: next(el.childNodes),
        };
      }
    },
    serialize(obj, children) {
      if (obj.object == 'block') {
        switch (obj.type) {
          case 'code_block':
            return (
              <pre>
                <code className={obj.data.get('className')}>{children}</code>
              </pre>
            );
          case 'paragraph':
            return <p className={obj.data.get('className')}>{children}</p>;
          case 'block-quote':
            return <blockquote className={obj.data.get('className')}>{children}</blockquote>;
          case 'bulleted-list':
            return <ul className={obj.data.get('className')}>{children}</ul>;
          case 'numbered-list':
            return <ol className={obj.data.get('className')}>{children}</ol>;
          case 'list-item':
            return <li className={obj.data.get('className')}>{children}</li>;
          case 'image':
            return <Image src={obj.data.get('src')} />;
        }
      }
    },
  },
  // Add a new rule that handles marks...
  {
    deserialize(el, next) {
      const type = MARK_TAGS[el.tagName.toLowerCase()]
      if (type) {
        return {
          object: 'mark',
          type: type,
          nodes: next(el.childNodes),
        };
      }
    },
    serialize(obj, children) {
      if (obj.object == 'mark') {
        switch (obj.type) {
          case 'bold':
            return <strong className={obj.data.get('className')}>{children}</strong>;
          case 'italic':
            return <em className={obj.data.get('className')}>{children}</em>;
          case 'strikethrough':
            return <del className={obj.data.get('className')}>{children}</del>;
          case 'underline':
            return <u className={obj.data.get('className')}>{children}</u>;
          case 'code':
            return <code className={obj.data.get('className')}>{children}</code>;
        }
      }
    },
  },
];

// Create a new serializer instance with our `rules` from above.
const html = new Html({ rules });

/*
 * A function to determine whether a URL has an image extension.
 *
 * @param {String} url
 * @return {Boolean}
 */

function isImage(url) {
  return !!imageExtensions.find(url.endsWith);
}

/**
 * A change function to standardize inserting images.
 *
 * @param {Editor} editor
 * @param {String} src
 * @param {Range} target
 */

function insertImage(editor, src, target) {
  if (target) {
    editor.select(target);
  }
  editor.insertBlock({
    type: 'image',
    data: { src },
  });
}

/**
 * The editor's schema.
 *
 * @type {Object}
 */

const schema = {
  document: {
    last: { type: 'paragraph' },
    normalize: (editor, { code, node, child }) => {
      switch (code) {
        case 'last_child_type_invalid': {
          const paragraph = Block.create('paragraph')
          return editor.insertNodeByKey(node.key, node.nodes.size, paragraph)
        }
      }
    },
  },
  blocks: {
    image: {
      isVoid: true,
    },
  },
}

export default class SlateEditor extends React.Component {
  constructor(props) {
    super(props);
    // Load the initial value from Local Storage or a default.
    this.initialValue = (props.content ||
                         localStorage.getItem('content' + props.node_id) ||
                         '');
    this.state = {
      value: html.deserialize(this.initialValue),
    };
  }

  /**
   * On change, save the new `value`.
   *
   * @param {Editor} editor
   */

  onChange = ({ value }) => {
    // When the document changes, save the serialized HTML to Local Storage.
    if (value.document != this.state.value.document) {
      const string = html.serialize(value)
      localStorage.setItem('content' + this.props.node_id, string)
    }
    this.setState({ value })
  }

  componentDidUpdate() {
    this.props.onChange();
  }

  /**
   * Check if the current selection has a mark with `type` in it.
   *
   * @param {String} type
   * @return {Boolean}
   */

  hasMark = type => {
    const { value } = this.state
    return value.activeMarks.some(mark => mark.type == type)
  }

  /**
   * Check if the any of the currently selected blocks are of `type`.
   *
   * @param {String} type
   * @return {Boolean}
   */

  hasBlock = type => {
    const { value } = this.state
    return value.blocks.some(node => node.type == type)
  }

  /**
   * Store a reference to the `editor`.
   *
   * @param {Editor} editor
   */

  ref = editor => {
    this.editor = editor
  }

  /**
   * Render.
   *
   * @return {Element}
   */

  render() {
    if (this.props.stylable) {
      return (
        <div>
          <Toolbar>
            {this.renderMarkButton('bold', 'format_bold')}
            {this.renderMarkButton('italic', 'format_italic')}
            {this.renderMarkButton('underline', 'format_underlined')}
            {this.renderMarkButton('code', 'code')}
            {/* {this.renderBlockButton('heading-one', 'looks_one')}
            {this.renderBlockButton('heading-two', 'looks_two')} */}
            {this.renderBlockButton('block-quote', 'format_quote')}
            {this.renderBlockButton('numbered-list', 'format_list_numbered')}
            {this.renderBlockButton('bulleted-list', 'format_list_bulleted')}
            {this.renderBlockButton('image', 'image')}
            {this.renderBlockButton('code_block', 'code_block')}
          </Toolbar>
          <Editor
            spellCheck
            autoFocus
            placeholder="Enter some rich text..."
            ref={this.ref}
            value={this.state.value}
            schema={schema}
            onChange={this.onChange}
            onDrop={this.onDropOrPaste}
            onPaste={this.onDropOrPaste}  
            onKeyDown={this.onKeyDown}
            renderNode={this.renderNode}
            renderMark={this.renderMark}
          />
        </div>
      );
    }
    return (
      <Editor
        spellCheck
        autoFocus
        placeholder="Enter some simple text..."
        ref={this.ref}
        value={this.state.value}
        onChange={this.onChange}
    />
    );
  }

  /**
   * Render a mark-toggling toolbar button.
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */

  renderMarkButton = (type, icon) => {
    const isActive = this.hasMark(type)

    return (
      <Button
        active={isActive}
        onMouseDown={event => this.onClickMark(event, type)}
      >
        <Icon>{icon}</Icon>
      </Button>
    )
  }

  /**
   * Render a block-toggling toolbar button.
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */

  renderBlockButton = (type, icon) => {
    let isActive = this.hasBlock(type);

    if (['numbered-list', 'bulleted-list'].includes(type)) {
      const { value: { document, blocks } } = this.state;

      if (blocks.size > 0) {
        const parent = document.getParent(blocks.first().key);
        isActive = this.hasBlock('list-item') && parent && parent.type === type;
      }
    }

    return (
      <Button
        active={isActive}
        onMouseDown={event => this.onClickBlock(event, type)}
      >
        <Icon>{icon}</Icon>
      </Button>
    );
  }

  /**
   * Render a Slate node.
   *
   * @param {Object} props
   * @return {Element}
   */

  renderNode = (props, editor, next) => {
    const { attributes, children, node, isFocused } = props

    switch (node.type) {
      case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>;
      case 'code_block':
          return (
            <pre>
              <code className = "language-javascript" {...attributes}>{Prism.tokenize(children, Prism.languages.markup)}</code>
            </pre>
          );
      case 'bulleted-list':
        return <ul className = "browser-default" {...attributes}>{children}</ul>;
      // case 'heading-one':
      //   return <h1 {...attributes}>{children}</h1>;
      // case 'heading-two':
      //   return <h2 {...attributes}>{children}</h2>;
      case 'list-item':
        return <li className = "browser-default" {...attributes}>{children}</li>;
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>;
      case 'image': {
        const src = node.data.get('src');
        return <Image src={src} selected={isFocused} {...attributes} />;
      }
      default:
        return next();
    }
  }

  /**
   * Render a Slate mark.
   *
   * @param {Object} props
   * @return {Element}
   */

  renderMark = (props, editor, next) => {
    const { children, mark, attributes } = props

    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>
      case 'code':
        return <code className = "language-javascript" {...attributes}>{children}</code>
      case 'italic':
        return <em {...attributes}>{children}</em>
      case 'underline':
        return <u {...attributes}>{children}</u>
      default:
        return next()
    }
  }

  /**
   * On key down, if it's a formatting command toggle a mark.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @return {Change}
   */

  onKeyDown = (event, editor, next) => {
    let mark

    if (isBoldHotkey(event)) {
      mark = 'bold'
    } else if (isItalicHotkey(event)) {
      mark = 'italic'
    } else if (isUnderlinedHotkey(event)) {
      mark = 'underline'
    } else if (isCodeHotkey(event)) {
      mark = 'code'
    } else {
      return next()
    }

    event.preventDefault()
    editor.toggleMark(mark)
  }

  /**
   * When a mark button is clicked, toggle the current mark.
   *
   * @param {Event} event
   * @param {String} type
   */

  onClickMark = (event, type) => {
    event.preventDefault()
    this.editor.toggleMark(type)
  }

  /**
   * When a block button is clicked, toggle the block type.
   *
   * @param {Event} event
   * @param {String} type
   */

  onClickBlock = (event, type) => {
    event.preventDefault()

    const { editor } = this
    const { value } = editor
    const { document } = value

    // Handle everything but list buttons.
    if (type != 'bulleted-list' && type != 'numbered-list') {
      const isActive = this.hasBlock(type)
      const isList = this.hasBlock('list-item')

      if (isList) {
        editor
          .setBlocks(isActive ? DEFAULT_NODE : type)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      } else {
        if (type == "image") {
          this.onClickImage(event);
        }
        else {
          editor.setBlocks(isActive ? DEFAULT_NODE : type)
        }
      }
    } else {
      // Handle the extra wrapping required for list buttons.
      const isList = this.hasBlock('list-item')
      const isType = value.blocks.some(block => {
        return !!document.getClosest(block.key, parent => parent.type == type)
      })

      if (isList && isType) {
        editor
          .setBlocks(DEFAULT_NODE)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      } else if (isList) {
        editor
          .unwrapBlock(
            type == 'bulleted-list' ? 'numbered-list' : 'bulleted-list'
          )
          .wrapBlock(type)
      } else {
        editor.setBlocks('list-item').wrapBlock(type)
      }
    }
  }

  /**
   * On clicking the image button, prompt for an image and insert it.
   *
   * @param {Event} event
   */

  onClickImage = event => {
    event.preventDefault()
    const src = window.prompt('Enter the URL of the image:')
    if (!src) return
    this.editor.command(insertImage, src)
  }

  /**
   * On drop, insert the image wherever it is dropped.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */

  onDropOrPaste = (event, editor, next) => {
    const target = getEventRange(event, editor)
    if (!target && event.type === 'drop') return next()

    const transfer = getEventTransfer(event)
    const { type, text, files } = transfer

    if (type === 'files') {
      for (const file of files) {
        const reader = new FileReader()
        const [mime] = file.type.split('/')
        if (mime !== 'image') continue

        reader.addEventListener('load', () => {
          editor.command(insertImage, reader.result, target)
        })

        reader.readAsDataURL(file)
      }
      return
    }

    if (type === 'text') {
      if (!isUrl(text)) return next()
      if (!isImage(text)) return next()
      editor.command(insertImage, text, target)
      return
    }

    next();
  }
}