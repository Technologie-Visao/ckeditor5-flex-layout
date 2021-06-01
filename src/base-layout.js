import LayoutEditable from "./editable";
import { Plugin } from 'ckeditor5/src/core';

export default class BaseLayout extends Plugin
{
  static get requires()
  {
    return [LayoutEditable];
  }

  init()
  {
    const model = this.editor.model;
    model.schema.register(this._schemaName(), this._schemaDefinition());
    model.schema.extend('layout-editable', {allowIn: this._schemaName()});
  }

  _schemaName()
  {
    throw 'No schema name defined';
  }

  _schemaDefinition()
  {
    return {
      allowIn: ['$root', 'layout-editable', this._schemaName()],
      isBlock: true,
      isInline: false,
      isObject: true,
      isLimit: true
    };
  }
}
