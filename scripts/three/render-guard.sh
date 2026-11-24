#!/bin/bash
# 渲染前防護（2026-11-24 事故：中斷的渲染遺留孤兒 headless Chrome，吃 ~200% CPU 三小時，矽晶圓-1 v3 從平常 32～42 分拖到 70 分以上）。
# 用法：在 flock 內、渲染開始前呼叫。① 清掉父程序已死（掛在 init 下）的 headless Chrome ② 列出負載與前 5 名 CPU 程序
# 只殺父程序 PID=1 的 Chrome；正在渲染的 Chrome 父程序是 node，不會被誤殺（而且外層有 flock，同時只會有一支在渲染）。
killed=0
for pid in $(ps -eo pid=,ppid=,args= | awk '$2==1 && /(chrome|chromium|headless_shell)/ && /headless/ {print $1}'); do
  echo "⚠ 清掉孤兒 headless Chrome PID $pid：$(ps -o args= -p "$pid" | cut -c1-80)"; kill "$pid" 2>/dev/null && killed=$((killed+1))
done
sleep 1
echo "渲染前負載：$(cut -d' ' -f1-3 /proc/loadavg)（核心數 $(nproc)）；清掉孤兒 $killed 支"
ps -eo pcpu=,pid=,args= --sort=-pcpu | head -5 | cut -c1-100
