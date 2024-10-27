const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const username = process.argv.slice(2)[0];

const fetchUserActivity = async (username) => {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/events`);

        if (response.status === 404) throw new Error('User not found!');
        else if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`)

        const result = await response.json();
        return result;
    } catch (err) {
        console.log('Failed to fetch user activity: ', err.message);
        throw err;
    }
}

const processResponse = (resp) => {
    let output = '';
    resp.forEach(event => {
        switch (event.type) {
            case 'PushEvent':
                output += `Pushed to ${event.repo.name}\n`;
                break;
            case 'PullRequestEvent':
                output += `Pull request from ${event.repo.name} - Action: ${event.payload.action}\n`;
                break;
            case 'ForkEvent':
                output += `Forked ${event.repo.name} to ${event.payload.forkee.full_name}\n`;
                break;
            case 'WatchEvent':
                output += `Starred ${event.repo.name}\n`;
                break;
            case 'CreateEvent':
                output += `Created ${event.payload.ref_type} in ${event.repo.name}\n`;
                break;
            case 'IssueCommentEvent':
                output += `Commented on issue #${event.payload.issue.number} in ${event.repo.name}\n`;
                break;
            case 'IssuesEvent':
                output += `Issue ${event.payload.action} in ${event.repo.name} - #${event.payload.issue.number}\n`;
                break;
            case 'DeleteEvent':
                output += `Deleted ${event.payload.ref_type} ${event.payload.ref} in ${event.repo.name}\n`;
                break;
            case 'PullRequestReviewEvent':
                output += `Reviewed pull request #${event.payload.pull_request.number} in ${event.repo.name} - State: ${event.payload.review.state}\n`;
                break;
            case 'PublicEvent':
                output += `Made ${event.repo.name} public\n`;
                break;
            default:
                output += `Event type ${event.type} in ${event.repo.name}\n`;
        }
    });
    console.log(output);
    return output;
};




if (!username) {
    rl.question('Please enter a valid user name: ', (username) => {
        fetchUserActivity(username).then((resp) => {
            processResponse(resp);
            process.exit(1);
        })
    })
} else {
    fetchUserActivity(username).then((resp) => {
        processResponse(resp);
        process.exit(1);
    });
}