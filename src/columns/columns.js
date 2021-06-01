import { toWidget } from "ckeditor5/src/widget";
import { ButtonView } from "@ckeditor/ckeditor5-ui";

import BaseLayout from "../base-layout";
import {createLayoutEditable} from "../editable";
import Layout2ColIcon from "../../theme/icons/2col.svg";
import Layout3ColIcon from "../../theme/icons/3col.svg";
import Layout from "../layout";
import LayoutColumnCommand from "./layoutcolumncommand";

import '../../theme/layout.css';

export default class ColumnLayout extends BaseLayout
{
  _schemaName()
  {
    return 'layout-column';
  }

  _schemaDefinition()
  {
    let def = super._schemaDefinition();
    def['allowAttributes'] = ['columns'];
    return def;
  }

  init()
  {
    super.init();

    const editor = this.editor;
    const t = editor.t;

    // Handle tab key navigation.
    editor.keystrokes.set('tab', (...args) => this._tabHandler(...args), {priority: 'low'});
    //editor.keystrokes.set('backspace', (...args) => this._deleteHandler(...args), {priority: 'low'});
    // this is required instead of keystrokes to stop propagation of delete until https://github.com/ckeditor/ckeditor5/issues/1244 is resolved
    editor.editing.view.document.on('delete', (...args) => this._deleteHandler(...args), {priority: 'low'});

    const cmd = new LayoutColumnCommand(editor);
    editor.plugins.get(Layout).registeredCommands.push(cmd);
    editor.commands.add('layout-column', cmd);

    // column ui
    const LAYOUT_COLUMN_2 = 'layout-column-2';
    editor.ui.componentFactory.add(
      LAYOUT_COLUMN_2, locale =>
      {
        const btn = new ButtonView(locale);

        btn.set(
          {
            label: t('Two Column'),
            icon: Layout2ColIcon,
            tooltip: true
          }
        );

        // Execute command.
        this.listenTo(btn, 'execute', () => cmd.execute(2));

        return btn;
      }
    );
    editor.plugins.get(Layout).registeredLayouts.push(
      editor.ui.componentFactory.create(LAYOUT_COLUMN_2)
    );

    const LAYOUT_COLUMN_3 = 'layout-column-3';
    editor.ui.componentFactory.add(
      LAYOUT_COLUMN_3, locale =>
      {
        const btn = new ButtonView(locale);

        btn.set(
          {
            label: t('Three Column'),
            icon: Layout3ColIcon,
            tooltip: true
          }
        );

        // Execute command.
        this.listenTo(btn, 'execute', () => cmd.execute(3));

        return btn;
      }
    );
    editor.plugins.get(Layout).registeredLayouts.push(
      editor.ui.componentFactory.create(LAYOUT_COLUMN_3)
    );

    const conversion = editor.conversion;

    conversion.for('upcast').add(viewLayoutToModel());

    conversion.for('dataDowncast').elementToElement(
      {
        model: this._schemaName(),
        view: (modelElement, { writer: viewWriter } ) => viewWriter.createContainerElement(
          'div', {
            class: 'ck-layout-columns',
            columns: modelElement.getAttribute('columns')
          }
        )
      }
    );

    conversion.for('editingDowncast').elementToElement(
      {
        model: this._schemaName(),
        view: (modelElement, { writer: viewWriter } ) =>
        {
          const widgetElement = viewWriter.createContainerElement(
            'div',
            {
              class: 'ck-layout-columns',
              columns: modelElement.getAttribute('columns')
            }
          );
          // Enable widget handling on placeholder element inside editing view.
          return toWidget(widgetElement, viewWriter);
        }
      }
    );

    let _schemaName = this._schemaName();

    function viewLayoutToModel()
    {
      return dispatcher =>
      {
        dispatcher.on('element:div', converter);
      };

      function converter(evt, data, conversionApi)
      {
        const viewLayout = data.viewItem;

        // Do not convert if this is not a "column layout".
        if(!conversionApi.consumable.test(
          viewLayout,
          {name: true, attributes: 'columns', classes: 'ck-layout-columns'}
        ))
        {
          return;
        }

        const colCount = viewLayout.getAttribute('columns');

        const layout = conversionApi.writer.createElement(_schemaName, {columns: colCount});

        // Insert element on allowed position.
        const splitResult = conversionApi.splitToAllowedParent(layout, data.modelCursor);

        // When there is no split result it means that we can't insert element to model tree, so let's skip it.
        if(!splitResult)
        {
          return;
        }

        conversionApi.writer.insert(layout, splitResult.position);
        conversionApi.consumable.consume(viewLayout, {name: true});

        // process existing divs
        let doneCols = 0;
        Array.from(data.viewItem.getChildren()).forEach(
          viewEditable =>
          {
            conversionApi.consumable.consume(viewEditable, {name: true}); // IMPORTANT: CONSUME KILLS IT

            if(viewEditable.name === 'div')
            {
              if(doneCols < colCount)
              {
                // create editable
                let editable = conversionApi.writer.createElement('layout-editable');
                conversionApi.convertChildren(viewEditable, conversionApi.writer.createPositionAt(editable, 'end'));
                conversionApi.writer.insert(editable, conversionApi.writer.createPositionAt(layout, 'end'));
                doneCols++;
              }
            }
          }
        );

        while(doneCols < colCount)
        {
          // create new ones
          createLayoutEditable(conversionApi.writer, layout);
          doneCols++;
        }

        // Set conversion result range.
        data.modelRange = conversionApi.writer.createRange(
          // Range should start before inserted element
          conversionApi.writer.createPositionBefore(layout),
          // Should end after but we need to take into consideration that children could split our
          // element, so we need to move range after parent of the last converted child.
          // before: <allowed>[]</allowed>
          // after: <allowed>[<converted><child></child></converted><child></child><converted>]</converted></allowed>
          conversionApi.writer.createPositionAfter(layout)
        );

        // Now we need to check where the modelCursor should be.
        // If we had to split parent to insert our element then we want to continue conversion inside split parent.
        //
        // before: <allowed><notAllowed>[]</notAllowed></allowed>
        // after:  <allowed><notAllowed></notAllowed><converted></converted><notAllowed>[]</notAllowed></allowed>
        if(splitResult.cursorParent)
        {
          data.modelCursor = conversionApi.writer.createPositionAt(splitResult.cursorParent, 0);

          // Otherwise just continue after inserted element.
        }
        else
        {
          data.modelCursor = data.modelRange.end;
        }
      }
    }
  }

  _tabHandler(domEventData, cancel)
  {
    const editor = this.editor;
    const selection = editor.model.document.selection;

    // find current editable
    const firstPosition = selection.getFirstPosition();
    let editable = firstPosition.parent;

    while(editable && editable.name !== 'layout-editable')
    {
      editable = editable.parent;
    }

    if(!editable)
    {
      return;
    }

    let layout = editable.parent;

    while(layout && layout.name !== this._schemaName())
    {
      layout = layout.parent;
    }

    if(!layout)
    {
      return;
    }

    // is last column
    const currentRowIndex = layout.getChildIndex(editable);
    const isLastColumn = currentRowIndex === (layout.childCount - 1);

    if(!isLastColumn)
    {
      return;
    }

    // stop other events
    cancel();

    editor.model.change(
      writer =>
      {
        writer.setAttribute('columns', layout.getAttribute('columns') - (-1), layout);
        createLayoutEditable(writer, layout);
      }
    );
    // check it was added
    if(currentRowIndex === (layout.childCount - 1))
    {
      return;
    }

    // move to last column
    editor.model.change(
      writer =>
      {
        writer.setSelection(writer.createRangeIn(layout.getChild(layout.childCount - 1)));
      }
    );
  }

  _deleteHandler(evt, data)
  {
    const editor = this.editor;
    const selection = editor.model.document.selection;

    // find current editable
    const firstPosition = selection.getFirstPosition();
    let editable = firstPosition.parent;

    while(editable && editable.name !== 'layout-editable')
    {
      editable = editable.parent;
    }

    if(!editable)
    {
      return;
    }

    let layout = editable.parent;

    while(layout && layout.name !== this._schemaName())
    {
      layout = layout.parent;
    }

    if(!layout)
    {
      return;
    }

    // is last column
    const currentRowIndex = layout.getChildIndex(editable);
    const isLastColumn = currentRowIndex === (layout.childCount - 1);

    if(!isLastColumn)
    {
      return;
    }

    const isEmpty = editable.isEmpty
      || (editable.childCount === 1 && editable.getChild(0).isEmpty);
    if(!isEmpty)
    {
      return;
    }

    // stop other events
    evt.stop();

    editor.model.change(
      writer =>
      {
        writer.setAttribute('columns', layout.getAttribute('columns') - (1), layout);
        writer.remove(editable);
      }
    );

    editor.model.change(
      writer =>
      {
        if(layout.childCount > 0) // move to last column
        {
          writer.setSelection(writer.createRangeIn(layout.getChild(layout.childCount - 1)));
        }
        else // move to the position before the layout and remove it
        {
          writer.setSelection(writer.createRange(writer.createPositionBefore(layout)));
          writer.remove(layout);
        }
      }
    );
  }
}

export function createColumnLayout(writer, insertPosition, columnCount)
{
  let layout = writer.createElement('layout-column', {columns: columnCount});
  for(let i = 0; i < columnCount; i++)
  {
    createLayoutEditable(writer, layout);
  }

  writer.model.insertContent(layout, insertPosition);
  writer.setSelection(writer.createPositionAt(layout, 0));
}
