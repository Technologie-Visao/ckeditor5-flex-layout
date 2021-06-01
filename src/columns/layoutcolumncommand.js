import { Command } from 'ckeditor5/src/core';
import { findOptimalInsertionPosition } from 'ckeditor5/src/widget';
import { createColumnLayout } from "./columns";

export default class LayoutColumnCommand extends Command
{
  execute(a)
  {
    const model = this.editor.model;
    const selection = model.document.selection;

    const insertPosition = findOptimalInsertionPosition(selection, model);
    model.change(
      writer =>
      {
        createColumnLayout(writer, insertPosition, a);
      }
    );
  }
}
