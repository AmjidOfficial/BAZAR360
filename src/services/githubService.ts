export interface GitHubRepoInfo {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  html_url: string;
}

/**
 * Fetch GitHub repository details from GitHub REST API
 * @param ownerAndRepo e.g., "AmjidOfficial/BAZAR360" or full URL "https://github.com/AmjidOfficial/BAZAR360.git"
 */
export async function fetchGitHubRepoDetails(ownerAndRepo: string): Promise<GitHubRepoInfo | null> {
  try {
    let cleanPath = ownerAndRepo.trim();
    if (cleanPath.startsWith('https://github.com/')) {
      cleanPath = cleanPath.replace('https://github.com/', '');
    }
    if (cleanPath.endsWith('.git')) {
      cleanPath = cleanPath.slice(0, -4);
    }
    // Remove any trailing slashes
    cleanPath = cleanPath.replace(/\/+$/, '');

    if (!cleanPath || !cleanPath.includes('/')) {
      throw new Error('Invalid repository format. Expected owner/repo.');
    }

    const response = await fetch(`https://api.github.com/repos/${cleanPath}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as GitHubRepoInfo;
  } catch (error) {
    console.error('[GitHubService] Error fetching repo:', error);
    return null;
  }
}

/**
 * Fetch recent commits for a GitHub repository
 */
export async function fetchGitHubCommits(ownerAndRepo: string, limit = 5): Promise<GitHubCommit[]> {
  try {
    let cleanPath = ownerAndRepo.trim();
    if (cleanPath.startsWith('https://github.com/')) {
      cleanPath = cleanPath.replace('https://github.com/', '');
    }
    if (cleanPath.endsWith('.git')) {
      cleanPath = cleanPath.slice(0, -4);
    }
    cleanPath = cleanPath.replace(/\/+$/, '');

    if (!cleanPath || !cleanPath.includes('/')) {
      return [];
    }

    const response = await fetch(`https://api.github.com/repos/${cleanPath}/commits?per_page=${limit}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data as GitHubCommit[];
  } catch (error) {
    console.error('[GitHubService] Error fetching commits:', error);
    return [];
  }
}
