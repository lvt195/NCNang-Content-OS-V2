import fs from 'fs';
import { execSync } from 'child_process';

const token = execSync('gh auth token').toString().trim();
const repo = 'lvt195/NCNang-Content-OS-V2';
const baseUrl = `https://api.github.com/repos/${repo}`;

async function ghFetch(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub API error ${res.status} on ${endpoint}: ${txt}`);
  }
  return res.json();
}

async function main() {
  console.log('1. Checking current remote main ref...');
  const refData = await ghFetch('/git/refs/heads/main');
  const parentCommitSha = refData.object.sha;
  console.log(`Current remote main SHA: ${parentCommitSha}`);

  const parentCommit = await ghFetch(`/git/commits/${parentCommitSha}`);
  const baseTreeSha = parentCommit.tree.sha;
  console.log(`Base tree SHA: ${baseTreeSha}`);

  // List of files changed between remote main and local HEAD
  const filesOutput = execSync(`git diff-tree -r --no-commit-id --name-only ${parentCommitSha} HEAD`).toString().trim();
  const changedFiles = filesOutput.split('\n').filter(Boolean);
  console.log(`Found ${changedFiles.length} changed files to upload:`, changedFiles);

  const treeEntries = [];

  for (const filePath of changedFiles) {
    if (!fs.existsSync(filePath)) {
      console.log(`File removed: ${filePath}`);
      treeEntries.push({
        path: filePath,
        mode: '100644',
        type: 'blob',
        sha: null
      });
      continue;
    }
    const stat = fs.statSync(filePath);
    const mode = (stat.mode & 0o111) ? '100755' : '100644';
    const contentBuffer = fs.readFileSync(filePath);
    const contentBase64 = contentBuffer.toString('base64');

    console.log(`Uploading blob for ${filePath} (${stat.size} bytes)...`);
    const blob = await ghFetch('/git/blobs', {
      method: 'POST',
      body: JSON.stringify({
        content: contentBase64,
        encoding: 'base64'
      })
    });

    treeEntries.push({
      path: filePath,
      mode: mode,
      type: 'blob',
      sha: blob.sha
    });
  }

  console.log('2. Creating new tree on GitHub...');
  const newTree = await ghFetch('/git/trees', {
    method: 'POST',
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: treeEntries
    })
  });
  console.log(`New tree created: ${newTree.sha}`);

  console.log('3. Creating commit on GitHub...');
  const commitMessage = execSync('git log -1 --pretty=%B HEAD').toString().trim() || 'feat: update product multi-category support and filters';
  const newCommit = await ghFetch('/git/commits', {
    method: 'POST',
    body: JSON.stringify({
      message: commitMessage,
      tree: newTree.sha,
      parents: [parentCommitSha],
      author: {
        name: 'Thiet Luong Van (VTI.D8)',
        email: 'thiet.luongvan@vti.com.vn',
        date: new Date().toISOString()
      }
    })
  });
  console.log(`New commit created: ${newCommit.sha}`);

  console.log('4. Updating refs/heads/main...');
  const updatedRef = await ghFetch('/git/refs/heads/main', {
    method: 'PATCH',
    body: JSON.stringify({
      sha: newCommit.sha,
      force: false
    })
  });
  console.log('Successfully updated remote main to:', updatedRef.object.sha);

  console.log('5. Syncing local git branch with new remote commit...');
  execSync(`git fetch origin main`);
  execSync(`git reset --hard FETCH_HEAD`);
  console.log('Local branch is now in sync with remote main!');
}

main().catch(err => {
  console.error('Push via API failed:', err);
  process.exit(1);
});
