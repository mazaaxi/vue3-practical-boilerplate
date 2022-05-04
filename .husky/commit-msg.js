const fs = require('fs-extra')
const simpleGit = require('simple-git')
const program = require('commander')

const ProjectId = 'VUE3-BP'
const BranchReg1 = new RegExp(`^(?:release|feature)/(${ProjectId}-T-\\d+)$`)
const BranchReg2 = new RegExp(`^(?:release|feature)/(${ProjectId}-T-\\d+)[-_].+`)
const ReleaseTypos = ['relese', 'relase', 'releas', 'reles']
const FeatureTypos = ['feture', 'fature', 'featare', 'featur', 'featar']

/**
 * コミットメッセージに参照ID(課題ID or プルリクエストID or ブランチ名)を付与します。
 * @param commitMsgFilePath コミットメッセージ編集用のファイルパスを指定します。
 *   例: '.git/COMMIT_EDITMSG' or '.git/MERGE_MSG'
 */
async function addIssueIdToCommitMsg(commitMsgFilePath) {
  const projectDir = process.cwd()
  commitMsgFilePath = `${projectDir}/${commitMsgFilePath}`
  const git = simpleGit(`${projectDir}`)

  // 現在のブランチ名を取得
  const status = await git.status()
  const currentBranch = status.current

  // ブランチ名'release/...'のタイポを検出
  const releaseTyposReg = new RegExp(`^\\s*(${ReleaseTypos.join('|')})/`)
  const releaseTyposMatched = releaseTyposReg.exec(currentBranch)
  if (releaseTyposMatched?.length >= 2) {
    const typo = releaseTyposMatched[1]
    throw new Error(`Is the branch name '${typo}/...' not a mistake for 'release/...'?`)
  }

  // ブランチ名'feature/...'のタイポを検出
  const featureTyposReg = new RegExp(`^\\s*(${FeatureTypos.join('|')})/`)
  const featureTyposMatched = featureTyposReg.exec(currentBranch)
  if (featureTyposMatched?.length >= 2) {
    const typo = featureTyposMatched[1]
    throw new Error(`Is the branch name '${typo}/...' not a mistake for 'feature/...'?`)
  }

  // 現在のブランチ名から「ブランチタイプ」と「参照ID」を取得
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

  // 引数で指定されたファイルからコミットメッセージを取得
  const commitMsg = await fs.readFile(commitMsgFilePath, 'utf8')
  // コミットメッセージを行ごとの配列に変換
  const msgLines = commitMsg.split(/\r?\n/g)

  // コミットメッセージに、参照IDが記述された行('refs ...'で始まる)が存在するか検索
  const RefsReg = /^\s*refs\s+/
  const existsRefs = msgLines.some(line => RefsReg.test(line))

  let newCommitMsg = ''
  // 参照IDをもつ行がある場合
  if (existsRefs) {
    for (const msgLine of msgLines) {
      if (RefsReg.test(msgLine)) {
        // 参照IDを配列で取得
        const refsIds = msgLine.replace(RefsReg, '')
          .split(/\s/)
          .filter(id => Boolean(id))
          .reduce((result, id) => {
            const matched = /\[(.+)\]/.exec(id)
            matched?.length >= 2 ? result.push(matched[1]) : result.push(id)
            return result
          }, [])

        // 参照ID配列に、現ブランチから取得した参照IDが含まれていない場合、
        // その参照IDを、参照ID配列の先頭に追加
        !refsIds.includes(currentRefsId) && refsIds.unshift(currentRefsId)

        const refsLine = `refs ${refsIds.map(id => `[${id}]`).join(' ')}`
        newCommitMsg = newCommitMsg ? `${newCommitMsg}\n${refsLine}` : refsLine
      } else {
        newCommitMsg = newCommitMsg ? `${newCommitMsg}\n${msgLine}` : msgLine
      }
    }
  }
  // 参照IDをもつ行がない場合
  else {
    const isEndWithNewLine = /\r?\n$/g.test(commitMsg)
    const _commitMsg = isEndWithNewLine ? commitMsg : `${commitMsg}\n`
    const refsLine = `refs [${currentRefsId}]`
    newCommitMsg = `${_commitMsg}\n${refsLine}`
  }

  // 上記で生成された新しいコミットメッセージを
  // コミットメッセージ編集用のファイルに書き込み
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
