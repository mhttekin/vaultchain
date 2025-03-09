# VaultChain

This is the main repository of the project, which will have the agreed and functioning aspects of the project. Each member will have their **OWN FORK OF THE REPO** , meaning that you should not just clone the repo, but create your **FORK** for it. You should be able to see the fork button on the top-right corner of the github page.

After the fork, you should clone it to your machine.

```shell
git clone your_fork_url
```

Then add the main repo as **upstream**.

```shell
git remote add upstream https://github.com/mhttekin/vaultchain
```
This remote branch will be used to get any updates from the system, the commands used for any updates from the main are:

```shell
git fetch upstream
git checkout main (or master depending on your local main)
git merge upstream/main 
```

You can work on the main branch of your fork, but I advise you to create a branch for the specific part you are working:

```shell
git checkout -b feature/my-feature
```
You **push** your changes to your fork through:

```shell
git push origin feature/my-feature
```

## Pull Requests

To clearly and safely integrate your features into the main repository, you should follow these steps:

1. **Open a Pull Request (PR)**:

- Navigate to your fork on GitHub.
- Click on the **"Compare & pull request"** button that appears after pushing your branch.

**Make sure your Pull Request targets:**
- **Base repository**: `mhttekin/vaultchain`
- **Base branch**: `main`
- **Head repository**: `your-username/vaultchain`
- **Head branch**: `feature/my-feature`

2. **Review and Merge**:
- I will approve and your changes will be merged into the `main` branch.

Remember, once there is an update fetch and merge.

```shell
git fetch upstream
git checkout main
git merge upstream/main
```

This ensures everyone stays updated, prevents conflicts, and maintains clarity in collaborative workflows.

### Dependencies

The dependencies for the backend are not talked through and is in ambiguity.

**Make sure to have up-to-date NPM and Node.js**
For the frontend, we will use React.
To download all the modules for it:
```shell
cd frontend
npm install
```
You should be able to run the server locally through:

```shell
npm run start
```


