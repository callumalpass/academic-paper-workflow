# Academic Paper Workflow

A GitHub Actions workflow for automatically building academic papers written in Markdown.

## Features

- Converts Markdown files to PDF, HTML, and DOCX formats
- Uses Pandoc with Chicago citation style
- Processes Obsidian-style wikilinks (`[[Link]]` and `[[Link|Text]]`)
- Creates GitHub releases with the output files
- Deploys HTML versions to GitHub Pages

## Usage

This repository is designed to be used as a submodule in your academic writing repositories.

### Setup as a Submodule

1. In your academic paper repository, add this repository as a submodule:

```bash
mkdir -p .github/workflows
git submodule add https://github.com/YOUR_USERNAME/academic-paper-workflow.git .github/workflows
git commit -m "Add academic paper workflow submodule"
git push
```

2. Create the required style directory and files in your main repository:

```bash
mkdir -p style
# Add your chicago-fullnote-bibliography.csl and style.css files
```

3. Ensure your Markdown files follow the naming convention: `ms.*.md` (e.g., `ms.introduction.md`, `ms.main.md`)

4. Push a tag to trigger the workflow:

```bash
git tag v0.1
git push origin v0.1
```

## Required Files

- `bibliography.json`: Your bibliography file (automatically downloaded from Dropbox in the workflow)
- `style/chicago-fullnote-bibliography.csl`: Citation style file
- `style/style.css`: CSS styles for HTML output

## Customization

You can customize the workflow by editing the workflow file in your repository after adding it as a submodule.