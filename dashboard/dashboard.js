/**
 * Academic Paper Dashboard
 * 
 * This script dynamically populates the dashboard with data from 
 * the repository and built papers.
 */

// Configuration (will be dynamically set by the workflow)
const config = {
  repoName: 'REPO_NAME_PLACEHOLDER',
  repoOwner: 'REPO_OWNER_PLACEHOLDER',
  buildDate: 'BUILD_DATE_PLACEHOLDER',
};

// DOM elements
const domElements = {
  repoName: document.getElementById('repo-name'),
  lastUpdated: document.getElementById('last-updated'),
  papersList: document.getElementById('papers-list'),
  releasesList: document.getElementById('releases-list'),
  wordCount: document.getElementById('word-count'),
  citationCount: document.getElementById('citation-count'),
  figureCount: document.getElementById('figure-count'),
  tableCount: document.getElementById('table-count'),
  commitTimeline: document.getElementById('commit-timeline'),
};

// Update basic repository information
function updateRepoInfo() {
  domElements.repoName.textContent = `${config.repoOwner}/${config.repoName}`;
  domElements.lastUpdated.textContent = new Date(config.buildDate).toLocaleString();
}

// Load and display papers
function loadPapers(papers) {
  domElements.papersList.innerHTML = '';
  
  if (papers.length === 0) {
    domElements.papersList.innerHTML = '<div class="card"><p>No papers found in this repository.</p></div>';
    return;
  }
  
  papers.forEach(paper => {
    const paperCard = document.createElement('div');
    paperCard.className = 'card';
    paperCard.innerHTML = `
      <h3>${paper.title}</h3>
      <div class="card-meta">
        <p>Last updated: ${new Date(paper.updated).toLocaleDateString()}</p>
        <p>${paper.wordCount} words | ${paper.citationCount} citations</p>
      </div>
      <p>${paper.description || 'No description available.'}</p>
      <div class="card-actions">
        <a href="${paper.pdfUrl}" class="button" download>PDF</a>
        <a href="${paper.htmlUrl}" class="button">HTML</a>
        <a href="${paper.docxUrl}" class="button" download>DOCX</a>
      </div>
    `;
    domElements.papersList.appendChild(paperCard);
  });
}

// Load and display releases
function loadReleases(releases) {
  domElements.releasesList.innerHTML = '';
  
  if (releases.length === 0) {
    domElements.releasesList.innerHTML = '<p>No releases found for this repository.</p>';
    return;
  }
  
  releases.forEach(release => {
    const releaseItem = document.createElement('div');
    releaseItem.className = 'release-item';
    
    // Prepare assets links HTML
    const assetsHtml = release.assets.map(asset => 
      `<a href="${asset.url}" class="asset-link" download>${asset.name}</a>`
    ).join('');
    
    releaseItem.innerHTML = `
      <div class="release-title">${release.name || release.tagName}</div>
      <div class="release-date">Released on ${new Date(release.publishedAt).toLocaleDateString()}</div>
      <div>${release.description || ''}</div>
      <div class="release-assets">${assetsHtml}</div>
    `;
    
    domElements.releasesList.appendChild(releaseItem);
  });
}

// Update statistics
function updateStats(stats) {
  domElements.wordCount.textContent = stats.wordCount.toLocaleString();
  domElements.citationCount.textContent = stats.citationCount.toLocaleString();
  domElements.figureCount.textContent = stats.figureCount.toLocaleString();
  domElements.tableCount.textContent = stats.tableCount.toLocaleString();
}

// Load commit timeline
function loadCommitTimeline(commits) {
  domElements.commitTimeline.innerHTML = '';
  
  if (commits.length === 0) {
    domElements.commitTimeline.innerHTML = '<p>No commits found for this repository.</p>';
    return;
  }
  
  commits.forEach(commit => {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    timelineItem.innerHTML = `
      <div class="timeline-date">${new Date(commit.date).toLocaleString()}</div>
      <div class="timeline-title">${commit.author}</div>
      <div class="timeline-description">${commit.message}</div>
    `;
    
    domElements.commitTimeline.appendChild(timelineItem);
  });
}

// Fetch dashboard data
async function fetchDashboardData() {
  try {
    // In a real implementation, this would fetch the data from generated JSON
    // For now, we'll use placeholder data
    
    // This will be replaced by actual data in the workflow
    const dashboardData = DASHBOARD_DATA_PLACEHOLDER;
    
    // Update the UI with the data
    loadPapers(dashboardData.papers);
    loadReleases(dashboardData.releases);
    updateStats(dashboardData.stats);
    loadCommitTimeline(dashboardData.commits);
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    document.querySelectorAll('.loading').forEach(el => {
      el.textContent = 'Error loading data. Please check the console for details.';
    });
  }
}

// Initialize
function init() {
  updateRepoInfo();
  fetchDashboardData();
}

// Start the application
document.addEventListener('DOMContentLoaded', init);