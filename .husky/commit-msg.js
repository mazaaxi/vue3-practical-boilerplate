const fs = require('fs-extra')
const simpleGit = require('simple-git')
const program = require('commander')

const ProjectId = 'VUE3-BP'
const BranchReg1 = new RegExp(`^(?:release|feature)/(${ProjectId}-T-\\d+)$`)
const BranchReg2 = new RegExp(`^(?:release|feature)/(${ProjectId}-T-\\d+)[-_].+`)
const ReleaseTypos = ['relese', 'relase', 'releas', 'reles']
const FeatureTypos = ['feture', 'fature', 'featare', 'featur', 'featar']

/**
 * Add a reference ID (issue ID or pull request ID or branch name) to the commit message.
 * @param commitMsgFilePath Specifies the file path for editing commit message.
 *   ex: '.git/COMMIT_EDITMSG' or '.git/MERGE_MSG'
 */
async function addIssueIdToCommitMsg(commitMsgFilePath) {
  const projectDir = process.cwd()
  commitMsgFilePath = `${projectDir}/${commitMsgFilePath}`
  const git = simpleGit(`${projectDir}`)

  // Get current branch name
  const status = await git.status()
  const currentBranch = status.current

  // Detect typos in branch name "release/..."
  const releaseTyposReg = new RegExp(`^\\s*(${ReleaseTypos.join('|')})/`)
  const releaseTyposMatched = releaseTyposReg.exec(currentBranch)
  if (releaseTyposMatched?.length >= 2) {
    const typo = releaseTyposMatched[1]
    throw new Error(`Is the branch name '${typo}/...' not a mistake for 'release/...'?`)
  }

  // Detect typos in branch name "feature/..."
  const featureTyposReg = new RegExp(`^\\s*(${FeatureTypos.join('|')})/`)
  const featureTyposMatched = featureTyposReg.exec(currentBranch)
  if (featureTyposMatched?.length >= 2) {
    const typo = featureTyposMatched[1]
    throw new Error(`Is the branch name '${typo}/...' not a mistake for 'feature/...'?`)
  }

  // Get `branchType` and `currentRefsId` (issue ID or pull request ID or branch name) from
  // the current branch name
  const { branchType, currentRefsId } = (() => {
    let matched = BranchReg1.exec(currentBranch)
    if (matched?.length >= 2) {
      return { branchType: 'release', currentRefsId: matched[1] }
    }
    matched = BranchReg2.exec(currentBranch)
    if (matched?.length >= 2) {
      return { branchType: 'feature', currentRefsId: matched[1] }
    }
    if (isReleaseBranch(currentBranch)) {
      return { branchType: 'release', currentRefsId: currentBranch }
    }
    if (isFeatureBranch(currentBranch)) {
      return { branchType: 'feature', currentRefsId: currentBranch }
    }
    return { branchType: undefined, currentRefsId: undefined }
  })()
  if (!branchType || !currentRefsId) return

  // Get a commit message from the file specified in the arguments
  const commitMsg = await fs.readFile(commitMsgFilePath, 'utf8')
  // Convert commit message to a line-by-line array
  const msgLines = commitMsg.split(/\r?\n/g)

  // Searches for the existence of a line (beginning with 'refs: [...]') with a reference ID
  // in the commit message.
  const RefsReg = /^\s*refs:\s*\[(.+)\]\s*$/
  const existsRefs = msgLines.some(line => RefsReg.test(line))

  let newCommitMsg = ''
  // If there is a line with the reference ID
  if (existsRefs) {
    for (const msgLine of msgLines) {
      const matched = RefsReg.exec(msgLine)
      if (matched) {
        const matchedStr = matched[1]
        // Get reference ID as an array
        const refsIds = matchedStr
          .split(',')
          .filter(idStr => Boolean(idStr.trim()))
          .reduce((result, idStr) => {
            const idRegs = [
              /* eslint-disable no-irregular-whitespace */
              new RegExp(`^"(${ProjectId}-[^"' 　]+)"$`),
              new RegExp(`^'(${ProjectId}-[^"' 　]+)'$`),
              new RegExp(`^(${ProjectId}-[^"' 　]+)$`),
              /* eslint-enable */
            ]

            idStr = idStr.trim()
            const extractedId = idRegs.reduce((result, idReg) => {
              if (result) return result
              const id = idReg.exec(idStr)?.[1]
              result = id ? id : result
              return result
            }, '')
            extractedId && result.push(extractedId)

            return result
          }, [])

        // If the reference ID array does not contain a reference ID obtained from the current branch,
        // the ID is added to the top of the reference ID array.
        !refsIds.includes(currentRefsId) && refsIds.unshift(currentRefsId)

        const refsLine = `refs: [${refsIds.map(id => `"${id}"`).join(', ')}]`
        newCommitMsg = newCommitMsg ? `${newCommitMsg}\n${refsLine}` : refsLine
      } else {
        newCommitMsg = newCommitMsg ? `${newCommitMsg}\n${msgLine}` : msgLine
      }
    }
  }
  // If there is no line with the reference ID
  else {
    const isEndWithNewLine = /\r?\n$/g.test(commitMsg)
    const _commitMsg = isEndWithNewLine ? commitMsg : `${commitMsg}\n`
    const refsLine = `refs: ["${currentRefsId}"]`
    newCommitMsg = `${_commitMsg}\n${refsLine}`
  }

  // The new commit message generated above is written to the temporary file for editing
  // the commit message.
  await fs.writeFile(commitMsgFilePath, newCommitMsg)
}

function isReleaseBranch(branch) {
  return /^release\//.test(branch)
}

function isFeatureBranch(branch) {
  return /^feature\//.test(branch)
}

program
  .argument('commitMsgFilePath', `Specify the file path for editing commit message (ex: '.git/COMMIT_EDITMSG' or '.git/MERGE_MSG')`)
  .action(async commitMsgFilePath => {
    try {
      await addIssueIdToCommitMsg(commitMsgFilePath)
    } catch (err) {
      console.error(err)
      program.error('', { exitCode: 1 })
    }
  })

program.parseAsync(process.argv)
