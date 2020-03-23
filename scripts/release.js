import {
  change,
  commit,
  exec,
  packages,
  resolve,
  run,
  start,
  write,
} from './support'
import { mapValues } from 'lodash'
import { version } from '../package.json'
import { prompt } from 'enquirer'
import semver from 'semver'
import chalk from 'chalk'

const release = async () => {
  const release = await askForRelease()
  const confirmed = await askForConfirmation(release)

  if (!confirmed) return

  start('Running tests')
  await runTests()

  start('Updating cross dependencies')
  await updateVersions(release)

  start('Committing changes')
  await commitChanges(release)

  start('Publishing packages')
  await publishPackages(release)

  start('Pushing to GitHub')
  await publishRepository(release)

  console.log()
}

const askForRelease = async () => {
  const releases = [
    'patch',
    'minor',
    'major',
    'prepatch',
    'preminor',
    'premajor',
    'prerelease',
  ]

  const increment = (release) => {
    return semver.inc(version, release)
  }

  const { release } = await prompt({
    type: 'select',
    name: 'release',
    message: 'Select release type',
    choices: releases.map((release) => {
      return `${release} (${increment(release)})`
    }),
  })

  return release.match(/\((.*)\)/)[1]
}

const askForConfirmation = async (release) => {
  const { confirmed } = await prompt({
    type: 'confirm',
    name: 'confirmed',
    message: `Releasing [v${release}]. Confirm?`,
  })

  return confirmed
}

const runTests = async () => {
  await exec('jest', ['--clearCache'])
  await run('yarn', ['test', '--passWithNoTests'])
}

const updateVersions = async (release) => {
  const update = updatePackage(release)
  const paths = packages().map((name) => 'packages/' + name)
  paths.concat('.').forEach(update)
}

const commitChanges = async (release) => {
  const { stdout } = await commit('git', ['diff'], { stdio: 'pipe' })

  if (stdout) {
    await commit('git', ['add', '-A'])
    await commit('git', ['commit', '-m', `release: v${release}`])
  } else {
    console.log('No changes to commit.')
  }
}

const publishPackages = async (release) => {
  for (const name of packages()) {
    await publishPackage(name, release)
  }
}

const publishRepository = async (release) => {
  await commit('git', ['tag', `v${release}`])
  await commit('git', ['push', 'origin', `refs/tags/v${release}`])
  await commit('git', ['push'])
}

const updatePackage = (release) => async (path) => {
  const dependencies = ['dependencies', 'peerDependencies']
  const file = resolve(path, 'package.json')

  await write(file, (config) => {
    config.version = release

    dependencies.forEach((type) => {
      if (type in config) {
        config[type] = mapDependencies(config, release, type)
      }
    })

    return config
  })
}

const mapDependencies = (config, release, type) => {
  return mapValues(config[type], (version, name) => {
    if (name.startsWith('@quarter')) {
      change(config.name, type, name, version, release)
      return release
    } else {
      return version
    }
  })
}

const publishPackage = async (name, release) => {
  const args = ['publish', '--new-version', release, '--access', 'public']

  try {
    start(`Publishing ${name}`)
    await commit('yarn', args, {
      cwd: resolve('packages', name),
      stdio: 'pipe',
    })

    console.log(chalk.green(`Successfully published: ${name}@${release}`))
  } catch (error) {
    if (error.stderr.match(/previously published/)) {
      console.log(chalk.red(`Skipping already published: ${name}`))
    } else {
      throw error
    }
  }
}

release().catch((err) => {
  console.error(err)
})
