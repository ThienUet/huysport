#!/usr/bin/env node

/**
 * Script: start-demo.mjs
 * Purpose: 
 *  1. Build both Frontend sources (huysports_admin & huysports_client) and Backend (huysports_be)
 *  2. Launch all 3 services using their PRODUCTION BUILDS (super fast, no dev mode overhead)
 *  3. Handle clean shutdown on Ctrl+C to guarantee ports (3000, 5000, 5173) are immediately released.
 */

import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ANSI Colors
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const MAGENTA = '\x1b[35m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const runningChildren = [];

// Helper to kill process tree cleanly on Windows and Unix
function killTree(proc) {
  if (!proc || !proc.pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' });
    } else {
      process.kill(-proc.pid, 'SIGKILL');
    }
  } catch {
    try {
      proc.kill('SIGKILL');
    } catch {}
  }
}

// Graceful shutdown handler
let isShuttingDown = false;
function handleExit(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n${YELLOW}${BOLD}🛑 [SPORTX] Đang nhận lệnh ${signal || 'dừng'} — Tiến hành tắt toàn bộ tiến trình và giải phóng ports...${RESET}`);
  for (const child of runningChildren) {
    killTree(child);
  }
  console.log(`${GREEN}✅ Đã giải phóng hoàn toàn cổng 3000, 5000, 5173. Tạm biệt!${RESET}\n`);
  process.exit(0);
}

process.on('SIGINT', () => handleExit('SIGINT (Ctrl+C)'));
process.on('SIGTERM', () => handleExit('SIGTERM'));
process.on('exit', () => {
  for (const child of runningChildren) {
    killTree(child);
  }
});

// Run a command asynchronously and wait for it to complete
function runBuildTask(command, args, cwd, label, color) {
  return new Promise((resolve, reject) => {
    console.log(`${color}${BOLD}📦 Đang build ${label}...${RESET}`);
    const proc = spawn(command, args, {
      cwd,
      shell: true,
      stdio: 'inherit',
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`${color}✅ Build ${label} thành công!${RESET}`);
        resolve();
      } else {
        reject(new Error(`Quá trình build ${label} thất bại (Exit code: ${code})`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

// Prefix lines from a stream
function prefixStream(stream, prefix, color) {
  if (!stream) return;
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.trim()) {
        console.log(`${color}${BOLD}${prefix}${RESET} ${line}`);
      }
    }
  });
}

// Spawn a long-running service
function startService(command, args, cwd, prefix, color) {
  const child = spawn(command, args, {
    cwd,
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe'],
    detached: process.platform !== 'win32',
  });

  runningChildren.push(child);
  prefixStream(child.stdout, prefix, color);
  prefixStream(child.stderr, prefix, color);

  child.on('close', (code) => {
    if (!isShuttingDown && code !== 0) {
      console.error(`${RED}${BOLD}${prefix} Dịch vụ dừng đột ngột với mã thoát: ${code}${RESET}`);
    }
  });

  return child;
}

async function main() {
  console.clear();
  console.log(`
${CYAN}${BOLD}========================================================================${RESET}
${GREEN}${BOLD}  ⚡ SPORTX E-COMMERCE — PRODUCTION DEMO RUNNER                        ${RESET}
${CYAN}${BOLD}========================================================================${RESET}
${YELLOW}  Chế độ: PRODUCTION BUILD (Tốc độ tối đa, không độ trễ dev)${RESET}
`);

  // --- BƯỚC 1: BUILD 2 SOURCE FRONTEND VÀ BACKEND ---
  console.log(`${BOLD}🔨 [BƯỚC 1/2] Thực hiện Build toàn bộ trước khi chạy...${RESET}\n`);

  try {
    // Build parallel: huysports_admin, huysports_client, huysports_be
    await Promise.all([
      runBuildTask('pnpm', ['--filter', 'huysports_be', 'build'], rootDir, 'Backend (TypeScript)', CYAN),
      runBuildTask('pnpm', ['--filter', 'huysports_admin', 'build'], rootDir, 'Frontend Admin (Vite)', MAGENTA),
      runBuildTask('pnpm', ['--filter', 'huysports_client', 'build'], rootDir, 'Frontend Client (Next.js 15)', GREEN),
    ]);

    console.log(`\n${GREEN}${BOLD}🎉 TẤT CẢ CÁC BẢN BUILD ĐÃ HOÀN TẤT THÀNH CÔNG!${RESET}\n`);
  } catch (err) {
    console.error(`\n${RED}${BOLD}❌ LỖI TRONG QUÁ TRÌNH BUILD:${RESET}`, err.message);
    process.exit(1);
  }

  // --- BƯỚC 2: KHỞI CHẠY BẢN BUILD PRODUCTION ---
  console.log(`${BOLD}🚀 [BƯỚC 2/2] Khởi chạy các dịch vụ ở chế độ PRODUCTION BUILD...${RESET}\n`);

  // 1. Chạy Backend trước
  console.log(`${CYAN}▶ Khởi động Backend API Server (Port 5000)...${RESET}`);
  startService('node', ['dist/server.js'], path.join(rootDir, 'huysports_be'), '[BACKEND]', CYAN);

  // Đợi 1.5 giây để Backend khởi động xong
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 2. Chạy Frontend Admin (Bản build Vite preview)
  console.log(`${MAGENTA}▶ Khởi động Admin Dashboard (Port 5173)...${RESET}`);
  startService('npx', ['vite', 'preview', '--port', '5173'], path.join(rootDir, 'huysports_admin'), '[ADMIN  ]', MAGENTA);

  // 3. Chạy Frontend Client (Bản build Next.js start)
  console.log(`${GREEN}▶ Khởi động Website Client Storefront (Port 3000)...${RESET}`);
  startService('npx', ['next', 'start', '-p', '3000'], path.join(rootDir, 'huysports_client'), '[CLIENT ]', GREEN);

  // Hiển thị bảng điều khiển địa chỉ truy cập
  setTimeout(() => {
    console.log(`
${GREEN}${BOLD}========================================================================${RESET}
${GREEN}${BOLD}  ✨ HỆ THỐNG SPORTX ĐÃ SẴN SÀNG Ở CHẾ ĐỘ DEMO PRODUCTION!            ${RESET}
${GREEN}${BOLD}========================================================================${RESET}
  🛍️  ${BOLD}Website Khách Hàng (Client):${RESET}  ${GREEN}http://localhost:3000${RESET}
  ⚙️  ${BOLD}Trang Quản Trị (Admin):     ${RESET}  ${MAGENTA}http://localhost:5173${RESET}
  🌿 ${BOLD}Backend RESTful API:        ${RESET}  ${CYAN}http://localhost:5000/api${RESET}
${GREEN}${BOLD}========================================================================${RESET}
  ${YELLOW}💡 Mẹo: Bản build chạy với hiệu năng cao nhất, không bị giật lag của dev mode.${RESET}
  ${RED}${BOLD}🛑 Nhấn Ctrl + C tại đây để dừng đồng thời toàn bộ hệ thống.${RESET}
${GREEN}${BOLD}========================================================================${RESET}
`);
  }, 2000);
}

main().catch((err) => {
  console.error(`${RED}Lỗi không mong muốn:${RESET}`, err);
  handleExit('ERROR');
});
