import { Plugin } from 'ckeditor5/src/core';
import ColumnLayout from './columns/columns';
import LayoutUI from "./layoutui";

export default class Layout extends Plugin
{
  constructor(editor)
  {
    super(editor);
    this.registeredLayouts = [];
    this.registeredCommands = [];
  }

  static get requires()
  {
    return [LayoutUI, ColumnLayout];
  }
}
