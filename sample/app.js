import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
import Layout from "../src/layout";

document.addEventListener('DOMContentLoaded', function () {
    ClassicEditor.create(
        document.getElementById('layout-example'),
        {
            plugins: [Essentials, Bold, Italic, Paragraph, Layout],
            toolbar: ['bold', 'italic', 'layout'],
            language: 'en'
        }
    ).then(editor => {
        CKEditorInspector.attach(editor);

        window.editor = editor;
    })
        .catch(error => {
            console.error(error.stack);
        });
});
