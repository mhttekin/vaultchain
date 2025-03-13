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

## Dependencies

**Recommended Versions:**
- Python >= 3.10
- Node.js >= 18.x

### Django Backend

**CREATE A .ENV FILE IN THE BACK FOLDER (NOT BACK/BACKEND)**
```shell
touch .env
```
**AND PASTE THE LINE I SENT ON WHATSAPP OR ELSE WONT WORK**

To setup backend, we need to create python environment first:
```shell
python3 -m venv myenv # or just python instead of python3 depending on your machine
source myenv/bin/activate # (or activate.fish if on fish shell) macOS/Linux
myenv/Scripts/activate # (same if fish) Windows
```
Now, that the environment is activated on your shell, install the requirements:
```shell
pip install -r requirements.txt
```
After installation completed, head to the back folder and create the DB locally:
```shell
cd back
python3 manage.py migrate
```
Now, everything is set, run the server with:
```shell
python3 manage.py runserver
```
### Next.js + React Frontend
**Make sure to have up-to-date NPM and Node.js**
For the frontend, we will use React Next.js.
To download all the modules for it:
```shell
cd frontend
npm install
```
You should be able to run the server locally through:

```shell
npm run start
```

### Updates 

* Always make sure your dependencies are up-to-date:
```shell
pip install --upgrade -r requirements.txt # Backend in the root file
npm update # Frontend, node updates can goof up the project sometimes, if project broken just revert to last git push or delete the folder and reclone 
```
