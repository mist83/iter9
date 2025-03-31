using Amazon.S3;
using Amazon.SecurityToken.Model;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Security.Cryptography.Xml;
using Octokit;
using ProductHeaderValue = Octokit.ProductHeaderValue;
using Credentials = Octokit.Credentials;
using EncodingType = Octokit.EncodingType;
using Reference = Octokit.Reference;
using Amazon.S3.Model;

namespace Iter9.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public partial class AgentController : ControllerBase
    {
        private readonly string gitHubPat;

        public AgentController(IConfiguration config)
        {
            gitHubPat = config["GitHub:Pat"];
        }

        [HttpGet("list")]
        public async Task<IActionResult> ListFilesAsync()
        {
            var files = new List<string>();
            var owner = "mist83";
            var repo = "iter9";
            var branch = "master";

            using var client = new HttpClient();
            client.DefaultRequestHeaders.UserAgent.ParseAdd("CSharpApp");
            client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("token", gitHubPat);

            // Step 1: Get the SHA of the branch
            var branchUrl = $"https://api.github.com/repos/{owner}/{repo}/branches/{branch}";
            var branchResponse = await client.GetAsync(branchUrl);
            if (!branchResponse.IsSuccessStatusCode)
            {
                return StatusCode((int)branchResponse.StatusCode, await branchResponse.Content.ReadAsStringAsync());
            }

            var branchJson = System.Text.Json.JsonDocument.Parse(await branchResponse.Content.ReadAsStringAsync());
            var sha = branchJson.RootElement.GetProperty("commit").GetProperty("sha").GetString();

            // Step 2: Get the full tree recursively
            var treeUrl = $"https://api.github.com/repos/{owner}/{repo}/git/trees/{sha}?recursive=1";
            var treeResponse = await client.GetAsync(treeUrl);
            if (!treeResponse.IsSuccessStatusCode)
            {
                return StatusCode((int)treeResponse.StatusCode, await treeResponse.Content.ReadAsStringAsync());
            }

            var treeJson = System.Text.Json.JsonDocument.Parse(await treeResponse.Content.ReadAsStringAsync());
            foreach (var item in treeJson.RootElement.GetProperty("tree").EnumerateArray())
            {
                if (item.GetProperty("type").GetString() == "blob")
                {
                    var path = item.GetProperty("path").GetString();
                    files.Add(path);
                }
            }

            return Ok(files);
        }

        [HttpGet("file")]
        public async Task<IActionResult> GetFileContentAsync([FromQuery] string path)
        {
            var owner = "mist83";
            var repo = "iter9";
            var branch = "master";

            if (string.IsNullOrWhiteSpace(path))
                return BadRequest("File path is required.");

            using var client = new HttpClient();
            client.DefaultRequestHeaders.UserAgent.ParseAdd("CSharpApp");
            client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("token", gitHubPat);

            var url = $"https://api.github.com/repos/{owner}/{repo}/contents/{Uri.EscapeDataString(path)}?ref={branch}";
            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
            }

            var contentJson = System.Text.Json.JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            var base64 = contentJson.RootElement.GetProperty("content").GetString();
            var bytes = Convert.FromBase64String(base64.Replace("\n", ""));
            var text = System.Text.Encoding.UTF8.GetString(bytes);

            return Content(text, "text/plain");
        }

        [HttpPost("suggestion")]
        public IActionResult SubmitSuggestion([FromBody] CodeChangeSuggestion suggestion)
        {
            if (string.IsNullOrWhiteSpace(suggestion.FilePath))
                return BadRequest("FilePath is required.");

            // Here, you'd normally persist this, or route it to GitHub/etc.
            return Ok(new
            {
                Message = "Suggestion received.",
                Timestamp = DateTime.UtcNow,
                Suggestion = suggestion
            });
        }

        [HttpPost("commit")]
        public async Task<string> CommitSuggestionToBotBranchAsync(CodeChangeSuggestion suggestion)
        {
            var owner = "mist83";
            var repo = "iter9";
            var botBranch = "bot/suggestions";
            var baseBranch = "master";

            var github = new GitHubClient(new ProductHeaderValue("SuggestionBot"))
            {
                Credentials = new Credentials(gitHubPat)
            };

            // 1. Get the base commit (from master)
            var masterRef = await github.Git.Reference.Get(owner, repo, $"heads/{baseBranch}");
            var masterSha = masterRef.Object.Sha;
            var masterCommit = await github.Git.Commit.Get(owner, repo, masterSha);

            // 2. Ensure bot/suggestions branch exists
            Reference botRef;
            try
            {
                botRef = await github.Git.Reference.Get(owner, repo, $"heads/{botBranch}");
            }
            catch (NotFoundException)
            {
                botRef = await github.Git.Reference.Create(owner, repo, new NewReference($"refs/heads/{botBranch}", masterSha));
            }

            // 3. Create blob (file content)
            var blob = new NewBlob
            {
                Content = suggestion.ProposedCode ?? "",
                Encoding = EncodingType.Utf8
            };
            var blobResult = await github.Git.Blob.Create(owner, repo, blob);

            // 4. Create a tree
            var newTree = new NewTree { BaseTree = masterCommit.Tree.Sha };
            newTree.Tree.Add(new NewTreeItem
            {
                Path = suggestion.NewFilePath ?? suggestion.FilePath,
                Mode = "100644",
                Type = TreeType.Blob,
                Sha = blobResult.Sha
            });
            var treeResult = await github.Git.Tree.Create(owner, repo, newTree);

            // 5. Create a commit
            var newCommit = new NewCommit(suggestion.Comment, treeResult.Sha, botRef.Object.Sha);
            var commitResult = await github.Git.Commit.Create(owner, repo, newCommit);

            // 6. Update the bot branch ref
            await github.Git.Reference.Update(owner, repo, $"heads/{botBranch}", new ReferenceUpdate(commitResult.Sha));

            return commitResult.Sha;
        }

        [HttpPost("pr")]
        public async Task<Tuple<PullRequest, bool>> CreatePullRequestAsync(string comment, string body)
        {
            var owner = "mist83";
            var repo = "iter9";
            var sourceBranch = "bot/suggestions";
            var targetBranch = "master";

            var github = new GitHubClient(new ProductHeaderValue("SuggestionBot"))
            {
                Credentials = new Credentials(gitHubPat)
            };

            // 1. Check for existing open PR from sourceBranch
            var prRequest = new PullRequestRequest
            {
                State = ItemStateFilter.Open,
                Head = $"{owner}:{sourceBranch}",
                Base = targetBranch
            };

            var existing = await github.PullRequest.GetAllForRepository(owner, repo, prRequest);
            var existingPr = existing.FirstOrDefault();

            if (existingPr != null)
            {
                // Update the body
                var updatedBody = existingPr.Body + $"\n\n---\nUpdate: {DateTime.UtcNow.ToString("u")}\n{body}";
                var prUpdate = new PullRequestUpdate { Body = updatedBody };
                await github.PullRequest.Update(owner, repo, existingPr.Number, prUpdate);

                //
                // Also add a comment to the thread
                var timestamp = DateTime.UtcNow.ToString("u");
                var commentBody = $"New suggestion processed at {timestamp} UTC.\n\n_{body}_";
                await github.Issue.Comment.Create(owner, repo, existingPr.Number, commentBody);

                return Tuple.Create(existingPr, true); // true = reused
            }

            // 2. Create new PR
            var newPr = new NewPullRequest(comment, sourceBranch, targetBranch)
            {
                Body = body
            };

            var pr = await github.PullRequest.Create(owner, repo, newPr);
            return Tuple.Create(pr, false); // false = new PR
        }

        [HttpPost("test")]
        [HttpGet("test")] // just to make it easier
        public async Task<IActionResult> TestAsync(
            [FromQuery] string filePath = "README.md",
            [FromQuery] string commitComment = "change joke",
            [FromQuery] string prComment = "Changed the joke",
            [FromQuery] string proposedCode = "<DAD_JOKE>"
            )
        {
            string ticket = $"[JIRA-{new Random().Next(1000, 9999)}]";

            if (proposedCode == "<DAD_JOKE>")
            {
                proposedCode = await new HttpClient().GetStringAsync("https://dvdkztg43tluo5mndqsnvzrt5y0zsmms.lambda-url.us-west-2.on.aws/Test?prompt=Give%20me%20a%20dad%20joke%20one%20liner%20question%20and%20answer%20all%20on%20one%20line&formatString=%20");
            }

            var suggestion = new CodeChangeSuggestion
            {
                FilePath = filePath,
                Comment = commitComment,
                ProposedCode = proposedCode,
            };

            await CommitSuggestionToBotBranchAsync(suggestion);
            var pr = await CreatePullRequestAsync(ticket, prComment);

            return Ok($"{(pr.Item2 ? "Updated" : "Created")} PR: {pr.Item1.HtmlUrl}");
        }

        [HttpGet]
        public async Task<IActionResult> GetAiResponse(string query)
        {
            await Task.CompletedTask;
            return BadRequest();
        }
    }
}
