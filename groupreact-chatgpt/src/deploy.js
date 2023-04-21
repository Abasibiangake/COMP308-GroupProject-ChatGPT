const fs = require('fs');
import * as azdev from "azure-devops-node-api";
const tl = require('azure-pipelines-task-lib/task');

const organizationUrl = 'https://dev.azure.com/ajames87';
const projectName = 'Group-chatgpt';
const token = tl.getVariable('TOKEN');
const artifactName = 'group-react-chatgpt';
const artifactPath = tl.getVariable('Build.ArtifactStagingDirectory') + '/group-react-chatgpt.zip';

const run = async () => {
  console.log('from here');
  try {
    // Get a connection to the Azure DevOps organization
    const credentialHandler = azdev.getPersonalAccessTokenHandler(
      token || process.env.TOKEN
    );
    const connection = new azdev.WebApi(organizationUrl, credentialHandler);

    // Get a reference to the Build API
    let build = await connection.getBuildApi();

    if (!fs.existsSync(artifactPath)) {
      console.error(`Artifact path not found: ${artifactPath}`);
      process.exit(1);
    }
    // Read the artifact ZIP file from disk
    const artifactStream = fs.createReadStream(artifactPath);

     // Create a new artifact
     const artifactMetadata = {
      artifactType: 'Container',
      artifactProvider: 'FilePath',
      artifactData: {
        zipPath: artifactPath,
        artifactName: artifactName
      }
    };
    await build.createArtifact(projectName, artifactMetadata, artifactStream);
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
