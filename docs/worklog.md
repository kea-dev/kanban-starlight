## Repo worklog

### Init Takt

```shell
mkdir kanban-starlight
cd kanban-starlight
git init --initial-branch main
gh skill install mindovermachine-dev/how-we-work init-takt-devcontainer --agent github-copilot --scope project
```

### Prompt

> Please use the skill /init-takt-devcontainer to prepare this repo for using TakT

### Reopen in container

Command Palette...
Dev Containers: Rebuild and Reopen in Container

### Make Trunk Worthy

```shell
gh insitu run fix-all
cspell #Fix any spelling errors
gh insitu run trunk-worthy
```

### Push to GitHub

```
git add -A
git commit -m "Bootstap TakT"
gh repo create kea-dev/kanban-starlight --disable-wiki --description "A Static site about the joys of Kanban and Trunk-based Development" --public --push --source .
```

### See it live:

```
gh browse
```

### Github settings

- Create a project
- Add a column `Delivery Initiated`
- Link the project
- Add the `.tt-config.json``

  ```json
  {
    "project": {
      "owner": "kea-dev",
      "number": 7
    }
  }
  ```

## Add a Starlight project

```shell
npm create astro@latest astro -- --template starlight --install --yes --skip-houston --no-git --no-ai
```

Create a repo level `package.json``

```json
{
  "name": "astro call through",
  "private": true,
  "scripts": {
    "dev": "cd astro && npm run dev -- --host 0.0.0.0",
    "dev-draft": "cd astro && npm run dev:draft -- --host 0.0.0.0",
    "build": "cd astro && npm run build",
    "build-draft": "cd astro && npm run build:draft",
    "preview": "cd astro && npm run preview -- --host 0.0.0.0",
    "astro": "cd astro && npm run astro",
    "install:astro": "npm --prefix astro install",
    "install:repo": "npm install",
    "check:astro": "cd astro && npm run check:astro"
  }
}
```

Add draft mode and astro check to the `astro/package.json` `scripts` section:

```json
  "scripts": {
    "dev:draft": "astro dev --mode drafts",
    "build:draft": "astro build --mode drafts",
    "check:astro": "astro check",
  },
```

CD into astro and run

```shell
pushd astro
npm run check:astro
popd
```
