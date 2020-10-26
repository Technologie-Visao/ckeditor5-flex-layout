import {toWidgetEditable} from "@ckeditor/ckeditor5-widget/src/utils";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

export default class LayoutEditable extends Plugin
{
  static get _schemaName()
  {
    return 'layout-editable';
  }

  static get _schemaDefinition()
  {
    return {
      inheritAllFrom: ['$text', '$block'],
      isLimit: true
    };
  }

  init()
  {
    const model = this.editor.model;

    model.schema.register(LayoutEditable._schemaName, LayoutEditable._schemaDefinition);

    //model.schema.extend('$text', {allowIn: 'layout-editable'});
    model.schema.extend('$block', {allowIn: 'layout-editable'});

    const conversion = this.editor.conversion;
    conversion.for('upcast').elementToElement(
      {
        view: {
          name: 'div',
          classes: ['ck-layout-editable']
        },
        model: 'layout-editable'
      }
    );

    conversion.for('dataDowncast').elementToElement(
      {
        model: LayoutEditable._schemaName,
        view: ( modelElement, { writer: viewWriter } )  =>
        {
          return viewWriter.createContainerElement('div', {class: 'ck-layout-editable'});
        }
      }
    );

    conversion.for('editingDowncast').elementToElement(
      {
        model: LayoutEditable._schemaName,
        view: ( modelElement, { writer: viewWriter } )  =>
        {
          const widgetElement = viewWriter.createEditableElement('div', {class: 'ck-layout-editable'});
          // Enable widget handling on placeholder element inside editing view.
          return toWidgetEditable(widgetElement, viewWriter);
        }
      }
    );
  }
}

export function createLayoutEditable(writer, layout)
{
  writer.createElement('layout-editable');
  let editable = writer.createElement('layout-editable');
  let paragraph = writer.createElement('paragraph');
  writer.insert(paragraph, writer.createPositionAt(editable, 'end'));
  writer.insert(editable, writer.createPositionAt(layout, 'end'));
}
