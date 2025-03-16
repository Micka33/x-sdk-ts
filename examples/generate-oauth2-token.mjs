import { TwitterClient } from '../dist/index.js';
import { TwitterApiScope } from '../dist/index.js';
import { createInterface } from 'readline';

const readline = createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const clientId = 'input_client_id_here';
const clientSecret = 'input_client_secret_here';
const redirectUri = 'http://localhost:3000/oauth2/callback';
const scopes = [TwitterApiScope.UsersRead, TwitterApiScope.TweetRead, TwitterApiScope.TweetWrite, TwitterApiScope.OfflineAccess];

// Set the access token and refresh token to null to generate a new token
const accessToken = null;
const refreshToken = null;
const tokenExpiresAt = null;

// Initialize the Twitter client
const twitterClient = new TwitterClient({
  oAuth1: { apiKey: '', apiSecret: '' },
  oAuth2: { clientId, clientSecret, scopes, redirectUri, accessToken, refreshToken, tokenExpiresAt },
});

// Generate authorization URL
const authorizeUrl = twitterClient.oAuth2.generateAuthorizeUrl();

console.log('Please visit this URL to authorize your application:');
console.log(authorizeUrl);

// Check if the access token was provided in the config
if (!twitterClient.oAuth2.getToken().accessToken) {

// if not, prompt for authorization code and exchange it for tokens
readline.question('Please enter the authorization code from the browser: ', async (code) => {
  try {
    // Exchange the code for tokens using OAuth2Auth
    await twitterClient.oAuth2.exchangeAuthCodeForToken(code);
    // Display the token information and get user info
    await displayTokenInfoAndGetUserInfo()
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    readline.close();
  }
});


} else {
  // if the access token was provided in the config

  // close the readline as we don't need it
  readline.close();

  // Check if it's expired and refresh it if it is
  if (twitterClient.oAuth2.isTokenExpired()) {
    await twitterClient.oAuth2.refreshAccessToken();
  }
  // display the token information and get user info
  await displayTokenInfoAndGetUserInfo();
}

async function displayTokenInfoAndGetUserInfo() {
  // Get and display the token information
  const { accessToken, refreshToken, tokenExpiresAt } = twitterClient.oAuth2.getToken();
  console.log('Access Token:', accessToken);
  console.log('Refresh Token:', refreshToken);
  console.log('Expires At:', new Date(tokenExpiresAt).toISOString());
  console.log('Expires In (seconds):', Math.floor((tokenExpiresAt - Date.now()) / 1000));

  // Get user information as an example
  const response = await twitterClient.users.getMe();
  console.log('User:', response.data);
  if (response.errors) {
    console.log('errors:', JSON.stringify(response.errors, null, 2));
  }

  // Uncomment to post a tweet as an example
  // const tweetResponse = await twitterClient.posts.createPost('Hello World!');
  // console.log('Tweet:', tweetResponse.data);
  // if (tweetResponse.errors) {
  //   console.log('errors:', JSON.stringify(tweetResponse.errors, null, 2));
  // }
}