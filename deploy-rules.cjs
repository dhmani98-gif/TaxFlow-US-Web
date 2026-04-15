const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

async function deployRules() {
  const keyFile = path.join('C:', 'Users', 'AlShaheen', 'firebase-key.json');
  const rulesFile = path.join(__dirname, 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesFile, 'utf8');
  
  console.log('Initializing Firebase Admin...');
  const serviceAccount = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  const projectId = serviceAccount.project_id;
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId,
    });
  }

  // Step 1: Grant Firebase Admin role to service account
  console.log('Granting Firebase Admin role to service account...');
  const { GoogleAuth } = require('google-auth-library');
  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  
  // Add Firebase Admin role (roles/firebase.admin) to the service account
  const serviceAccountEmail = serviceAccount.client_email;
  const iamUrl = `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:setIamPolicy`;
  
  try {
    const iamResponse = await fetch(iamUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        policy: {
          bindings: [{
            role: 'roles/firebase.admin',
            members: [`serviceAccount:${serviceAccountEmail}`],
          }],
        },
      }),
    });
    
    if (iamResponse.ok) {
      console.log('✅ Firebase Admin role granted');
    } else {
      const iamError = await iamResponse.text();
      console.log('Could not grant role (may already have it):', iamError.substring(0, 200));
    }
  } catch (e) {
    console.log('Role grant skipped:', e.message);
  }
  
  // Step 2: Wait a moment for IAM propagation
  console.log('Waiting for IAM propagation...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Step 3: Deploy rules via Admin SDK
  console.log('Deploying Firestore rules via Admin SDK...');
  try {
    const result = await admin.securityRules().releaseFirestoreRulesetFromSource(rulesContent);
    console.log('✅ Firestore rules deployed successfully!');
    console.log('Ruleset:', result.name);
  } catch (error) {
    console.error('Admin SDK failed:', error.message);
    
    // Fallback: REST API with cloud-platform scope
    console.log('\nTrying REST API fallback...');
    const newAuth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/firebase', 'https://www.googleapis.com/auth/cloud-platform'],
    });
    const newClient = await newAuth.getClient();
    const newToken = await newClient.getAccessToken();
    
    // Create ruleset
    const rulesetResponse = await fetch(
      `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${newToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: { files: [{ name: 'firestore.rules', content: rulesContent }] },
        }),
      }
    );
    
    const ruleset = await rulesetResponse.json();
    if (!rulesetResponse.ok) {
      console.error('Ruleset error:', JSON.stringify(ruleset, null, 2));
      process.exit(1);
    }
    console.log('Ruleset created:', ruleset.name);
    
    // Release ruleset
    const releaseResponse = await fetch(
      `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${newToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `projects/${projectId}/releases/cloud.firestore`,
          rulesetName: ruleset.name,
        }),
      }
    );
    
    const releaseText = await releaseResponse.text();
    if (!releaseResponse.ok) {
      console.error('Release error:', releaseText);
      process.exit(1);
    }
    console.log('✅ Firestore rules deployed successfully (fallback)!');
  }
}

deployRules().catch(err => {
  console.error('Deploy failed:', err.message);
  process.exit(1);
});
