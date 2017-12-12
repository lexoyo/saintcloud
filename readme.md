
# saintcloud

> A CLI tool with utilities for google cloud platform

**This is dirty test code, I am learning gcp APIs, not nodejs, open to PRs for cleanup, refactoring, test but no feature**

This first version of the tool finds the old versions of a project, lists them and remove them if you confirm.

```
$ npm install -g saintcloud
$ saintcloud
```

Options:
- `GCLOUD_PROJECT_ID` or 1st arg: the project ID (default=all projects)
- `GCLOUD_KEY_FILE` env var or 2nd arg: path to the key file (default=./key.json)

```
$ saintcloud $GCLOUD_PROJECT_ID $GCLOUD_KEY_FILE 
```

See this [guide to create a JSON keyfile](https://googlecloudplatform.github.io/gcloud-node/#/authentication).

Use [gcloud CLI](https://cloud.google.com/sdk/gcloud/) to get your project ID.
```
$ gcloud projects list
```
