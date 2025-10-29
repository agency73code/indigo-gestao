import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Heading } from '@tiptap/extension-heading';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Bold,
    Italic,
    Strikethrough,
    Code2,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
} from 'lucide-react';

type RichTextEditorProps = {
    value?: string;
    onChange?: (html: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
};

export function RichTextEditor({
    value = '',
    onChange,
    placeholder = 'Digite aqui...',
    disabled = false,
    className,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                // Desabilitar link do StarterKit para usar a configuração customizada
                link: false,
            }),
            Heading.configure({
                levels: [1, 2, 3],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            TextStyle,
            Color,
        ],
        content: value,
        editable: !disabled,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm max-w-none',
                    'min-h-[120px] w-full rounded-[5px] border border-input bg-background px-3 py-2',
                    'text-sm ring-offset-background',
                    'placeholder:text-muted-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    // Estilos escopados do editor
                    '[&>*]:my-2',
                    '[&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mt-4 [&>h1]:mb-2',
                    '[&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mt-3 [&>h2]:mb-2',
                    '[&>h3]:text-lg [&>h3]:font-medium [&>h3]:mt-2 [&>h3]:mb-1',
                    '[&>ul]:list-disc [&>ul]:ml-4',
                    '[&>ol]:list-decimal [&>ol]:ml-4',
                    '[&>blockquote]:border-l-4 [&>blockquote]:border-muted-foreground/30 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-muted-foreground',
                    '[&>code]:bg-muted [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-sm [&>code]:font-mono',
                    '[&>pre]:bg-muted [&>pre]:p-3 [&>pre]:rounded [&>pre]:overflow-x-auto',
                    '[&_strong]:font-bold',
                    '[&_em]:italic',
                    '[&_s]:line-through',
                ),
            },
        },
    });

    React.useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    const ToolbarButton = ({
        onClick,
        isActive = false,
        disabled = false,
        icon: Icon,
        title,
    }: {
        onClick: () => void;
        isActive?: boolean;
        disabled?: boolean;
        icon: React.ElementType;
        title: string;
    }) => (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'h-8 w-8 p-0',
                isActive && 'bg-accent text-accent-foreground',
            )}
            title={title}
            aria-label={title}
            aria-pressed={isActive}
        >
            <Icon className="h-4 w-4" />
        </Button>
    );

    if (!editor) {
        return (
            <div className={cn('min-h-[120px] w-full rounded-[5px] border border-input bg-background px-3 py-2 animate-pulse', className)}>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
        );
    }

    return (
        <div className={cn('relative space-y-2', className)}>
            {/* Toolbar estática no topo quando não está desabilitado */}
            {!disabled && (
                <div className="no-print flex items-center gap-1 p-1 rounded-[5px] border border-border bg-background/50 flex-wrap">
                    <div className="flex items-center gap-1">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            isActive={editor.isActive('bold')}
                            icon={Bold}
                            title="Negrito (Cmd+B)"
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            isActive={editor.isActive('italic')}
                            icon={Italic}
                            title="Itálico (Cmd+I)"
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            isActive={editor.isActive('strike')}
                            icon={Strikethrough}
                            title="Tachado"
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleCode().run()}
                            isActive={editor.isActive('code')}
                            icon={Code2}
                            title="Código"
                        />
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    <div className="flex items-center gap-1">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            isActive={editor.isActive('heading', { level: 1 })}
                            icon={Heading1}
                            title="Título 1"
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            isActive={editor.isActive('heading', { level: 2 })}
                            icon={Heading2}
                            title="Título 2"
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            isActive={editor.isActive('heading', { level: 3 })}
                            icon={Heading3}
                            title="Título 3"
                        />
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    <div className="flex items-center gap-1">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            isActive={editor.isActive('bulletList')}
                            icon={List}
                            title="Lista com marcadores"
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            isActive={editor.isActive('orderedList')}
                            icon={ListOrdered}
                            title="Lista numerada"
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            isActive={editor.isActive('blockquote')}
                            icon={Quote}
                            title="Citação"
                        />
                    </div>

                </div>
            )}

            <EditorContent editor={editor} />
        </div>
    );
}

export default RichTextEditor;

