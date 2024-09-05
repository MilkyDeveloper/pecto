import React, { useCallback } from 'react'

import { Remirror, useRemirror, useKeymap } from '@remirror/react'
import { ExtensionPriority } from 'remirror'
import {
	BlockquoteExtension,
	BoldExtension,
	BulletListExtension,
	CodeExtension,
	HardBreakExtension,
	HeadingExtension,
	ItalicExtension,
	LinkExtension,
	ListItemExtension,
	OrderedListExtension,
	StrikeExtension,
	// Huge bundle size
	// TableExtension,
	HorizontalRuleExtension,
	SubExtension,
	SupExtension,
	UnderlineExtension,
	ShortcutsExtension,
} from 'remirror/extensions'

// Keeps the bundle >500kB
// import css from 'refractor/lang/css.js'
// import javascript from 'refractor/lang/javascript.js'
// import json from 'refractor/lang/json.js'
// import markdown from 'refractor/lang/markdown.js'
// import typescript from 'refractor/lang/typescript.js'
// import python from 'refractor/lang/python.js'
// import csharp from 'refractor/lang/csharp.js'
// import bash from 'refractor/lang/bash.js'
// import c from 'refractor/lang/c.js'
// import cpp from 'refractor/lang/cpp.js'
// import rust from 'refractor/lang/rust.js'
// import go from 'refractor/lang/go.js'

import 'remirror/styles/all.css'
import './Editor.scss'

export const Editor = ({ content, save, tabAction }) => {
	const { manager } = useRemirror({
		// All of these extensions must be translatable to a default html element
		extensions: () => [
			new LinkExtension({ autoLink: true }),
			new BoldExtension(),
			new StrikeExtension(),
			new ItalicExtension(),
			new HeadingExtension(),
			new BlockquoteExtension(),
			new BulletListExtension({ enableSpine: true }),
			new OrderedListExtension(),
			new ListItemExtension({ priority: ExtensionPriority.High, enableCollapsible: true }),
			new CodeExtension(),
			// new CodeBlockExtension({
			// 	supportedLanguages: [
			// 		css,
			// 		javascript,
			// 		json,
			// 		markdown,
			// 		typescript,
			// 		python,
			// 		csharp,
			// 		bash,
			// 		c,
			// 		cpp,
			// 		rust,
			// 		go,
			// 	],
			// }),
			// new TableExtension(),
			// new MarkdownExtension({ copyAsMarkdown: false }),
			/**
			 * `HardBreakExtension` allows us to create a newline inside paragraphs.
			 * e.g. in a list item
			 */
			new HardBreakExtension(),
			new HorizontalRuleExtension(),
			new SubExtension(),
			new SupExtension(),
			new UnderlineExtension(),
			new ShortcutsExtension(),
		],
		stringHandler: 'html',
	})

	// Add the state and create an `onChange` handler for the state.
	return (
		<div className="remirror-theme">
			<Remirror
				autoRender={'end'}
				manager={manager}
				initialContent={content}
				// TODO: can we connect this to our zustand store through props?
				// https://remirror.io/docs/advanced/updating-editor-externally/
				onChange={({ helpers, state }) => {
					save(helpers.getHTML(state))
				}}
				{...(tabAction && {
					hooks: [
						() => {
							useKeymap('Tab', tabAction)
						},
					],
				})}
			/>
		</div>
	)
}
