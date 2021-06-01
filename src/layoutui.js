import { Plugin } from 'ckeditor5/src/core';
import { addToolbarToDropdown, createDropdown } from 'ckeditor5/src/ui';
import LayoutIcon from "../theme/icons/layout.svg";
import Layout from "./layout";

const LAYOUT_DROPDOWN = 'layout';

export default class LayoutUI extends Plugin
{
  init()
  {
    const editor = this.editor;
    const layoutPlugin = editor.plugins.get(Layout);

    editor.ui.componentFactory.add(
      LAYOUT_DROPDOWN, locale =>
      {
        let dropdownView = createDropdown(locale);

        addToolbarToDropdown(dropdownView, layoutPlugin.registeredLayouts);
        dropdownView.toolbarView.isVertical = false;
        dropdownView.buttonView.set(
          {
            icon: LayoutIcon,
            isOn: false,
            tooltip: 'Layout'
          }
        );

        dropdownView.bind('isEnabled').toMany(
          layoutPlugin.registeredCommands, 'isEnabled', (...areEnabled) =>
          {
            return areEnabled.some(isEnabled => isEnabled);
          }
        );

        return dropdownView;
      }
    );
  }
}
