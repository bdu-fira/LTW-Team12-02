const fs = require('fs');
const file = process.argv[2];
let content = fs.readFileSync(file, 'utf8');

if (file.includes('git-rebase-todo')) {
  // Replace pick with reword for our target commit
  content = content.replace(/pick cf274ff/, 'reword cf274ff');
} else if (file.includes('COMMIT_EDITMSG')) {
  // If editing the commit message, replace the old text
  if (content.includes('checkout: temporary commit for worktree checkout')) {
    content = content.replace('checkout: temporary commit for worktree checkout', 'Lưu nháp tiến độ công việc');
  }
}

fs.writeFileSync(file, content);
