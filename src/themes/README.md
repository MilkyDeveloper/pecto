# Themes

Themes are the biggest milestone of recent development.

## Revisions

1. One SASS file for all themes
   - Huge Bundle size for 3 themes (130kB gzipped)
2. One SASS file per theme
   - Huge Bundle size if we import all themes
   - We can load [`light.scss`](./light.scss) synchronously and the rest of the themes when they are needed
     - 44kB gzipped

## New Themes

To create a new theme, follow these steps:

- Create an entry in [`themes.js`](../themes.js)
  - Make sure the `id` field is unique
- Create a new SCSS file in this directory called `${id}.theme.scss`
  - Use [`light.scss`](./light.scss) as a template