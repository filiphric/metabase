import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { useDebouncedCallback } from "use-debounce";
import { useLocalStorage } from "@mantine/hooks";
import SlashCommand from "./slash-command";
import ChartExtension from "./chart-extension";
import SectionExtension from "./section-extension";
import { ActionIcon, Menu } from "@mantine/core";
import { Icon } from "metabase/core/components/Icon";
import SidebarEditor from "./SidebarEditor";

function Editor() {
  const [content, setContent] = useLocalStorage({
    key: "mb-dash-rich",
    defaultValue: `
      <h1>Hello World! 🌎️</h1>
      <p>You can edit me!</p>
      <mb-chart></mb-chart>
    `,
  });

  const [sidebarContent, setSidebarContent] = useLocalStorage({
    key: "mb-dash-sidebar",
    defaultValue: `
      <h3>Hello sidebar! 🌎️</h3>
      <p>You can edit me too!</p>
      <mb-chart></mb-chart>
    `,
  });

  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [showSave, setShowSave] = useState(false);
  const [hasSidebar, setHasSidebar] = useState(false);

  const debouncedUpdates = useDebouncedCallback(async ({ editor }) => {
    const json = editor.getJSON();
    setShowSave(true);
    setSaveStatus("Saving...");
    setContent(json);
    // Simulate a delay in saving.
    setTimeout(() => {
      setSaveStatus("Saved");
      setTimeout(() => {
        setShowSave(false);
      }, 500);
    }, 500);
  }, 750);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
      }),
      SlashCommand,
      TiptapLink,
      TiptapImage,
      TaskItem,
      TaskList,
      ChartExtension,
      SectionExtension,
    ],
    content: content,
    onUpdate: e => {
      setSaveStatus("Saving...");
      debouncedUpdates(e);
    },
  });

  // Hydrate the editor with the content from localStorage.
  useEffect(() => {
    if (editor && content && !hydrated) {
      // because https://github.com/ueberdosis/tiptap/issues/3764#issuecomment-1546629928
      setTimeout(() => {
        editor.commands.setContent(content);
        setHydrated(true);
      });
    }
  }, [editor, content, hydrated]);

  return (
    <>
      <div className="wrapper mt4" style={{ maxWidth: 1800 }}>
        {showSave && (
          <div
            className="fixed bottom left rounded bg-dark text-white p2"
            style={{ backgroundColor: "#222" }}
          >
            {saveStatus}
          </div>
        )}
        <div className="flex">
          <Menu className="ml-auto">
            <Menu.Target>
              <ActionIcon>
                <Icon name="ellipsis" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => setHasSidebar(true)}>
                {hasSidebar ? "Remove sidebar" : "Add sidebar"}
              </Menu.Item>
              <Menu.Item>Subscriptions</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
        <div className="flex">
          <div className="flex-full">
            <EditorContent editor={editor} />
          </div>
          {hasSidebar && (
            <div style={{ width: 300, backgroundColor: "#e8e8e8" }}>
              <SidebarEditor />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Editor;
