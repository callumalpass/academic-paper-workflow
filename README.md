# Academic Paper Workflow

A GitHub Actions workflow for automatically building academic papers written in Markdown.

## Features

- Converts Markdown files to PDF, HTML, and DOCX formats
- Uses Pandoc with Chicago citation style
- Processes Obsidian-style wikilinks (`[[Link]]` and `[[Link|Text]]`)
- Creates GitHub releases with the output files
- Deploys HTML versions to GitHub Pages

## Usage

This repository provides a reusable GitHub Actions workflow for academic paper repositories.

### Setup Using Reusable Workflow (Recommended)

1. In your academic paper repository, create a workflow file:

```bash
mkdir -p .github/workflows
```

2. Create a file named `build-paper.yml` in the `.github/workflows` directory with the following content:

```yaml
name: Build Academic Paper

on:
  push:
    tags:
      - 'v*'
  # Optional: Add manual trigger
  workflow_dispatch:

jobs:
  build-paper:
    uses: callumalpass/academic-paper-workflow/.github/workflows/build-paper.yml@main
    # Optional: You can customize the bibliography URL
    # with:
    #   bibliography_url: 'https://your-custom-url/bibliography.json'
```

3. Create the required style directory and files in your main repository:

```bash
mkdir -p style
# Add your chicago-fullnote-bibliography.csl and style.css files
```

4. Ensure your Markdown files follow the naming convention: `ms.*.md` (e.g., `ms.introduction.md`, `ms.main.md`)

5. Push a tag to trigger the workflow:

```bash
git tag v0.1
git push origin v0.1
```

## Required Files

- `bibliography.json`: Your bibliography file (automatically downloaded from Github in the workflow)
- `style/chicago-fullnote-bibliography.csl`: Citation style file
- `style/style.css`: CSS styles for HTML output

## Customization

You can customize the workflow by editing the workflow file in your repository after adding it as a submodule.
