# Troubleshooting Guide

## Why did merging my PR not trigger a release?
This may be caused by a bug in github where 'squash and merge' does not always use the latest PR title, resulting in the
final commit message not having the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) prefix
that would have triggered a release.

This can be resolved by rewriting the commit message and pushing your changes to main using `git push --force-with-lease`.
Instructions on how to update a commit message can be found [here](https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/changing-a-commit-message#amending-older-or-multiple-commit-messages).
