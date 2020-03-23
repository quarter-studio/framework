import chalk from 'chalk'
import execa from 'execa'
import path from 'path'
import fs from 'fs'

export const change = (...args) => {
  console.log(chalk.yellow(args.join(' -> ')))
}

export const commit = async (bin, args, opts = {}) => {
  if (process.argv.includes('--dry')) {
    console.log(chalk.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts)
    return {}
  } else {
    return await run(bin, args, opts)
  }
}

export const exec = async (bin, args, opts) => {
  return await run(resolve('node_modules/.bin/' + bin), args, opts)
}

export const packages = () => {
  return fs.readdirSync(resolve('packages'))
}

export const resolve = (...args) => {
  return path.resolve(__dirname, '..', ...args)
}

export const run = async (bin, args, opts) => {
  return await execa(bin, args, { stdio: 'inherit', ...opts })
}

export const start = (message) => {
  console.log(chalk.cyan('\n' + message + '...'))
}

export const write = async (file, update) => {
  const input = fs.readFileSync(file, 'utf-8')
  const content = update(JSON.parse(input))
  const output = JSON.stringify(content, null, 2)
  return fs.writeFileSync(file, output + '\n')
}
