
const fs = require('fs');
// const path = require('path');
const azdev = require('azure-devops-node-api');
const tl = require('azure-pipelines-task-lib/task');

const organizationUrl = 'https://dev.azure.com/ajames87';
const projectName = 'Group-chatgpt';
const token = tl.getVariable('TOKEN');
const artifactName = 'group-react-artifact';
const buildArtifactFolder = 'build'; // Update this to match your artifact folder name
const artifactPath = '/home/vsts/work/1/s/groupreact-chatgpt/build/group-react-artifact.zip';
console.log('token is coming from', token || process.env.TOKEN);

const run = async () => {
  try {
    // Get a connection to the Azure DevOps organization
    const credentialHandler = azdev.getPersonalAccessTokenHandler(
      token || process.env.TOKEN
    );
    const connection = new azdev.WebApi(organizationUrl, credentialHandler);

    // Get a reference to the Build API
    const buildApi = await connection.getBuildApi();

    if (!fs.existsSync(artifactPath)) {
      console.error(`Artifact path not found: ${artifactPath}`);
      process.exit(1);
    }
    // Read the artifact ZIP file from disk
    const artifactStream = fs.createReadStream(artifactPath);

    // Publish the artifact during the build process
    await buildApi.uploadArtifact(
      artifactName,
      artifactStream,
      fs.statSync(artifactPath).size,
      projectName,
      'build'
    );

    // Get a reference to the Release API
    const releaseApi = await connection.getReleaseApi();

    // Create a new release
    const release = {
      definitionId: 'group-react-releaseApi',
      description: 'New release created by Azure DevOps pipeline',
      artifacts: [
        {
          alias: artifactName,
          instanceReference: {
            id: artifactName,
          },
        },
      ],
    };
    const createdRelease = await releaseApi.createRelease(release, projectName);

    console.log('Release created successfully', createdRelease);
  } catch (err) {
    console.error('Failed to create release', err);
    process.exit(1);
  }
};

run();

// const fs = require('fs');
// const path = require('path');
// const  azdev  = require('azure-devops-node-api');
// const tl = require('azure-pipelines-task-lib/task');

// const organizationUrl = 'https://dev.azure.com/ajames87';
// const projectName = 'Group-chatgpt';
// const token = tl.getVariable('TOKEN');
// const artifactName = 'group-react-artifact';
// const artifactPath = path.join(__dirname, 'build', `${artifactName}.zip`);
// console.log('token iscoming  from',token || process.env.TOKEN);
// const run = async () => {
//   try {
//     // Get a connection to the Azure DevOps organization
//     const credentialHandler = azdev.getPersonalAccessTokenHandler(token || process.env.TOKEN);
//     const connection = new azdev.WebApi(organizationUrl, credentialHandler);

//     // Get a reference to the Release API
//     const releaseApi = await connection.getReleaseApi();

//     // Read the artifact ZIP file from disk
//     const artifactStream = fs.createReadStream(artifactPath);

//     // Upload the artifact to Azure DevOps
//     const uploadedArtifact = await releaseApi.createArtifactAsync(
//       artifactName,
//       projectName,
//       artifactStream
//     );

//     // Create a new release
//     const release = {
//       definitionId: 'group-react-releaseApi',
//       description: 'New release created by Azure DevOps pipeline',
//       artifacts: [
//         {
//           alias: artifactName,
//           instanceReference: {
//             id: uploadedArtifact.id.toString(),
//           },
//         },
//       ],
//     };
//     const createdRelease = await releaseApi.createRelease(release, projectName);

//     console.log('Release created successfully', createdRelease);
//   } catch (err) {
//     console.error('Failed to create release', err);
//     process.exit(1);
//   }
// };

// run();


