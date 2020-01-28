import React from 'react';
import styled from '@emotion/styled';

export const Button = styled('span')`
  cursor: pointer;
  color: ${props =>
    props.reversed
      ? props.active ? 'white' : '#aaa'
      : props.active ? 'black' : '#ccc'};
`

export const Icon = styled(({ className, ...rest }) => {
  return <span className={`material-icons ${className}`} {...rest} />
})`
  font-size: 19px;
`

export const Menu = styled('div')`
  & > * {
    display: inline-block;
  }
  & > * + * {
    margin-left: 7px;
  }
`

export const Toolbar = styled(Menu)`
  margin-left: -4px;
  margin-right: -4px;
  margin-bottom: 4px;
  border-bottom: 2px solid #eee;
`

/**
 * A styled image block component.
 *
 * @type {Component}
 */

export const Image = styled('img')`
  display: block;
  max-width: 100%;
  max-height: 20em;
  box-shadow: ${props => (props.selected ? '0 0 0 2px blue;' : 'none')};
`