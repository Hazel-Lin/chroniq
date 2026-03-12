export const ADD_HELP_TEXT = `
模式:
  cq add         = 多行多条
  cq add --stdin = 多行单条

示例:
  cq add "想到一个方案 #idea"                   # 单条记录（内联标签请加引号）
  cq add                                         # 批量输入，多行落多条
  cq add --stdin                                 # 块输入，多行落单条
  cq add "完成任务A #work"                      # 行内标签
  cq add --multiline                             # 编辑器录入单条多行
  cat note.md | cq add --stdin                   # 标准输入保存为单条记录
  cat bullets.txt | cq add --stdin --split auto  # 自动拆分多条
  cq today --full                                # 按原换行查看正文
  cq list --date 2026-03-12 --full               # 查看某天全文

提示:
  含 #标签 的内容请放进引号里，否则 shell 会把 # 后内容当成注释
`;
