const fs = require('fs');
const azdev = require("azure-devops-node-api");
const tl = require('azure-pipelines-task-lib/task');
const organizationUrl = 'https://dev.azure.com/ajames87';
const projectName = 'Group-chatgpt';
const token = tl.getVariable('TOKEN');
const artifactName = 'group-react-chatgpt';
const artifactPath = tl.getVariable('Build.ArtifactStagingDirectory') + '/group-react-chatgpt.zip';
const releaseDefinitionName = 'release1'; // Specify the release definition name here

const run = async () => {
  try {
    // Get a connection to the Azure DevOps organization
    const credentialHandler = azdev.getPersonalAccessTokenHandler(
      token || process.env.TOKEN
    );
    const connection = new azdev.WebApi(organizationUrl, credentialHandler);

    // Get a reference to the Release API
    const releaseApi = await connection.getReleaseApi();

    // Get the release definition by name
    const releaseDefinitions = await releaseApi.getReleaseDefinitions(projectName, releaseDefinitionName);
    if (releaseDefinitions.length === 0) {
      console.error(`Release definition not found with name: ${releaseDefinitionName}`);
      process.exit(1);
    }

    // Use the first release definition (assuming there is only one release definition with the given name)
    const releaseDefinition = releaseDefinitions[0];

    // Get a reference to the Build API
    const build = await connection.getBuildApi();

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

    // Create a new release
    const release = {
      definitionId: releaseDefinition.id,
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

    if (createdRelease) {
      console.log('created release', createdRelease);
      console.log(`Release created successfully with ID: ${createdRelease.id}`);
    } else {
      console.error('Failed to create release');
      process.exit(1);
    }

  } catch (err) {
    console.error('Failed to create release', err);
    process.exit(1);
  }
};

run();
