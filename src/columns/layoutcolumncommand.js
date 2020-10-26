import Command from "@ckeditor/ckeditor5-core/src/command";
import {findOptimalInsertionPosition} from "@ckeditor/ckeditor5-widget/src/utils";
import {createColumnLayout} from "./columns";

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
