#!/usr/bin/env node

/**
 * Script to generate the dashboard data based on the repository contents
 * This script is run as part of the GitHub Actions workflow
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration from environment variables
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'unknown-repo';
const repoOwner = process.env.GITHUB_REPOSITORY?.split('/')[0] || 'unknown-owner';
const buildDate = new Date().toISOString();
const outputDir = process.env.OUTPUT_DIR || 'output';
const dashboardDir = process.env.DASHBOARD_DIR || 'dashboard';

// Make sure the dashboard directory exists
fs.mkdirSync(path.join(outputDir, dashboardDir), { recursive: true });

// Generate statistics for the papers
function generateStats() {
  const paperFiles = fs.readdirSync(outputDir).filter(file => file.endsWith('.pdf') || file.endsWith('.html') || file.endsWith('.docx'));
  
  // Count unique paper bases (excluding the file extensions)
  const uniquePapers = new Set();
  paperFiles.forEach(file => {
    const baseName = file.split('.').slice(0, -1).join('.');
    uniquePapers.add(baseName);
  });
  
  // Find all markdown files to analyze
  const markdownFiles = fs.readdirSync('.').filter(file => file.startsWith('ms.') && file.endsWith('.md'));
  
  // Analyze the content of all markdown files
  let totalWordCount = 0;
  let totalCitationCount = 0;
  let totalFigureCount = 0;
  let totalTableCount = 0;
  
  markdownFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Count words (approximate)
      const words = content.split(/\\s+/).filter(Boolean);
      totalWordCount += words.length;
      
      // Count citations (looking for [@citation] pattern)
      const citations = content.match(/\\[@[^\\]]+\\]/g) || [];
      totalCitationCount += citations.length;
      
      // Count figures (looking for "![" pattern that indicates images)
      const figures = content.match(/!\\[[^\\]]*\\]\\([^\\)]+\\)/g) || [];
      totalFigureCount += figures.length;
      
      // Count tables (approximate, looking for | characters that might indicate tables)
      const lines = content.split('\\n');
      let tableCount = 0;
      let inTable = false;
      
      for (const line of lines) {
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
          if (!inTable) {
            inTable = true;
            tableCount++;
          }
        } else {
          inTable = false;
        }
      }
      
      totalTableCount += tableCount;
    } catch (error) {
      console.error(`Error analyzing ${file}:`, error);
    }
  });
  
  return {
    wordCount: totalWordCount,
    citationCount: totalCitationCount,
    figureCount: totalFigureCount,
    tableCount: totalTableCount,
    paperCount: uniquePapers.size
  };
}

// Extract metadata from Markdown files
function extractPaperMetadata() {
  const markdownFiles = fs.readdirSync('.').filter(file => file.startsWith('ms.') && file.endsWith('.md'));
  
  return markdownFiles.map(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const baseName = file.replace('.md', '');
      
      // Try to extract title from the first # heading
      const titleMatch = content.match(/^#\\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : baseName;
      
      // Count words
      const words = content.split(/\\s+/).filter(Boolean);
      const wordCount = words.length;
      
      // Count citations
      const citations = content.match(/\\[@[^\\]]+\\]/g) || [];
      const citationCount = citations.length;
      
      // Try to extract abstract or description
      const abstractMatch = content.match(/^Abstract[:\\s]+(.*?)$/mi);
      let description = '';
      
      if (abstractMatch && abstractMatch[1]) {
        description = abstractMatch[1].trim();
        if (description.length > 150) {
          description = description.substring(0, 147) + '...';
        }
      }
      
      // Last modified date (from git)
      let updated;
      try {
        updated = execSync(`git log -1 --format=%cd --date=iso ${file}`).toString().trim();
      } catch (e) {
        updated = new Date().toISOString();
      }
      
      return {
        title,
        description,
        filename: file,
        baseName,
        wordCount,
        citationCount,
        updated,
        pdfUrl: `${baseName}.pdf`,
        htmlUrl: `${baseName}.html`,
        docxUrl: `${baseName}.docx`
      };
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
      return null;
    }
  }).filter(Boolean);
}

// Get recent commits
function getRecentCommits(limit = 10) {
  try {
    const gitLogCommand = `git log -n ${limit} --pretty=format:"%H|%an|%ad|%s" --date=iso`;
    const gitLogOutput = execSync(gitLogCommand).toString().trim();
    
    return gitLogOutput.split('\\n').map(line => {
      const [hash, author, date, message] = line.split('|');
      return { hash, author, date, message };
    });
  } catch (error) {
    console.error('Error getting git commits:', error);
    return [];
  }
}

// Generate the dashboard data
function generateDashboardData() {
  const stats = generateStats();
  const papers = extractPaperMetadata();
  const commits = getRecentCommits();
  
  // Get releases
  const releases = [];
  try {
    const tagsCommand = `git tag --sort=-creatordate | head -n 5`;
    const tags = execSync(tagsCommand).toString().trim().split('\\n').filter(Boolean);
    
    tags.forEach(tag => {
      try {
        const tagDate = execSync(`git log -1 --format=%ad --date=iso ${tag}`).toString().trim();
        const tagMessage = execSync(`git tag -n --format='%(contents)' ${tag}`).toString().trim();
        
        // Find assets associated with this tag
        const assets = papers.map(paper => ({
          name: path.basename(paper.pdfUrl),
          url: paper.pdfUrl
        }));
        
        releases.push({
          tagName: tag,
          name: `Release ${tag}`,
          publishedAt: tagDate,
          description: tagMessage || `Release ${tag}`,
          assets
        });
      } catch (e) {
        console.error(`Error processing tag ${tag}:`, e);
      }
    });
  } catch (error) {
    console.error('Error getting git tags:', error);
  }
  
  return {
    config: {
      repoName,
      repoOwner,
      buildDate
    },
    stats,
    papers,
    commits,
    releases
  };
}

// Main function
function main() {
  try {
    const dashboardData = generateDashboardData();
    
    // Write the data JSON
    const dataJson = JSON.stringify(dashboardData, null, 2);
    fs.writeFileSync(path.join(outputDir, dashboardDir, 'data.json'), dataJson);
    
    // Update the dashboard.js file with the data
    let dashboardJs = fs.readFileSync(path.join(dashboardDir, 'dashboard.js'), 'utf8');
    
    // Replace placeholders
    dashboardJs = dashboardJs.replace('REPO_NAME_PLACEHOLDER', dashboardData.config.repoName);
    dashboardJs = dashboardJs.replace('REPO_OWNER_PLACEHOLDER', dashboardData.config.repoOwner);
    dashboardJs = dashboardJs.replace('BUILD_DATE_PLACEHOLDER', dashboardData.config.buildDate);
    dashboardJs = dashboardJs.replace('DASHBOARD_DATA_PLACEHOLDER', JSON.stringify(dashboardData));
    
    // Write the updated JS file
    fs.writeFileSync(path.join(outputDir, dashboardDir, 'dashboard.js'), dashboardJs);
    
    // Copy the HTML and CSS files
    fs.copyFileSync(
      path.join(dashboardDir, 'index.html'), 
      path.join(outputDir, dashboardDir, 'index.html')
    );
    fs.copyFileSync(
      path.join(dashboardDir, 'style.css'), 
      path.join(outputDir, dashboardDir, 'style.css')
    );
    
    // Create an index.html in the output root that redirects to the dashboard
    const redirectHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=dashboard/index.html">
  <title>Redirecting to Dashboard</title>
</head>
<body>
  <p>Redirecting to the <a href="dashboard/index.html">dashboard</a>...</p>
</body>
</html>`;
    
    fs.writeFileSync(path.join(outputDir, 'index.html'), redirectHtml);
    
    console.log('Dashboard data and files generated successfully!');
    
  } catch (error) {
    console.error('Error generating dashboard:', error);
    process.exit(1);
  }
}

// Run the script
main();